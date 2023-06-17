import Image from 'next/image'
import { Inter } from 'next/font/google'
import HeroSection from '@/components/sections/HeroSection'
import FeatureSection from '@/components/sections/FeatureSection'
//import StatsSection from '@/components/sections/StatsSection'
//import Testimonials from '@/components/sections/Testimonials'
//import PricingSection from '@/components/sections/PricingSection'
// import FaqsSection from '@/components/sections/FaqsSection'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeatureSection />
      {/* <FaqsSection /> */}
    </>
  )
}
