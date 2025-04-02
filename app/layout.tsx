import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "บันทึกรายรับรายจ่าย",
  description: "แอพบันทึกรายรับรายจ่ายส่วนตัว",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th">
      <body className={inter.className}>
      
          {children}
   
      </body>
    </html>
  )
}