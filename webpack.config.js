const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  
    module: {
        rules: [
            {
                test: /\.css$/, // ou /\.scss$/ pour SASS
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader', // ou 'sass-loader' pour SASS
                ],
            },
        
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[id].css',
        }),
    ],
    
};
