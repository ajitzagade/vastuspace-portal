import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireAdminSession } from '@/lib/auth-api'
import { getProjectById, updateProject } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const unauthorized = requireAdminSession()
  if (unauthorized) return unauthorized
  const project = await getProjectById(params.id)
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(project)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const unauthorized = requireAdminSession()
  if (unauthorized) return unauthorized
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const updated = await updateProject(params.id, body as Parameters<typeof updateProject>[1])
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  // Return merged view (includes Supabase assets) so the dashboard matches the public page.
  const full = await getProjectById(params.id)
  const payload = full ?? updated
  try {
    revalidatePath(`/projects/${payload.slug}`)
    revalidatePath('/projects')
    revalidatePath('/')
    revalidatePath('/dashboard')
  } catch {
    // revalidatePath only in Next server context
  }
  return NextResponse.json(payload)
}
