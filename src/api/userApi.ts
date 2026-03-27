import request, { tokenOps } from './request'

interface LoginParams {
  username: string
  password: string
}

export interface CreateUserParams {
  username: string
  password: string
  avatar: File
  email: string
  bio: string
  type?: string
}

interface LoginResponse {
  success: boolean
  data: {
    token: string
    message?: string
    username: string
    email?: string
    avatar?: string
  }
}

interface CreateUserResponse {
  message: string
  user?: {
    id: string
    username: string
    email?: string
    avatar?: string
    bio?: string
  }
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  try {
    const response = await request.post<LoginResponse, LoginResponse, LoginParams>('/user/login', {
      username,
      password,
    })

    if (response.data.token) {
      tokenOps.setToken(response.data.token)
    }

    return response
  } catch (error) {
    console.error('登录失败:', error)
    throw error
  }
}

export async function createUser(payload: CreateUserParams): Promise<CreateUserResponse> {
  try {
    const formData = new FormData()
    formData.append('username', payload.username)
    formData.append('password', payload.password)
    formData.append('avatar', payload.avatar)
    formData.append('email', payload.email)
    formData.append('bio', payload.bio)
    formData.append('type', payload.type ?? 'user')

    const response = await request.post<CreateUserResponse, CreateUserResponse, FormData>(
      '/user/create_user',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )

    return response
  } catch (error) {
    console.error('注册失败:', error)
    throw error
  }
}

export function logout() {
  tokenOps.removeToken()
}
