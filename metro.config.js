const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    // Prefer platform-specific RN entry, then fall back to JS build
    resolverMainFields: ['react-native', 'main'],
    // Exclude backup/worktree copies so Metro only crawls the active app tree.
    blockList: [
      /.*[\\/]\.codex-worktrees[\\/].*/,
      /.*[\\/]AqualinkTindoe_Aqua505[\\/].*/,
      /.*[\\/]fresh_aqua591[\\/].*/,
    ],
  },
  watchFolders: [path.resolve(__dirname)],
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
