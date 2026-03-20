import { NextRequest, NextResponse } from 'next/server'
import { addAsset, getProjectById } from '@/lib/db'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const project = await getProjectById(params.id)
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

  const body = await req.json()
  const { type, cdn_url, original_name, is_hero } = body

  if (!type || !cdn_url) {
    return NextResponse.json({ error: 'type and cdn_url required' }, { status: 400 })
  }

  const asset = await addAsset(params.id, {
    project_id: params.id,
    type,
    storage_path: `projects/${project.slug}/${original_name || 'asset'}`,
    cdn_url,
    metadata: { original_name, is_hero: !!is_hero, order: project.assets?.length || 0 },
  })

  return NextResponse.json(asset, { status: 201 })
}
