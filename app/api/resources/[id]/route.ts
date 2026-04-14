import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { resourceSchema } from '@/lib/validations';

// GET /api/resources/[id]
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const supabase = await createServerSupabaseClient();

        const { data: resource, error } = await supabase
            .from('resources')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !resource) {
            return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
        }

        return NextResponse.json({ resource });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// PUT /api/resources/[id] -> Admin Only
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
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

        // Check if just toggling status
        if (Object.keys(body).length === 1 && 'is_active' in body) {
            const { error: updateError } = await supabase
                .from('resources')
                .update({ is_active: body.is_active })
                .eq('id', id);

            if (updateError) {
                return NextResponse.json({ error: updateError.message }, { status: 500 });
            }
            return NextResponse.json({ message: 'Resource status updated successfully' });
        }

        // Validate
        const validationResult = resourceSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Validation Error', details: validationResult.error.format() },
                { status: 400 }
            );
        }

        const { data: resource, error: updateError } = await supabase
            .from('resources')
            .update({
                ...validationResult.data,
                is_active: validationResult.data.is_active ?? true
            })
            .eq('id', id)
            .select()
            .single();

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        return NextResponse.json({ resource });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE /api/resources/[id] -> Admin Only
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
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

        const { error: deleteError } = await supabase
            .from('resources')
            .delete()
            .eq('id', id);

        if (deleteError) {
            return NextResponse.json({ error: deleteError.message }, { status: 500 });
        }

        return NextResponse.json({ message: 'Resource deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
