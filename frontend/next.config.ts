/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Properly handle code that should only run in the browser
  serverExternalPackages: [],
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on browser-only globals like window
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        dns: false,
        child_process: false,
        http2: false,
        path: false,
        os: false,
        // Add any other browser-only modules your app depends on
      };
    }
    return config;
  },
};

export default nextConfig;
