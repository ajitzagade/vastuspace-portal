import { NextRequest, NextResponse } from 'next/server'
import { getProjectById, updateProject } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const project = await getProjectById(params.id)
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(project)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const updated = await updateProject(params.id, body as Parameters<typeof updateProject>[1])
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(updated)
}
