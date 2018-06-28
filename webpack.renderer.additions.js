// temp workaround for https://github.com/electron-userland/electron-webpack/issues/125
const presetEnv = require('@babel/preset-env/lib/index.js');
delete presetEnv.default;
delete presetEnv.isPluginRequired;
delete presetEnv.transformIncludesAndExcludes;

module.exports = {
  module: {
    rules: [
      {
        test: /\.s[a|c]ss$/,
        use: [
          {
            loader: "style-loader"
          },
          {
            loader: "css-loader"
          },
          {
            loader: "sass-loader"
          }
        ]
      }
    ]
  }
}