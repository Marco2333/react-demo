const webpack = require('webpack');

module.exports = {
	devtool: 'eval-source-map',
	// externals: {
	// 	'react': 'window.React',
	// 	'react-dom': 'window.ReactDOM'
	// },
	entry: __dirname + "/app/main.js",
	output: {
		path: __dirname + "/public",
		filename: "bundle.js"
	},

	module: {
		loaders: [{
			test: /\.js$/,
			exclude: /node_modules/,
			loader: 'babel-loader'
		}, {
			test: /\.css$/,
			loader: 'style-loader!css-loader' //添加对样式表的处理
		}]
	},

	plugins: [
		new webpack.DllReferencePlugin({
			context: __dirname,
			manifest: require('./manifest.json'),
		})
	],

	devServer: {} // Omitted for brevity
}