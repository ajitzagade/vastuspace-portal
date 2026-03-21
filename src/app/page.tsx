import { getProjects } from '@/lib/db'
import { getProjectSubdomainUrl } from '@/lib/site-url'
import Link from 'next/link'
import { ArrowRight, Building2, MapPin, Star, ChevronDown } from 'lucide-react'
import ContactForm from '@/components/landing/ContactForm'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const allProjects = await getProjects()
  const published = allProjects.filter(p => p.status === 'published')

  return (
    <main className="bg-obsidian text-ivory overflow-x-hidden">

      {/* ── STICKY NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-obsidian/95 backdrop-blur-sm border-b border-gold/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-display text-2xl text-gold tracking-widest font-light">VASTUSPACE</span>
          <div className="hidden md:flex items-center gap-8 text-xs font-body tracking-widest uppercase text-ivory/50">
            <a href="#about" className="hover:text-gold transition-colors">About</a>
            <a href="#projects" className="hover:text-gold transition-colors">Projects</a>
            <a href="#testimonials" className="hover:text-gold transition-colors">Testimonials</a>
            <a href="#contact" className="hover:text-gold transition-colors">Contact</a>
            <Link href="/login?redirect=/dashboard" className="border border-gold/40 text-gold px-5 py-2 hover:bg-gold/10 transition-colors">
              Admin
            </Link>
          </div>
          {/* Mobile hamburger placeholder */}
          <div className="md:hidden flex items-center gap-3">
            <a href="#contact" className="text-gold text-xs border border-gold/40 px-4 py-2">Contact</a>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section id="home" className="relative min-h-screen flex items-center pt-20">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 -left-32 w-[600px] h-[600px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)' }} />
          <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%)' }} />
        </div>
        <div className="max-w-7xl mx-auto px-6 py-20 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-gold/60 text-xs tracking-[0.4em] uppercase mb-6 font-body">Luxury Real Estate · India</p>
            <h1 className="font-display text-7xl md:text-8xl font-light leading-none mb-8">
              <span className="block text-ivory">Homes</span>
              <span className="block text-gold-gradient italic">Beyond</span>
              <span className="block text-ivory">Ordinary</span>
            </h1>
            <p className="text-ivory/50 font-body text-lg leading-relaxed max-w-md mb-12">
              VastuSpace curates extraordinary properties across India — where architecture, landscape, and life converge in perfect harmony.
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <a href="#projects" className="btn-gold flex items-center gap-3 text-sm">
                Explore Projects <ArrowRight size={16} />
              </a>
              <a href="#contact" className="btn-ghost text-sm py-3">
                Get in Touch
              </a>
            </div>
          </div>

          {published[0] && (
            <div className="relative">
              <div className="absolute -top-4 -right-4 w-full h-full glass rounded-lg border border-gold/10" />
              <div className="absolute -top-2 -right-2 w-full h-full glass rounded-lg border border-gold/10" />
              <Link
                href={`/projects/${published[0].slug}`}
                className="relative glass rounded-lg overflow-hidden border border-gold/20 block group"
              >
                <div className="aspect-[4/3] relative overflow-hidden">
                  {published[0].assets?.find(a => a.metadata.is_hero) && (
                    <img
                      src={published[0].assets.find(a => a.metadata.is_hero)!.cdn_url}
                      alt={published[0].name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="text-gold text-xs tracking-widest uppercase mb-1">{published[0].location?.city}</p>
                    <h3 className="font-display text-3xl text-ivory font-light">{published[0].name}</h3>
                    <p className="text-ivory/60 text-sm mt-1">{published[0].price} · {published[0].bedrooms} BHK</p>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <span className="text-gold/60 text-xs font-mono tracking-widest">
                    {getProjectSubdomainUrl(published[0].slug).replace(/^https?:\/\//, '')}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
              </Link>
            </div>
          )}
        </div>

        <a href="#about" className="absolute bottom-8 left-1/2 -translate-x-1/2 text-ivory/20 hover:text-gold transition-colors animate-bounce">
          <ChevronDown size={24} />
        </a>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" className="py-32 px-6 border-t border-gold/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-px bg-gold" />
              <span className="text-gold/60 text-xs tracking-[0.4em] uppercase font-mono">About VastuSpace</span>
            </div>
            <h2 className="font-display text-5xl md:text-6xl text-ivory font-light leading-tight mb-8">
              Where <span className="text-gold-gradient italic">Vastu</span> meets<br />Vision
            </h2>
            <p className="text-ivory/50 font-body text-lg leading-relaxed mb-6">
              Founded on the principles of ancient Vastu Shastra and modern architectural excellence, VastuSpace creates properties that are not just homes — they are environments designed for wellbeing, prosperity, and beauty.
            </p>
            <p className="text-ivory/40 font-body leading-relaxed mb-10">
              Every project we curate undergoes rigorous Vastu analysis, ensuring that light, space, and energy flow harmoniously. We partner only with architects who share our belief that a great home changes the way you live.
            </p>
            <div className="grid grid-cols-3 gap-6">
              {[
                ['12+', 'Years of Excellence'],
                ['48', 'Landmark Projects'],
                ['1200+', 'Happy Families'],
              ].map(([n, l]) => (
                <div key={l} className="border-l border-gold/30 pl-4">
                  <p className="font-display text-4xl text-gold font-light">{n}</p>
                  <p className="text-ivory/40 text-xs font-body mt-1 leading-tight">{l}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="aspect-square rounded-sm overflow-hidden">
                <img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=600&q=80" alt="Architecture" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="aspect-video rounded-sm overflow-hidden">
                <img src="https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=600&q=80" alt="Interior" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              </div>
            </div>
            <div className="space-y-4 pt-8">
              <div className="aspect-video rounded-sm overflow-hidden">
                <img src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&q=80" alt="Design" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="aspect-square rounded-sm overflow-hidden">
                <img src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&q=80" alt="Luxury" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROJECTS ── */}
      <section id="projects" className="py-32 px-6 border-t border-gold/10 bg-obsidian-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-16">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-px bg-gold" />
                <span className="text-gold/60 text-xs tracking-[0.4em] uppercase font-mono">Our Portfolio</span>
              </div>
              <h2 className="font-display text-5xl md:text-6xl text-ivory font-light">
                Featured <span className="text-gold-gradient italic">Projects</span>
              </h2>
            </div>
            <Link href="/projects" className="btn-ghost text-xs py-2.5 hidden md:flex items-center gap-2">
              View All Projects <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {published.map((p, i) => {
              const hero = p.assets?.find(a => a.metadata.is_hero)
              const has3D = p.assets?.some(a => a.type === '3d_model')
              return (
                <Link
                  key={p.id}
                  href={`/projects/${p.slug}`}
                  className="group glass border border-gold/10 hover:border-gold/30 rounded-sm overflow-hidden transition-all duration-300 block"
                  style={{ transform: `translateY(${i % 2 === 1 ? '24px' : '0'})` }}
                >
                  <div className="aspect-[4/3] overflow-hidden bg-obsidian-700 relative">
                    {hero ? (
                      <img src={hero.cdn_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-ivory/10">
                        <Building2 size={40} strokeWidth={0.5} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {has3D && (
                      <div className="absolute top-3 left-3">
                        <span className="bg-gold/90 text-obsidian text-xs px-2 py-0.5 font-mono tracking-wider rounded-sm">3D</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-gold/50 text-xs font-mono tracking-widest mb-1 flex items-center gap-1">
                          <MapPin size={10} /> {p.location?.city}
                        </p>
                        <h3 className="font-display text-2xl text-ivory font-light group-hover:text-gold transition-colors">{p.name}</h3>
                      </div>
                      <ArrowRight size={16} className="text-gold/30 group-hover:text-gold transition-colors mt-2" />
                    </div>
                    {p.tagline && (
                      <p className="text-ivory/35 text-xs font-body italic mb-3 line-clamp-1">{p.tagline}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-ivory/40 font-body pt-3 border-t border-gold/10">
                      {p.price && <span className="text-gold/70 font-medium">{p.price}</span>}
                      {p.bedrooms && <span>{p.bedrooms} BHK</span>}
                      {p.area_sqft && <span>{p.area_sqft.toLocaleString()} sq ft</span>}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          <div className="flex justify-center mt-12 md:hidden">
            <Link href="/projects" className="btn-ghost text-xs flex items-center gap-2">
              View All Projects <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" className="py-32 px-6 border-t border-gold/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-12 h-px bg-gold/40" />
              <span className="text-gold/60 text-xs tracking-[0.4em] uppercase font-mono">What Residents Say</span>
              <div className="w-12 h-px bg-gold/40" />
            </div>
            <h2 className="font-display text-5xl text-ivory font-light">
              Lived <span className="text-gold-gradient italic">Experiences</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {published
              .flatMap(p => (p.testimonials || []).slice(0, 1).map(t => ({ ...t, project: p.name })))
              .slice(0, 3)
              .map(t => (
                <div key={t.id} className="glass border border-gold/10 rounded-sm p-8 hover:border-gold/20 transition-colors">
                  <div className="flex items-center gap-1 mb-6">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} size={12} className="text-gold fill-gold" />
                    ))}
                  </div>
                  <p className="text-ivory/60 font-body leading-relaxed mb-6 font-display text-lg italic">
                    "{t.text}"
                  </p>
                  <div className="pt-5 border-t border-gold/10">
                    <p className="text-ivory/80 font-body text-sm font-medium">{t.name}</p>
                    <p className="text-gold/50 text-xs font-mono mt-0.5">{t.role}</p>
                    <p className="text-ivory/20 text-xs font-mono mt-0.5">{t.project}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="py-32 px-6 border-t border-gold/10 bg-obsidian-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-12 h-px bg-gold/40" />
              <span className="text-gold/60 text-xs tracking-[0.4em] uppercase font-mono">Reach Us</span>
              <div className="w-12 h-px bg-gold/40" />
            </div>
            <h2 className="font-display text-5xl text-ivory font-light mb-4">
              Begin your <span className="text-gold-gradient italic">journey</span>
            </h2>
            <p className="text-ivory/40 font-body max-w-md mx-auto">
              Our advisors are available to guide you through every step of finding your perfect VastuSpace home.
            </p>
          </div>
          <ContactForm projects={published.map(p => ({ id: p.id, slug: p.slug, name: p.name }))} />
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-gold/10 px-6 py-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="font-display text-xl text-gold tracking-widest">VASTUSPACE</span>
            <p className="text-ivory/20 text-xs font-mono mt-1">Luxury Real Estate · India</p>
          </div>
          <div className="flex items-center gap-6 text-xs font-body tracking-widest uppercase text-ivory/30">
            <a href="#about" className="hover:text-gold transition-colors">About</a>
            <a href="#projects" className="hover:text-gold transition-colors">Projects</a>
            <a href="#testimonials" className="hover:text-gold transition-colors">Testimonials</a>
            <a href="#contact" className="hover:text-gold transition-colors">Contact</a>
          </div>
          <p className="text-ivory/20 text-xs font-mono">© 2026 VastuSpace. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
