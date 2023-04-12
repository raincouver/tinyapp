const express = require('express');
const app = express();
const PORT = 8080; //default port 8080
const morgan = require('morgan');
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');
const helper = require('./helper.js');

////////////////////////////////////////////////////////
//Database /////////////////////////////////////////////
////////////////////////////////////////////////////////
const users = {
  'example': {
    id:'example',
    email:'a@a.com',
    password:'$2a$10$ehrVXtecxFvxutH6BxjwremOoQhCB1Yxun/p3QL7eVZXZxS1T0Xka'
    //bcrypt.hashSync('123', 10)
  },
  '00002': {
    id:'00002',
    email:'b@b.com',
    password:'$2a$10$CXYzHBtiUxQzgsYqKc4Xpecr7uhFkRwvSKmqnVM3ItP35VBgo.6am'
  },
  'aJ48lW':{
    id:'aJ48lW',
    email:'c@c.com',
    password:'$2a$10$Uj.gSkTx5U8NPlxMC/k/u.GO0EDHQjovo9r038Kz0yUdyQjJIJTpK'
  }

};

const urlDatabase = {
  'b2xVn2': {
    longURL : "http://www.lighthouselabs.ca",
    id : 'example'
  },
  '9sm5xK':{
    longURL : "http://www.google.com",
    id : 'example'
  },
  'b6UTxQ': {
    longURL: "https://www.tsn.ca",
    id : "aJ48lW"
  },

};

////////////////////////////////////////////////////////
//Apps Use /////////////////////////////////////////////
////////////////////////////////////////////////////////
app.set("view engine", "ejs");
// app.use(cookieParser()) // Parse Cookie populate req.cookies
app.use(express.urlencoded({ extended: true })); //Parse Body populate req.body
app.use(morgan('dev'));
app.use(cookieSession({
  name: 'session',
  keys: ['/* secret keys */'],

  // Cookie Options
  maxAge: 10 * 60 * 1000 // 10 min
}));

////////////////////////////////////////////////////////
//Routes: GET //////////////////////////////////////////
////////////////////////////////////////////////////////

