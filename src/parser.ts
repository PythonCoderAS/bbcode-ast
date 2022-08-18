import {BaseNode, ChildrenHolder, ListItemNode, Node, RootNode, TextNode} from "./node";

export default class Parser {
  supportedTagNames: string[];
  caseSensitive: boolean;

  constructor(supportedTagNames: string[], caseSensitive?: boolean) {
    this.supportedTagNames = supportedTagNames;
    this.caseSensitive = caseSensitive ?? false;
    if (!this.caseSensitive) {
      this.supportedTagNames = this.supportedTagNames.map(tag => tag.toLowerCase());
    }
  }

  /**
   * Convert a chunk of BBCode to a {@link RootNode}.
   * @param text The chunk of BBCode to convert.
   * @returns The {@link RootNode} representing the BBCode.
   * @throws {Error} If the BBCode is not valid (missing a closing tag).
   */
  parse(text: string): RootNode {
    // Represents the node we will be returning.
    const rootNode = new RootNode();
    // Represents the current bbcode stack. This way, we can throw errors if we find an unexpected closing tag/unclosed tag.
    const currentStack: (BaseNode & ChildrenHolder)[] = [rootNode]
    // Represents the unparsed text that is remaining.
    let textLeft = text;
    // Represents the current text we are building.
    let currentText = "";
    // Represents whether we're building text or a tag.
    let buildingText = true;
    // Represents whether we're building the name of a tag or the value/attributes
    let buildingTagName = false;
    // Represents whether we're building the value of a tag or the attributes.
    let buildingValue = false;
    // Represents whether we're building the attribute's name or it's value.
    let buildingAttributeName = false;
    // Represents whether we're building the opening or closing tag.
    let buildingClosingTag = false;
    // Represents whether we're in a quote. In that case, ignore all spaces.
    let quoted = false;
    // Represents the name of the current tag we're building.
    let currentTagName = "";
    // Represents the value of the current tag we're building.
    let currentTagValue = "";
    // Represents the current attributes we're building for the tag.
    let currentTagAttributes: { [key: string]: string } = {};
    // Represents the name of the current attribute we're building.
    let currentTagAttributeName = "";
    // Represents the value of the current attribute we're building.
    let currentTagAttributeValue = "";
    while (textLeft){
      const nextCharacter = textLeft.substring(0, 1);
      textLeft = textLeft.substring(1);
      if (['"', "'"].includes(nextCharacter)) {
        quoted = !quoted;
      }
      if (buildingText) {
        if (nextCharacter === "[") {
          // We're building text and we found a "[".
          // We're now building a tag.
          buildingText = false;
          buildingTagName = true;
          currentTagName = "";
          if (currentText.length > 0) {
            // We've already built some text. Add it as a text node.
            const textNode = new TextNode(currentText);
            currentStack[currentStack.length - 1].addChild(textNode);
            currentText = "";
          }
        } else {
          // We're building text, and we found a character other than "[".
          // Add the character to the current text.
          currentText += nextCharacter;
        }
      } else {
        // We have to be building a tag or tag data.
        if (buildingTagName) {
          // We're building the tag's name.
          if (nextCharacter === "*" && !currentTagName) {
            // This is a list node closing tag.
            const lastStackElement = currentStack[currentStack.length - 1];
            if (lastStackElement instanceof ListItemNode) {
              // We finished the last list item.
              currentStack.pop();
              const previousStackElement = currentStack[currentStack.length - 1];
              previousStackElement.addChild(lastStackElement);
            }
          } else if (nextCharacter === "/" && !currentTagName) {
            buildingClosingTag = true;
          } else if ((["]", " ", "="].includes(nextCharacter))){
            // We found a character that signifies the end of the tag name.
              // First, we determine if it is a valid tag name.
              if (this.supportedTagNames.includes(this.caseSensitive ? currentTagName : currentTagName.toLowerCase())) {
                // The tag name is valid.
                if (nextCharacter === "]"){
                  if (currentTagName === "*"){
                    // This is a list node opening tag.
                    const listNode = new ListItemNode();
                    currentStack.push(listNode);
                    buildingText = true;
                    buildingTagName = false;
                    currentTagName = "";
                  } else if (buildingClosingTag){
                    // We're making the closing tag. Now that we've completed, we want to remove the last element from the stack and add it to the children of the element prior.
                    let lastElement = currentStack.pop()!;
                    if (currentTagName === "list"){
                      // List tag. If the last element is a list item, we need to add it to the previous element.
                      if (lastElement instanceof ListItemNode){
                        const previousElement = currentStack.pop()!;
                        previousElement.addChild(lastElement);
                        lastElement = previousElement;
                      }
                    }
                    if (lastElement.name !== currentTagName){
                      throw new Error(`Expected closing tag for '${currentTagName}', found '${lastElement.name}'.`);
                    } else {
                      currentStack[currentStack.length - 1].addChild(lastElement);
                      buildingText = true;
                      buildingClosingTag = false;
                      buildingTagName = false;
                      currentTagName = "";
                    }
                  } else {
                    // Simple tag, there are no attributes or values. We push a tag to the stack and continue.
                    const currentTag = new Node({name: currentTagName});
                    currentStack.push(currentTag);
                    buildingTagName = false;
                    buildingText = true;
                    currentTagName = "";
                  }
                } else if (nextCharacter === "="){
                  // We are building a tag with a simple value.
                  buildingTagName = false;
                  buildingValue = true;
                } else if (nextCharacter === " "){
                  // We are building a tag with attributes.
                  buildingTagName = false;
                  buildingValue = false;
                  buildingAttributeName = true;
                }
              } else {
              // We treat it as text.
              buildingText = true;
              buildingTagName = false;
              currentText += "[" + currentTagName;
            }
          } else {
            // We're still building the tag's name.
            currentTagName += nextCharacter;
          }
        } else if (buildingValue) {
          // We're building the tag's value.
          if (nextCharacter === "]"){
            // We found the end of the tag.
            buildingValue = false;
            const currentTag = new Node({name: currentTagName});
            currentTag.setValue(currentTagValue);
            currentStack.push(currentTag);
            buildingTagName = false;
            buildingText = true;
            currentTagName = "";
            currentTagValue = "";
          } else if (nextCharacter === " " && !quoted){
            // We found the end of the value and are now building attributes.
            buildingValue = false;
            buildingAttributeName = true;
          } else {
            // We're still building the tag's value.
            currentTagValue += nextCharacter;
          }
        } else if (buildingAttributeName){
          // We're building the attribute's name.
          if (nextCharacter === "="){
            // We finished the name, and now we're building the value.
            buildingAttributeName = false;
          } else {
            // We're still building the attribute's name.
            currentTagAttributeName += nextCharacter;
          }
        } else {
          // We're building the attribute's value.
          if (nextCharacter === "]"){
            // We found the end of the tag.
            buildingAttributeName = false;
            currentTagAttributes[currentTagAttributeName] = currentTagAttributeValue;
            const currentTag = new Node({name: currentTagName, attributes: currentTagAttributes});
            if (currentTagValue) {
              currentTag.setValue(currentTagValue);
            }
            currentStack.push(currentTag);
            buildingTagName = false;
            buildingText = true;
            currentTagName = "";
            currentTagValue = "";
            currentTagAttributes = {};
            currentTagAttributeName = "";
            currentTagAttributeValue = "";
          } else if (nextCharacter === " " && !quoted){
            // We found the end of the value and are now building another attribute.
            buildingAttributeName = true;
            currentTagAttributes[currentTagAttributeName] = currentTagAttributeValue;
            currentTagAttributeName = "";
            currentTagAttributeValue = "";
          } else {
            // We're still building the attribute's value.
            currentTagAttributeValue += nextCharacter;
          }
        }
      }
    }
    if (buildingText){
      if (currentText.length > 0){
        // We have leftover text. Add it as a text node.
        const textNode = new TextNode(currentText);
        currentStack[currentStack.length - 1].addChild(textNode);
      }
    } else {
      // We're building a tag, but it's invalid. We have to add it as text.
      if (buildingClosingTag){
        // We're building a closing tag, but it's invalid. Add it as text.
        const textNode = new TextNode("[/" + currentTagName);
        currentStack[currentStack.length - 1].addChild(textNode);
      } else {
        let tagText = "[" + currentTagName;
        if (currentTagValue) {
          tagText += "=" + currentTagValue;
        }
        if (Object.keys(currentTagAttributes).length !== 0) {
          Object.entries(currentTagAttributes).forEach(([key, value]) => {
            tagText += ` ${key}="${value}"`;
          });
        }
        if (buildingAttributeName){
          tagText += ` ${currentTagAttributeName}`;
        } else {
          if (currentTagAttributeName){
            tagText += ` ${currentTagAttributeName}=${currentTagAttributeValue}`;
          }
        }
        const textNode = new TextNode(tagText);
        currentStack[currentStack.length - 1].addChild(textNode);
      }
    }
    if (currentStack.length > 1){
      // We didn't close all tags.
      throw new Error(`Expected all tags to be closed. Found ${currentStack.length - 1} unclosed tags, most recently unclosed tag is "${currentStack[currentStack.length - 1].name}".`);
    }
    return rootNode;
  }
}
