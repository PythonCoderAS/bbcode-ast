import Parser from "./parser.js";

export * from "./node.js";
export { default as Parser } from "./parser.js";

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
  "font",
  "justify",
  "sub",
  "sup",
  "pre",
  "table",
  "tr",
  "td",
];
/**
 * The default BBcode parser. Implements the tags used on the website [MyAnimeList](https://myanimelist.net/info.php?go=bbcode).
 */
const defaultParser = new Parser(defaultTags, false);
export default defaultParser;
