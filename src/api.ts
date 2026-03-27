import { Axios } from 'axios'

const client = new Axios({
  baseURL: 'http://127.0.0.1:8088',
})

export async function generateImage(image: Blob, prompt: string): Promise<string[]> {
  const input = new FormData()
  input.append('prompt_text', prompt)
  input.append('image', image)

  const res:
    | {
        images: string[]
      }
    | {
        error: string
      } = JSON.parse(await (await client.post('/get_image', input, {})).data)

  if (!('images' in res)) {
    throw res.error
  }

  return res.images
}
