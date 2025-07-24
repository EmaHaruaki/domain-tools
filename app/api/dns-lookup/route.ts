import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { domain } = await request.json()

    if (!domain || typeof domain !== "string") {
      return NextResponse.json({ error: "Invalid domain provided" }, { status: 400 })
    }

    // Validate domain format (basic check)
    const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!domainRegex.test(domain)) {
      return NextResponse.json({ error: "Invalid domain format" }, { status: 400 })
    }

    // Fetch DNS records from Google DNS over HTTPS
    const dnsResponse = await fetch(`https://dns.google/resolve?name=${domain}`)
    if (!dnsResponse.ok) {
      throw new Error(`Failed to fetch DNS records: ${dnsResponse.statusText}`)
    }
    const dnsData = await dnsResponse.json()

    const aRecords =
      dnsData.Answer?.filter((record: any) => record.type === 1) // Type 1 is A record
        .map((record: any) => ({ value: record.data })) || []

    const mxRecords =
      dnsData.Answer?.filter((record: any) => record.type === 15) // Type 15 is MX record
        .map((record: any) => ({
          value: record.data.split(" ")[1],
          priority: Number.parseInt(record.data.split(" ")[0]),
        })) || []

    const txtRecords =
      dnsData.Answer?.filter((record: any) => record.type === 16) // Type 16 is TXT record
        .map((record: any) => ({ value: record.data.replace(/"/g, "") })) || [] // Remove quotes from TXT records

    const cnameRecords =
      dnsData.Answer?.filter((record: any) => record.type === 5) // Type 5 is CNAME record
        .map((record: any) => ({ value: record.data })) || []

    // Fetch subdomains from crt.sh
    const crtShResponse = await fetch(`https://crt.sh/?q=%25.${domain}&output=json`)
    if (!crtShResponse.ok) {
      throw new Error(`Failed to fetch subdomains from crt.sh: ${crtShResponse.statusText}`)
    }
    const crtShData = await crtShResponse.json()

    const subdomains = new Set<string>()
    crtShData.forEach((cert: any) => {
      // Add common_name
      if (cert.common_name && cert.common_name.endsWith(`.${domain}`)) {
        subdomains.add(cert.common_name)
      }
      // Add name_value (SANs)
      if (cert.name_value) {
        cert.name_value.split("\n").forEach((name: string) => {
          if (name.startsWith("*.")) {
            name = name.substring(2) // Remove *. prefix
          }
          if (name.endsWith(`.${domain}`) && name !== domain) {
            subdomains.add(name)
          }
        })
      }
    })

    return NextResponse.json({
      aRecords,
      mxRecords,
      txtRecords,
      cnameRecords,
      subdomains: Array.from(subdomains).sort(),
    })
  } catch (error: any) {
    console.error("DNS lookup error:", error)
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 })
  }
}
