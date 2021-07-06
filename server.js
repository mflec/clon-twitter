const express = require('express');
const cookieparser = require('cookie-parser');
const session = require('express-session');
const morgan = require('morgan');
const { Sequelize, Model, DataTypes } = require('sequelize');
require('dotenv').config();


const { DB_USER, DB_PASS, DB_HOST, DB_PORT, DB_NAME } = process.env;
const sequelize = new Sequelize(`postgres://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}`);

const app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


class User extends Model {}

User.init({
  username: { type: DataTypes.STRING(50), primaryKey: true },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    get() {
      return this.getDataValue('name').toUpperCase()
    },
    set(value) {
      this.setDataValue('name', value.toLowerCase())
    }
  },
  mail: { type: DataTypes.STRING(100), unique: true, allowNull: false },
  password: {type: DataTypes.STRING, allowNull: false}
}, { sequelize, modelName: 'user' })

const Tweet = sequelize.define('tweet', {
  content: { type: DataTypes.TEXT }
})


User.hasMany(Tweet);
Tweet.belongsTo(User);

User.sync({ alter: true })
Tweet.sync({ alter: true })




// middleware's 
// -----------------------------------------------

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));

app.use(cookieparser());
app.use(express.static('views'));

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
  res.render('index');
});


app.get('/home', redirectLogin, (req, res) => {
  Tweet.findAll()
  .then(data=> {return res.render('home', {data: data})}) 
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
  const { username, password } = req.body;
  User.findOne({username: username})
  .then(user=> {
    if(user.password== password)
    {
    req.session.userId = user.username
    return res.redirect('/home')
  }
  return res.redirect('/login')
  })
    .catch(error=> {return res.redirect('/login')})
});


app.post('/register', redirectHome, (req, res) => {
  const { username, name, mail, password} = req.body;
  User.create({ username, name, mail, password })
    .then(data=> res.redirect('/'))
    .catch(error => {
      console.error(error)
      res.status(500).send('Upss 😥')
    })
});


app.post('/home', (req, res) => {
  const { content, username} = req.body;
  let tweetCreated;
  Tweet.create({ content }, { include: [User] })
    .then(tweet => {
      tweetCreated = tweet;
      return tweetCreated.setUser(username)
    })
    .then(() => {
      res.redirect('/')
    })
    .catch(error => {
      console.error(error)
      res.status(500).send('Upss 😥')
    })
})

// detele all tweets
//-----------------------------------------------------------------

app.get('/clear', (req, res) => {
  Tweet.destroy({where: {}})
    .then(() => res.redirect('/home'))
    .catch(error => {
      console.error(error)
      res.status(500).send('Upss 😥')
    })
})



//------------------------------------------------------------------

app.listen(3001, (err) => {
  if(err) {
   console.log(err);
 } else {
   console.log('Listening on localhost:' + 3001);
 }
});
