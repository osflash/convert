'use client'

import React, { useMemo, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { FileVideoIcon, Wand2Icon } from 'lucide-react'
import { z } from 'zod'

import { cn } from '~/libs/utils'

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
  const [convertProgress, setConvertProgress] = useState(0)
  const [uploadProgress, setUploadProgress] = useState(0)

  const [storage, setStorage] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      resolutions: ['1920x1080'],
      apitKey: ''
    }
  })

  const handleSubmit = (data: FormData) => {
    console.log(data)
  }

  const videoFile = form.watch('video')

  const previewURL = useMemo(() => {
    if (!videoFile) {
      return null
    }

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

        <div className="flex items-center space-x-2">
          <Checkbox
            id="storage"
            checked={storage}
            onCheckedChange={() => {
              setStorage(!storage)
            }}
          />
          <Label htmlFor="storage">Deseja armazenar no nft.storage?</Label>
        </div>

        <FormField
          control={form.control}
          name="apitKey"
          render={({ field }) => (
            <FormItem className={cn({ hidden: !storage })}>
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
