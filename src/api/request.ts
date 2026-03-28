import axios from 'axios'
import type { AxiosError, AxiosHeaders, AxiosInstance, AxiosResponse } from 'axios'

const TOKEN_KEY = 'auth_token'
const DEFAULT_BASE_URL = 'http://127.0.0.1:3000'

type ApiError = Error & {
  status?: number
  payload?: unknown
  code?: string
}

type BackendSuccess<T = unknown> = {
  success: true
  data: T
}

type BackendFail = {
  success: false
  message?: string
}

type BackendEnvelope<T = unknown> = BackendSuccess<T> | BackendFail

const baseURL = (import.meta.env.VITE_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, '')

function isBackendEnvelope(payload: unknown): payload is BackendEnvelope {
  return typeof payload === 'object' && payload !== null && 'success' in payload
}

function pickMessage(payload: unknown): string {
  if (typeof payload === 'string') {
    return payload
  }

  if (isBackendEnvelope(payload) && payload.success === false) {
    return payload.message || ''
  }

  if (typeof payload === 'object' && payload !== null) {
    const maybe = payload as { message?: string; error?: string }
    return maybe.message || maybe.error || ''
  }

  return ''
}

function buildApiError(options: {
  message: string
  status?: number
  payload?: unknown
  code?: string
}): ApiError {
  const apiError = new Error(options.message) as ApiError
  apiError.status = options.status
  apiError.payload = options.payload
  apiError.code = options.code
  return apiError
}

const request: AxiosInstance = axios.create({
  baseURL,
  timeout: 15000,
})

request.interceptors.request.use(
  (config) => {
    const headers = axios.AxiosHeaders.from(config.headers ?? {})

    if (config.data instanceof FormData) {
      // Let browser attach multipart boundary automatically.
      headers.delete('Content-Type')
    } else if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }

    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    config.headers = headers as AxiosHeaders
    return config
  },
  (error) => Promise.reject(error)
)

request.interceptors.response.use(
  (response: AxiosResponse) => {
    const payload = response.data as any

    if (isBackendEnvelope(payload) && payload.success === false) {
      return Promise.reject(
        buildApiError({
          message: payload.message || 'Request failed, please retry later.',
          status: response.status,
          payload,
        })
      )
    }

    return payload
  },
  (error: AxiosError) => {
    const status = error.response?.status
    const payload = error.response?.data
    const backendMessage = pickMessage(payload)

    let errorMessage = backendMessage || error.message || 'Request failed, please retry later.'

    if (error.code === 'ECONNABORTED' || /timeout/i.test(error.message || '')) {
      errorMessage = 'Request timeout, backend may still be processing.'
    } else if (!error.response && error.request) {
      errorMessage = 'Network error. Please check frontend-backend connectivity.'
    }

    if (status === 401) {
      localStorage.removeItem(TOKEN_KEY)
    }

    console.error('[API Error]', {
      method: error.config?.method,
      url: error.config?.url,
      code: error.code,
      status,
      payload,
      message: errorMessage,
    })

    return Promise.reject(
      buildApiError({
        message: errorMessage,
        status,
        payload,
        code: error.code,
      })
    )
  }
)

export default request

export const tokenOps = {
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  getToken: () => localStorage.getItem(TOKEN_KEY),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),
}
