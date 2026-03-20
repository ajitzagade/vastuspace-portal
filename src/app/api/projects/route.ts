import { NextRequest, NextResponse } from 'next/server'
import { createProject, getProjects } from '@/lib/db'

export async function GET() {
  const projects = await getProjects()
  return NextResponse.json(projects)
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  const project = await createProject(data)
  return NextResponse.json(project, { status: 201 })
}
