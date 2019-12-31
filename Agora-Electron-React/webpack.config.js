const ExtractTextPlugin = require('extract-text-webpack-plugin')
const isProduction = process.env["NODE_ENV"] === "production"

module.exports = {
    externals: {"agora-electron-sdk": "commonjs2 agora-electron-sdk"},
    watch: isProduction ? false : true,

    target: 'electron-renderer',

    entry: './src/renderer/index.js',

    output: {
        path: __dirname + '/build',
        publicPath: 'build/',
        filename: 'bundle.js'
    },

    module: {
        rules: [
            {
                test: /\.jsx?$/,
                loader: 'babel-loader',
                options: {
                    presets: ['react']
                }
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract({
                  loader: 'css-loader',
                  options: {
                    modules: true
                  }
                })
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                loader: 'file-loader',
                query: {
                    name: '[name].[ext]?[hash]'
                }
            }
        ]
    },

    plugins: [
        new ExtractTextPlugin({
            filename: 'bundle.css',
            disable: false,
            allChunks: true
        })
    ],

    resolve: {
      extensions: ['.js', '.json', '.jsx']
    }

}
