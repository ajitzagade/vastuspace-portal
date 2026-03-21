import { NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/auth-api'
import { getProjectBySlug } from '@/lib/db'
import { isSupabaseConfigured } from '@/lib/supabase/admin'

export async function GET(req: Request) {
  const unauthorized = requireAdminSession()
  if (unauthorized) return unauthorized
  const url = new URL(req.url)
  const slug = url.searchParams.get('slug')

  if (!slug) {
    return NextResponse.json({ error: 'Missing query param: slug' }, { status: 400 })
  }

  const supabaseConfigured = isSupabaseConfigured()
  const project = await getProjectBySlug(slug)

  if (!project) {
    return NextResponse.json({ ok: false, supabaseConfigured, slug, project: null }, { status: 200 })
  }

  const images = (project.assets || []).filter(a => a.type === 'image')
  const models3D = (project.assets || []).filter(a => a.type === '3d_model')

  return NextResponse.json(
    {
      ok: true,
      supabaseConfigured,
      slug,
      project: {
        id: project.id,
        name: project.name,
        assetsCount: project.assets?.length ?? 0,
        imagesCount: images.length,
        models3DCount: models3D.length,
        imageUrls: images.slice(0, 6).map(a => a.cdn_url),
      },
    },
    { status: 200 },
  )
}

