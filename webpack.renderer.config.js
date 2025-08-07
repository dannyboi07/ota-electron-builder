const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

/**
 * @module webpack.renderer.config
 * @type {import('webpack').Configuration}
 */
module.exports = {
    mode: process.env === "development" ? "development" : "production",
    entry: "./src/renderer/index.js",
    output: {
        path: path.resolve(__dirname, "dist/renderer"),
        filename: "index.js",
        libraryTarget: "var",
    },
    target: "electron-renderer",
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                            [
                                "@babel/preset-env",
                                {
                                    modules: false,
                                    targets: {
                                        browsers: ["last 2 versions"],
                                    },
                                },
                            ],
                        ],
                    },
                },
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "src/renderer/index.html",
            filename: "index.html",
        }),
    ],
    resolve: {
        extensions: [".js", ".json"],
    },
};
