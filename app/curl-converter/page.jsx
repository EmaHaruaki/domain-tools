"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function CurlConverterPage() {
  const [curlInput, setCurlInput] = useState("")
  const [curlOutput, setCurlOutput] = useState("")
  const [conversionType, setConversionType] = useState("winToUnix") // 'winToUnix' or 'unixToWin'

  // PowerShell Invoke-WebRequest to Unix curl
  const convertPowerShellToUnixCurl = (psCurl) => {
    let unixCurl = "curl"
    let url = ""
    let method = "GET"
    const headers = []
    let body = ""

    // Extract URL
    const uriMatch = psCurl.match(/-Uri\s+['"]?([^'"\s]+)['"]?/)
    if (uriMatch) {
      url = uriMatch[1]
    } else {
      // Try to find URL as first positional argument if not named
      const firstArg = psCurl.split(/\s+/).find((arg) => arg.startsWith("http://") || arg.startsWith("https://"))
      if (firstArg) {
        url = firstArg
      }
    }

    // Extract Method
    const methodMatch = psCurl.match(/-Method\s+['"]?(\w+)['"]?/)
    if (methodMatch) {
      method = methodMatch[1].toUpperCase()
    }

    // Extract Headers
    const headerMatches = psCurl.matchAll(/-Headers\s+@\{([^}]+)\}/g)
    for (const match of headerMatches) {
      const headerContent = match[1]
      const headerPairs = headerContent.split(";")
      headerPairs.forEach((pair) => {
        const [key, value] = pair.split("=").map((s) => s.trim().replace(/^['"]|['"]$/g, ""))
        if (key && value) {
          headers.push(`-H "${key}: ${value}"`)
        }
      })
    }

    // Extract Body
    const bodyMatch = psCurl.match(/-Body\s+['"]?([^'"]+)['"]?/)
    if (bodyMatch) {
      body = bodyMatch[1]
    }

    if (url) {
      unixCurl += ` '${url}'`
    } else {
      return "Error: Could not find URL in PowerShell curl command."
    }

    if (method !== "GET") {
      unixCurl += ` -X ${method}`
    }

    if (headers.length > 0) {
      unixCurl += ` ${headers.join(" ")}`
    }

    if (body) {
      unixCurl += ` -d '${body}'`
    }

    return unixCurl
  }

  // Unix curl to PowerShell Invoke-WebRequest
  const convertUnixCurlToPowerShell = (unixCurl) => {
    let psCurl = "Invoke-WebRequest"
    let url = ""
    let method = "GET"
    const headers = {}
    let body = ""

    // Split by space, but not inside quotes. Handle escaped quotes.
    const parts = unixCurl.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || []

    for (let i = 0; i < parts.length; i++) {
      let part = parts[i]
      // Remove outer quotes if present
      if ((part.startsWith("'") && part.endsWith("'")) || (part.startsWith('"') && part.endsWith('"'))) {
        part = part.substring(1, part.length - 1)
      }

      if (part.startsWith("http://") || part.startsWith("https://")) {
        url = part
      } else if (part === "-X" && parts[i + 1]) {
        method = parts[++i].replace(/^'|'$/g, "").toUpperCase()
      } else if (part === "-H" && parts[i + 1]) {
        const header = parts[++i].replace(/^"|"$/g, "") // Remove outer quotes
        const [key, value] = header.split(":", 2).map((s) => s.trim())
        if (key && value) {
          headers[key] = value
        }
      } else if (part === "-d" && parts[i + 1]) {
        body = parts[++i].replace(/^'|'$/g, "") // Remove outer quotes
      }
    }

    if (url) {
      psCurl += ` -Uri '${url}'`
    } else {
      return "Error: Could not find URL in Unix curl command."
    }

    if (method !== "GET") {
      psCurl += ` -Method ${method}`
    }

    if (Object.keys(headers).length > 0) {
      const headerString = Object.entries(headers)
        .map(([key, value]) => `'${key}'='${value}'`) // Use single quotes for keys and values in PowerShell hash table
        .join(";")
      psCurl += ` -Headers @{${headerString}}`
    }

    if (body) {
      psCurl += ` -Body '${body}'`
    }

    return psCurl
  }

  const handleConvert = () => {
    if (!curlInput.trim()) {
      setCurlOutput("")
      return
    }

    let converted = ""
    if (conversionType === "winToUnix") {
      converted = convertPowerShellToUnixCurl(curlInput)
    } else {
      converted = convertUnixCurlToPowerShell(curlInput)
    }
    setCurlOutput(converted)
  }

  // Perform conversion whenever input or type changes
  useEffect(() => {
    handleConvert()
  }, [curlInput, conversionType])

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Curl Command Converter</CardTitle>
        <CardDescription>Convert curl commands between Windows PowerShell and Unix/macOS syntax.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant={conversionType === "winToUnix" ? "default" : "outline"}
              onClick={() => setConversionType("winToUnix")}
            >
              Windows (PowerShell) → Unix/macOS
            </Button>
            <Button
              variant={conversionType === "unixToWin" ? "default" : "outline"}
              onClick={() => setConversionType("unixToWin")}
            >
              Unix/macOS → Windows (PowerShell)
            </Button>
          </div>
          <div>
            <Label htmlFor="curl-input">Input Command</Label>
            <Textarea
              id="curl-input"
              placeholder={
                conversionType === "winToUnix"
                  ? "e.g., Invoke-WebRequest -Uri 'https://api.example.com/data' -Method POST -Headers @{ 'Content-Type'='application/json'; 'Authorization'='Bearer token' } -Body '{\"key\":\"value\"}'"
                  : "e.g., curl -X POST 'https://api.example.com/data' -H 'Content-Type: application/json' -H 'Authorization: Bearer token' -d '{\"key\":\"value\"}'"
              }
              value={curlInput}
              onChange={(e) => setCurlInput(e.target.value)}
              rows={5}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="curl-output">Converted Command</Label>
            <Textarea
              id="curl-output"
              value={curlOutput}
              readOnly
              rows={5}
              className="mt-1 bg-gray-100 dark:bg-gray-800"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
