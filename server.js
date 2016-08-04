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

app.post("/tweets", function(req, res){
  console.log(req.body);
  var hashtags = req.body.hashtags.split(',');
  var query = "%23sgd1953" 
  for(var i=0, length=hashtags.length; i<length; i++){
    query = query + '%20OR%20%20%23' + hashtags[i];
  }
  getTweets(query, res)
});

app.get("/tweets", function(req, res){
  getTweets("%23sgd1953", res)
})

function getTweets(query, res){
  twitter.get("/search/tweets", {q: query, src: "typd", count: 100 }, function(error, tweets, response){
    if(error!==null){
      res.status(500).send({ error: 'Getting tweets failed!' });
    }
    else{
      var tweetImages = [];
      for (var i=0, tweetsLength=tweets.statuses.length; i<tweetsLength; i++){
          var tweet = tweets.statuses[i];
          if(tweet.entities.media!==undefined){
            for(var j=0, tweetMediaLength=tweet.entities.media.length; j<tweetMediaLength; j++){
              var tweetMedia = tweet.entities.media[j];
              if(tweetMedia.type==='photo'){
                tweetImages.push(tweetMedia.media_url);
              }
            }
          }
      }
      res.json({data: tweetImages, tweets: tweets});
    }
  }); 
}

if (require.main === module) {
  var server = http.createServer(app);
  server.listen(process.env.PORT || 1616, function() {
    console.log("Listening on %j", server.address());
  });

  //Step 4: Initialize Twitter API
  var Twitter = require('twitter');

  //Get this data from your twitter apps dashboard
  var config = {
      "consumer_key": "Zb5QMdkYk2v23gsYMaksj0QJ9",
      "consumer_secret": "JpogwFC1AXoxAYPmVho0yZaXYchTyR8e2dp3TiJT9EcbG7kyeM",
      "access_token_key": "141620722-ug05LFuFn5wUgUVlUe5WgYsNQWEZCRaFsAei2E6W",
      "access_token_secret": "Q6ZBXoIwm41dsZ3IzaTgPz0TWRAO1aE8khFPjk1QpPoPv"
  }

  var twitter = new Twitter(config);
}