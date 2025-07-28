import withPWA from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // Fix for HLS.js worker issues - COMPLETE FIX for MODULE_NOT_FOUND
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      // Complete solution: Disable HLS.js workers entirely
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
      
      // Ignore ALL worker-related imports from HLS.js
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /worker/i,
          contextRegExp: /hls\.js/,
        })
      );

      // Additional ignore for specific worker paths
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^\.\/lib\/worker.*$/,
        })
      );

      // Define HLS_DISABLE_WORKER to disable workers completely
      config.plugins.push(
        new webpack.DefinePlugin({
          'process.env.HLS_DISABLE_WORKER': JSON.stringify('true'),
        })
      );
    }
    return config;
  },
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
})(nextConfig);
