import { NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/auth-api'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/admin'

export async function GET(req: Request) {
  const unauthorized = requireAdminSession()
  if (unauthorized) return unauthorized
  const url = new URL(req.url)
  const projectId = url.searchParams.get('project_id')

  if (!projectId) {
    return NextResponse.json({ error: 'Missing query param: project_id' }, { status: 400 })
  }

  const supabaseConfigured = isSupabaseConfigured()
  if (!supabaseConfigured) {
    return NextResponse.json(
      { ok: false, supabaseConfigured, projectId, assets: [], reason: 'Supabase env vars not configured on this runtime' },
      { status: 200 },
    )
  }

  try {
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from('project_assets')
      .select('id, project_id, type, cdn_url, storage_path, metadata, created_at')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      return NextResponse.json(
        { ok: false, supabaseConfigured, projectId, assets: [], reason: error.message },
        { status: 200 },
      )
    }

    return NextResponse.json({ ok: true, supabaseConfigured, projectId, assets: data ?? [] }, { status: 200 })
  } catch (e) {
    return NextResponse.json(
      { ok: false, supabaseConfigured, projectId, assets: [], reason: e instanceof Error ? e.message : 'Unknown error' },
      { status: 200 },
    )
  }
}

