"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 dark:bg-gray-950">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Welcome to Domain Tools</CardTitle>
          <CardDescription>Select a tool to get started.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link href="/dns-lookup" passHref className="block">
            <Button className="w-full">Go to DNS Lookup</Button>
          </Link>
          <Link href="/subdomain-lookup" passHref className="block">
            <Button className="w-full">Go to Subdomain Lookup</Button>
          </Link>
          <Link href="/cli-tools" passHref className="block">
            <Button className="w-full">Go to CLI Tools</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
