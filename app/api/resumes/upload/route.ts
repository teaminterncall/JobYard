import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: Request) {
    try {
        const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1'
        const rateLimitResult = rateLimit(ip, 'upload_resume', { limit: 5, windowMs: 60000 })
        if (!rateLimitResult.success) {
            return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 })
        }

        const supabase = await createServerSupabaseClient()

        // Auth Check
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'File size exceeds the 5MB limit.' }, { status: 400 })
        }

        // --- BYTE-LEVEL VALIDATION (Magic Numbers) ---
        const buffer = await file.arrayBuffer()
        const uint8Array = new Uint8Array(buffer)

        // PDF signature: %PDF- (25 50 44 46 2D)
        const isPDF = uint8Array.length > 5 && 
            uint8Array[0] === 0x25 && uint8Array[1] === 0x50 && 
            uint8Array[2] === 0x44 && uint8Array[3] === 0x46 && uint8Array[4] === 0x2D

        // DOCX signature (ZIP): PK\x03\x04 (50 4B 03 04)
        const isDOCX = uint8Array.length > 4 && 
            uint8Array[0] === 0x50 && uint8Array[1] === 0x4B && 
            uint8Array[2] === 0x03 && uint8Array[3] === 0x04

        // JPEG signature: FF D8 FF
        const isJPEG = uint8Array.length > 3 &&
            uint8Array[0] === 0xFF && uint8Array[1] === 0xD8 && uint8Array[2] === 0xFF

        // PNG signature: 89 50 4E 47 0D 0A 1A 0A
        const isPNG = uint8Array.length > 8 &&
            uint8Array[0] === 0x89 && uint8Array[1] === 0x50 && uint8Array[2] === 0x4E && 
            uint8Array[3] === 0x47 && uint8Array[4] === 0x0D && uint8Array[5] === 0x0A && 
            uint8Array[6] === 0x1A && uint8Array[7] === 0x0A

        if (!isPDF && !isDOCX && !isJPEG && !isPNG) {
            return NextResponse.json({ error: 'Invalid file content. Must be a genuine PDF, DOCX, JPEG, or PNG file.' }, { status: 400 })
        }
        // ----------------------------------------------

        const safeFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')
        const filePath = `${user.id}/${Date.now()}_${safeFileName}`

        // Upload Direct to Storage via Backend Proxy
        let contentType = 'application/octet-stream'
        if (isPDF) contentType = 'application/pdf'
        if (isDOCX) contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        if (isJPEG) contentType = 'image/jpeg'
        if (isPNG) contentType = 'image/png'

        const { error: storageError } = await supabase.storage.from('resumes').upload(filePath, buffer, {
            contentType,
            upsert: false
        })

        if (storageError) {
            return NextResponse.json({ error: storageError.message }, { status: 500 })
        }

        // Insert into 'resumes' Database Table
        const { data: resume, error: insertError } = await supabase
            .from('resumes')
            .insert({
                user_id: user.id,
                file_path: filePath,
                file_size: file.size
            })
            .select()
            .single()

        if (insertError) {
            // Attempt to cleanup storage if DB insertion fails
            await supabase.storage.from('resumes').remove([filePath])
            return NextResponse.json({ error: insertError.message }, { status: 500 })
        }

        return NextResponse.json({ resume }, { status: 201 })
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
