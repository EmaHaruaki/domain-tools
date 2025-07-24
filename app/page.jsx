"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 dark:bg-gray-950">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Welcome to Domain Tools</CardTitle>
          <CardDescription>Select a tool to get started.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link href="/dns-lookup" passHref>
            <Button className="w-full">Go to DNS Lookup</Button>
          </Link>
          <Link href="/subdomain-lookup" passHref>
            <Button className="w-full">Go to Subdomain Lookup</Button>
          </Link>
          <Link href="/cli-tools" passHref>
            <Button className="w-full">Go to CLI Tools</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

// Separate component for DNS Lookup functionality
function DnsLookupPage() {
  const [domain, setDomain] = useState("")
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResults(null)
    setError(null)

    if (!domain || typeof domain !== "string") {
      setError("Invalid domain provided")
      setLoading(false)
      return
    }

    const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!domainRegex.test(domain)) {
      setError("Invalid domain format")
      setLoading(false)
      return
    }

    try {
      // Fetch DNS records from Google DNS over HTTPS
      const dnsResponse = await fetch(`https://dns.google/resolve?name=${domain}`)
      if (!dnsResponse.ok) {
        throw new Error(`Failed to fetch DNS records: ${dnsResponse.statusText}`)
      }
      const dnsData = await dnsResponse.json()

      const aRecords =
        dnsData.Answer?.filter((record) => record.type === 1) // Type 1 is A record
          .map((record) => ({ value: record.data })) || []

      const mxRecords =
        dnsData.Answer?.filter((record) => record.type === 15) // Type 15 is MX record
          .map((record) => ({
            value: record.data.split(" ")[1],
            priority: Number.parseInt(record.data.split(" ")[0]),
          })) || []

      const txtRecords =
        dnsData.Answer?.filter((record) => record.type === 16) // Type 16 is TXT record
          .map((record) => ({ value: record.data.replace(/"/g, "") })) || [] // Remove quotes from TXT records

      const cnameRecords =
        dnsData.Answer?.filter((record) => record.type === 5) // Type 5 is CNAME record
          .map((record) => ({ value: record.data })) || []

      // Fetch subdomains from crt.sh
      const crtShResponse = await fetch(`https://crt.sh/?q=%25.${domain}&output=json`)
      if (!crtShResponse.ok) {
        throw new Error(`Failed to fetch subdomains from crt.sh: ${crtShResponse.statusText}`)
      }
      const crtShData = await crtShResponse.json()

      const subdomains = new Set()
      crtShData.forEach((cert) => {
        // Add common_name
        if (cert.common_name && cert.common_name.endsWith(`.${domain}`)) {
          subdomains.add(cert.common_name)
        }
        // Add name_value (SANs)
        if (cert.name_value) {
          cert.name_value.split("\n").forEach((name) => {
            if (name.startsWith("*.")) {
              name = name.substring(2) // Remove *. prefix
            }
            if (name.endsWith(`.${domain}`) && name !== domain) {
              subdomains.add(name)
            }
          })
        }
      })

      setResults({
        aRecords,
        mxRecords,
        txtRecords,
        cnameRecords,
        subdomains: Array.from(subdomains).sort(),
      })
    } catch (err) {
      console.error("DNS lookup error:", err)
      setError(err.message || "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 dark:bg-gray-950">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">DNS &amp; Subdomain Lookup</CardTitle>
          <CardDescription>Enter a domain name to view its DNS records and subdomains.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="domain">Domain Name</Label>
              <Input
                id="domain"
                type="text"
                placeholder="example.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Search
            </Button>
          </form>

          {error && (
            <div className="mt-6 rounded-md bg-red-100 p-4 text-red-700 dark:bg-red-900 dark:text-red-200">
              <p className="font-medium">Error:</p>
              <p>{error}</p>
            </div>
          )}

          {results && (
            <div className="mt-8 space-y-8">
              <div>
                <h3 className="mb-4 text-xl font-semibold">A Records</h3>
                {results.aRecords.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>IP Address</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.aRecords.map((record, index) => (
                        <TableRow key={`a-${index}`}>
                          <TableCell>{record.value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground">No A records found.</p>
                )}
              </div>

              <div>
                <h3 className="mb-4 text-xl font-semibold">MX Records</h3>
                {results.mxRecords.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Priority</TableHead>
                        <TableHead>Host</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.mxRecords.map((record, index) => (
                        <TableRow key={`mx-${index}`}>
                          <TableCell>{record.priority}</TableCell>
                          <TableCell>{record.value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground">No MX records found.</p>
                )}
              </div>

              <div>
                <h3 className="mb-4 text-xl font-semibold">TXT Records</h3>
                {results.txtRecords.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Text</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.txtRecords.map((record, index) => (
                        <TableRow key={`txt-${index}`}>
                          <TableCell className="break-all">{record.value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground">No TXT records found.</p>
                )}
              </div>

              <div>
                <h3 className="mb-4 text-xl font-semibold">CNAME Records</h3>
                {results.cnameRecords.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Alias For</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.cnameRecords.map((record, index) => (
                        <TableRow key={`cname-${index}`}>
                          <TableCell>{record.value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground">No CNAME records found.</p>
                )}
              </div>

              <div>
                <h3 className="mb-4 text-xl font-semibold">Subdomains (from crt.sh)</h3>
                {results.subdomains.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subdomain</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.subdomains.map((sub, index) => (
                        <TableRow key={`sub-${index}`}>
                          <TableCell>{sub}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground">No subdomains found via crt.sh.</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
