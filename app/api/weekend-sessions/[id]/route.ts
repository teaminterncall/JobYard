import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { weekendSessionSchema } from '@/lib/validations';

// GET /api/weekend-sessions/[id]
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const supabase = await createServerSupabaseClient();

        const { data: session, error } = await supabase
            .from('weekend_sessions')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !session) {
            return NextResponse.json({ error: 'Weekend session not found' }, { status: 404 });
        }

        return NextResponse.json({ session });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// PUT /api/weekend-sessions/[id] -> Admin Only
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
                .from('weekend_sessions')
                .update({ is_active: body.is_active })
                .eq('id', id);

            if (updateError) {
                return NextResponse.json({ error: updateError.message }, { status: 500 });
            }
            return NextResponse.json({ message: 'Session status updated successfully' });
        }

        // Validate
        const validationResult = weekendSessionSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Validation Error', details: validationResult.error.format() },
                { status: 400 }
            );
        }

        const { data: session, error: updateError } = await supabase
            .from('weekend_sessions')
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

        return NextResponse.json({ session });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE /api/weekend-sessions/[id] -> Admin Only
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
            .from('weekend_sessions')
            .delete()
            .eq('id', id);

        if (deleteError) {
            return NextResponse.json({ error: deleteError.message }, { status: 500 });
        }

        return NextResponse.json({ message: 'Session deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
