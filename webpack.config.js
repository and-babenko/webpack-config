const path = require("path"); /* 2.1 */

const HTMLWebpackPlugin = require("html-webpack-plugin"); /* 9.1 */
const MiniCssExtractPlugin = require("mini-css-extract-plugin"); /* 10.1 */
const OptimizeCssAssetWebpackPlugin = require("optimize-css-assets-webpack-plugin"); /* 10.4 */
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin"); /* 11.2 */
const TerserWebpackPlugin = require("terser-webpack-plugin"); /* 14.2 */

const PATHS = {
  /* 2.2 */
  src: path.resolve(__dirname, "src"),
  dist: path.resolve(__dirname, "dist"),
  devAssets: path.resolve(__dirname, "src/assets"),
  prodAssets: path.resolve(__dirname, "dist/assets"),
  html: path.resolve(__dirname, "src/index.html"),
};

module.exports = (env, argv) => {
  /* 1 */
  const isDev = argv.mode === "development"; /* 6.2 */
  const isProd = !isDev; /* 6.3 */

  const filename = (ext) =>
    isDev ? `[name]${ext}` : `[name].[hash].min${ext}`; /* 6.4 */

  return {
    mode: "development" /* 6.1 */,

    context: PATHS.src /* 3 */,

    entry: {
      /* 4 */
      app: ["./js/app.js", "./scss/style.scss"],
    },

    output: {
      /* 5 */
      filename: `./js/${filename(".js")}`,
      path: PATHS.dist,
      clean: true,
    },

    devServer: {
      /* 7 */
      static: {
        directory: PATHS.dist,
      },
      port: 8080,
      compress: true,
      historyApiFallback: true,
      open: true,
      hot: true,
    },

    devtool: isProd ? false : "source-map" /* 8 */,

    resolve: {
      /* 14.5 */
      extensions: [".ts", ".js"],
    },

    module: {
      rules: [
        {
          /* 9.3 */
          test: /\.html$/i,
          use: [
            {
              loader: "html-loader",
              options: {
                minimize: isProd,
              },
            },
          ],
        },
        {
          /* 10.3 */
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
          /* 11.1 */
          test: /\.(png|jpe?g|gif)$/i,
          type: "asset/resource",
          generator: {
            filename: `assets/imgs/${filename("[ext]")}`,
          },
        },
        {
          /* 12 */
          test: /\.(svg)$/i,
          type: "asset/resource",
          generator: {
            filename: `assets/svgs/${filename("[ext]")}`,
          },
        },
        {
          /* 13.1 */
          test: /\.(ico)$/i,
          type: "asset/resource",
          generator: {
            filename: `assets/favicon/${filename("[ext]")}`,
          },
        },
        {
          /* 13.2 */
          test: /\.(woff(2)?|eot|ttf|otf)$/,
          type: "asset/resource",
          generator: {
            filename: `assets/fonts/${filename("[ext]")}`,
          },
        },
        {
          /* 14.1 */
          test: /\.js$/,
          use: ["babel-loader"],
          exclude: /node_modules/,
        },
        {
          /* 14.4 */
          test: /\.ts$/,
          loader: "ts-loader",
          exclude: /node_modules/,
        },
      ],
    },

    plugins: [
      new HTMLWebpackPlugin({
        /* 9.2 */
        template: PATHS.html,
        filename: "index.html",
        minify: {
          collapseWhitespace: isProd,
        },
      }),
      new MiniCssExtractPlugin({
        /* 10.2 */
        filename: `./css/${filename(".css")}`,
      }),
    ],

    optimization: (function () {
      /* 10.5 */
      const configObj = {
        /* 15 */
        splitChunks: {
          chunks: "all",
        },
      };

      if (isProd) {
        configObj.minimizer = [
          new OptimizeCssAssetWebpackPlugin() /* 10.6 */,
          new ImageMinimizerPlugin({
            /* 11.3 */
            minimizer: {
              implementation: ImageMinimizerPlugin.sharpMinify,
              options: {
                encodeOptions: {
                  jpeg: {
                    quality: 100,
                  },
                  webp: {
                    lossless: true,
                  },
                  avif: {
                    lossless: true,
                  },
                  png: {
                    lossless: true,
                  },
                },
              },
            },
          }),
          new TerserWebpackPlugin() /* 14.3 */,
        ];
      }
      return configObj;
    })(),
  };
};
