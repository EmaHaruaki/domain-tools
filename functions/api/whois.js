export async function onRequest(context) {
  const { request, env } = context
  const url = new URL(request.url)
  const domain = url.searchParams.get("domain")

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  }

  // CORS プリフライト
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers })
  }

  if (!domain) {
    return new Response(JSON.stringify({ error: "Domain parameter is required." }), { status: 400, headers })
  }

  try {
    // 環境変数からAPIキーを取得
    const apiKey = env.WHOISXML_API_KEY
    if (!apiKey) throw new Error("API key is not configured on the server.")

    // WhoisXML API エンドポイント
    const apiUrl = `https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=${apiKey}&domainName=${encodeURIComponent(
      domain
    )}&outputFormat=JSON`

    const resp = await fetch(apiUrl)
    if (!resp.ok) throw new Error(`WHOIS API request failed with status ${resp.status}`)

    const data = await resp.json()

    return new Response(JSON.stringify(data), { status: 200, headers })
  } catch (error) {
    console.error("WHOIS API error:", error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers })
  }
}
