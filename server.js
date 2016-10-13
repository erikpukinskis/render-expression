var library = require("nrtv-library")(require)

library.using([
  "./bridge-to" // need this until we can unify this with browser-bridge or make it its own module or something.
], function() {})

library.using(
  [
    "nrtv-server",
    "browser-bridge",
    "bridge-module",
    "web-element",
    "./draw-expression",
    "./an-expression",
    "./choose-expression",
    "./load-sample-home-page",
    "./module",
  ],
  function(server, BrowserBridge, bridgeModule, element, drawExpression, anExpression, chooseExpression, sampleHomePage, Module) {


    var emptyProgram = anExpression({
      kind: "function literal",
      argumentNames: [],
      body: [
        anExpression.emptyExpression()
      ]
    })


    var bridge = new BrowserBridge()

    var chooseExpression = bridgeModule(library, "choose-expression", bridge)

    var loadedExpression = sampleHomePage

    var program = drawExpression(loadedExpression, bridge, chooseExpression)

    bridge.asap("var functionCall = library.get(\"function-call\")")


    ///////////////// ONE

    var functionCall = require("function-call")
    var chobe = bridgeModule(library, "./choose-expression", bridge).asBinding()

    var binding = eval(chobe.callable())
    var chobeOut = binding.withArgs(true).evalable()
    // should not bind to library


    ///////////////// TWO

    var addBinding = eval(program.bindings.addLine.asBinding().callable())
    var addOut = addBinding.withArgs(true).evalable()

    // should not bind to addLine

    /////////////////////
    var asB = program.binding.asBinding().callable()

    debugger

    bridge.asap(
      bridge.defineFunction([
        bridgeModule(library, "./scroll-to-select", bridge),
        bridgeModule(library, "./line-controls", bridge),
        bridgeModule(library, "./choose-expression", bridge).asBinding(),
        program.binding,
        program.binding.asBinding(),
        program.bindings.addKeyPair.asBinding(),
        program.bindings.addLine.asBinding()
      ], function showControlsOnScroll(scrollToSelect, lineControls, chooseExpression, program, programBinding, addKeyPair, addLine) {

        var controls = lineControls(
          program,
          {
            program: programBinding,
            chooseExpression: chooseExpression,
            addLine: addLine,
            addKeyPair: addKeyPair
          }
        )

        scrollToSelect({
          getIds: program.getIds,
          show: controls.show,
          hide: controls.hide
        })
      })
    )

    var programName = loadedExpression.name || "unnamed"

    Module.prepareBridge(bridge)

    bridge.asap(
      bridge.defineFunction(
        [bridgeModule(library, "./module", bridge)],
        function runProgramOnChange(Module, program, name) {
          var mod = new Module(program, name)

          var dependencies = program.rootExpression().argumentNames

          mod.loadDependencies(dependencies, function() {
            mod.run() 
          })

          program.onchanged(mod.run)

          program.onnewexpression(function(parent, line) {
            module.updateDependencies(parent, line, mod.run)
          })
        }
      ).withArgs(program.binding, programName)
    )

    var head = element("head")


    var body = element("body",
      element(".two-columns", [
        element(
          ".column",
          element(".output")
        ),
        element(".column", [
          element(".program-header"),
          element(".program", program.element)
        ])
      ])
    )

    var stylesheet = element("link", {
      rel: "stylesheet",
      href: "styles.css"
    })

    server.addRoute(
      "get",
      "/",
      bridge.sendPage(
        [head, body, stylesheet]
      )
    )

    server.addRoute(
      "get",
      "/styles.css",
      function(xxxx, response) {
        response.sendFile(__dirname+"/styles.css")
      }
    )

    server.addRoute(
      "get",
      "/library/:name.js",
      function(request, response) {
        var name = request.params.name

        if (name.match(/[^a-z-]/)) {
          throw new Error("Dependencies can only have lowercase letters and dash. You asked for "+name)
        }

        var bridge = new BrowserBridge()

        var source = bridgeModule.definitionWithDeps(library, name, bridge)

        response.setHeader('content-type', 'text/javascript')

        response.send(source)
      }
    )

    server.start(4050)
  }
)
