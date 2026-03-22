/**
 * Supabase Storage rejects many characters in object keys. macOS screenshot names
 * include ASCII spaces and Unicode spaces (e.g. U+202F before "AM/PM"), which
 * surface as "Invalid key". We only sanitize the **storage key**; keep the real
 * name in `metadata.original_name` for UI.
 */
export function sanitizeStorageFileName(name: string): string {
  const trimmed = name.trim() || 'upload'
  const lastDot = trimmed.lastIndexOf('.')
  const hasExt = lastDot > 0 && lastDot < trimmed.length - 1
  let base = hasExt ? trimmed.slice(0, lastDot) : trimmed
  let ext = hasExt ? trimmed.slice(lastDot).toLowerCase() : ''

  // Whitespace incl. NBSP / narrow NBSP (U+202F in macOS "7.18.04 PM" filenames) — no `/u` flag for older TS targets
  base = base
    .replace(/[\t\n\v\f\r \u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]+/g, '-')
    // Path / URL / shell-unfriendly characters
    .replace(/[/\\#?%&{}[\]|^~`"<>@+=*,;:!]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')

  if (ext) {
    const raw = ext.replace(/^\./, '').replace(/[^a-z0-9]/gi, '')
    ext = raw ? `.${raw.slice(0, 12)}` : ''
  }

  let out = `${base || 'upload'}${ext}`
  if (out.length > 180) {
    out = out.slice(0, 180)
  }
  return out || 'upload.bin'
}
