import request from './request'

// First-run model warm-up + image generation may exceed 2 minutes.
// Keep a longer client timeout to avoid premature aborts.
const SESSION_REQUEST_TIMEOUT = 300000

type SessionInitBody = {
  data: {
    session: {
      id: number
      message?: string
      status?: string
      user_id?: number
    }
    processedImages?: string[]
  }
}

type SessionInitResponse = SessionInitBody & {
  success?: boolean
}

type SendMessageBody = {
  id?: number | string
  url?: string
  assistant_reply?: string
  assistantReply?: string
  message?: string
  reply?: string
  text?: string
  llm_reply?: string
  llmReply?: string
  optimized_prompt?: string
  optimizedPrompt?: string
  image?: string
  images?: string[]
  image_urls?: string[]
  data?: {
    id?: number | string
    url?: string
    assistant_reply?: string
    assistantReply?: string
    message?: string
    reply?: string
    text?: string
    llm_reply?: string
    llmReply?: string
    optimized_prompt?: string
    optimizedPrompt?: string
    image?: string
    images?: string[]
    image_urls?: string[]
  }
}

type SendMessageResponse = SendMessageBody & {
  success?: boolean
}

type ApiError = Error & {
  status?: number
  payload?: unknown
}

export type ParsedImageReply = {
  text: string
  images: string[]
}

export type BackendSessionMessage = {
  sender: 'user' | 'assistant'
  content: string
  file?: string
  files?: string[]
  timestamp?: string
}

export type BackendSessionHistoryItem = {
  sessionId: string
  title: string
  status: string
  startedAt: string
  endedAt: string | null
  messages: BackendSessionMessage[]
}

function normalizeImageUrl(url: string): string {
  if (!url) {
    return ''
  }

  if (/^https?:\/\//i.test(url) || url.startsWith('data:')) {
    return url
  }

  const base = (import.meta.env.VITE_BASE_URL || 'http://127.0.0.1:3000').replace(/\/+$/, '')
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`
}

function unwrapSuccessData<T extends { success?: boolean; data?: unknown }>(payload: T): unknown {
  if (
    payload &&
    typeof payload === 'object' &&
    payload.success === true &&
    payload.data &&
    typeof payload.data === 'object'
  ) {
    return payload.data
  }

  return payload
}

type SessionHistoryResponse = {
  success?: boolean
  data?: BackendSessionHistoryItem[]
}

export async function initImageSession(params: { prompt: string; files: File[] }): Promise<string> {
  const formData = new FormData()
  formData.append('prompt', params.prompt)

  console.log('[initSession] request', {
    prompt: params.prompt,
    hasImage: false,
    imageName: '',
  })

  let res

  try {
    res = await request.post<SessionInitResponse, SessionInitResponse, FormData>(
      '/session/init',
      formData,
      { timeout: SESSION_REQUEST_TIMEOUT }
    )
    console.log('[initSession] response', res)

  } catch (error) {

    const err = error as ApiError & { code?: string }
    console.error('[initSession] failed', {
      message: err.message,
      code: err.code,
      status: err.status,
      payload: err.payload,
    })
    throw error

  }

  const sessionId = res.data.session.id

  if (!sessionId) {
    console.error('[initSession] missing session id', res)
    throw new Error('Failed to init session: backend did not return sessionId')
  }

  return String(sessionId)

}

export async function sendImageSessionMessage(params: {
  sessionId: string
  prompt: string
  files: File[]
}): Promise<ParsedImageReply> {
  const formData = new FormData()
  formData.append('sessionId', params.sessionId)
  formData.append('prompt', params.prompt)

  const imageFile = params.files[0]
  if (imageFile) {
    formData.append('image', imageFile, imageFile.name)
  }

  console.log('[upload] request', {
    sessionId: params.sessionId,
    prompt: params.prompt,
    hasImage: Boolean(imageFile),
    imageName: imageFile?.name || '',
  })

  let res: SendMessageBody
  try {
    const raw = await request.post<SendMessageResponse, SendMessageResponse, FormData>(
      '/session/upload',
      formData,
      { timeout: SESSION_REQUEST_TIMEOUT }
    )
    res = unwrapSuccessData(raw) as SendMessageBody
    console.log('[upload] response', res)
  } catch (error) {
    const err = error as ApiError & { code?: string }
    console.error('[upload] failed', {
      message: err.message,
      code: err.code,
      status: err.status,
      payload: err.payload,
    })
    throw error
  }

  const llmReply =
    res.llm_reply ||
    res.llmReply ||
    res.data?.llm_reply ||
    res.data?.llmReply ||
    ''

  const assistantText =
    res.assistant_reply ||
    res.assistantReply ||
    res.data?.assistant_reply ||
    res.data?.assistantReply ||
    llmReply ||
    res.message ||
    res.reply ||
    res.text ||
    res.data?.message ||
    res.data?.reply ||
    res.data?.text ||
    ''

  const rawImages = (
    res.images ||
    res.image_urls ||
    (res.url ? [res.url] : []) ||
    res.data?.images ||
    res.data?.image_urls ||
    (res.data?.url ? [res.data.url] : []) ||
    (res.image ? [res.image] : []) ||
    (res.data?.image ? [res.data.image] : []) ||
    []
  ).filter(Boolean) as string[]

  const imageId = res.id || res.data?.id
  if (rawImages.length === 0 && imageId !== undefined && imageId !== null) {
    rawImages.push(`/session/get_image/${String(imageId)}`)
  }

  return {
    text: assistantText || 'Request received. Generating image...',
    images: rawImages.map(normalizeImageUrl),
  }
}

export async function fetchLatestSessionHistory(limit = 10): Promise<BackendSessionHistoryItem[]> {
  const raw = await request.get<SessionHistoryResponse, SessionHistoryResponse>('/session/history', {
    params: { limit },
    timeout: SESSION_REQUEST_TIMEOUT,
  })

  const res = unwrapSuccessData(raw)
  if (Array.isArray(res)) {
    return res as BackendSessionHistoryItem[]
  }

  return []
}

