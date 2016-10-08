var library = require("nrtv-library")(require)

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
    "./module"
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

    var programName = loadedExpression.name || "unnamed"


    Module.prepareBridge(bridge)

    bridge.asap(
      bridge.defineFunction(
        [bridgeModule(library, "./module", bridge)],
        function(Module, program, name) {
          var mod = new Module(program, name)

          mod.run()

          program.onchanged(module.run)

          program.onnewexpression(module.updateDependencies)
        }
      ).withArgs(program.binding, programName)
    )

    var head = element("head", [
      element("script", {src: "/dependencies/tap-out.js"}),
      element("script", {src: "/dependencies/element.js"}),
      element("script", {src: "/dependencies/function-call.js"}),
      element("script", {src: "/dependencies/add-html.js"}),
      element("script", {src: "/dependencies/menu.js"})
    ])


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
      "/dependencies/:name.js",
      function(request, response) {
        var name = request.params.name
        if (name.match(/[^a-z-]/)) {
          throw new Error("Dependencies can only have lowercase letters and dash. You asked for "+name)
        }
        response.sendFile(__dirname+"/build/"+name+".js")
      }
    )

    server.start(4050)
  }
)
