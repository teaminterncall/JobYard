import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { resourceSchema } from '@/lib/validations';
import { rateLimit } from '@/lib/rate-limit';

// GET /api/resources -> filters: page, limit, category
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const category = searchParams.get('category');

        const supabase = await createServerSupabaseClient();

        let query = supabase
            .from('resources')
            .select('*', { count: 'exact' })
            .eq('is_active', true);

        // Applying Filters
        if (category) {
            query = query.eq('category', category);
        }

        // Pagination
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to).order('created_at', { ascending: false });

        const { data: resources, error, count } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            resources,
            pagination: {
                page,
                limit,
                total: count,
                totalPages: count ? Math.ceil(count / limit) : 0
            }
        });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST /api/resources -> Admin Only!
export async function POST(request: Request) {
    try {
        const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
        const rateLimitResult = rateLimit(ip, 'create_resource', { limit: 10, windowMs: 60000 });
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

        const body = await request.json();
        const validationResult = resourceSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Validation Error', details: validationResult.error.format() },
                { status: 400 }
            );
        }

        // Insert
        const { data: resource, error: insertError } = await supabase
            .from('resources')
            .insert({
                ...validationResult.data,
                is_active: validationResult.data.is_active ?? true
            })
            .select()
            .single();

        if (insertError) {
            return NextResponse.json({ error: insertError.message }, { status: 500 });
        }

        return NextResponse.json({ resource }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
