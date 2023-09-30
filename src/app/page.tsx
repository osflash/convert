import React from 'react'

import { ConvertForm } from '~/components/Form'

const HomePage: React.FC = () => {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
      <ConvertForm />
    </main>
  )
}

export default HomePage
