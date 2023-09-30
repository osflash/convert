'use client'

import React, { useState } from 'react'

import Link from 'next/link'

import { GithubIcon, MoreVerticalIcon } from 'lucide-react'

import { ToggleTheme } from '~/components/ToggleTheme'
import { Button } from '~/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '~/components/ui/sheet'

export const NavBarMobile: React.FC = () => {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 sm:hidden"
        >
          <MoreVerticalIcon className="h-5 w-5" />
          <span className="sr-only">Alternar menu</span>
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="flex flex-col justify-between">
        <div className="flex gap-3 pt-6">
          <Button variant="outline" asChild>
            <Link
              href="https://github.com/osflash/convert"
              target="_blank"
              rel="noreferrer"
            >
              <GithubIcon className="mr-2 h-4 w-4" />
              Github
            </Link>
          </Button>

          <ToggleTheme />
        </div>

        <span className="text-sm text-muted-foreground">
          Desenvolvido com ❤️ por OsFlash
        </span>
      </SheetContent>
    </Sheet>
  )
}
