import { type ConfigFunction } from "@babel/core";

const config: ConfigFunction = (api) => {
  api.cache.forever();
  return {
    presets: [
      ["@babel/preset-env", { modules: false, targets: "node 16" }],
      ["@babel/preset-typescript"],
    ],
    plugins: [
      [
        "module-extension-resolver",
        {
          extensionsToKeep: [".json"],
        },
      ],
    ],
  };
};

module.exports = config;
