import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react'
import { Geist, Geist_Mono } from 'next/font/google'
import { Nav } from './Nav'
import './globals.css'
import Footer from './Footer'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Text Craft',
  description:
    "Text Craft is a powerful text processing toolkit that provides text comparison and similarity matching features. Supporting line-by-line analysis, real-time comparison, and difference highlighting, it's perfect for code review and document version comparison scenarios.",
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout(props: Readonly<RootLayoutProps>) {
  const { children } = props

  return (
    <html lang="en">
      <Analytics />
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  )
}
