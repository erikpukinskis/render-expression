**render-expression** takes an AST generated by [an-expression](https://www.npmjs.com/package/an-expression) and renders it as an interactive web application:

```javascript
var anExpression = require("an-expression")
var renderExpression = require("render-expression")
var BrowserBridge = require("browser-bridge")
var app = require("express")()

var tree = anExpression.tree()

javascriptToEzjs(buildAHouse.toString(), tree)

var bridge = new BrowserBridge()
var partial = bridge.partial()

renderExpression(partial, tree.rootId(), tree)

app.get("/", bridge.responseHandler())

// Sample function: 

function buildAHouse(issueBond, showSource, library, renderBond) {
  var foo = "bar"

  issueBond("floor panel")

  issueBond.addTasks([
    "cut studs to length",
    "cut track to length",
    "crimp",
    "add sheathing",
    "flipsulate",
    "add sheathing",
  ])

  issueBond.expense(buildPanel,
    "labor",
    "$100"
  )
  issueBond.expense(buildPanel,
    "steel studs",
    "$20"
  )
  issueBond.expense(buildPanel,
    "plywood",
    "$10"
  )

  return buildPanel
}
```

### Screenshot

![source code screenshot](/screenshot.gif)

### Internal documentation

```javascript
var el = expressionToElement(bridge, expressionId, tree)
```
