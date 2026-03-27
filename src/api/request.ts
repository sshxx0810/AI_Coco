import axios from 'axios'
import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios'

// 环境变量 - baseURL
const baseURL = import.meta.env.VITE_BASE_URL || 'http://127.0.0.1:3000'

// 创建 axios 实例
const request: AxiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// token key
const TOKEN_KEY = 'auth_token'

// ============ 请求拦截器 ============
request.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem(TOKEN_KEY)
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// ============ 响应拦截器 ============
request.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('登录响应结果:', response.data.success)
    // 2xx 状态码这里处理，直接返回 data
    return response.data
  },
  (error: AxiosError) => {
    // 处理错误响应
    let errorMessage = '网络错误，请稍后重试'

    if (error.response) {
      // 服务器返回了错误状态码
      const status = error.response.status
      const data = error.response.data as { message?: string; error?: string }

      switch (status) {
        case 400:
          errorMessage = data?.message || '请求参数错误'
          break
        case 401:
          errorMessage = data?.message || '用户名或密码错误'
          // 清除 token
          localStorage.removeItem(TOKEN_KEY)
          break
        case 403:
          errorMessage = '没有权限访问该资源'
          break
        case 404:
          errorMessage = '请求的资源不存在'
          break
        case 500:
          errorMessage = '服务器内部错误'
          break
        default:
          errorMessage = data?.message || data?.error || errorMessage
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      errorMessage = '网络连接失败，请检查网络'
    }

    // 返回带错误信息的 Promise
    return Promise.reject(new Error(errorMessage))
  }
)

export default request

// 导出 token 操作方法
export const tokenOps = {
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  getToken: () => localStorage.getItem(TOKEN_KEY),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),
}
