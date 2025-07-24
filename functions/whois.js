// Cloudflare Pages Functionsは、package.jsonに依存関係を記述することで
// 自動的にnpmモジュールをインストールしてくれます。
// そのため、whois-jsonを直接インポートできます。
import whois from "whois-json"

// Cloudflare Pages Functionsのエントリーポイント
export async function onRequest(context) {
  const { request } = context
  const url = new URL(request.url)
  const domain = url.searchParams.get("domain")

  // CORSヘッダー
  const headers = {
    "Access-Control-Allow-Origin": "*", // すべてのオリジンからのアクセスを許可
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  }

  // OPTIONSリクエストのハンドリング (CORSプリフライト)
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: headers,
    })
  }

  if (!domain) {
    return new Response(JSON.stringify({ error: "Domain parameter is required." }), {
      status: 400,
      headers: headers,
    })
  }

  try {
    const result = await whois.lookup(domain)
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: headers,
    })
  } catch (error) {
    console.error("WHOIS lookup failed:", error)
    return new Response(
      JSON.stringify({ error: `Failed to retrieve WHOIS information for ${domain}. ${error.message || ""}` }),
      {
        status: 500,
        headers: headers,
      },
    )
  }
}
