import Image from 'next/image'
import { Inter } from 'next/font/google'
import HeroSection from '@/components/sections/HeroSection'
import FeatureSection from '@/components/sections/FeatureSection'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeatureSection />
    </>
  )
}
