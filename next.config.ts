import type { NextConfig } from 'next';

const NEXT_PUBLIC_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000';

let apiHostname = '127.0.0.1';
try {
  apiHostname = new URL(NEXT_PUBLIC_API_BASE_URL).hostname;
} catch {
  apiHostname = '127.0.0.1';
}

const HOSTNAMES_RED_LOCAL = new Set(['127.0.0.1', 'localhost', 'host.docker.internal']);
const apiEnRedLocal = HOSTNAMES_RED_LOCAL.has(apiHostname);

const nextConfig: NextConfig = {
  // Genera una build standalone para minimizar la imagen Docker.
  output: 'standalone',
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  images: {
    dangerouslyAllowLocalIP: apiEnRedLocal,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: apiHostname,
      },
      {
        protocol: 'https',
        hostname: apiHostname,
      },
      // La API puede devolver URLs con localhost aunque el base URL use 127.0.0.1.
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
      },
    ],
  },
};

export default nextConfig;
