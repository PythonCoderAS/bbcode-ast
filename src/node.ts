export interface NodeConstructorParams {
  name: string;
  attributes?: { [key: string]: string };
  value?: string;
}

export abstract class BaseNode {
  abstract name: string;

  abstract clone(): BaseNode;
  abstract toString(): string;
}

export interface ChildrenHolder {
  children: BaseNode[];

  addChild(child: BaseNode): void;
}

export interface AttributeHolder {
  attributes: { [key: string]: string };

  setAttribute(key: string, value: string): void;
}

export class Node extends BaseNode implements ChildrenHolder, AttributeHolder {
  name: string;
  attributes: { [key: string]: string };
  children: BaseNode[] = [];
  // For simple parameterized values, like [x=y]...[/x]
  value?: string;

  constructor(params: NodeConstructorParams) {
    super();
    this.name = params.name;
    this.attributes = params.attributes || {};
  }

  clone(): Node {
    const node = new Node({name: this.name, attributes: this.attributes, value: this.value});
    node.children = this.children.map(child => child.clone());
    return node;
  }

  addChild(child: BaseNode): void {
    if (child instanceof TextNode){
      const previousChild = this.children[this.children.length - 1];
      if (previousChild instanceof TextNode){
        // We flatten the text nodes.
        previousChild.text += child.text;
        return;
      }
    }
    this.children.push(child.clone());
  }

  setValue(value: string): void {
    this.value = value;
  }

  setAttribute(key: string, value: string): void {
    this.attributes[key] = value;
  }


  toString(): string {
    let nodeString = `[${this.name}`;
    if (this.value){
      nodeString += `=${this.value}`;
    }
    Object.entries(this.attributes).forEach(([key, value]) => {
      nodeString += ` ${key}="${value}"`;
    });
    nodeString += ']';
    this.children.forEach(child => {
      nodeString += child.toString();
    });
    nodeString += `[/${this.name}]`;
    return nodeString;
  }
}

export class TextNode extends BaseNode {
  text: string;
  name: string = 'TextNode';

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

export class RootNode extends BaseNode implements ChildrenHolder {
  name = "RootNode";
  children: BaseNode[];

  constructor(children: BaseNode[] = []) {
    super();
    this.children = children;
  }

  addChild(child: BaseNode): void {
    if (child instanceof TextNode){
      const previousChild = this.children[this.children.length - 1];
      if (previousChild instanceof TextNode){
        // We flatten the text nodes.
        previousChild.text += child.text;
        return;
      }
    }
    this.children.push(child.clone());
  }

  clone(): RootNode {
    return new RootNode(this.children.map(child => child.clone()));
  }

  toString(): string {
    return this.children.map(child => child.toString()).join('');
  }
}

export class ListItemNode extends RootNode {
  name = "ListItemNode";

  toString(): string {
    return "[*]" + super.toString();
  }
}
