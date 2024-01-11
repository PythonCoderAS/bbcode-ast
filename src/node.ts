/**
 * Parameters for constructing a new Node object.
 */
export interface NodeConstructorParams {
  /**
   * The name of the node.
   *
   * Ref: {@link Node.name}
   * @example `[b]Hello World![/b]` -> `b`
   */
  name: string;
  /**
   * The attributes of the node.
   *
   * Ref: {@link Node.attributes}
   * @example `[img width=100 height=100]https://example.com/image.png[/img]` -> `{ width: "100", height: "100" }`
   */
  attributes?: { [key: string]: string };
  /**
   * The value of the node.
   *
   * Ref: {@link Node.value}
   * @example `[color=red]Hello World![/color]` -> `red`
   */
  value?: string;
}

/**
 * The abstract base class for all nodes.
 */
export abstract class BaseNode {
  /**
   * The name of the node.
   */
  abstract name: string;

  /**
   * Clones the code, creating a new deep-copied node.
   */
  abstract clone(): BaseNode;

  /**
   * Converts the node into a textual representation of the node as BBCode.
   * A node should return the exact same string as the input to {@link Parser.parse} provided `indented` is `false`.
   * @returns The textual representation of the node as BBCode.
   */
  abstract toString(): string;

  /**
   * Gets the textual representation of the node as BBCode.
   * An alias for {@link BaseNode.toString}.
   */
  toBBCode(): string {
    return this.toString();
  }

  /**
   * Converts the node into a tree-like overview of all children.
   * @param {number} indentWidth The number of spaces to indent the output. Defaults to `2`.
   * @returns The tree-like overview of all children.
   */
  nodeTree(indentWidth: number = 2): string {
    return this.nodeTreeHeading() + this.nodeTreeChildren(indentWidth);
  }

  /**
   * Gets the heading of the node tree.
   * @returns The heading of the node tree.
   */
  protected abstract nodeTreeHeading(): string;

  /**
   * Gets the children of the node tree.
   * @param indentWidth The number of spaces to indent the output.
   * @returns The children of the node tree.
   */
  protected abstract nodeTreeChildren(indentWidth: number): string;
}

/**
 * Indents a string.
 * @param input The string to indent.
 * @param indentWidth The number of spaces to indent the string.
 * @param indentLevel The current level of indentation.
 * @returns The indented string.
 */
function indentString(
  input: string,
  indentWidth: number,
  indentLevel: number
): string {
  const lines = input.split("\n");
  const indent = " ".repeat(indentWidth * indentLevel);
  return lines.map((line) => indent + line).join("\n");
}

/**
 * An interface for nodes that can hold children.
 */
export interface ChildrenHolder {
  /**
   * The children of the node. A node can have any number of children of all types.
   */
  children: BaseNode[];

  /**
   * Adds a child to the node. If the node is a {@link TextNode}, attempts to flatten the node with a previous TextNode.
   * @param child The child to add.
   */
  addChild(child: BaseNode): void;
}

/**
 * A type for attributes.
 *
 * A BBCode attribute is a key-value pair, where the key is a string and the value is a string. A tag can have multiple attributes.
 * @example `[img width=100 height=100]https://example.com/image.png[/img]` -> `{ width: "100", height: "100" }`
 */
export type AttributeType = { [key: string]: string };

/**
 * An interface for nodes that can hold attributes.
 */
export interface AttributeHolder {
  /**
   * The attributes of the node.
   * This should be public, so it can be directly accessed and modified.
   */
  attributes: AttributeType;

  /**
   * Sets the attribute of the node.
   * @param key The key of the attribute.
   * @param value The value of the attribute.
   * @deprecated Use {@link AttributeHolder.attributes} instead.
   */
  setAttribute(key: string, value: string): void;
}

export interface ValueHolder {
  /**
   * Stores the [simple parameterized value](https://www.bbcode.org/reference.php) of the tag.
   *
   * @example `[b=red]Hello World![/b]` -> `red`
   */
  value?: string;

  /**
   * Sets the value of the node.
   *
   * @param {string} value The value of the node.
   * @deprecated Use {@link ValueHolder.value} instead.
   */
  setValue(value: string): void;
}

export abstract class ChildrenHolderNode
  extends BaseNode
  implements ChildrenHolder
{
  /**
   * The children of the node.
   *
   * Ref: {@link ChildrenHolder.children}
   */
  public children: BaseNode[] = [];

  addChild(child: BaseNode): void {
    if (child instanceof TextNode) {
      const previousChild = this.children[this.children.length - 1];
      if (previousChild instanceof TextNode) {
        // We flatten the text nodes.
        previousChild.text += child.text;
        return;
      }
    }

    this.children.push(child.clone());
  }

  protected nodeTreeChildren(indentWidth: number): string {
    if (this.children.length === 0) {
      return ` {}`;
    }

    let nodeString = ` {`;
    this.children.forEach((child) => {
      const childOutput = `\n${indentString(
        child.nodeTree(indentWidth),
        indentWidth,
        1
      )}`;

      nodeString += childOutput;
    });
    nodeString += "\n}";

    return nodeString;
  }
}

