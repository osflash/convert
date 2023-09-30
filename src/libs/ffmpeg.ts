import type { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'

export const loadFFmpeg = async (ffmpeg: FFmpeg) => {
  // const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.2/dist/umd'
  const baseURL = 'https://unpkg.com/@ffmpeg/core-mt@0.12.2/dist/umd' // core-mt

  // const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.2/dist/esm'
  // const baseURL = 'https://unpkg.com/@ffmpeg/core-mt@0.12.2/dist/esm'

  // toBlobURL is used to bypass CORS issue, urls with the same
  // domain can be used directly.
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    workerURL: await toBlobURL(
      `${baseURL}/ffmpeg-core.worker.js`,
      'text/javascript'
    )
  })
}
