import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
    try {
        const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
        const rateLimitResult = rateLimit(ip, 'upload_resource', { limit: 10, windowMs: 60000 });
        if (!rateLimitResult.success) {
            return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
        }

        const supabase = await createServerSupabaseClient();

        // Auth Check
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Admin Check
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Check size limit: 15MB for resources
        if (file.size > 15 * 1024 * 1024) {
            return NextResponse.json({ error: 'File size exceeds the 15MB limit.' }, { status: 400 });
        }

        // --- BYTE-LEVEL VALIDATION (Magic Numbers) ---
        const buffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(buffer);

        // PDF signature: %PDF- (25 50 44 46 2D)
        const isPDF = uint8Array.length > 5 && 
            uint8Array[0] === 0x25 && uint8Array[1] === 0x50 && 
            uint8Array[2] === 0x44 && uint8Array[3] === 0x46 && uint8Array[4] === 0x2D;

        if (!isPDF) {
            return NextResponse.json({ error: 'Invalid file content. Must be a genuine PDF file.' }, { status: 400 });
        }

        const safeFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
        const filePath = `admin_${user.id}/${Date.now()}_${safeFileName}`;

        // Upload Direct to Storage via Backend Proxy
        const { error: storageError } = await supabase.storage.from('resources').upload(filePath, buffer, {
            contentType: 'application/pdf',
            upsert: false
        });

        if (storageError) {
            return NextResponse.json({ error: storageError.message }, { status: 500 });
        }

        // Return path immediately, to be used when creating/updating the resource DB entry
        return NextResponse.json({ pdf_path: filePath }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
