module.exports = function (api) {
  api.cache(true);
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: { '@': './src' },
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        },
      ],
      // Strip console.log/warn/info in production builds — keeps bundle clean
      ...(isProduction ? [['transform-remove-console', { exclude: ['error'] }]] : []),
    ],
  };
};
