const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')
const withNextIntl = require('next-intl/plugin')()

module.exports = withNextIntl({
  output: 'standalone',
  trailingSlash: true,
  reactStrictMode: false,
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
    return config
  },
})
