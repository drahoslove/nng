// const SentryWebpackPlugin = require('@sentry/webpack-plugin')

module.exports = {
  entry: {
		eggworker: './eggworker.js',
  },
  output: {
		filename: '[name]-bundle.js',
		path: __dirname,
	},
	module: {
		rules: [
			{ test: /\.js$/, use: 'babel-loader' },
		]
	},
	plugins: [
    // new SentryWebpackPlugin({
    //   include: '.',
    //   ignoreFile: '.sentrycliignore',
    //   ignore: ['node_modules', 'webpack.config.js'],
    //   configFile: 'sentry.properties'
    // })
  ]
};