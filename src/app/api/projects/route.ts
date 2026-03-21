import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireAdminSession } from '@/lib/auth-api'
import { createProject, getProjects } from '@/lib/db'

export async function GET() {
  const unauthorized = requireAdminSession()
  if (unauthorized) return unauthorized
  const projects = await getProjects()
  return NextResponse.json(projects)
}

export async function POST(req: NextRequest) {
  const unauthorized = requireAdminSession()
  if (unauthorized) return unauthorized
  const data = await req.json()
  const project = await createProject(data)
  try {
    revalidatePath('/dashboard')
    revalidatePath('/projects')
    revalidatePath('/')
  } catch {
    // ignore outside Next server
  }
  return NextResponse.json(project, { status: 201 })
}
