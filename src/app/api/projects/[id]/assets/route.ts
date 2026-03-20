import { NextRequest, NextResponse } from 'next/server'
import { addAsset, getProjectById } from '@/lib/db'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/admin'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const project = await getProjectById(params.id)
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

  const contentType = req.headers.get('content-type') || ''
  const bucketName = process.env.SUPABASE_ASSET_BUCKET || 'property-assets'

  // File picker (multipart/form-data)
  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'file required' }, { status: 400 })
    }

    const typeRaw = String(formData.get('type') || '')
    const originalNameRaw = String(formData.get('original_name') || file.name || 'asset')
    const isHeroRaw = formData.get('is_hero')
    const cdnUrlRaw = formData.get('cdn_url')

    const isHero = typeof isHeroRaw === 'string' ? isHeroRaw === 'true' : Boolean(isHeroRaw)

    const type =
      typeRaw === 'image' || typeRaw === '3d_model' || typeRaw === 'floor_plan'
        ? typeRaw
        : originalNameRaw.endsWith('.glb') || originalNameRaw.endsWith('.gltf') || originalNameRaw.endsWith('.obj')
          ? '3d_model'
          : 'image'

    const originalName = originalNameRaw || 'asset'

    if (!isSupabaseConfigured()) {
      // Demo fallback: store metadata in-memory only.
      const asset = await addAsset(params.id, {
        project_id: params.id,
        type,
        storage_path: `projects/${project.slug}/${originalName}`,
        cdn_url: typeof cdnUrlRaw === 'string' ? cdnUrlRaw : '',
        metadata: { original_name: originalName, is_hero: isHero, order: project.assets?.length || 0 },
      })
      return NextResponse.json(asset, { status: 201 })
    }

    const supabase = getSupabaseAdmin()
    const storagePath = `projects/${project.slug}/${Date.now()}-${originalName}`

    const { error: uploadError } = await supabase.storage.from(bucketName).upload(storagePath, file, {
      contentType: file.type || undefined,
      upsert: false,
    })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const publicUrl = supabase.storage.from(bucketName).getPublicUrl(storagePath).data.publicUrl

    // Simple order for demo sorting.
    const { count } = await supabase
      .from('project_assets')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', params.id)

    const order = count ?? 0

    const metadata = { original_name: originalName, is_hero: isHero, order }

    const { data: inserted, error: insertError } = await supabase
      .from('project_assets')
      .insert({
        project_id: params.id,
        type,
        storage_path: storagePath,
        cdn_url: publicUrl,
        metadata,
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json(inserted, { status: 201 })
  }

  // Paste URL (JSON)
  const body = await req.json()
  const { type, cdn_url, original_name, is_hero } = body

  if (!type || !cdn_url) {
    return NextResponse.json({ error: 'type and cdn_url required' }, { status: 400 })
  }

  if (!isSupabaseConfigured()) {
    const asset = await addAsset(params.id, {
      project_id: params.id,
      type,
      storage_path: `projects/${project.slug}/${original_name || 'asset'}`,
      cdn_url,
      metadata: { original_name, is_hero: !!is_hero, order: project.assets?.length || 0 },
    })

    return NextResponse.json(asset, { status: 201 })
  }

  const supabase = getSupabaseAdmin()
  const originalName = original_name || 'asset'
  const storagePath = `projects/${project.slug}/external-${Date.now()}-${originalName}`

  const metadata = { original_name: originalName, is_hero: !!is_hero, order: project.assets?.length || 0 }

  const { data: inserted, error: insertError } = await supabase
    .from('project_assets')
    .insert({
      project_id: params.id,
      type,
      storage_path: storagePath,
      cdn_url,
      metadata,
    })
    .select()
    .single()

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json(inserted, { status: 201 })
}
