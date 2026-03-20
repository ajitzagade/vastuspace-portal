import { getProjectBySlug } from '@/lib/db'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import PropertyHero from '@/components/landing/PropertyHero'
import PropertyGallery from '@/components/landing/PropertyGallery'
import PropertyAmenities from '@/components/landing/PropertyAmenities'
import PropertyEnquire from '@/components/landing/PropertyEnquire'
import PropertyNav from '@/components/landing/PropertyNav'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const project = await getProjectBySlug(params.slug)
  if (!project) return { title: 'Not Found' }
  return {
    title: `${project.name} — VastuSpace`,
    description: project.tagline,
    openGraph: {
      title: `${project.name} by VastuSpace`,
      description: project.tagline,
      images: project.assets?.find(a => a.metadata.is_hero)?.cdn_url ? [project.assets.find(a => a.metadata.is_hero)!.cdn_url] : [],
    }
  }
}

export default async function PropertyPage({ params }: { params: { slug: string } }) {
  const project = await getProjectBySlug(params.slug)
  if (!project) notFound()

  return (
    <div className="min-h-screen bg-obsidian overflow-x-hidden">
      <PropertyNav project={project} />
      <PropertyHero project={project} />
      <PropertyGallery project={project} />
      <PropertyAmenities project={project} />
      <PropertyEnquire project={project} />
    </div>
  )
}
