import { z } from 'zod'

export const envSchema = z
  .object({
    NEXT_PUBLIC_NFT_STORAGE_TOKEN: z.string()
  })
  .readonly()

export type Env = z.infer<typeof envSchema>
