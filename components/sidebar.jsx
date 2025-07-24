"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { NetworkIcon as Dns, Globe, Terminal, Home, Repeat, Key, Search, Info } from "lucide-react"

export function Sidebar({ onLinkClick }) {
  // onLinkClickプロパティを追加
  const pathname = usePathname()

  const navItems = [
    {
      name: "Home",
      href: "/",
      icon: Home,
    },
    {
      name: "DNS Lookup",
      href: "/dns-lookup",
      icon: Dns,
    },
    {
      name: "Subdomain Lookup",
      href: "/subdomain-lookup",
      icon: Globe,
    },
    {
      name: "CLI Tools",
      href: "/cli-tools",
      icon: Terminal,
    },
    {
      name: "Curl Converter",
      href: "/curl-converter",
      icon: Repeat,
    },
    {
      name: "Password Tools",
      href: "/password-tools",
      icon: Key,
    },
    {
      name: "WHOIS Lookup",
      href: "/whois",
      icon: Info,
    },
  ]

  return (
    <aside className="flex w-64 flex-col border-r bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-8 flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-gray-50">
        <Search className="h-6 w-6" />
        Domain Tools
      </div>
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50",
              )}
              onClick={onLinkClick} // リンククリック時にonLinkClickを呼び出す
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
