/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // App Router is enabled by using the `app/` directory.
  // Firebase's Node builds depend on `undici`, which uses syntax webpack
  // doesn't parse by default. We alias it away entirely so it is never bundled.
  webpack(config) {
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};
    config.resolve.alias["undici"] = false;
    return config;
  },
};

export default nextConfig;
