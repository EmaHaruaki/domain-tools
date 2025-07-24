"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"

export default function CliToolsPage() {
  const [commandInput, setCommandInput] = useState("")
  const [outputLines, setOutputLines] = useState(["Welcome to the Web CLI. Type 'help' for available commands."])
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [loading, setLoading] = useState(false)
  const [currentTab, setCurrentTab] = useState("linux") // 'linux' or 'windows'
  const outputRef = useRef(null)

  const availableCommands = {
    linux: {
      "🌐 dig [-t <type>] <domain>": "DNSレコードを取得します (A, MX, TXT, CNAMEなど)。",
      "🌐 ping <host>": "サーバーへの遅延を疑似的に確認します。",
      "🌐 curl <url>": "HTTPリクエストを送信し、レスポンスを表示します。",
      "🌐 whois <domain>": "ドメインのWHOIS情報を取得します (外部API)。",
      "🌐 ip": "クライアントのグローバルIPアドレスを表示します。",
      "🌐 traceroute <host>": "ホストへの経路を疑似的に追跡します。",
      "🔄 echo <text>": "入力されたテキストを表示します。",
      "🔄 cat <filename>": "定義済みのテキストファイルの内容を表示します。",
      "🔄 base64 encode <text>": "テキストをBase64エンコードします。",
      "🔄 base64 decode <text>": "Base64文字列をデコードします。",
      "🔄 date": "現在の日付と時刻を表示します。",
      "🔄 clear": "画面をクリアします。",
      "🔄 help": "利用可能なコマンドを表示します。",
      "🔄 history": "コマンド履歴を表示します。",
    },
    windows: {
      "🌐 nslookup [/type=<type>] <domain>": "DNSレコードを取得します (A, MX, TXT, CNAMEなど)。",
      "🌐 ping <host>": "サーバーへの遅延を疑似的に確認します。",
      "🌐 curl <url>": "HTTPリクエストを送信し、レスポンスを表示します。",
      "🌐 whois <domain>": "ドメインのWHOIS情報を取得します (外部API)。",
      "🌐 ipconfig": "クライアントのグローバルIPアドレスを表示します。",
      "🌐 tracert <host>": "ホストへの経路を疑似的に追跡します。",
      "🔄 echo <text>": "入力されたテキストを表示します。",
      "🔄 type <filename>": "定義済みのテキストファイルの内容を表示します。",
      "🔄 certutil -encode <text>": "テキストをBase64エンコードします。",
      "🔄 certutil -decode <text>": "Base64文字列をデコードします。",
      "🔄 date /t": "現在の日付を表示します。",
      "🔄 time /t": "現在の時刻を表示します。",
      "🔄 cls": "画面をクリアします。",
      "🔄 help": "利用可能なコマンドを表示します。",
      "🔄 doskey /history": "コマンド履歴を表示します。",
    },
  }

  // スクロールを一番下にする
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [outputLines])

  const addOutput = (line) => {
    setOutputLines((prev) => [...prev, line])
  }

  const executeCommand = async (command) => {
    if (!command.trim()) return

    addOutput(`> ${command}`)
    setHistory((prev) => {
      const newHistory = [...prev, command]
      return newHistory.slice(Math.max(newHistory.length - 50, 0)) // Keep last 50 commands
    })
    setHistoryIndex(-1) // Reset history index after execution
    setCommandInput("")
    setLoading(true)

    const parts = command.split(" ").filter(Boolean)
    const cmd = parts[0]
    const args = parts.slice(1)

    try {
      switch (cmd.toLowerCase()) {
        case "help":
          addOutput("Available commands:")
          Object.entries(availableCommands[currentTab]).forEach(([key, value]) => {
            addOutput(`  ${key}: ${value}`)
          })
          break
        case "clear":
        case "cls":
          setOutputLines([])
          break
        case "history":
        case "doskey": // Windows equivalent
          if (args[0] === "/history") {
            addOutput("Command History:")
            history.forEach((histCmd, idx) => addOutput(`  ${idx + 1} ${histCmd}`))
          } else {
            addOutput("Command History:")
            history.forEach((histCmd, idx) => addOutput(`  ${idx + 1} ${histCmd}`))
          }
          break
        case "echo":
          addOutput(args.join(" "))
          break
        case "date":
          if (currentTab === "windows" && args[0] === "/t") {
            addOutput(new Date().toLocaleDateString())
          } else {
            addOutput(new Date().toLocaleString())
          }
          break
        case "time": // Windows specific
          if (currentTab === "windows" && args[0] === "/t") {
            addOutput(new Date().toLocaleTimeString())
          } else {
            addOutput("Usage: time /t")
          }
          break
        case "cat":
        case "type": // Windows equivalent
          if (args[0] === "README.txt") {
            addOutput("This is a simulated file content.")
            addOutput("You can add more predefined files here.")
          } else {
            addOutput(`cat: ${args[0]}: No such file or directory (simulated)`)
          }
          break
        case "base64":
        case "certutil": // Windows equivalent
          if (currentTab === "linux") {
            if (args[0] === "encode") {
              addOutput(btoa(args.slice(1).join(" ")))
            } else if (args[0] === "decode") {
              try {
                addOutput(atob(args.slice(1).join(" ")))
              } catch {
                addOutput("Error: Invalid Base64 string.")
              }
            } else {
              addOutput("Usage: base64 [encode|decode] <text>")
            }
          } else {
            // Windows certutil simulation
            if (args[0] === "-encode") {
              addOutput("-----BEGIN CERTIFICATE-----")
              addOutput(
                btoa(args.slice(1).join(" "))
                  .match(/.{1,64}/g)
                  .join("\n"),
              ) // Wrap lines
              addOutput("-----END CERTIFICATE-----")
            } else if (args[0] === "-decode") {
              try {
                const encoded = args
                  .slice(1)
                  .join(" ")
                  .replace(/-----(BEGIN|END) CERTIFICATE-----|\n/g, "")
                addOutput(atob(encoded))
              } catch {
                addOutput("Error: Invalid Base64 string.")
              }
            } else {
              addOutput("Usage: certutil -encode|-decode <text>")
            }
          }
          break
        case "dig":
        case "nslookup": // Windows equivalent
          let domainToLookup = ""
          let recordTypeToLookup = "" // Default to all types if not specified

          if (currentTab === "linux") {
            // dig [-t <type>] <domain>
            const tIndex = args.indexOf("-t")
            if (tIndex !== -1 && args[tIndex + 1]) {
              recordTypeToLookup = args[tIndex + 1].toUpperCase()
              domainToLookup = args[tIndex + 2] || args[0] // domain could be before or after -t
            } else {
              domainToLookup = args[0]
            }
          } else {
            // nslookup [/type=<type>] <domain>
            const typeArg = args.find((arg) => arg.startsWith("/type="))
            if (typeArg) {
              recordTypeToLookup = typeArg.split("=")[1].toUpperCase()
              domainToLookup = args.find((arg) => !arg.startsWith("/type="))
            } else {
              domainToLookup = args[0]
            }
          }

          if (!domainToLookup) {
            addOutput(`Usage: ${cmd} [-t <type>] <domain> (Linux)`)
            addOutput(`Usage: ${cmd} [/type=<type>] <domain> (Windows)`)
            break
          }

          const typeParam = recordTypeToLookup ? `&type=${recordTypeToLookup}` : ""
          const dnsResponse = await fetch(`https://dns.google/resolve?name=${domainToLookup}${typeParam}`)
          if (!dnsResponse.ok) {
            throw new Error(`Failed to fetch DNS records: ${dnsResponse.statusText}`)
          }
          const dnsData = await dnsResponse.json()

          addOutput(`;; QUESTION SECTION:`)
          addOutput(`;${domainToLookup}. IN ${recordTypeToLookup || "ANY"}`)
          addOutput(``)
          addOutput(`;; ANSWER SECTION:`)
          if (dnsData.Answer && dnsData.Answer.length > 0) {
            dnsData.Answer.forEach((record) => {
              let recordType = ""
              switch (record.type) {
                case 1:
                  recordType = "A"
                  break // A record
                case 5:
                  recordType = "CNAME"
                  break // CNAME record
                case 15:
                  recordType = "MX"
                  break // MX record
                case 16:
                  recordType = "TXT"
                  break // TXT record
                case 28:
                  recordType = "AAAA"
                  break // AAAA record
                case 2:
                  recordType = "NS"
                  break // NS record
                case 6:
                  recordType = "SOA"
                  break // SOA record
                default:
                  recordType = `TYPE${record.type}`
              }
              // Only show the requested type if specified, otherwise show all relevant types
              if (!recordTypeToLookup || recordTypeToLookup === recordType) {
                addOutput(`${record.name}\t${record.TTL}\tIN\t${recordType}\t${record.data}`)
              }
            })
          } else {
            addOutput(`No ${recordTypeToLookup || ""} records found for ${domainToLookup}`)
          }
          break
        case "ping":
          if (!args[0]) {
            addOutput(`Usage: ping <host>`)
            break
          }
          addOutput(`Pinging ${args[0]} with 32 bytes of data:`)
          for (let i = 0; i < 4; i++) {
            const startTime = performance.now()
            try {
              // Simulate network request
              await new Promise((resolve) => setTimeout(resolve, Math.random() * 100 + 50))
              const endTime = performance.now()
              const time = (endTime - startTime).toFixed(2)
              addOutput(`Reply from ${args[0]}: bytes=32 time=${time}ms TTL=64 (simulated)`)
            } catch (e) {
              addOutput(`Request timed out. (simulated)`)
            }
          }
          addOutput(`Ping statistics for ${args[0]}:`)
          addOutput(`    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),`)
          addOutput(`Approximate round trip times in milli-seconds:`)
          addOutput(`    Minimum = 50ms, Maximum = 150ms, Average = 100ms (simulated)`)
          break
        case "curl":
        case "http": // Simplified for http
          if (!args[0]) {
            addOutput(`Usage: ${cmd} <url>`)
            break
          }
          try {
            const response = await fetch(args[0])
            const headers = Array.from(response.headers.entries())
            addOutput(`HTTP/${response.httpVersion || "1.1"} ${response.status} ${response.statusText}`)
            headers.forEach(([key, value]) => addOutput(`${key}: ${value}`))
            addOutput(``)
            const text = await response.text()
            addOutput(text.substring(0, 500) + (text.length > 500 ? "..." : "")) // Limit output
          } catch (e) {
            addOutput(`Error: Could not connect to ${args[0]} - ${e.message}`)
          }
          break
        case "whois":
          if (!args[0]) {
            addOutput(`Usage: whois <domain>`)
            break
          }
          addOutput(`Searching WHOIS for ${args[0]}... (simulated via placeholder API)`)
          // This would require a real WHOIS API. For demonstration, we'll mock it.
          // Example: https://www.whoisxmlapi.com/
          try {
            // Placeholder for a real WHOIS API call
            const mockWhoisResponse = {
              domainName: args[0],
              registrar: "Example Registrar Inc.",
              creationDate: "2000-01-01",
              expirationDate: "2025-01-01",
              status: "clientTransferProhibited",
              nameServers: ["ns1.example.com", "ns2.example.com"],
            }
            addOutput(`Domain Name: ${mockWhoisResponse.domainName}`)
            addOutput(`Registrar: ${mockWhoisResponse.registrar}`)
            addOutput(`Creation Date: ${mockWhoisResponse.creationDate}`)
            addOutput(`Expiration Date: ${mockWhoisResponse.expirationDate}`)
            addOutput(`Status: ${mockWhoisResponse.status}`)
            addOutput(`Name Servers: ${mockWhoisResponse.nameServers.join(", ")}`)
            addOutput(
              `\nNote: This WHOIS lookup is simulated. A real implementation would require a dedicated WHOIS API service.`,
            )
          } catch (e) {
            addOutput(`Error fetching WHOIS data: ${e.message}`)
          }
          break
        case "ip":
        case "ipconfig": // Windows equivalent
          addOutput("Fetching public IP address...")
          try {
            const ipResponse = await fetch("https://api.ipify.org?format=json")
            const ipData = await ipResponse.json()
            addOutput(`IPv4 Address: ${ipData.ip}`)
            addOutput(
              `\nNote: This shows your public IP address. 'ipconfig' on Windows typically shows local network adapter details, which cannot be accessed from a browser.`,
            )
          } catch (e) {
            addOutput(`Error fetching IP: ${e.message}`)
          }
          break
        case "traceroute":
        case "tracert": // Windows equivalent
          if (!args[0]) {
            addOutput(`Usage: ${cmd} <host>`)
            break
          }
          addOutput(`Tracing route to ${args[0]} over a maximum of 30 hops:`)
          addOutput(
            `\nNote: This is a highly simplified simulation. Real traceroute uses ICMP packets which cannot be sent from a browser.`,
          )
          for (let i = 1; i <= 5; i++) {
            const time1 = (Math.random() * 20 + 10).toFixed(2)
            const time2 = (Math.random() * 20 + 10).toFixed(2)
            const time3 = (Math.random() * 20 + 10).toFixed(2)
            const ip = `192.168.1.${i * 10}` // Mock IP
            addOutput(`  ${i}    ${time1} ms    ${time2} ms    ${time3} ms  ${ip}`)
            await new Promise((resolve) => setTimeout(resolve, 100)) // Small delay
          }
          addOutput(`Trace complete.`)
          break
        default:
          addOutput(`Command not found: ${cmd}. Type 'help' for available commands.`)
      }
    } catch (e) {
      addOutput(`Error executing command: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      executeCommand(commandInput)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (history.length > 0) {
        const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1)
        setHistoryIndex(newIndex)
        setCommandInput(history[newIndex])
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (history.length > 0) {
        const newIndex = historyIndex === -1 ? -1 : Math.min(history.length - 1, historyIndex + 1)
        setHistoryIndex(newIndex)
        setCommandInput(newIndex === -1 ? "" : history[newIndex])
      }
    }
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Web CLI Tools</CardTitle>
        <CardDescription>Simulate command-line network tools in your browser.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            {" "}
            {/* 3から2に変更 */}
            <TabsTrigger value="linux">Linux Commands</TabsTrigger>
            <TabsTrigger value="windows">Windows Commands</TabsTrigger>
          </TabsList>
          <TabsContent value="linux" className="mt-4">
            <h4 className="mb-2 text-lg font-semibold">Available Linux Commands:</h4>
            <ul className="mb-4 list-inside list-disc text-sm text-gray-600 dark:text-gray-400">
              {Object.entries(availableCommands.linux).map(([cmd, desc]) => (
                <li key={cmd}>
                  <span className="font-mono text-green-700 dark:text-green-400">{cmd}</span>: {desc}
                </li>
              ))}
            </ul>
          </TabsContent>
          <TabsContent value="windows" className="mt-4">
            <h4 className="mb-2 text-lg font-semibold">Available Windows Commands:</h4>
            <ul className="mb-4 list-inside list-disc text-sm text-gray-600 dark:text-gray-400">
              {Object.entries(availableCommands.windows).map(([cmd, desc]) => (
                <li key={cmd}>
                  <span className="font-mono text-blue-700 dark:text-blue-400">{cmd}</span>: {desc}
                </li>
              ))}
            </ul>
          </TabsContent>
        </Tabs>

        {/* CLI Terminal Section */}
        <div
          className="mt-4 h-96 overflow-y-auto rounded-md bg-gray-800 p-4 font-mono text-sm text-green-400"
          ref={outputRef}
        >
          {outputLines.map((line, index) => (
            <div key={index}>{line}</div>
          ))}
          {loading && <div className="animate-pulse">...</div>}
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="mt-4 flex gap-2">
          <Input
            className="flex-1 bg-gray-700 text-green-400 placeholder:text-gray-500 focus:border-green-500 focus:ring-green-500"
            placeholder="Type command here..."
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            autoFocus
          />
          <Button onClick={() => executeCommand(commandInput)} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Execute
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
