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

  // Windows CMD curl to Unix curl
  const convertCmdCurlToUnixCurl = (cmdCurl) => {
    let unixCurl = "curl"
    let url = ""
    let method = "GET"
    const headers = []
    let body = ""

    // Split by space, but not inside quotes. Handle escaped quotes.
    // Also handle ^ for line breaks if present (though we won't generate them)
    const parts = cmdCurl.replace(/\s*\^\s*\n\s*/g, " ").match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || []

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
        headers.push(`-H "${header}"`)
      } else if (part === "-d" && parts[i + 1]) {
        body = parts[++i].replace(/^"|"$/g, "").replace(/""/g, '"') // Remove outer quotes and unescape internal ""
      }
    }

    if (url) {
      unixCurl += ` '${url}'`
    } else {
      return "Error: Could not find URL in Windows CMD curl command."
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

  // Unix curl to Windows Command Prompt curl
  const convertUnixCurlToCmdCurl = (unixCurl) => {
    let cmdCurl = "curl"
    let url = ""
    let method = "GET"
    const headers = []
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
        const header = parts[++i].replace(/^"|"$/g, "").replace(/^'|'$/g, "") // Remove outer quotes (both types)
        headers.push(`-H "${header}"`) // cmd.exe curl needs header string in double quotes
      } else if (part === "-d" && parts[i + 1]) {
        body = parts[++i].replace(/^'|'$/g, "").replace(/^"|"$/g, "") // Remove outer quotes (both types)
      }
    }

    if (url) {
      cmdCurl += ` "${url}"` // URL in double quotes
    } else {
      return "Error: Could not find URL in Unix curl command."
    }

    if (method !== "GET") {
      cmdCurl += ` -X ${method}`
    }

    if (headers.length > 0) {
      cmdCurl += ` ${headers.join(" ")}`
    }

    if (body) {
      // Escape double quotes within the body for cmd.exe
      const escapedBody = body.replace(/"/g, '""')
      cmdCurl += ` -d "${escapedBody}"` // Body in double quotes
    }

    return cmdCurl // No ^ for line breaks by default
  }

  const handleConvert = () => {
    if (!curlInput.trim()) {
      setCurlOutput("")
      return
    }

    let converted = ""
    if (conversionType === "winToUnix") {
      converted = convertCmdCurlToUnixCurl(curlInput)
    } else if (conversionType === "unixToWin") {
      converted = convertUnixCurlToCmdCurl(curlInput)
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
        <CardDescription>Convert curl commands between Windows CMD and Unix/macOS syntax.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant={conversionType === "winToUnix" ? "default" : "outline"}
              onClick={() => setConversionType("winToUnix")}
            >
              Windows (CMD) → Unix/macOS
            </Button>
            <Button
              variant={conversionType === "unixToWin" ? "default" : "outline"}
              onClick={() => setConversionType("unixToWin")}
            >
              Unix/macOS → Windows (CMD)
            </Button>
          </div>
          <div>
            <Label htmlFor="curl-input">Input Command</Label>
            <Textarea
              id="curl-input"
              placeholder={
                conversionType === "winToUnix"
                  ? `e.g., curl -X GET "https://api.example.com/data" -H "Accept: application/json" -H "Authorization: Bearer token"`
                  : `e.g., curl -X GET 'https://api.example.com/data' -H 'Accept: application/json' -H 'Authorization: Bearer token'`
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
