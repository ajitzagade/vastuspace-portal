import { NextResponse } from 'next/server'
import { getProjectBySlug } from '@/lib/db'

function extIsSupported(url: string) {
  const normalized = url.split('?')[0].split('#')[0].toLowerCase()
  return normalized.endsWith('.glb') || normalized.endsWith('.gltf')
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const slug = url.searchParams.get('slug')

  if (!slug) {
    return NextResponse.json({ ok: false, error: 'Missing query param: slug' }, { status: 400 })
  }

  const project = await getProjectBySlug(slug)
  if (!project) {
    return NextResponse.json({ ok: false, slug, project: null }, { status: 200 })
  }

  const models3D = (project.assets || []).filter(a => a.type === '3d_model')
  const sortedModels3D = [...models3D].sort((a, b) => {
    const aHero = a.metadata.is_hero ? 1 : 0
    const bHero = b.metadata.is_hero ? 1 : 0
    if (aHero !== bHero) return bHero - aHero

    const aOrder = a.metadata.order ?? 0
    const bOrder = b.metadata.order ?? 0
    if (aOrder !== bOrder) return aOrder - bOrder

    const aName = a.metadata.original_name ?? a.storage_path
    const bName = b.metadata.original_name ?? b.storage_path
    return aName.localeCompare(bName)
  })

  const supportedModels3D = sortedModels3D.filter(m => extIsSupported(m.cdn_url))

  // PropertyGallery currently defaults selectedModelIndex=0 (reset on project.id change).
  const uiSelected = supportedModels3D[0] || null

  return NextResponse.json(
    {
      ok: true,
      slug,
      project: { id: project.id, name: project.name },
      counts: {
        total3dModels: sortedModels3D.length,
        supported3dModels: supportedModels3D.length,
      },
      uiDefaults: {
        selectedModelIndex: 0,
        selectedModel: uiSelected
          ? {
              id: uiSelected.id,
              original_name: uiSelected.metadata.original_name ?? uiSelected.storage_path,
              cdn_url: uiSelected.cdn_url,
              supported: extIsSupported(uiSelected.cdn_url),
              created_at: uiSelected.created_at,
            }
          : null,
      },
      models3d: sortedModels3D.map(m => ({
        id: m.id,
        original_name: m.metadata.original_name ?? m.storage_path,
        cdn_url: m.cdn_url,
        supported: extIsSupported(m.cdn_url),
        created_at: m.created_at,
      })),
    },
    { status: 200 },
  )
}

