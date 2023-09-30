import type { Env } from '~/libs/zod'

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Env {}
  }
}

export {}
