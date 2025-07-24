"use client"

import "./globals.css"
import { Inter } from "next/font/google"
import { Sidebar } from "@/components/sidebar"
import { useMobile } from "@/hooks/use-mobile" // useMobileフックをインポート
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet" // Sheetコンポーネントをインポート
import { Button } from "@/components/ui/button" // Buttonコンポーネントをインポート
import { Menu } from "lucide-react" // Menuアイコンをインポート
import { ToastProvider } from "@/components/ui/toast" // ToastProviderをインポート
import { useState } from "react"

const inter = Inter({ subsets: ["latin"] })

export default function ClientLayout({ children }) {
  const isMobile = useMobile()
  const [isOpen, setIsOpen] = useState(false) // Sheetの開閉状態を管理

  return (
    <html lang="ja">
      <body className={`${inter.className} flex min-h-screen bg-gray-100 dark:bg-gray-950`}>
        {isMobile ? (
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="fixed left-4 top-4 z-50 md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <Sidebar onLinkClick={() => setIsOpen(false)} /> {/* リンククリックで閉じる */}
            </SheetContent>
          </Sheet>
        ) : (
          <Sidebar />
        )}
        <main className="flex-1 p-4 md:p-8">{children}</main>
        <ToastProvider /> {/* ToastProviderを追加 */}
      </body>
    </html>
  )
}
