import React from 'react'

import Link from 'next/link'

import { GithubIcon } from 'lucide-react'

import { NavBarMobile } from '~/components/Mobile/NavBarMobile'
import { ToggleTheme } from '~/components/ToggleTheme'
import { Button } from '~/components/ui/button'
import { Separator } from '~/components/ui/separator'

export const Header: React.FC = () => {
  return (
    <div className="border-b">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-3">
        <h1 className="text-xl font-bold">convert.video</h1>

        <div className="flex items-center gap-3 max-sm:hidden">
          <span className="text-sm text-muted-foreground">
            Desenvolvido com ❤️ por OsFlash
          </span>

          <Separator orientation="vertical" className="h-6" />

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

        <NavBarMobile />
      </header>
    </div>
  )
}
