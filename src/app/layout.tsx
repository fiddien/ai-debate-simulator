import './globals.css'
import { Inter } from 'next/font/google'
import { DebateProvider } from '@/context/DebateContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'AI Debate Simulator',
  description: 'A platform for simulating AI-powered debates',
  icons: {
    icon: {
      url: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22grey%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22 class=%22feather feather-comments%22><path d=%22M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z%22/></svg>",
      type: "image/svg+xml",
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <DebateProvider>
          {children}
        </DebateProvider>
      </body>
    </html>
  )
}