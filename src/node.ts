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
   */
  abstract toString(): string;

  /**
   * Gets the textual representation of the node as BBCode.
   * An alias for {@link BaseNode.toString}.
   */
  toBBCode(): string {
    return this.toString();
  }
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

/**
 * A BBCode node. This represents a tag and it's children.
 */
export class Node extends BaseNode implements ChildrenHolder, AttributeHolder {
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
   * The children of the tag.
   *
   * Ref: {@link ChildrenHolder.children}
   */
  public children: BaseNode[] = [];

  /**
   * Stores the [simple parameterized value](https://www.bbcode.org/reference.php) of the tag.
   *
   * @example `[b=red]Hello World![/b]` -> `red`
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

  /**
   * Sets the value of the node.
   *
   * @param {string} value The value of the node.
   * @deprecated Use {@link Node.value} instead.
   */
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
    this.children.forEach((child) => {
      nodeString += child.toString();
    });
    nodeString += `[/${this.name}]`;
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
}

/**
 * The root node that represents the head of the AST. It only stores children.
 */
export class RootNode extends BaseNode implements ChildrenHolder {
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
}
