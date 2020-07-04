var webpack = require("webpack")
module.exports = {
    entry: "./index.js",
    module: {
        rules: [{
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            }
        ]
    },
    resolve: {
        extensions: ['*', '.js', '.jsx'],
    },
    output: {
        filename: './lib/nb.js',
        libraryTarget: 'umd',
        library: 'nb',
    },
    plugins: [
        /*
         new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery"
        })
        */
    ],
    node: {
    }
}
