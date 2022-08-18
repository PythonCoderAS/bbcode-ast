# bbcode-ast

Generates an Abstract Syntax Tree (AST) from a chunk of BBCode.

## Installation

```bash
npm install --save bbcode-ast
```

## Usage

You can either use the default parser or construct your own parser. Once you have a `Parser`, call the `parse` method on
it.

It will return the root node of the AST.

You can navigate through the tree by accessing the `children` attribute of the root node and recursively inspecting
the `children` of child nodes.
