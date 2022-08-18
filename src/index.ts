import Parser from "./parser";

export * from "./node";
export { default as Parser } from "./parser";

const defaultTags = ["b", "u", "i", "s", "center", "right", "color", "size", "yt", "list", "url", "img", "spoiler", "code"]
const defaultParser = new Parser(defaultTags, false);
export default defaultParser;
