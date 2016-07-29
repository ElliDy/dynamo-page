var http = require('http');

var express = require('express');

var app = express();
var bodyParser = require("body-parser");
var jsonfile = require('jsonfile')

//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(require('morgan')('short'));

// ************************************
// This is the real meat of the example
// ************************************
(function() {

  // Step 1: Create & configure a webpack compiler
  var webpack = require('webpack');
  var webpackConfig = require(process.env.WEBPACK_CONFIG ? process.env.WEBPACK_CONFIG : './webpack.config');
  var compiler = webpack(webpackConfig);

  // Step 2: Attach the dev middleware to the compiler & the server
  app.use(require("webpack-dev-middleware")(compiler, {
    noInfo: true, publicPath: webpackConfig.output.publicPath
  }));

  // Step 3: Attach the hot middleware to the compiler & the server
  app.use(require("webpack-hot-middleware")(compiler, {
    log: console.log, path: '/__webpack_hmr', heartbeat: 10 * 1000
  }));
})();

 app.use(express.static(__dirname + '/src')); 

// Do anything you like with the rest of your express application.
app.get("/", function(req, res) {
  res.sendFile(__dirname + '/src/index.html');
});

app.post("/idea", function(req, res) {
  var file = './ideas.json'
  jsonfile.readFile(file, function(err, obj) {
      if(err!==null){
        res.status(500).send({ error: 'Something failed on reading file!' });
      }
      else{
        obj.ideas.push(req.body);
        jsonfile.writeFile(file, obj, function (err) {
          if(err!==null){
            res.status(500).send({ error: 'Something failed on writing to file!' });
          }
          else{
            res.json({data: req.body});
          }
        })
      }
  })
});

if (require.main === module) {
  var server = http.createServer(app);
  server.listen(process.env.PORT || 1616, function() {
    console.log("Listening on %j", server.address());
  });
}