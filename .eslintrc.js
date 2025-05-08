module.exports = {
  parserOptions: { ecmaVersion: 2020, sourceType: 'module' },
  plugins: ['unicode-sanitizer'],
  rules: {
    'unicode-sanitizer/no-dangling-unicode': ['error', {
      configFile: './mapping.yaml',
      allowFancy: false
    }],
  },
};