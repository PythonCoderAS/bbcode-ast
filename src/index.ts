import Parser from "./parser";

export * from "./node";
export { default as Parser } from "./parser";

const defaultTags = [
  "b",
  "u",
  "i",
  "s",
  "center",
  "right",
  "color",
  "size",
  "yt",
  "list",
  "*",
  "url",
  "img",
  "spoiler",
  "code",
  "quote",
];
/**
 * The default BBcode parser. Implements the tags used on the website [MyAnimeList](https://myanimelist.net/info.php?go=bbcode).
 */
const defaultParser = new Parser(defaultTags, false);
export default defaultParser;
