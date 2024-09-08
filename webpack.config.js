const path = require('path');

module.exports = {
    entry: {
        popup: './src/pages/popup.ts',
        contentScript: './src/content/contentScript.ts',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js' // This will output files like popup.bundle.js, contentScript.bundle.js, etc.
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    mode: 'development',
    devtool: 'source-map' // Use 'source-map' instead of 'eval'
};