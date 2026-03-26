import type { Warranty, Reminder, CreateWarrantyInput } from '@/types'
import { supabase, isSupabaseConfigured } from './supabase'
import { dummyWarranties, dummyReminders } from './dummy-data'
import { addMonths, format } from 'date-fns'

// In-memory stores per user type (persists during session)
let existingWarranties = [...dummyWarranties]
let existingReminders = [...dummyReminders]
let newUserWarranties: Warranty[] = []
let newUserReminders: (Reminder & { warranty?: Warranty })[] = []
let nextId = 100

// Track which demo user is active: 'existing' (Sanchari) or 'new' (empty account)
let activeDemoUser: 'existing' | 'new' = 'existing'

export function setActiveDemoUser(type: 'existing' | 'new') {
  activeDemoUser = type
}

function getLocalWarranties(): Warranty[] {
  return activeDemoUser === 'new' ? newUserWarranties : existingWarranties
}

function setLocalWarranties(warranties: Warranty[]) {
  if (activeDemoUser === 'new') {
    newUserWarranties = warranties
  } else {
    existingWarranties = warranties
  }
}

function pushLocalWarranty(warranty: Warranty) {
  if (activeDemoUser === 'new') {
    newUserWarranties.push(warranty)
  } else {
    existingWarranties.push(warranty)
  }
}

function getLocalReminders() {
  return activeDemoUser === 'new' ? newUserReminders : existingReminders
}

function setLocalReminders(reminders: typeof existingReminders) {
  if (activeDemoUser === 'new') {
    newUserReminders = reminders as typeof newUserReminders
  } else {
    existingReminders = reminders
  }
}

// Check if user is logged in — if not, use dummy data even when Supabase is configured
async function isAuthenticated(): Promise<boolean> {
  if (!isSupabaseConfigured) return false
  const { data: { session } } = await supabase!.auth.getSession()
  return !!session
}

// ─── Warranties ────────────────────────────────────────────

export async function fetchWarranties(): Promise<Warranty[]> {
  if (await isAuthenticated()) {
    const { data, error } = await supabase!
      .from('warranties')
      .select('*, documents(*)')
      .is('trashed_at', null)
      .order('expiry_date')
    if (error) throw error
    return data ?? []
  }
  return getLocalWarranties().filter((w) => !w.trashed_at)
}

export async function fetchWarrantyById(id: string): Promise<Warranty | null> {
  if (await isAuthenticated()) {
    const { data, error } = await supabase!
      .from('warranties')
      .select('*, documents(*)')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  }
  return getLocalWarranties().find((w) => w.id === id) ?? null
}

export async function createWarranty(input: CreateWarrantyInput): Promise<Warranty> {
  if (await isAuthenticated()) {
    const { data: { user } } = await supabase!.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    const { data, error } = await supabase!
      .from('warranties')
      .insert({
        user_id: user.id,
        product_name: input.product_name,
        brand: input.brand || null,
        category: input.category,
        purchase_date: input.purchase_date,
        warranty_months: input.warranty_months,
        serial_number: input.serial_number || null,
        warranty_terms: input.warranty_terms || null,
        brand_contact: input.brand_contact || null,
        notes: input.notes || null,
        image_url: input.image_url || null,
        gallery_urls: input.gallery_urls || [],
        reminder_config: input.reminder_config || { enabled: ['30_day', '7_day', 'expiry'], custom: [] },
      })
      .select('*, documents(*)')
      .single()
    if (error) throw error
    return data
  }
  const now = format(new Date(), 'yyyy-MM-dd')
  const warranty: Warranty = {
    id: `w${++nextId}`,
    user_id: 'demo-user',
    product_name: input.product_name,
    brand: input.brand ?? null,
    category: input.category,
    purchase_date: input.purchase_date,
    warranty_months: input.warranty_months,
    expiry_date: format(addMonths(new Date(input.purchase_date), input.warranty_months), 'yyyy-MM-dd'),
    serial_number: input.serial_number ?? null,
    warranty_terms: input.warranty_terms ?? null,
    brand_contact: input.brand_contact ?? null,
    notes: input.notes ?? null,
    image_url: input.image_url ?? null,
    gallery_urls: input.gallery_urls ?? [],
    reminder_config: input.reminder_config ?? { enabled: ['30_day', '7_day', 'expiry'], custom: [] },
    created_at: now,
    updated_at: now,
    trashed_at: null,
    documents: [],
  }
  pushLocalWarranty(warranty)
  return warranty
}

