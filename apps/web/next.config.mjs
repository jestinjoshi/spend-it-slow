import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  // SW caching is noisy in dev; only enable it for production builds.
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // core ships TypeScript source, so Next must transpile it.
  transpilePackages: ["@spenditslow/core"],
};

export default withSerwist(nextConfig);
