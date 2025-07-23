import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ClerkProvider } from "@clerk/nextjs"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { UserSync } from "@/components/user-sync"
import { MobileOptimizations } from "@/components/mobile-optimizations"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SyncSphere - Team Collaboration Platform",
  description: "Professional team management and collaboration platform with responsive design for all devices",
  generator: 'v0.dev',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        </head>
        <body className={`${inter.className} overflow-x-hidden`}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <MobileOptimizations />
            <UserSync />
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
