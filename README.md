# bbcode-ast

Generates an Abstract Syntax Tree (AST) from a chunk of BBCode.

Read full and updated documentation: https://pythoncoderas.github.io/bbcode-ast/

## Installation

### Node.js

```bash
npm install --save bbcode-ast
```

### Browser

Load the library from https://cdn.jsdelivr.net/npm/bbcode-ast@1/dist/bundle.min.js.

This will add a `bbcode_ast` variable to the `window` global. The default parser can be accessed through `bbcode_ast.default`.

## Usage

You can either use the default parser or construct your own parser. Once you have a `Parser`, call the `parse` method on
it. The default parser can be imported.

It will return the root node of the AST.

You can navigate through the tree by accessing the `children` attribute of the root node and recursively inspecting
the `children` of child nodes.
