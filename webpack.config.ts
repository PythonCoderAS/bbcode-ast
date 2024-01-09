import { resolve } from "path";
import { fileURLToPath } from "url";
// eslint-disable-next-line import/no-extraneous-dependencies
import { Configuration } from "webpack";

const config: Configuration = {
  entry: "./src/index.ts",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: { loader: "babel-loader" },
        exclude: /node_modules|\.d\.ts$/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts"],
    extensionAlias: {
      ".js": ".ts",
    },
  },
  output: {
    filename: "bundle.js",
    path: resolve(fileURLToPath(new URL(".", import.meta.url)), "dist"),
    library: "bbcode_ast",
  },
  devtool: "source-map",
};

export default config;
