/** @type {import('next').NextConfig} */
const nextConfig = {
     webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        dns: false,
        child_process: false,
        "timers/promises": false,
        socks:false
      };
    }
    return config;
  },
};

export default nextConfig;
