import "./globals.css"
import ClientLayout from "./client"

export const metadata = {
  title: "DNS & Subdomain Tools",
  description: "Lookup DNS records and subdomains for any domain.",
    generator: 'v0.dev'
}

export default function RootLayout({ children }) {
  return <ClientLayout>{children}</ClientLayout>
}