/**
 * A BBCode node. This represents a tag and it's children.
 */
export class Node
  extends ChildrenHolderNode
  implements AttributeHolder, ValueHolder
{
  /**
   * The name of the tag.
   *
   * @example `[b]Hello World![/b]` -> `b`
   */
  public name: string;

  /**
   * The attributes of the tag.
   *
   * Ref: {@link AttributeType}
   */
  public attributes: AttributeType;

  /**
   * The value of the tag.
   *
   * Ref: {@link ValueHolder.value}
   */
  value?: string;

  constructor(params: NodeConstructorParams) {
    super();
    this.name = params.name;
    this.attributes = params.attributes || {};
    this.value = params.value;
  }

  clone(): Node {
    const node = new Node({
      name: this.name,
      attributes: this.attributes,
      value: this.value,
    });
    node.children = this.children.map((child) => child.clone());
    return node;
  }

  setValue(value: string): void {
    this.value = value;
  }

  setAttribute(key: string, value: string): void {
    this.attributes[key] = value;
  }

  /**
   * Makes the opening tag of the node. This will include the name, and all attributes.
   * @returns The opening tag of the node.
   */
  makeOpeningTag(): string {
    let nodeString = `[${this.name}`;
    if (this.value) {
      nodeString += `=${this.value}`;
    }

    Object.entries(this.attributes).forEach(([key, value]) => {
      nodeString += ` ${key}=${value}`;
    });
    nodeString += "]";
    return nodeString;
  }

  toString(): string {
    let nodeString = this.makeOpeningTag();
    nodeString += this.children.map((child) => child.toString()).join("");
    nodeString += `[/${this.name}]`;
    return nodeString;
  }

  protected nodeTreeHeading(): string {
    let nodeString = `Node [${this.name}]`;
    const allAttrs = [];
    if (this.value) {
      allAttrs.push(`${this.value}`);
    }

    if (Object.keys(this.attributes).length > 0) {
      nodeString += ` (${allAttrs
        .concat(
          Object.entries(this.attributes).map(
            ([key, value]) => `${key}=${value}`
          )
        )
        .join(", ")})`;
    }

    return nodeString;
  }
}

/**
 * A node that represents a chunk of text. This node is *not* a tag.
 */
export class TextNode extends BaseNode {
  /**
   * The text of the node.
   */
  text: string;

  readonly name = "TextNode";

  /**
   * Create a new TextNode.
   * @param {string} text The text of the node.
   */
  constructor(text: string) {
    super();
    this.text = text;
  }

  clone(): TextNode {
    return new TextNode(this.text);
  }

  toString(): string {
    return this.text;
  }

  // eslint-disable-next-line class-methods-use-this
  protected nodeTreeHeading(): string {
    return `TextNode`;
  }

  protected nodeTreeChildren(indentWidth: number): string {
    return ` {\n${indentString(this.text, indentWidth, 1)}\n}`;
  }
}

/**
 * The root node that represents the head of the AST. It only stores children.
 */
export class RootNode extends ChildrenHolderNode {
  name = "RootNode";

  children: BaseNode[];

  /**
   * Create a new RootNode.
   * @param {BaseNode[]} children The children of the node.
   */
  constructor(children: BaseNode[] = []) {
    super();
    this.children = children;
  }

  addChild(child: BaseNode): void {
    if (child instanceof TextNode) {
      const previousChild = this.children[this.children.length - 1];
      if (previousChild instanceof TextNode) {
        // We flatten the text nodes.
        previousChild.text += child.text;
        return;
      }
    }

    this.children.push(child.clone());
  }

  clone(): RootNode {
    return new RootNode(this.children.map((child) => child.clone()));
  }

  /**
   * The textual representation of the BBCode AST. It should return a string equivalent to the input to {@link Parser.parse}.
   */
  toString(): string {
    return this.children.map((child) => child.toString()).join("");
  }

  // eslint-disable-next-line class-methods-use-this
  protected nodeTreeHeading(): string {
    return `RootNode`;
  }
}

/**
 * A node that represents a list item. It is similar to the root node.
 */
export class ListItemNode extends RootNode {
  name = "*";

  toString(): string {
    return `[*]${super.toString()}`;
  }

  clone(): ListItemNode {
    return new ListItemNode(this.children.map((child) => child.clone()));
  }

  // eslint-disable-next-line class-methods-use-this
  protected nodeTreeHeading(): string {
    return `ListItemNode`;
  }
}