export async function updateWarranty(id: string, input: Partial<CreateWarrantyInput>): Promise<Warranty | null> {
  if (await isAuthenticated()) {
    // Only send fields that exist in the DB (exclude expiry_date — it's generated)
    const updateFields: Record<string, unknown> = {}
    if (input.product_name !== undefined) updateFields.product_name = input.product_name
    if (input.brand !== undefined) updateFields.brand = input.brand || null
    if (input.category !== undefined) updateFields.category = input.category
    if (input.purchase_date !== undefined) updateFields.purchase_date = input.purchase_date
    if (input.warranty_months !== undefined) updateFields.warranty_months = input.warranty_months
    if (input.serial_number !== undefined) updateFields.serial_number = input.serial_number || null
    if (input.warranty_terms !== undefined) updateFields.warranty_terms = input.warranty_terms || null
    if (input.brand_contact !== undefined) updateFields.brand_contact = input.brand_contact || null
    if (input.notes !== undefined) updateFields.notes = input.notes || null
    if (input.image_url !== undefined) updateFields.image_url = input.image_url || null
    if (input.gallery_urls !== undefined) updateFields.gallery_urls = input.gallery_urls || []
    if (input.reminder_config !== undefined) updateFields.reminder_config = input.reminder_config

    const { data, error } = await supabase!
      .from('warranties')
      .update(updateFields)
      .eq('id', id)
      .select('*, documents(*)')
      .single()
    if (error) throw error
    return data
  }
  const locals = getLocalWarranties()
  const idx = locals.findIndex((w) => w.id === id)
  if (idx === -1) return null
  const existing = locals[idx]
  const updated: Warranty = {
    ...existing,
    ...input,
    brand: input.brand ?? existing.brand,
    serial_number: input.serial_number ?? existing.serial_number,
    warranty_terms: input.warranty_terms ?? existing.warranty_terms,
    brand_contact: input.brand_contact ?? existing.brand_contact,
    notes: input.notes ?? existing.notes,
    gallery_urls: input.gallery_urls ?? existing.gallery_urls,
    reminder_config: input.reminder_config ?? existing.reminder_config,
    expiry_date: input.purchase_date || input.warranty_months
      ? format(
          addMonths(
            new Date(input.purchase_date ?? existing.purchase_date),
            input.warranty_months ?? existing.warranty_months
          ),
          'yyyy-MM-dd'
        )
      : existing.expiry_date,
    updated_at: format(new Date(), 'yyyy-MM-dd'),
  }
  locals[idx] = updated
  return updated
}

export async function trashWarranty(id: string): Promise<void> {
  const now = format(new Date(), 'yyyy-MM-dd')
  if (await isAuthenticated()) {
    const { error } = await supabase!.from('warranties').update({ trashed_at: now }).eq('id', id)
    if (error) throw error
    return
  }
  const locals = getLocalWarranties()
  const idx = locals.findIndex((w) => w.id === id)
  if (idx !== -1) locals[idx] = { ...locals[idx], trashed_at: now }
}

export async function fetchTrashedWarranties(): Promise<Warranty[]> {
  if (await isAuthenticated()) {
    const { data, error } = await supabase!
      .from('warranties')
      .select('*, documents(*)')
      .not('trashed_at', 'is', null)
      .order('trashed_at', { ascending: false })
    if (error) throw error
    return data ?? []
  }
  return getLocalWarranties().filter((w) => !!w.trashed_at)
}

export async function restoreWarranty(id: string): Promise<void> {
  if (await isAuthenticated()) {
    const { error } = await supabase!.from('warranties').update({ trashed_at: null }).eq('id', id)
    if (error) throw error
    return
  }
  const locals = getLocalWarranties()
  const idx = locals.findIndex((w) => w.id === id)
  if (idx !== -1) locals[idx] = { ...locals[idx], trashed_at: null }
}

export async function permanentlyDeleteWarranty(id: string): Promise<void> {
  if (await isAuthenticated()) {
    const { error } = await supabase!.from('warranties').delete().eq('id', id)
    if (error) throw error
    return
  }
  setLocalWarranties(getLocalWarranties().filter((w) => w.id !== id))
  setLocalReminders(getLocalReminders().filter((r) => r.warranty_id !== id))
}

// ─── Image Upload ─────────────────────────────────────────

export async function uploadWarrantyImage(warrantyId: string, file: File): Promise<string> {
  if (await isAuthenticated()) {
    const { data: { user } } = await supabase!.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const ext = file.name.split('.').pop() || 'jpg'
    const path = `${user.id}/${warrantyId}/cover.${ext}`

    const { error: uploadError } = await supabase!.storage
      .from('warranty-docs')
      .upload(path, file, { upsert: true })
    if (uploadError) throw uploadError

    const { data: urlData } = supabase!.storage
      .from('warranty-docs')
      .getPublicUrl(path)

    const publicUrl = urlData.publicUrl

    // Save as image_url on the warranty
    await updateWarranty(warrantyId, { image_url: publicUrl })

    return publicUrl
  }

  // Local fallback: use data URL
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = async () => {
      const dataUrl = reader.result as string
      await updateWarranty(warrantyId, { image_url: dataUrl })
      resolve(dataUrl)
    }
    reader.readAsDataURL(file)
  })
}

export async function uploadGalleryImage(warrantyId: string, file: File): Promise<string> {
  const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  if (await isAuthenticated()) {
    const { data: { user } } = await supabase!.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const ext = file.name.split('.').pop() || 'jpg'
    const path = `${user.id}/${warrantyId}/gallery/${uniqueId}.${ext}`

    const { error: uploadError } = await supabase!.storage
      .from('warranty-docs')
      .upload(path, file, { upsert: true })
    if (uploadError) throw uploadError

    const { data: urlData } = supabase!.storage
      .from('warranty-docs')
      .getPublicUrl(path)

    return urlData.publicUrl
  }

  // Local fallback: use data URL
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.readAsDataURL(file)
  })
}

// ─── Reminders ─────────────────────────────────────────────

export async function fetchReminders(): Promise<(Reminder & { warranty?: Warranty })[]> {
  if (await isAuthenticated()) {
    const { data, error } = await supabase!
      .from('reminders')
      .select('*, warranty:warranties(*)')
      .order('sent_at', { ascending: false })
    if (error) throw error
    return data ?? []
  }
  return getLocalReminders().map((r) => ({
    ...r,
    warranty: getLocalWarranties().find((w) => w.id === r.warranty_id),
  }))
}

