'use client'

import React, { useMemo, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { fetchFile } from '@ffmpeg/util'
import { zodResolver } from '@hookform/resolvers/zod'
import { PromisePool } from '@supercharge/promise-pool'
import { FileVideoIcon, Wand2Icon } from 'lucide-react'
import mime from 'mime'
import { NFTStorage } from 'nft.storage'
import { Blockstore } from 'nft.storage/src/platform.js'
import { z } from 'zod'

import { splitter } from '~/libs/splitter'

import { storage } from '~/services/storage'

import { useFFmpeg } from '~/providers/FFmpeg'

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '~/components/ui/form'
import { Label } from '~/components/ui/label'
import { Progress } from '~/components/ui/progress'

import { FFmpeg } from '../FFmpeg'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Checkbox } from '../ui/checkbox'
import { Input } from '../ui/input'

const resolutionsSchema = z.enum([
  '3840x2160',
  '2560x1440',
  '1920x1080',
  '1280x720',
  '854x480'
])

const formSchema = z.object({
  video: z.custom<FileList>().superRefine((files, ctx) => {
    if (!files || files.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Você deve selecionar pelo menos um vídeo'
      })

      return false
    }

    // if (!['video/mp4,', 'video/x-matroska'].includes(files[0].type)) {
    //   ctx.addIssue({
    //     code: z.ZodIssueCode.custom,
    //     message: 'O arquivo deve ser um tipo de vídeo válido'
    //   })

    //   return false
    // }

    return true
  }),
  resolutions: z
    .array(resolutionsSchema)
    .refine(value => value.some(resolution => resolution), {
      message: 'Você deve selecionar pelo menos uma resolução.'
    }),
  apitKey: z.string()
})

export type FormData = z.infer<typeof formSchema>

const resolutions = Object.values(resolutionsSchema.Values)

const bitrates = ['8000k', '4000k', '2000k', '1000k', '500k']

