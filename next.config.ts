import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
// เปลี่ยน 'nhh-ita' ให้ตรงกับชื่อ Repository ของคุณบน GitHub
const repoName = "nhh-ita";

const nextConfig: NextConfig = {
  // output: "export",       // Disabled to allow API routes
  trailingSlash: true,    // สร้าง /path/ แทน /path (ป้องกัน 404)
  images: {
    unoptimized: true,    // ปิด Next.js Image Optimization (ไม่รองรับบน static host)
  },
  basePath: isProd ? `/${repoName}` : "",
  assetPrefix: isProd ? `/${repoName}/` : "",
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
};

export default nextConfig;