//landing page redirect to /urls
app.get("/", (req, res) => {
  // res.send('Hello!');
  res.redirect('/login');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {

  // let userSessionID = req.cookies["userSessionID"];
  let userSessionID = req.session.userSessionID;
  //If the user is not logged in, display a message or prompt suggesting that they log in or register first.
  if (!users[userSessionID]) {
    return res.status(400).send("<img src='https://http.cat/400'><h1>You must have an account to use our amazing feature! <br> Sign up now if you don't have an account with us yet. Log in if you do!</h1>");
  }

  const templateVars = {
    urls: helper.urlsForUser(userSessionID, urlDatabase),
    user: users[userSessionID]
  };

  // console.log(filterUrlsToShow(userSessionID));

  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {

  // let userSessionID = req.cookies["userSessionID"];
  let userSessionID = req.session.userSessionID;

  //If the user is not logged in, redirect GET /urls/new to GET /login
  if (!users[userSessionID]) {
    return res.redirect('/login');
  }

  const templateVars = {
    user: users[userSessionID]
  };

  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {

  let userSessionID = req.session.userSessionID;

  if (!helper.getPageByShortUrl(req.params.id, urlDatabase)) {
    return res.status(404).send("<img src='https://http.cat/404'><h1>Not Found.</h1>");
  }

  if (!(req.session.userSessionID === urlDatabase[req.params.id].id)) {
    return res.status(401).send("<img src='https://http.cat/401'><h1>Unauthorized.</h1>");
  }

  const templateVars = {
    id: req.params.id,
    longURL:urlDatabase[req.params.id].longURL,
    user: users[userSessionID]
  };

  console.log(templateVars);

  res.render("urls_show", templateVars);
});

// GET /Register
app.get('/register', (req, res) => {
  
  // let userSessionID = req.cookies["userSessionID"];
  let userSessionID = req.session.userSessionID;
  
  //If the user is not logged in, POST /urls should respond with an HTML message that tells the user why they cannot shorten URLs.
  if (users[userSessionID]) {
    return res.redirect('/urls');
  }

  res.render('registration');
});

// GET /LOGIN
app.get('/login', (req, res) => {

  // let userSessionID = req.cookies["userSessionID"];
  let userSessionID = req.session.userSessionID;
  
  //If the user is not logged in, POST /urls should respond with an HTML message that tells the user why they cannot shorten URLs.
  if (users[userSessionID]) {
    return res.redirect('/urls');
  }

  res.render('login');
});

app.get("/u/:id", (req, res) => {
  // console.log(req);
  res.redirect(urlDatabase[req.params.id].longURL);
});

////////////////////////////////////////////////////////
//Routes: POST /////////////////////////////////////////
////////////////////////////////////////////////////////

app.post("/urls", (req, res) => {

  let userSessionID = req.session.userSessionID;
  
  //If the user is not logged in, POST /urls should respond with an HTML message that tells the user why they cannot shorten URLs.
  if (!users[userSessionID]) {
    return res.status(400).send("<img src='https://http.cat/400'><h1>Log in is required to use this feature!</h1>");
  }

  let shortURL = helper.generateRandomString(6);

  urlDatabase[shortURL] = {
    'longURL' : req.body.longURL,
    'id' : userSessionID
  };

  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id", (req, res) => {

  // let userSessionID = req.cookies["userSessionID"];
  let userSessionID = req.session.userSessionID;

    if (!helper.getPageByShortUrl(req.params.id, urlDatabase)) {
    return res.status(404).send("<img src='https://http.cat/404'><h1>Not Found.</h1>");
  }

  //If the user is not logged in, POST /urls should respond with an HTML message that tells the user why they cannot shorten URLs.
  if (!users[userSessionID]) {
    return res.status(400).send("<img src='https://http.cat/400'><h1>Log in is required to use this feature!</h1>");
  }

  if (!(req.session.userSessionID === urlDatabase[req.params.id].id)) {
    return res.status(401).send("<img src='https://http.cat/401'><h1>Unauthorized.</h1>");
  }

  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect('/urls');
});

// POST /Register
app.post('/register', (req, res) => {
  console.log(req.body);
  const email = req.body.email;
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);

  //Check if email and password were not provided
  if (!email) {
    return res.status(400).send("<img src='https://http.cat/400'><h1>Please provide an email address to continue!</h1>");
  }
  if (!req.body.password) {
    return res.status(400).send("<img src='https://http.cat/400'><h1>Please provide a password to continue!</h1>");
  }

  //Check if email is already registered
  if (helper.getUserByEmail(email, users)) {
    return res.status(400).send("<img src='https://http.cat/400'><h1>Looks like you have already registered with us, log in with your password!</h1>");
  }
  
  //Assign new user with new id
  // let newUserId = String(Object.keys(users).length + 1).padStart(5, '0');
  let newUserId = helper.generateRandomString(6);

  //Check if the newly generated ID is already existed
  for (const userId in users) {
    if (newUserId === userId) {
      //generate a new one and check again
      newUserId = newUserId + email;
    }
  }

  users[newUserId] = {
    id:newUserId,
    email:email,
    password:hashedPassword
  };
  
  //The enetered credentials are correct
  //Set a cookie and then redirect the user
  req.session.userSessionID = newUserId;
  // res.cookie('userSessionID', newUserId);
  res.redirect('/urls');
});

// POST /LOGIN
app.post('/login', (req, res) => {
  console.log(req.body);
  const email = req.body.email;
  const password = req.body.password;

  //Check if email and password were not provided
  if (!email || !password) {
    return res.status(400).send("<img src='https://http.cat/400'><h1>Please provide email and password!</h1>");
  }

  //Look up the user based on their email address
  let foundUser = helper.getUserByEmail(email, users);
  // for (const userId in users) {
  //   const user = users[userId];
  //   if (user.email === email) {
  //     foundUser = user;
  //   }
  // }

  console.log(foundUser);
  // did we Not find a user
  if (!foundUser) {
    return res.status(400).send("<img src='https://http.cat/400'><h1>No user with that email found!</h1>");
  }

  // do the passwords NOT match
  if (!bcrypt.compareSync(password,foundUser.password)) {
    return res.status(400).send("<img src='https://http.cat/400'><h1>Passwords do not match!</h1>");
  }

  //The enetered credentials are correct
  //Set a cookie and then redirect the user
  
  req.session.userSessionID = foundUser.id;
  // res.cookie('userSessionID', foundUser.id);
  res.redirect('/');
});


//POST /logout
app.post('/logout', (req, res) => {

  req.session = null;

  //redirect the user
  res.redirect('/login');
});


app.post("/urls/:id/delete", (req, res) => {

  let userSessionID = req.session.userSessionID;
  // let userSessionID = req.cookies["userSessionID"];
  
  //If the user is not logged in, POST /urls should respond with an HTML message that tells the user why they cannot shorten URLs.
  if (!users[userSessionID]) {
    return res.status(400).send("<img src='https://http.cat/400'><h1>Log in is required to use this feature!</h1>");
  }

  if (!(req.session.userSessionID === urlDatabase[req.params.id].id)) {
    return res.status(401).send("<img src='https://http.cat/401'><h1>Unauthorized.</h1>");
  }

  if (!helper.getPageByShortUrl(req.params.id, urlDatabase)) {
    return res.status(404).send("<img src='https://http.cat/404'><h1>Not Found.</h1>");
  }

  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls');
});

////////////////////////////////////////////////////////
//Routes: LISTEN ///////////////////////////////////////
////////////////////////////////////////////////////////

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
