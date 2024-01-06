const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const webpack = require('webpack');
const UnusedWebpackPlugin = require('unused-webpack-plugin');
const path = require('path');

module.exports = async (env, argv) => {
    const config = await createExpoWebpackConfigAsync(env, argv);

    // Ignore all locale files of moment.js except 'fr'
    config.plugins.push(
        new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /fr/),
    );

    // Add ContextReplacementPlugin for moment-timezone to only include 'fr' timezone data
    config.plugins.push(
        new webpack.ContextReplacementPlugin(/moment-timezone[/\\]data[/\\]packed[/\\]latest\.json$/, (context) => {
            if (/\/data\/packed\/latest\.json$/.test(context.request)) {
                // Only the 'fr' locale for timezone data
                Object.assign(context, {
                    regExp: /^\.\/(fr)/,
                    request: context.request.replace(/latest\.json$/, 'fr.json'),
                });
            }
        }),

    );
    // Add the unused-webpack-plugin to the array of plugins
    config.plugins.push(
        new UnusedWebpackPlugin({
            // Directories to look for unused files
            directories: [path.join(__dirname, './screens')],
            // Exclude patterns
            exclude: ['*.test.js'],
            // Root directory of the project
            root: __dirname,
        }),
    );
    config.performance = {
        maxEntrypointSize: 512000,
        maxAssetSize: 512000,
        hints: false // You can set this to 'false' to turn off the warnings
    };


    // Optionally you can enable the bundle size report.
    // It's best to do this only with production builds because it will add noticeably more time to your builds and reloads.
    if (env.mode === 'production') {
        config.plugins.push(
            new BundleAnalyzerPlugin({
                path: 'web-report',
            })
        );
    }

    return config;
};