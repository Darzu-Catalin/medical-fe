const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')
const withNextIntl = require('next-intl/plugin')()

module.exports = withNextIntl({
  output: 'standalone',
  trailingSlash: true,
  reactStrictMode: false,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    esmExternals: 'loose'
  },
  modularizeImports: {
    '@mui/material': {
      transform: '@mui/material/{{member}}',
    },
    '@mui/lab': {
      transform: '@mui/lab/{{member}}',
    },
  },
  images: {
    remotePatterns: [
      {
        // allow all
        hostname: '*',
      },
    ],
    domains: ['*'],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })
    config.plugins.push(
      new CopyPlugin({
        patterns: [
          {
            from: path.join(__dirname, 'node_modules/tinymce/skins'),
            to: path.join(__dirname, 'public/assets/libs/tinymce/skins'),
          },
        ],
      })
    )

    // Fix for Redux Toolkit module resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      '@reduxjs/toolkit': path.resolve(__dirname, 'node_modules/@reduxjs/toolkit'),
    }

    // Ensure proper module resolution for vendor chunks
    if (config.cache && typeof config.cache === 'object') {
      config.cache.buildDependencies = config.cache.buildDependencies || {}
      config.cache.buildDependencies.config = [__filename]
    }

    return config
  },
})
