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
})
