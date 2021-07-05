const express = require('express');
const cookieparser = require('cookie-parser');
const session = require('express-session');
const morgan = require('morgan');
const {users, tweets, registerUser, verifyUser , addTweet} = require('./app')

const app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


// middleware's 
// -----------------------------------------------

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));

app.use(cookieparser());

app.use(session(
  {
    name: 'sid',
    secret:'secret', 
    resave:false,
    saveUninitialized:false,
    cookie:{
      maxAge: 1000 * 60 * 60 * 2 
    }
  }
));

app.use((req, res, next) => {
  console.log(req.session);
  next();
});

app.use(express.static('views'))

const redirectLogin = (req, res, next) => {
  if(!req.session.userId) {
    res.redirect('/login');
  } else {
    next();
  }
}

const redirectHome = (req, res, next) => {
  if(req.session.userId) {
    res.redirect('/home');
  } else {
    next();
  }
}


//  GET's
// ------------------------------------------------------------------------------

app.get('/', (req, res) => {
  const { userId } = req.session;
  if(userId) return res.redirect('/home');
  res.render('in');
});

app.get('/home', redirectLogin, (req, res) => {
  const user = users.find(user => user.id === req.session.userId); 
  res.render('home', {tweets: tweets, user: user.name})
});

app.get('/login', redirectHome,  (req, res) => {
  res.render('login')
});


app.get('/register', redirectHome, (req, res) => {
  res.render('register', {exist: false})
});

app.get('/logout', redirectLogin, (req, res) => {
  req.session.destroy(err => {
    if(err) {
      return res.redirect('/home');
    }
    res.clearCookie('sid');
    res.redirect('/');
  })
});

// POST's
// ------------------------------------------------------------------------------


app.post('/login', redirectHome, (req, res) => {
  const user= verifyUser(req.body)
  if(user) {
      req.session.userId = user.id;
      return res.redirect('/home')
   }
 return res.redirect('/login');
});


app.post('/register', redirectHome, (req, res) => {
  if(registerUser(req.body)) return res.redirect('/');
  return res.redirect('/register', {exist: true});  
});

app.post('/home', redirectHome, (req,res)=> {
  addTweet(req.body.tweet)
  return res.redirect('/home');
})

app.listen(3000, (err) => {
  if(err) {
   console.log(err);
 } else {
   console.log('Listening on localhost:3000');
 }
});
