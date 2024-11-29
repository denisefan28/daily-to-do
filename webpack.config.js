import path from 'path';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  mode: "production",
  entry: {
    contentScript: "./src/content/index.js",
    background: "./src/background/index.js",
    react: "./src/react/index.jsx",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
    }),
    new CopyWebpackPlugin({
      patterns: [{
        from: path.resolve(__dirname, "manifest.json"),
        to: path.resolve(__dirname, "dist"),
      }, {
        from: path.resolve(__dirname, "src/assets"),
        to: path.resolve(__dirname, "dist/assets"),
      }],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
};