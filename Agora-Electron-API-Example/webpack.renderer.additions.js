const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const isDevelopment = process.env.NODE_ENV === 'development'

module.exports = function (config) {
  const rules = config.module.rules

  rules.concat({
    test: /\.global\.(scss|sass)$/,
    use: [
      {
        loader: 'style-loader',
      },
      {
        loader: 'css-loader',
        options: {
          sourceMap: true,
        },
      },
      {
        loader: 'sass-loader',
      },
    ],
  })

  if (isDevelopment) {
    config.devServer = {
      ...config.devServer,
      historyApiFallback: true,
      // compress: true,
      // noInfo: true,
      // stats: 'errors-only',
      // inline: true,
      // lazy: false,
    }
    config.plugins = [
      ...config.plugins,
      new ReactRefreshWebpackPlugin(),
    ].filter(Boolean)

    rules.concat({
      test: /\.[jt]sx?$/,
      exclude: /node_modules/,
      use: [
        {
          loader: require.resolve('babel-loader'),
          options: {
            plugins: [
              isDevelopment && require.resolve('react-refresh/babel'),
            ].filter(Boolean),
          },
        },
      ],
    })
  }

  rules.forEach((rule) => {
    // if (rule.use && rule.use.filter) {
    //   rule.use = rule.use.filter((plugin) => plugin !== 'css-hot-loader')
    // }

    if (rule.test.toString().match(/s\(\[ac\]\)ss/)) {
      rule.use = [
        {
          loader: 'style-loader',
        },
        {
          loader: '@teamsupercell/typings-for-css-modules-loader',
        },
        {
          loader: 'css-loader',
          options: {
            modules: {
              localIdentName: '[name]__[local]__[hash:base64:5]',
            },
            importLoaders: 1,
          },
        },
        {
          loader: 'sass-loader',
        },
      ]
      return
    }
  })

  config.externals = [
    // ...config.externals,
    'webpack',
    'agora-electron-sdk',
  ]
  console.log('config', config)
  return config
}
