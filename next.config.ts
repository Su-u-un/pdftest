/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias.canvas = false; // 处理 pdf-lib 的 canvas 依赖
    return config;
  },
};

module.exports = nextConfig;