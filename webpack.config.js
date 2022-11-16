//123123123
const path = require("path"); // 2.1

const HTMLWebpackPlugin = require("html-webpack-plugin"); // 8.1
const { CleanWebpackPlugin } = require("clean-webpack-plugin"); // 9
const MiniCssExtractPlugin = require("mini-css-extract-plugin"); // 10.1
const CopyWebpackPlugin = require("copy-webpack-plugin"); // 12.1
const OptimizeCssAssetWebpackPlugin = require("optimize-css-assets-webpack-plugin"); // 17.1
const TerserWebpackPlugin = require("terser-webpack-plugin"); // 17.2
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

const isDev = process.env.NODE_ENV === "development"; // 6.1
const isProd = !isDev; // 6.2

const filename = (ext) => (isDev ? `[name]${ext}` : `[name].[hash]${ext}`); // 7.1

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

// 1
module.exports = {
  mode: "development", // 6
  context: path.resolve(__dirname, "src"), // 2.2, 3

  // 4
  entry: {
    // polyfill: "babel-polyfill", // 4.1
    app: ["./js/app.js", "./scss/style.scss"], // 4.2
  },
  // 5
  output: {
    filename: `./js/${filename(".js")}`, // 5.1, 7.2
    path: path.resolve(__dirname, "dist"), // 5.2
    publicPath: "", // 5.3
  },
  // 11
  devServer: {
    static: {
      directory: path.join(__dirname, "dist"),
    },
    historyApiFallback: true,
    open: true,
    compress: true,
    hot: true,
    port: 3000,
    publicPath: "/",
  },

  devtool: isProd ? false : "source-map", // 16

  optimization: optimization(), // 17.3

  plugins: [
    // 8.2
    new HTMLWebpackPlugin({
      template: path.resolve(__dirname, "src/index.html"), // 8.3
      filename: "index.html", // 8.4
      minify: {
        // 8.5
        collapseWhitespace: isProd,
      },
    }),
    new CleanWebpackPlugin(), // 9.2
    new MiniCssExtractPlugin({
      // 10.3
      filename: `./css/${filename(".css")}`,
    }),
    new CopyWebpackPlugin({
      // 12.2
      patterns: [
        {
          from: path.resolve(__dirname, "src/assets"),
          to: path.resolve(__dirname, "dist/assets"),
        },
      ],
    }),
  ],
  module: {
    rules: [
      {
        // 8.6
        test: /\.html$/i,
        loader: "html-loader",
      },
      {
        // 10.2
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        // 10.4
        test: /\.s[ac]ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: (resourcePath, context) => {
                return path.relative(path.dirname(resourcePath), context) + "/";
              },
            },
          },
          "css-loader",
          "sass-loader",
        ],
      },
      {
        // 13
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: "asset/resource",
        generator: {
          filename: `img/${filename("[ext]")}`,
        },
      },
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
