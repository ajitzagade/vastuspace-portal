'use client'

import { useState } from 'react'
import { ArrowRight, Phone, Mail, MapPin } from 'lucide-react'

interface Props {
  projects: { id: string; slug: string; name: string }[]
}

export default function ContactForm({ projects }: Props) {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '', project: '', message: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="glass border border-gold/20 rounded-sm p-12 text-center">
        <div className="w-14 h-14 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center mx-auto mb-6">
          <span className="text-gold text-2xl">✓</span>
        </div>
        <h3 className="font-display text-3xl text-ivory font-light mb-3">Message Received</h3>
        <p className="text-ivory/40 font-body">
          Thank you for reaching out. Our advisor will contact you within 24 hours.
        </p>
        <button
          onClick={() => { setSubmitted(false); setForm({ name: '', phone: '', email: '', project: '', message: '' }) }}
          className="btn-ghost text-xs mt-6 px-6 py-2"
        >
          Send Another
        </button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-ivory/40 tracking-widest uppercase mb-2 font-body">Name</label>
            <input
              required
              className="input-luxury"
              placeholder="Your full name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs text-ivory/40 tracking-widest uppercase mb-2 font-body">Phone</label>
            <input
              className="input-luxury"
              placeholder="+91 00000 00000"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-ivory/40 tracking-widest uppercase mb-2 font-body">Email</label>
          <input
            required
            type="email"
            className="input-luxury"
            placeholder="your@email.com"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-xs text-ivory/40 tracking-widest uppercase mb-2 font-body">Project Interest</label>
          <select
            className="input-luxury"
            value={form.project}
            onChange={e => setForm(f => ({ ...f, project: e.target.value }))}
          >
            <option value="">Select a project...</option>
            {projects.map(p => (
              <option key={p.id} value={p.slug}>{p.name}</option>
            ))}
            <option value="general">General Enquiry</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-ivory/40 tracking-widest uppercase mb-2 font-body">Message</label>
          <textarea
            className="input-luxury min-h-[120px] resize-none"
            placeholder="Tell us what you're looking for..."
            value={form.message}
            onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
          />
        </div>
        <button type="submit" className="btn-gold w-full flex items-center justify-center gap-2 text-sm">
          Send Enquiry <ArrowRight size={14} />
        </button>
      </form>

      <div className="space-y-6">
        <div className="glass border border-gold/10 rounded-sm p-6">
          <h3 className="font-display text-xl text-ivory font-light mb-6">Get in touch</h3>
          <div className="space-y-5">
            {[
              { icon: Phone, label: 'Call Us', value: '+91 98765 43210' },
              { icon: Mail, label: 'Email Us', value: 'hello@vastuspace.com' },
              { icon: MapPin, label: 'Visit Us', value: 'VastuSpace HQ, BKC, Mumbai 400051' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-sm bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon size={14} className="text-gold" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-ivory/30 text-xs font-mono tracking-widest mb-0.5">{label}</p>
                  <p className="text-ivory/70 text-sm font-body">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="glass border border-gold/10 rounded-sm p-6">
          <p className="text-ivory/30 text-xs font-mono tracking-widest mb-3">Office Hours</p>
          <div className="space-y-2 text-sm font-body">
            <div className="flex justify-between text-ivory/60">
              <span>Monday – Friday</span><span className="text-gold/70">9:00 AM – 7:00 PM</span>
            </div>
            <div className="flex justify-between text-ivory/60">
              <span>Saturday</span><span className="text-gold/70">10:00 AM – 5:00 PM</span>
            </div>
            <div className="flex justify-between text-ivory/40">
              <span>Sunday</span><span>By appointment</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
