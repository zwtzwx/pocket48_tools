module.exports = {
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: 'babel-loader',
          exclude:  /node_modules|NIM_Web_SDK/i
        },
        {
          test: /\.worker\.js$/,
          loader: 'worker-loader',
          options: { inline: true, fallback: false }
        }
      ]
    },
    externals: {
      SDK: 'window.SDK'
    }
  }
}