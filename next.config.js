/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true,
    domains: ['firebasestorage.googleapis.com'],
  },
  
  // Webpack configuration to handle Firebase chunk loading issues
  webpack: (config, { isServer, dev }) => {
    // Handle Firebase dynamic imports and chunk loading
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        maxSize: 200000, // Prevent chunks from being too large
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all'
          },
          firebase: {
            test: /[\\/]node_modules[\\/]@firebase|firebase[\\/]/,
            name: 'firebase',
            priority: 10,
            chunks: 'all'
          }
        }
      };
    }
    
    // Handle module resolution for Firebase
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    
    return config;
  },
  
  // Experimental features to improve module loading
  experimental: {
    esmExternals: 'loose',
  },
}

module.exports = nextConfig
