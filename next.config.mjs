/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // 静的エクスポートを有効にする
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // その他の設定があればここに追加
};

export default nextConfig;
