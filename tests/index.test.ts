import { expect } from "chai";
import defaultParser, {Node, TextNode} from "../src/index";

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
})
