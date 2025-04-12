module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    ['@babel/plugin-transform-private-methods', { loose: false }], // Ensure consistent 'loose' mode
    ['@babel/plugin-transform-class-properties', { loose: false }], // Ensure consistent 'loose' mode
    ['@babel/plugin-transform-private-property-in-object', { loose: false }], // Ensure consistent 'loose' mode
  ],
  env: {
    production: {
      plugins: ['react-native-paper/babel'], // Keep only necessary plugins
    },
  },
};