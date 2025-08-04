// export default nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensure .js files are resolved
  webpack(config) {
    config.resolve.extensions.push('.js');
    return config;
  },
};

export default nextConfig;