import { expect } from "chai";
import defaultParser, {ListItemNode, Node, TextNode} from "../src/index";

describe("bbcode-ast tests", () => {
  it("Should parse tag-free text", () => {
    const parsed = defaultParser.parse("Hello world!")
    expect(parsed.children.length).to.equal(1);
    expect(parsed.children[0].name).to.equal("TextNode");
    expect((parsed.children[0] as TextNode).text).to.equal("Hello world!");
    expect(parsed.toString()).to.equal("Hello world!");
  })

  it("Should parse simple tag", () => {
    const parsed = defaultParser.parse("[b]Hello world![/b]")
    expect(parsed.children.length).to.equal(1);
    expect(parsed.children[0].name).to.equal("b");
    expect((parsed.children[0] as Node).children.length).to.equal(1);
    expect((parsed.children[0] as Node).children[0].name).to.equal("TextNode");
    expect(((parsed.children[0] as Node).children[0] as TextNode).text).to.equal("Hello world!");
    expect(parsed.toString()).to.equal("[b]Hello world![/b]");
  })

  it("Should parse multiple simple tags", () => {
    const parsed = defaultParser.parse("[b]Hello world![/b][i]Hello world![/i]")
    expect(parsed.children.length).to.equal(2);
    expect(parsed.children[0].name).to.equal("b");
    expect((parsed.children[0] as Node).children.length).to.equal(1);
    expect((parsed.children[0] as Node).children[0].name).to.equal("TextNode");
    expect(((parsed.children[0] as Node).children[0] as TextNode).text).to.equal("Hello world!");
    expect(parsed.children[1].name).to.equal("i");
    expect((parsed.children[1] as Node).children.length).to.equal(1);
    expect((parsed.children[1] as Node).children[0].name).to.equal("TextNode");
    expect(((parsed.children[1] as Node).children[0] as TextNode).text).to.equal("Hello world!");
    expect(parsed.toString()).to.equal("[b]Hello world![/b][i]Hello world![/i]");
  })

  it("Should parse nested tags", () => {
    const parsed = defaultParser.parse("[b][i]Hello world![/i][/b]")
    expect(parsed.children.length).to.equal(1);
    expect(parsed.children[0].name).to.equal("b");
    expect((parsed.children[0] as Node).children.length).to.equal(1);
    expect((parsed.children[0] as Node).children[0].name).to.equal("i");
    expect(((parsed.children[0] as Node).children[0] as Node).children.length).to.equal(1);
    expect((((parsed.children[0] as Node).children[0] as Node).children[0] as TextNode).text).to.equal("Hello world!");
    expect(parsed.toString()).to.equal("[b][i]Hello world![/i][/b]");
  })

  it("Should parse code tags and ignore content", () => {
    const parsed = defaultParser.parse("[code][b]Hello world![/b][/code]")
    expect(parsed.children.length).to.equal(1);
    expect(parsed.children[0].name).to.equal("code");
    expect((parsed.children[0] as Node).children.length).to.equal(1);
    expect((parsed.children[0] as Node).children[0].name).to.equal("TextNode");
    expect(((parsed.children[0] as Node).children[0] as TextNode).text).to.equal("[b]Hello world![/b]");
    expect(parsed.toString()).to.equal("[code][b]Hello world![/b][/code]");
  })

  it("Should parse list tags", () => {
    const parsed = defaultParser.parse("[list][*]Hello world![*]Hello world![/list]")
    expect(parsed.children.length).to.equal(1);
    expect(parsed.children[0].name).to.equal("list");
    expect((parsed.children[0] as Node).children.length).to.equal(2);
    expect((parsed.children[0] as Node).children[0].name).to.equal("*");
    expect(((parsed.children[0] as Node).children[0] as ListItemNode).children.length).to.equal(1);
    expect(((parsed.children[0] as Node).children[0] as ListItemNode).children[0].name).to.equal("TextNode");
    expect((((parsed.children[0] as Node).children[0] as ListItemNode).children[0] as TextNode).text).to.equal("Hello world!");
    expect((parsed.children[0] as Node).children[1].name).to.equal("*");
    expect(((parsed.children[0] as Node).children[1] as ListItemNode).children.length).to.equal(1);
    expect(((parsed.children[0] as Node).children[1] as ListItemNode).children[0].name).to.equal("TextNode");
    expect((((parsed.children[0] as Node).children[1] as ListItemNode).children[0] as TextNode).text).to.equal("Hello world!");
    expect(parsed.toString()).to.equal("[list][*]Hello world![*]Hello world![/list]");
  })

  it("Should parse simple attributes", () => {
    const parsed = defaultParser.parse("[color=red]Hello world![/color]")
    expect(parsed.children.length).to.equal(1);
    expect(parsed.children[0].name).to.equal("color");
    expect((parsed.children[0] as Node).value).to.equal("red");
    expect((parsed.children[0] as Node).children.length).to.equal(1);
    expect((parsed.children[0] as Node).children[0].name).to.equal("TextNode");
    expect(((parsed.children[0] as Node).children[0] as TextNode).text).to.equal("Hello world!");
    expect(parsed.toString()).to.equal("[color=red]Hello world![/color]");
  })

  it("Should parse simple attributes with space and quotes", () => {
    const parsed = defaultParser.parse('[spoiler="a spoiler"]Hello world![/spoiler]')
    expect(parsed.children.length).to.equal(1);
    expect(parsed.children[0].name).to.equal("spoiler");
    expect((parsed.children[0] as Node).value).to.equal('"a spoiler"');
    expect((parsed.children[0] as Node).children.length).to.equal(1);
    expect((parsed.children[0] as Node).children[0].name).to.equal("TextNode");
    expect(((parsed.children[0] as Node).children[0] as TextNode).text).to.equal("Hello world!");
    expect(parsed.toString()).to.equal('[spoiler="a spoiler"]Hello world![/spoiler]');
  })

  it("Should parse complex attributes", () => {
    const parsed = defaultParser.parse("[url=https://www.google.com][img align=right]https://i.imgur.com/oz0a7.jpg[/img][/url]")
    expect(parsed.children.length).to.equal(1);
    expect(parsed.children[0].name).to.equal("url");
    expect((parsed.children[0] as Node).value).to.equal("https://www.google.com");
    expect((parsed.children[0] as Node).children.length).to.equal(1);
    expect((parsed.children[0] as Node).children[0].name).to.equal("img");
    expect(((parsed.children[0] as Node).children[0] as Node).attributes).to.deep.equal({align: "right"});
    expect((((parsed.children[0] as Node).children[0] as Node).children[0] as TextNode).text).to.equal("https://i.imgur.com/oz0a7.jpg");
    expect(parsed.toString()).to.equal("[url=https://www.google.com][img align=right]https://i.imgur.com/oz0a7.jpg[/img][/url]");
  })

  it("Should parse complex attributes and quotes", () => {
    const parsed = defaultParser.parse("[url=https://www.google.com][img align='right']https://i.imgur.com/oz0a7.jpg[/img][/url]")
    expect(parsed.children.length).to.equal(1);
    expect(parsed.children[0].name).to.equal("url");
    expect((parsed.children[0] as Node).value).to.equal("https://www.google.com");
    expect((parsed.children[0] as Node).children.length).to.equal(1);
    expect((parsed.children[0] as Node).children[0].name).to.equal("img");
    expect(((parsed.children[0] as Node).children[0] as Node).attributes).to.deep.equal({align: "'right'"});
    expect((((parsed.children[0] as Node).children[0] as Node).children[0] as TextNode).text).to.equal("https://i.imgur.com/oz0a7.jpg");
    expect(parsed.toString()).to.equal("[url=https://www.google.com][img align='right']https://i.imgur.com/oz0a7.jpg[/img][/url]");
  })
})
