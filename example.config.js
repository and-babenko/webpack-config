// Встроенный модуль для работы с путями на разных системах, подгонка под один стандарт.
const path = require("path");
// Нужен для проставления вендорных префиксов в css, для кроссбраузерности
const autoprefixer = require("autoprefixer");
// Модуль для precss
const precss = require("precss");
// Для работы с HTML - файлами, у нас - для перемещения index в итоговый билд
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  // Четвертый обязательный компонент.
  // Кроме entry, мы можем указать поле, куда (в какой файл) собирать конечный результат. Это свойство задаётся с помощью поля output. По умолчанию, весь результирующий код собирается в папку dist. Тут же можно прописать правила для распределения картинок по папкам и так далее.
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].[hash]. js",
  },
  mode: "development",
  //Настройки локального сервера

  devServer: {
    publicPath: "/",
    port: 999,
    contentBase: path.join(process.cwd(), "dist"),
    host: "localhost",
    historyApiFallback: true,
    noInfo: false,
    stats: "minimal",
    hot: true,
  },
  module: {
    // Второй обязательный компонент
    // Для того, чтобы трансформировать файл, используются специальные утилиты - загрузчики (loaders). Для любых настроек модуля вебпак используется поле module. Массив rules внутри объекта module определяет список правил для загрузчиков. Таким образом, все js-файлы будут сначала прогоняется через babel-loader, css через style-loader и так далее. Их также необходимо установить через консоль, без отдельно прописанных правил для разных типов файлов в финальной сборке они будут не читабельными.
    rules: [
      {
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
        test: /\.js$/,
      },
      {
        test: /\.css$/,
        use: [
          {
            //В билде докинет нашему индексу тег <style>
            loader: "style-loader",
          },
          {
            //Читает содержимое css файла и передает его сборщику
            loader: "css-loader",

            options: {
              importLoaders: 1,
              sourceMap: true,
            },
          },
          {
            loader: "postcss-loader",
            options: {
              plugins: () => [precss, autoprefixer],
            },
          },
        ],
      },
      {
        test: /\.(png|jpe?g|gif)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[path][name].[ext]",
              outPath: "images",
            },
          },
        ],
      },
    ],
  },
  // Третий обязательный компонент
  // Вебпак плагины используются для настройки процесса сборки всего приложения, а не отдельного файла как с лоадерами. Например, плагин для минификации кода (во время сборки код подвергается очистке и минификации). Или плагин для сборки html страницы и css кода (скрипты вставляются в html, куски css собираются в один файл), именно это и делает код ниже. Для его использования его необходимо подгрузить с помощью npm i -D html-webpack-plugin.
  plugins: [
    new HtmlWebpackPlugin({
      template: "index.html",
    }),
  ],
};