export const ConvertForm: React.FC = () => {
  const [cids, setCID] = useState<string[] | null>(null)

  const [convertProgress, setConvertProgress] = useState(0)
  const [uploadProgress, setUploadProgress] = useState(0)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      resolutions: ['1920x1080'],
      apitKey: ''
    }
  })

  const { ffmpeg } = useFFmpeg()

  const convertVideo = async (
    video: File,
    resolutions: z.infer<typeof resolutionsSchema>[]
  ) => {
    console.log('Convert started.')

    await ffmpeg.writeFile(video.name, await fetchFile(video))

    ffmpeg.on('progress', file => {
      const progress =
        Math.round(file.progress * 10_000) / 100 / resolutions.length

      setConvertProgress(progress)

      console.log(`Convert progress: ${progress}`)
    })

    const { results } = await PromisePool.withConcurrency(1)
      .for(resolutions)
      .process(async (resolution, i) => {
        const bitrate = bitrates[i]

        await ffmpeg.createDir(resolution)

        await ffmpeg.exec([
          '-i',
          video.name,
          '-vf',
          `scale=${resolution}`,
          '-b:v',
          bitrate,
          '-c:v',
          'libx264',
          '-g',
          '30',
          '-c:a',
          'aac',
          '-f',
          'hls',
          '-hls_time',
          '6',
          '-hls_list_size',
          '0',
          '-hls_segment_filename',
          `${resolution}/output_%03d.ts`,
          `${resolution}/output.m3u8`
        ])

        const files = (await ffmpeg.listDir(resolution)).filter(
          ({ isDir }) => !isDir
        )

        const data = await Promise.all(
          files.map(async dir => {
            const file = await ffmpeg.readFile(`${resolution}/${dir.name}`)
            const type = mime.getType(dir.name) || undefined

            const videoFileBlob = new Blob([file], { type })

            return new File([videoFileBlob], dir.name, { type })
          })
        )

        processUpload(data)

        return data
      })

    console.log('Convert finished.')

    return results
  }

  const processUpload = async (files: File[]) => {
    const blockstore = new Blockstore()

    const { car, cid } = await NFTStorage.encodeDirectory(files, { blockstore })

    const uploadProgress = new Map<number, number>()

    try {
      const blobs = await splitter(car)

      await PromisePool.withConcurrency(1)
        .for(blobs)
        .process(async (blob, i) => {
          return await storage.post('/upload', blob, {
            headers: {
              'Content-Type': 'application/car',
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_NFT_STORAGE_TOKEN}`
            },
            onUploadProgress: async e => {
              let totalProgress = 0

              uploadProgress.set(i, e.progress ?? 0)

              uploadProgress.forEach(value => (totalProgress += value))

              const progress =
                Math.round(totalProgress * 10_000) / 100 / blobs.length

              setUploadProgress(progress)
            }
          })
        })

      setCID(prev => prev?.concat(cid) || [cid])
    } catch (err) {
      //
    } finally {
      await blockstore.close()
    }
  }

  const handleSubmit = async (data: FormData) => {
    const videoFile = data.video[0]

    const video = await convertVideo(videoFile, data.resolutions)
  }

  const videoFile = form.watch('video')

  const previewURL = useMemo(() => {
    if (!videoFile) {
      return null
    }

    setConvertProgress(0)
    setUploadProgress(0)

    const file = videoFile[0]

    if (!file) {
      return null
    }

    return URL.createObjectURL(file)
  }, [videoFile])

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="w-80 space-y-6"
      >
        <FFmpeg />

        <FormField
          control={form.control}
          name="video"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="relative flex aspect-video cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed text-sm text-muted-foreground hover:bg-primary/5">
                {previewURL ? (
                  <video
                    src={previewURL}
                    controls={false}
                    className="pointer-events-none absolute inset-0"
                  />
                ) : (
                  <>
                    <FileVideoIcon className="h-4 w-4" />
                    Selecione um vídeo
                  </>
                )}
              </FormLabel>
              <FormDescription>
                Selecione o vídeo que deseja converter
              </FormDescription>

              <FormControl>
                <input
                  type="file"
                  accept="video/*,.mkv"
                  className="sr-only"
                  onChange={event => field.onChange(event.target.files)}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="resolutions"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">
                  Resoluções <Badge variant="destructive">obrigatório</Badge>
                </FormLabel>
                <FormDescription>
                  Selecione as resoluções que deseja converter do vídeo
                </FormDescription>
              </div>

              {resolutions.map(resolution => (
                <FormField
                  key={resolution}
                  control={form.control}
                  name="resolutions"
                  render={({ field }) => (
                    <FormItem
                      key={resolution}
                      className="flex flex-row items-start space-x-3 space-y-0"
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(resolution)}
                          onCheckedChange={checked =>
                            checked
                              ? field.onChange(field.value?.concat(resolution))
                              : field.onChange(
                                  field.value?.filter(
                                    value => value !== resolution
                                  )
                                )
                          }
                        />
                      </FormControl>

                      <FormLabel className="font-normal">
                        {resolution}
                      </FormLabel>
                    </FormItem>
                  )}
                />
              ))}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* <div className="flex items-center space-x-2">
          <Checkbox
            id="storage"
            checked={storage}
            onCheckedChange={() => {
              setStorage(!storage)
            }}
          />
          <Label htmlFor="storage">Deseja armazenar no nft.storage?</Label>
        </div> */}

        <FormField
          control={form.control}
          name="apitKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Chave de API da nft.storage{' '}
                <Badge variant="warning">opcional</Badge>
              </FormLabel>

              <FormControl>
                <Input
                  type="text"
                  placeholder={process.env.NEXT_PUBLIC_NFT_STORAGE_TOKEN}
                  {...field}
                />
              </FormControl>

              <FormDescription>
                Por favor, forneça uma chave de API da nft.storage. Se você não
                fornecer uma chave, será utilizada a chave padrão.
              </FormDescription>

              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <Label>Progresso de Conversão</Label>
          <Progress value={convertProgress} />
        </div>

        <div className="space-y-2">
          <Label>Progresso de Envio</Label>
          <Progress value={uploadProgress} />
        </div>

        {cids &&
          cids.map(cid => (
            <Input
              key={cid}
              value={`https://nftstorage.link/ipfs/${cid}`}
              readOnly
            />
          ))}

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          Converter
          <Wand2Icon className="ml-2 h-4 w-4" />
        </Button>
      </form>
    </Form>
  )
}
