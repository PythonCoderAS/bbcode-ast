import { expect } from "chai";

import defaultParser, {
  ListItemNode,
  Node,
  Parser,
  TextNode,
} from "../src/index.ts";

describe("bbcode-ast tests", () => {
  it("Should parse tag-free text", () => {
    const parsed = defaultParser.parse("Hello world!");
    expect(parsed.children.length).to.equal(1);
    expect(parsed.children[0].name).to.equal("TextNode");
    expect((parsed.children[0] as TextNode).text).to.equal("Hello world!");
    expect(parsed.toString()).to.equal("Hello world!");
  });

  it("Should parse simple tag", () => {
    const parsed = defaultParser.parse("[b]Hello world![/b]");
    expect(parsed.children.length).to.equal(1);
    expect(parsed.children[0].name).to.equal("b");
    expect((parsed.children[0] as Node).children.length).to.equal(1);
    expect((parsed.children[0] as Node).children[0].name).to.equal("TextNode");
    expect(
      ((parsed.children[0] as Node).children[0] as TextNode).text
    ).to.equal("Hello world!");
    expect(parsed.toString()).to.equal("[b]Hello world![/b]");
  });

  it("Should parse multiple simple tags", () => {
    const parsed = defaultParser.parse(
      "[b]Hello world![/b][i]Hello world![/i]"
    );
    expect(parsed.children.length).to.equal(2);
    expect(parsed.children[0].name).to.equal("b");
    expect((parsed.children[0] as Node).children.length).to.equal(1);
    expect((parsed.children[0] as Node).children[0].name).to.equal("TextNode");
    expect(
      ((parsed.children[0] as Node).children[0] as TextNode).text
    ).to.equal("Hello world!");
    expect(parsed.children[1].name).to.equal("i");
    expect((parsed.children[1] as Node).children.length).to.equal(1);
    expect((parsed.children[1] as Node).children[0].name).to.equal("TextNode");
    expect(
      ((parsed.children[1] as Node).children[0] as TextNode).text
    ).to.equal("Hello world!");
    expect(parsed.toString()).to.equal(
      "[b]Hello world![/b][i]Hello world![/i]"
    );
  });

  it("Should parse nested tags", () => {
    const parsed = defaultParser.parse("[b][i]Hello world![/i][/b]");
    expect(parsed.children.length).to.equal(1);
    expect(parsed.children[0].name).to.equal("b");
    expect((parsed.children[0] as Node).children.length).to.equal(1);
    expect((parsed.children[0] as Node).children[0].name).to.equal("i");
    expect(
      ((parsed.children[0] as Node).children[0] as Node).children.length
    ).to.equal(1);
    expect(
      (
        ((parsed.children[0] as Node).children[0] as Node)
          .children[0] as TextNode
      ).text
    ).to.equal("Hello world!");
    expect(parsed.toString()).to.equal("[b][i]Hello world![/i][/b]");
  });

  it("Should parse code tags and ignore content", () => {
    const parsed = defaultParser.parse("[code][b]Hello world![/b][/code]");
    expect(parsed.children.length).to.equal(1);
    expect(parsed.children[0].name).to.equal("code");
    expect((parsed.children[0] as Node).children.length).to.equal(1);
    expect((parsed.children[0] as Node).children[0].name).to.equal("TextNode");
    expect(
      ((parsed.children[0] as Node).children[0] as TextNode).text
    ).to.equal("[b]Hello world![/b]");
    expect(parsed.toString()).to.equal("[code][b]Hello world![/b][/code]");
  });

  it("Should parse list tags", () => {
    const parsed = defaultParser.parse(
      "[list][*]Hello world![*]Hello world![/list]"
    );
    expect(parsed.children.length).to.equal(1);
    expect(parsed.children[0].name).to.equal("list");
    expect((parsed.children[0] as Node).children.length).to.equal(2);
    expect((parsed.children[0] as Node).children[0].name).to.equal("*");
    expect(
      ((parsed.children[0] as Node).children[0] as ListItemNode).children.length
    ).to.equal(1);
    expect(
      ((parsed.children[0] as Node).children[0] as ListItemNode).children[0]
        .name
    ).to.equal("TextNode");
    expect(
      (
        ((parsed.children[0] as Node).children[0] as ListItemNode)
          .children[0] as TextNode
      ).text
    ).to.equal("Hello world!");
    expect((parsed.children[0] as Node).children[1].name).to.equal("*");
    expect(
      ((parsed.children[0] as Node).children[1] as ListItemNode).children.length
    ).to.equal(1);
    expect(
      ((parsed.children[0] as Node).children[1] as ListItemNode).children[0]
        .name
    ).to.equal("TextNode");
    expect(
      (
        ((parsed.children[0] as Node).children[1] as ListItemNode)
          .children[0] as TextNode
      ).text
    ).to.equal("Hello world!");
    expect(parsed.toString()).to.equal(
      "[list][*]Hello world![*]Hello world![/list]"
    );
  });

  it("Should parse simple attributes", () => {
    const parsed = defaultParser.parse("[color=red]Hello world![/color]");
    expect(parsed.children.length).to.equal(1);
    expect(parsed.children[0].name).to.equal("color");
    expect((parsed.children[0] as Node).value).to.equal("red");
    expect((parsed.children[0] as Node).children.length).to.equal(1);
    expect((parsed.children[0] as Node).children[0].name).to.equal("TextNode");
    expect(
      ((parsed.children[0] as Node).children[0] as TextNode).text
    ).to.equal("Hello world!");
    expect(parsed.toString()).to.equal("[color=red]Hello world![/color]");
  });

  it("Should parse simple attributes with space and quotes", () => {
    const parsed = defaultParser.parse(
      '[spoiler="a spoiler"]Hello world![/spoiler]'
    );
    expect(parsed.children.length).to.equal(1);
    expect(parsed.children[0].name).to.equal("spoiler");
    expect((parsed.children[0] as Node).value).to.equal('"a spoiler"');
    expect((parsed.children[0] as Node).children.length).to.equal(1);
    expect((parsed.children[0] as Node).children[0].name).to.equal("TextNode");
    expect(
      ((parsed.children[0] as Node).children[0] as TextNode).text
    ).to.equal("Hello world!");
    expect(parsed.toString()).to.equal(
      '[spoiler="a spoiler"]Hello world![/spoiler]'
    );
  });

  it("Should parse complex attributes", () => {
    const parsed = defaultParser.parse(
      "[url=https://www.google.com][img align=right]https://i.imgur.com/oz0a7.jpg[/img][/url]"
    );
    expect(parsed.children.length).to.equal(1);
    expect(parsed.children[0].name).to.equal("url");
    expect((parsed.children[0] as Node).value).to.equal(
      "https://www.google.com"
    );
    expect((parsed.children[0] as Node).children.length).to.equal(1);
    expect((parsed.children[0] as Node).children[0].name).to.equal("img");
    expect(
      ((parsed.children[0] as Node).children[0] as Node).attributes
    ).to.deep.equal({ align: "right" });
    expect(
      (
        ((parsed.children[0] as Node).children[0] as Node)
          .children[0] as TextNode
      ).text
    ).to.equal("https://i.imgur.com/oz0a7.jpg");
    expect(parsed.toString()).to.equal(
      "[url=https://www.google.com][img align=right]https://i.imgur.com/oz0a7.jpg[/img][/url]"
    );
  });

  it("Should parse complex attributes and quotes", () => {
    const parsed = defaultParser.parse(
      "[url=https://www.google.com][img align='right']https://i.imgur.com/oz0a7.jpg[/img][/url]"
    );
    expect(parsed.children.length).to.equal(1);
    expect(parsed.children[0].name).to.equal("url");
    expect((parsed.children[0] as Node).value).to.equal(
      "https://www.google.com"
    );
    expect((parsed.children[0] as Node).children.length).to.equal(1);
    expect((parsed.children[0] as Node).children[0].name).to.equal("img");
    expect(
      ((parsed.children[0] as Node).children[0] as Node).attributes
    ).to.deep.equal({ align: "'right'" });
    expect(
      (
        ((parsed.children[0] as Node).children[0] as Node)
          .children[0] as TextNode
      ).text
    ).to.equal("https://i.imgur.com/oz0a7.jpg");
    expect(parsed.toString()).to.equal(
      "[url=https://www.google.com][img align='right']https://i.imgur.com/oz0a7.jpg[/img][/url]"
    );
  });

  it("Parse very nested BBCode", () => {
    const text = `[b][i][u][s][color=red][url=https://www.google.com][img align=right]https://i.imgur.com/oz0a7.jpg[/img][/url][/color][/s][/u][/i][/b]`;
    const parsed = defaultParser.parse(text);
    expect(parsed.children.length).to.equal(1);
    expect(parsed.toString() === text);
  });

  it("Parse real-world example", () => {
    const text = `Some quick suggestions:

[list=1]
[*]Update your includes so the script runs on more pages. Here is a sample list (there might be more to add):[code]// @match        https://myanimelist.net/forum/index.php?topicid=*
// @match        https://myanimelist.net/people/*
// @match        https://myanimelist.net/blog.php?eid=*
// @match        https://myanimelist.net/news/*
// @match        https://myanimelist.net/comtocom.php*
[/code]
Basically, wherever user-entered text is rendered with BBCode, you want to load the script there.
[*]From your comment, I am confused about what you are trying to do. [quote=hacker09] Right now it works great for my 2 test cases, but if they are copy pasted into any text box and it includes forum links the script breaks if they are the first links I think. Or at least won't convert the forum links but will convert everything else.[/quote] Does this mean there's a way to convert a textbox into formatted links? How can I trigger this?
[/list]`;
    const parsed = defaultParser.parse(text);
    expect(parsed.children.length).to.equal(2);
    expect(parsed.toString() === text);
  });

  it("Custom parser", () => {
    const parser = new Parser(["b"]);
    const text = "[b][i]Hello world![/i][/b]";
    const parsed = parser.parse(text);
    expect(parsed.children.length).to.equal(1);
    expect(parsed.children[0].name).to.equal("b");
    expect((parsed.children[0] as Node).children.length).to.equal(1);
    expect((parsed.children[0] as Node).children[0].name).to.equal("TextNode");
    expect(
      ((parsed.children[0] as Node).children[0] as TextNode).text
    ).to.equal("[i]Hello world![/i]");
    expect(parsed.toString()).to.equal(text);
  });

  it("Custom parser with lenient mode", () => {
    const parser = new Parser(["b", "i", "s"], false, true);
    const text = "[b][i][s]Hello world![/i][/b]";
    const parsed = parser.parse(text);
    expect(parsed.children.length).to.equal(1);
    expect(parsed.toString()).to.equal(text);
  });

  it("Custom parser with lenient mode and no closing tags", () => {
    const parser = new Parser(["b", "i", "s"], false, true);
    const text = "[b]Test![/b][b][i][s]Hello world![b]Test![/b]";
    const parsed = parser.parse(text);
    expect(parsed.children.length).to.equal(2);
    expect(parsed.toString()).to.equal(text);
  });
});
