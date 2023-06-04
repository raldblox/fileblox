import Image from 'next/image'
import { Inter } from 'next/font/google'
import HeroSection from '@/components/sections/HeroSection'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <>
      <HeroSection />
    </>
  )
}
