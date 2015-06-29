(function() {
  var app, express, redisStore;

  express = require('express');
  var session = require('express-session');
  redisStore = require('connect-redis')(session);

  app = express();

  app.configure(function() {
    this.use(express.cookieParser());
    return this.use(express.session({
      secret: "@#$TYHBVGHJIY^TWEYKJHNBGFDWGHJKUYTWE#$%^&*&^%$#",
      store: new redisStore()
    }));
  });

  app.get("/", function(req, res) {
    console.info(req.session.item);
    req.session.item = 'Hello World';
    return res.send('Hello World');
  });

  app.listen(3000, function() {
    return console.info("Express server listening on port " + (this.address().port) + " in " + process.env.NODE_ENV + " mode");
  });

}).call(this);