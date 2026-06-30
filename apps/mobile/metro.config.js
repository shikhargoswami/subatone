// apps/mobile/metro.config.js
const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

const projectRoot = __dirname
const monorepoRoot = path.resolve(projectRoot, '../..')

const config = getDefaultConfig(projectRoot)

// Watch all files in the monorepo
config.watchFolders = [monorepoRoot]

// Resolve modules from root node_modules first, then local
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
]

// Explicitly map packages that Clerk's web code imports
// but must resolve from the monorepo root (not bundled by default in RN)
config.resolver.extraNodeModules = {
  'react-dom': path.resolve(monorepoRoot, 'node_modules', 'react-dom'),
}

module.exports = config
