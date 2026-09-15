import { supabase } from './supabaseClient'

export const AUDIO_BUCKET = 'audios'
export const IMAGEM_BUCKET = 'imagens'

export function extractStoragePath(publicUrl, bucket) {
  const marker = `/storage/v1/object/public/${bucket}/`
  const idx = publicUrl?.indexOf(marker)
  if (idx === -1 || idx === undefined) return null
  return publicUrl.slice(idx + marker.length)
}

export async function removeStorageFile(publicUrl, bucket) {
  const path = extractStoragePath(publicUrl, bucket)
  if (!path) return
  await supabase.storage.from(bucket).remove([path])
}

export async function gerarAudioIA(texto, voz) {
  const res = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: texto, voice: voz }),
  })
  const data = await res.json()

  if (!res.ok || !data.audioContent) {
    throw new Error(data.error || 'Falha ao gerar áudio')
  }

  const bytes = atob(data.audioContent)
  const array = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) array[i] = bytes.charCodeAt(i)
  return new File([array], `narracao-ia-${voz}.mp3`, { type: 'audio/mpeg' })
}

export async function uploadAudioFile(file) {
  const path = `${crypto.randomUUID()}-${file.name}`
  const { error } = await supabase.storage
    .from(AUDIO_BUCKET)
    .upload(path, file, { contentType: file.type || 'audio/mpeg' })
  if (error) throw error
  const { data } = supabase.storage.from(AUDIO_BUCKET).getPublicUrl(path)
  return data.publicUrl
}
