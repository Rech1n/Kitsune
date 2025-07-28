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
  // Fix for HLS.js worker issues - Clean Code: Configuration centralization
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      // Handle HLS.js worker files properly - Fix MODULE_NOT_FOUND error
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
      
      // Ignore worker imports that cause issues
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^\.\/lib\/worker$/,
          contextRegExp: /hls\.js/,
        })
      );

      // Handle worker files
      config.module.rules.push({
        test: /\.worker\.js$/,
        type: 'asset/resource',
        generator: {
          filename: 'static/worker/[hash][ext][query]',
        },
      });
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
