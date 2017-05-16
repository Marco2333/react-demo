const webpack = require('webpack');

module.exports = {
	devtool: 'eval-source-map',
	entry: __dirname + "/app/mock.js",
	output: {
		path: __dirname + "/public",
		filename: "bundle.js"
	},
	module: {
		loaders: [{
			test: /\.js$/,
			exclude: /node_modules/,
			loader: 'babel-loader',
			query: {
				presets: ['es2015']
			}
		}]
	},
	plugins: [
		new webpack.DllReferencePlugin({
			context: __dirname,
			manifest: require('./manifest.json'),
		})
	],
}