'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Project } from '@/types'
import { Send, Check, Phone, Mail, MapPin } from 'lucide-react'

export default function PropertyEnquire({ project }: { project: Project }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTimeout(() => setSubmitted(true), 400)
  }

  return (
    <section ref={ref} id="enquire" className="relative py-32 px-8 bg-obsidian">
      {/* Diagonal top border */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-obsidian-800"
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 0%, 0 100%)' }} />

      <div className="relative max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">

          {/* Left: Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-px bg-gold/40" />
              <p className="text-gold text-xs tracking-[0.4em] uppercase font-mono">Private Enquiry</p>
            </div>

            <h2 className="font-display text-5xl md:text-6xl text-ivory font-light leading-tight mb-8">
              Begin your<br />
              <span className="text-gold-gradient italic">conversation.</span>
            </h2>

            <p className="text-ivory/50 leading-relaxed font-body max-w-sm mb-12">
              Our advisors are available to arrange a private viewing of {project.name} at your convenience.
            </p>

            {/* Property summary */}
            <div className="glass rounded-sm border border-gold/15 p-6 space-y-4">
              <h3 className="font-display text-2xl text-ivory font-light">{project.name}</h3>
              {project.tagline && <p className="text-ivory/40 text-sm italic font-display">{project.tagline}</p>}
              <div className="pt-3 border-t border-gold/10 space-y-2">
                {project.price && (
                  <div className="flex items-center gap-3">
                    <span className="text-gold text-xs font-mono w-20">PRICE</span>
                    <span className="text-ivory/70 text-sm">{project.price}</span>
                  </div>
                )}
                {project.location?.city && (
                  <div className="flex items-center gap-3">
                    <MapPin size={12} className="text-gold ml-0.5" />
                    <span className="text-ivory/70 text-sm">{project.location.address}, {project.location.city}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-6 mt-8">
              <a href="tel:+919999999999" className="flex items-center gap-2 text-ivory/30 hover:text-gold transition-colors text-sm">
                <Phone size={14} /> +91 99999 99999
              </a>
              <a href="mailto:hello@vastuspace.com" className="flex items-center gap-2 text-ivory/30 hover:text-gold transition-colors text-sm">
                <Mail size={14} /> hello@vastuspace.com
              </a>
            </div>
          </motion.div>

          {/* Right: Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass rounded-sm border border-gold/20 p-12 text-center"
              >
                <div className="w-14 h-14 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center mx-auto mb-6">
                  <Check size={24} className="text-gold" />
                </div>
                <h3 className="font-display text-3xl text-ivory font-light mb-3">Enquiry Received</h3>
                <p className="text-ivory/40 font-body">
                  Thank you for your interest in {project.name}. Our advisor will be in touch within 24 hours.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-ivory/30 tracking-widest uppercase mb-2 font-mono">Name</label>
                    <input
                      className="input-luxury"
                      required
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-ivory/30 tracking-widest uppercase mb-2 font-mono">Phone</label>
                    <input
                      className="input-luxury"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="+91 00000 00000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-ivory/30 tracking-widest uppercase mb-2 font-mono">Email</label>
                  <input
                    type="email"
                    className="input-luxury"
                    required
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-xs text-ivory/30 tracking-widest uppercase mb-2 font-mono">Message</label>
                  <textarea
                    className="input-luxury min-h-[120px] resize-none"
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder={`I am interested in ${project.name} and would like to schedule a private viewing...`}
                  />
                </div>

                <button type="submit" className="btn-gold w-full flex items-center justify-center gap-3">
                  <Send size={14} />
                  Submit Enquiry
                </button>

                <p className="text-ivory/20 text-xs text-center font-mono">
                  Your information is kept strictly confidential.
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative max-w-6xl mx-auto mt-24 pt-10 border-t border-gold/10 flex items-center justify-between">
        <span className="font-display text-gold tracking-widest font-light">VASTUSPACE</span>
        <span className="text-ivory/20 text-xs font-mono">{project.slug}.vastuspace.com</span>
        <span className="text-ivory/20 text-xs font-mono">© 2026</span>
      </div>
    </section>
  )
}
