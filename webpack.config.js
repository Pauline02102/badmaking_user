const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    // ... Votre configuration existante
    module: {
        rules: [
            {
                test: /\.css$/, // ou /\.scss$/ pour SASS
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader', // ou 'sass-loader' pour SASS
                ],
            },
            // ... autres règles
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[id].css',
        }),
    ],
    // ... Reste de votre configuration
};
