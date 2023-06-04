import Image from 'next/image'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <main
      className="flex min-h-screen items-center flex-col justify-center p-10"
    >
      Hello File Blox
    </main>
  )
}
