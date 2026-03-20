'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowLeft, Check, MapPin, Plus, X } from 'lucide-react'
import { ProjectFormData, AmenityItem } from '@/types'

const EMPTY_FORM: ProjectFormData = {
  name: '',
  tagline: '',
  brief: '',
  price: '',
  bedrooms: '',
  bathrooms: '',
  area_sqft: '',
  year_completion: '',
  location: { lat: 19.076, lng: 72.877, address: '', city: '', country: 'India' },
  amenities: { lifestyle: [], wellness: [], technology: [], location: [] },
  status: 'draft',
}

const STEPS = ['Basics', 'Details', 'Amenities', 'Media', 'Review']

export default function NewProjectPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<ProjectFormData>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [amenityInput, setAmenityInput] = useState<Record<string, string>>({
    lifestyle: '', wellness: '', technology: '', location: ''
  })

  const update = (key: keyof ProjectFormData, value: unknown) => {
    setForm(f => ({ ...f, [key]: value }))
  }

  const addAmenity = (cat: keyof typeof form.amenities) => {
    const text = amenityInput[cat]?.trim()
    if (!text) return
    const item: AmenityItem = { id: Date.now().toString(), name: text, icon: '✦' }
    setForm(f => ({
      ...f,
      amenities: { ...f.amenities, [cat]: [...f.amenities[cat], item] }
    }))
    setAmenityInput(prev => ({ ...prev, [cat]: '' }))
  }

  const removeAmenity = (cat: keyof typeof form.amenities, id: string) => {
    setForm(f => ({
      ...f,
      amenities: { ...f.amenities, [cat]: f.amenities[cat].filter(a => a.id !== id) }
    }))
  }

  const handleSubmit = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const project = await res.json()
      router.push(`/dashboard/${project.id}?created=true`)
    } catch (e) {
      console.error(e)
      setSaving(false)
    }
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-10">
        <h1 className="font-display text-4xl text-ivory font-light mb-1">New Project</h1>
        <p className="text-ivory/40 text-sm">Create a new property listing</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-0 mb-10">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center">
            <button
              onClick={() => i < step && setStep(i)}
              className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-mono transition-all ${
                i < step ? 'bg-gold text-obsidian cursor-pointer' :
                i === step ? 'border-2 border-gold text-gold' :
                'border border-obsidian-600 text-ivory/20'
              }`}
            >
              {i < step ? <Check size={12} /> : i + 1}
            </button>
            <span className={`ml-2 text-xs font-body hidden sm:block ${i === step ? 'text-ivory' : 'text-ivory/30'}`}>
              {s}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`w-12 h-px mx-4 ${i < step ? 'bg-gold/50' : 'bg-obsidian-600'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-6"
      >
        {step === 0 && (
          <>
            <Field label="Project Name *">
              <input className="input-luxury" value={form.name}
                onChange={e => update('name', e.target.value)}
                placeholder="e.g. Marble Heights" />
            </Field>
            <Field label="Tagline">
              <input className="input-luxury" value={form.tagline}
                onChange={e => update('tagline', e.target.value)}
                placeholder="e.g. Above the city. Beyond imagination." />
            </Field>
            <Field label="Project Brief">
              <textarea className="input-luxury min-h-[160px] resize-none" value={form.brief}
                onChange={e => update('brief', e.target.value)}
                placeholder="Describe the property, architecture, vision..." />
            </Field>
            <Field label="Status">
              <select className="input-luxury" value={form.status}
                onChange={e => update('status', e.target.value as 'draft' | 'published')}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </Field>
          </>
        )}

        {step === 1 && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Starting Price">
                <input className="input-luxury" value={form.price}
                  onChange={e => update('price', e.target.value)}
                  placeholder="e.g. ₹12.5 Cr onwards" />
              </Field>
              <Field label="Completion Year">
                <input className="input-luxury" value={form.year_completion}
                  onChange={e => update('year_completion', e.target.value)}
                  placeholder="e.g. 2026" />
              </Field>
              <Field label="Bedrooms">
                <input className="input-luxury" type="number" value={form.bedrooms}
                  onChange={e => update('bedrooms', e.target.value)} placeholder="4" />
              </Field>
              <Field label="Bathrooms">
                <input className="input-luxury" type="number" value={form.bathrooms}
                  onChange={e => update('bathrooms', e.target.value)} placeholder="4" />
              </Field>
              <Field label="Area (sq ft)" className="col-span-2">
                <input className="input-luxury" type="number" value={form.area_sqft}
                  onChange={e => update('area_sqft', e.target.value)} placeholder="4200" />
              </Field>
            </div>

            <div className="pt-2 border-t border-gold/10">
              <p className="text-ivory/60 text-xs tracking-widest uppercase mb-4 flex items-center gap-2">
                <MapPin size={12} className="text-gold" /> Location
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Address">
                  <input className="input-luxury" value={form.location.address}
                    onChange={e => update('location', { ...form.location, address: e.target.value })}
                    placeholder="Street / Area" />
                </Field>
                <Field label="City">
                  <input className="input-luxury" value={form.location.city}
                    onChange={e => update('location', { ...form.location, city: e.target.value })}
                    placeholder="Mumbai" />
                </Field>
                <Field label="Latitude">
                  <input className="input-luxury" type="number" step="0.0001" value={form.location.lat}
                    onChange={e => update('location', { ...form.location, lat: parseFloat(e.target.value) })} />
                </Field>
                <Field label="Longitude">
                  <input className="input-luxury" type="number" step="0.0001" value={form.location.lng}
                    onChange={e => update('location', { ...form.location, lng: parseFloat(e.target.value) })} />
                </Field>
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <div className="space-y-8">
            {(['lifestyle', 'wellness', 'technology', 'location'] as const).map(cat => (
              <div key={cat}>
                <p className="text-gold text-xs tracking-widest uppercase mb-3 capitalize">{cat}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {form.amenities[cat].map(item => (
                    <span key={item.id} className="flex items-center gap-1.5 px-3 py-1 bg-gold/10 border border-gold/20 text-gold text-xs rounded-sm">
                      {item.name}
                      <button onClick={() => removeAmenity(cat, item.id)} className="hover:text-ivory">
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    className="input-luxury flex-1"
                    value={amenityInput[cat] || ''}
                    onChange={e => setAmenityInput(prev => ({ ...prev, [cat]: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && addAmenity(cat)}
                    placeholder={`Add ${cat} amenity...`}
                  />
                  <button onClick={() => addAmenity(cat)}
                    className="px-3 bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20 transition-colors">
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}


        {step === 3 && (
          <div className="space-y-5">
            <div className="border border-gold/10 rounded-sm p-4 bg-gold/5">
              <p className="text-ivory/50 text-xs font-mono leading-relaxed">
                💡 Images and 3D models can be added after creating the project from the project editor. 
                You can preview the project and come back to upload assets at any time.
              </p>
            </div>
            <Field label="Hero Image URL (optional)">
              <input className="input-luxury" placeholder="https://images.unsplash.com/..." 
                onChange={e => update('brief', form.brief)} />
            </Field>
            <Field label="3D Model URL (optional)">
              <input className="input-luxury" placeholder="https://cdn.example.com/model.glb" />
              <p className="text-ivory/30 text-xs mt-1.5 font-mono">Accepts .glb, .gltf, .obj — shown in the interactive hero section</p>
            </Field>
            <div className="glass rounded-sm border border-gold/10 p-4">
              <p className="text-gold text-xs tracking-widest uppercase mb-2">After creating the project</p>
              <p className="text-ivory/40 text-xs leading-relaxed">
                Use the project editor to drag-and-drop images, upload full 3D models, add floor plans, and set the hero image. 
                All asset management is available from the dashboard once the project is created.
              </p>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="glass rounded-lg border border-gold/20 p-6 space-y-4">
            <h3 className="font-display text-2xl text-ivory font-light">{form.name || '(No name)'}</h3>
            {form.tagline && <p className="text-ivory/60 italic font-display">{form.tagline}</p>}
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Price', form.price],
                ['City', form.location.city],
                ['Bedrooms', form.bedrooms],
                ['Bathrooms', form.bathrooms],
                ['Area', form.area_sqft && `${form.area_sqft} sq ft`],
                ['Year', form.year_completion],
                ['Status', form.status],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={k as string} className="flex items-center gap-3">
                  <span className="text-ivory/30 text-xs font-mono w-20">{k}</span>
                  <span className="text-ivory/70">{v}</span>
                </div>
              ))}
            </div>
            {form.brief && (
              <div className="pt-4 border-t border-gold/10">
                <p className="text-ivory/50 text-sm leading-relaxed line-clamp-3">{form.brief}</p>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-10 pt-6 border-t border-gold/10">
        <button
          onClick={() => setStep(s => s - 1)}
          disabled={step === 0}
          className="flex items-center gap-2 text-ivory/40 hover:text-ivory disabled:opacity-20 transition-colors text-sm"
        >
          <ArrowLeft size={16} /> Back
        </button>
        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={(step === 0 && !form.name)}
            className="btn-gold flex items-center gap-2 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue <ArrowRight size={14} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="btn-gold flex items-center gap-2 text-xs disabled:opacity-60"
          >
            {saving ? 'Creating...' : <>Create Project <Check size={14} /></>}
          </button>
        )}
      </div>
    </div>
  )
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-xs text-ivory/40 tracking-widest uppercase mb-2 font-body">{label}</label>
      {children}
    </div>
  )
}
