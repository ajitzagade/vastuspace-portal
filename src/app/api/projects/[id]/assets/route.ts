import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/auth-api'
import { addAsset, deleteAsset, getProjectById } from '@/lib/db'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/admin'

/** FormData / JSON sometimes omit or stringify metadata; keep dashboard + public UI stable. */
function normalizeAssetResponse(row: Record<string, unknown>) {
  const rawMeta = row.metadata
  const metadata =
    rawMeta && typeof rawMeta === 'object' && !Array.isArray(rawMeta)
      ? (rawMeta as Record<string, unknown>)
      : {}
  return { ...row, metadata }
}

function parseFormBool(v: FormDataEntryValue | null): boolean {
  if (v == null) return false
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase()
    if (s === 'true' || s === '1' || s === 'yes') return true
    if (s === 'false' || s === '0' || s === '' || s === 'null') return false
    try {
      const parsed = JSON.parse(s) as unknown
      return parsed === true || parsed === 'true'
    } catch {
      return false
    }
  }
  return Boolean(v)
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const unauthorized = requireAdminSession()
  if (unauthorized) return unauthorized
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

    const isHero = parseFormBool(isHeroRaw)

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
      return NextResponse.json(normalizeAssetResponse(asset as unknown as Record<string, unknown>), { status: 201 })
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

    return NextResponse.json(normalizeAssetResponse(inserted as unknown as Record<string, unknown>), { status: 201 })
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

    return NextResponse.json(normalizeAssetResponse(asset as unknown as Record<string, unknown>), { status: 201 })
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

  return NextResponse.json(normalizeAssetResponse(inserted as unknown as Record<string, unknown>), { status: 201 })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const unauthorized = requireAdminSession()
  if (unauthorized) return unauthorized
  const contentType = req.headers.get('content-type') || ''
  const bucketName = process.env.SUPABASE_ASSET_BUCKET || 'property-assets'

  let assetId: string | null = null

  if (contentType.includes('application/json')) {
    const body = await req.json()
    assetId = body?.asset_id || body?.assetId || null
  } else {
    const url = req.nextUrl
    assetId = url.searchParams.get('asset_id')
  }

  if (!assetId) {
    return NextResponse.json({ error: 'Missing asset_id' }, { status: 400 })
  }

  const project = await getProjectById(params.id)
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

  if (!isSupabaseConfigured()) {
    const ok = await deleteAsset(params.id, assetId)
    return NextResponse.json({ ok, assetId }, { status: ok ? 200 : 404 })
  }

  const supabase = getSupabaseAdmin()

  const { data: assetRow, error: assetError } = await supabase
    .from('project_assets')
    .select('id, project_id, storage_path')
    .eq('id', assetId)
    .eq('project_id', params.id)
    .single()

  if (assetError || !assetRow) {
    return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
  }

  // Remove file from public storage bucket (ignore not-found to support legacy rows).
  try {
    const { error: removeError } = await supabase.storage.from(bucketName).remove([assetRow.storage_path])
    // Supabase can error if the object doesn't exist (e.g., legacy CDN-only rows).
    if (removeError && !removeError.message.toLowerCase().includes('not found')) {
      // Continue to delete metadata even if storage removal fails.
      console.warn('Supabase storage remove failed:', removeError.message)
    }
  } catch (e) {
    console.warn('Supabase storage remove threw:', e)
  }

  const { error: deleteError } = await supabase
    .from('project_assets')
    .delete()
    .eq('id', assetId)
    .eq('project_id', params.id)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, assetId }, { status: 200 })
}
