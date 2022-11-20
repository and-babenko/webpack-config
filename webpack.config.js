const path = require("path"); // 2.1

const HTMLWebpackPlugin = require("html-webpack-plugin"); // 8.1
const MiniCssExtractPlugin = require("mini-css-extract-plugin"); // 9.1

const OptimizeCssAssetWebpackPlugin = require("optimize-css-assets-webpack-plugin"); // 17.1
const TerserWebpackPlugin = require("terser-webpack-plugin"); // 17.2
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

// 2.2
const PATHS = {
  src: path.resolve(__dirname, "src"),
  dist: path.resolve(__dirname, "dist"),
  devAssets: path.resolve(__dirname, "src/assets"),
  prodAssets: path.resolve(__dirname, "dist/assets"),
  html: path.resolve(__dirname, "src/index.html"),
};

// 1
module.exports = (env, argv) => {
  const isDev = argv.mode === "development"; // 6.1
  const isProd = !isDev; // 6.2

  const filename = (ext) =>
    isDev ? `[name]${ext}` : `[name].[hash].min${ext}`; // 6.3

  const optimization = () => {
    // 17.4
    const configObj = {
      splitChunks: {
        // 17.5
        chunks: "all",
      },
    };
    if (isProd) {
      configObj.minimizer = [
        new OptimizeCssAssetWebpackPlugin(), // 17.6
        new TerserWebpackPlugin(), // 17.7
        new ImageMinimizerPlugin({
          minimizer: {
            implementation: ImageMinimizerPlugin.imageminMinify,
            options: {
              plugins: [
                ["gifsicle", { interlaced: true }],
                ["jpegtran", { progressive: true }],
                ["optipng", { optimizationLevel: 5 }],
                [
                  "svgo",
                  {
                    plugins: [
                      {
                        name: "preset-default",
                        params: {
                          overrides: {
                            removeViewBox: false,
                            addAttributesToSVGElement: {
                              params: {
                                attributes: [
                                  { xmlns: "http://www.w3.org/2000/svg" },
                                ],
                              },
                            },
                          },
                        },
                      },
                    ],
                  },
                ],
              ],
            },
          },
        }),
      ];
    }
    return configObj;
  };

  return {
    mode: "development", // 6

    context: PATHS.src, // 3

    devtool: isProd ? false : "source-map", // 16

    // 4
    entry: {
      app: ["./js/app.js", "./scss/style.scss"],
    },

    // 5
    output: {
      filename: `./js/${filename(".js")}`,
      path: PATHS.dist,
      clean: true,
    },

    // 7
    devServer: {
      static: {
        directory: PATHS.dist,
      },
      port: 8080,
      compress: true,
      historyApiFallback: true,
      open: true,
      hot: true,
    },

    optimization: optimization(), // 17.3

    plugins: [
      // new CopyWebpackPlugin({
      // const CopyWebpackPlugin = require("copy-webpack-plugin");
      //   patterns: [
      //     {
      //       from: PATHS.devAssets,
      //       to: PATHS.prodAssets,
      //       noErrorOnMissing: true,
      //     },
      //   ],
      // }),

      // 8.2
      new HTMLWebpackPlugin({
        template: PATHS.html,
        filename: "index.html",
        minify: {
          collapseWhitespace: isProd,
        },
      }),

      // 9.2
      new MiniCssExtractPlugin({
        filename: `./css/${filename(".css")}`,
      }),
    ],

    module: {
      rules: [
        {
          // 8.3
          test: /\.html$/i,
          loader: "html-loader",
        },

        {
          // 9.3
          test: /\.(s[ac]ss|css)$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            {
              loader: "css-loader",
              options: { sourceMap: true },
            },
            {
              loader: "postcss-loader",
              options: { sourceMap: true },
            },
            {
              loader: "resolve-url-loader",
            },
            {
              loader: "sass-loader",
              options: { sourceMap: true },
            },
          ],
          exclude: "/node_modules",
        },
        {
          // 10.1
          test: /\.(png|jpe?g|gif)$/i,
          type: "asset/resource",
          generator: {
            filename: `assets/imgs/${filename("[ext]")}`,
          },
        },
        // {
        //   test: /\.(ico)$/i,
        //   type: "asset/resource",
        //   generator: {
        //     filename: `assets/${filename("[ext]")}`,
        //   },
        // },
        {
          // 14
          test: /\.(woff2)$/i,
          type: "asset/resource",
          generator: {
            filename: `fonts/${filename("[ext]")}`,
          },
        },
        {
          // 15
          test: /\.js$/,
          exclude: /node_modules/, // 15.1
          use: ["babel-loader"], // 15.2
        },
      ],
    },
  };
};
