var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var Blog = require("./models/blog")

var app = express();

/* Database setup */
var admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://wics-workshop.firebaseio.com"
});

var db = admin.firestore();
var dbref = db.collection('blog');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/* ROUTES */

/* GET blogs list page. */
app.get('/', function(req, res) {
  var getDoc = dbref.get()
  .then(blogposts => {
    arr = [];
    blogposts.forEach(doc => {
      // console.log(doc.id, '=>', doc.data());
      arr.push(doc.data());
    });
    // console.log(arr);
    res.render("index", {blogposts: arr});
  })
  .catch(err => {
    console.log('Error getting documents', err);
  });
});

/* GET page to create new blog post. */
app.get('/create', function(req, res, next) {
  res.render('create');
});

/* POST route to create a new blog post */
app.post("/create", (req, res) => {
  // Corresponding with the 'name' attributes we set in our form in index.ejs
  let title = req.body.title;
  let content = req.body.content;

  dbref.doc(title).set({
    title: title, 
    content: content
  })
  .then(ref => {
    res.redirect("/");
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app
