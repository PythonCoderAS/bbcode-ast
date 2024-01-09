import { readdir, rename, rm } from "fs/promises";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const parentDirName = resolve(__dirname, "..");
const distDir = resolve(parentDirName, "dist");

const files = await readdir(distDir);

const configFiles = files.filter((file) => file.includes(".config."));

const srcFiles = await readdir(resolve(distDir, "src"));

await Promise.all(
  srcFiles.map((file) =>
    rename(resolve(distDir, "src", file), resolve(distDir, file))
  )
);
await Promise.all(configFiles.map((file) => rm(resolve(distDir, file))));
await rm(resolve(distDir, "src"), {
  recursive: true,
  force: true,
});
