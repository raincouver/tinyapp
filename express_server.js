const express = require('express');
const app = express();
const PORT = 8080; //default port 8080
const cookieParser = require('cookie-parser')
const morgan = require('morgan');

////////////////////////////////////////////////////////
//Function /////////////////////////////////////////////
////////////////////////////////////////////////////////
function generateRandomString(length) {
  const charRange ="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  let num = 0;
  while (num < length) {
    result += charRange .charAt(Math.floor(Math.random() * charRange.length));
    num += 1;
  }
  return result;
};

function getUserByEmail(email) {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return true;
    }
  }
};

function getPageByShortUrl(shortUrl) {
  for (const url in urlDatabase) {
    if (url === shortUrl) {
      return true;
    }
  }
};

function ifShortUrlAccessible(shortUrl) {
  for (const userId in users) {
    if (userId === urlDatabase[shortUrl].id) {
      return true;
    }
  }
};

function urlsForUser(id) {
  const result = {};

  for (urlId in urlDatabase){
    let value = urlDatabase[urlId];
    if (value.id === id){
      result[`${urlId}`] = value.longURL;
    }
  }
  return result;
}

////////////////////////////////////////////////////////
//Database /////////////////////////////////////////////
////////////////////////////////////////////////////////
const users = {
  'example': {
    id:'example',
    email:'a@a.com',
    password:'123'
  },  
  '00002': {
    id:'00002',
    email:'b@b.com',
    password:'123'
  },
  'aJ48lW':{
    id:'aJ48lW',
    email:'c@c.com',
    password:'123'
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
app.use(cookieParser()) // Parse Cookie populate req.cookies
app.use(express.urlencoded({ extended: true })); //Parse Body populate req.body
app.use(morgan('dev'))


////////////////////////////////////////////////////////
//Routes: GET //////////////////////////////////////////
////////////////////////////////////////////////////////

//landing page redirect to /urls
app.get("/", (req, res) => {
  // res.send('Hello!');
  res.redirect('/urls');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {

  let user_id = req.cookies["user_id"];

  //If the user is not logged in, display a message or prompt suggesting that they log in or register first.
  if (!users[user_id]) {
    return res.status(400).send("You must have an account to use our amazing feature! Sign up now if you don't have an account with use yet. Log in if you do!");
  }

  const templateVars = { 
    urls: urlsForUser(user_id),
    user: users[user_id]
  };

  // console.log(filterUrlsToShow(user_id));

  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {

  let user_id = req.cookies["user_id"];

  //If the user is not logged in, redirect GET /urls/new to GET /login
  if (!users[user_id]) {
    return res.redirect('/login');
  }

  const templateVars = { 
    user: users[user_id]
  };

  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {

  if(!ifShortUrlAccessible(req.params.id)) {
    return res.status(401).send("Unauthorized.");
  }

  if(!getPageByShortUrl(req.params.id)) {
    return res.status(404).send("Not Found.");
  }

  let user_id = req.cookies["user_id"];

  const templateVars = { 
    id: req.params.id, 
    longURL:urlDatabase[req.params.id].longURL,
    user: users[user_id]
   };

  console.log(templateVars);

  res.render("urls_show", templateVars);
});

// GET /Register
app.get('/register', (req, res) => {
  
  let user_id = req.cookies["user_id"];
  
  //If the user is not logged in, POST /urls should respond with an HTML message that tells the user why they cannot shorten URLs.
  if (users[user_id]) {
    return res.redirect('/urls');
  }

  res.render('registration');
})

// GET /LOGIN
app.get('/login', (req, res) => {

  let user_id = req.cookies["user_id"];
  
  //If the user is not logged in, POST /urls should respond with an HTML message that tells the user why they cannot shorten URLs.
  if (users[user_id]) {
    return res.redirect('/urls');
  }

  res.render('login');
})

app.get("/u/:id", (req, res) => {
  // console.log(req);
  res.redirect(urlDatabase[req.params.id].longURL);
});

////////////////////////////////////////////////////////
//Routes: POST /////////////////////////////////////////
////////////////////////////////////////////////////////

app.post("/urls", (req, res) => {

  let user_id = req.cookies["user_id"];
  
  //If the user is not logged in, POST /urls should respond with an HTML message that tells the user why they cannot shorten URLs.
  if (!users[user_id]) {
    return res.status(400).send('Log in is required to use this feature!');
  }

  let shortURL = generateRandomString(6);

  urlDatabase[shortURL] = {
    'longURL' : req.body.longURL,
    'id' : user_id
  };

  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id", (req, res) => {

  let user_id = req.cookies["user_id"];
  
  //If the user is not logged in, POST /urls should respond with an HTML message that tells the user why they cannot shorten URLs.
  if (!users[user_id]) {
    return res.status(400).send('Log in is required to use this feature!');
  }

  if(!ifShortUrlAccessible(req.params.id)) {
    return res.status(401).send("Unauthorized.");
  }

  if(!getPageByShortUrl(req.params.id)) {
    return res.status(404).send("Not Found.");
  }

  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect('/urls');
});

// POST /Register
app.post('/register', (req, res) => {
  console.log(req.body)
  const email = req.body.email;
  const password = req.body.password;

  //Check if email and password were not provided
  if (!email) {
    return res.status(400).send('Please provide an email address to continue!');
  }
  if (!password) {
    return res.status(400).send('Please provide a password to continue!');
  }

  //Check if email is already registered
  if (getUserByEmail(email)) {
    return res.status(400).send('Looks like you have already registered with us, log in with your password!');
  }
  
  //Assign new user with new id
  // let newUserId = String(Object.keys(users).length + 1).padStart(5, '0'); 
  let newUserId = generateRandomString(6);

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
    password:password
  };
  
  //The enetered credentials are correct
  //Set a cookie and then redirect the user
  res.cookie('user_id', newUserId);
  res.redirect('/urls');
})

// POST /LOGIN
app.post('/login', (req, res) => {
  console.log(req.body)
  const email = req.body.email;
  const password = req.body.password;

  //Check if email and password were not provided
  if (!email || !password) {
    return res.status(400).send('Please provide email and password!');
  }

  //Look up the user based on their email address
  let foundUser = null;
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      foundUser = user;
    }
  }

  console.log(foundUser)
  // did we Not find a user
  if (!foundUser) {
    return res.status(400).send('No user with that email found!');
  }

  // do the passwords NOT match
  if (foundUser.password !== password) {
    return res.status(400).send('Passwords do not match!');
  }

  //The enetered credentials are correct
  //Set a cookie and then redirect the user
  res.cookie('user_id', foundUser.id);
  res.redirect('/');
})

// //GET /PROTECTED
// app.get('/protected', (req, res) => {
//   //check if the user is logged in 
//   const userId = req.cookies.userId;
//   const user = users[userId];

//   if (!userId) {
//     return res.status(401).send('You must log in to see this page!');
//   }

//   const templateVars = {
//     user: user,
//   }

//   console.log(user);
//   //Happy Path is render the protected template
//   res.render('protected', templateVars);
// })

//POST /logout
app.post('/logout', (req, res) => {
  //Clear the cookie
  res.clearCookie('user_id');

  //redirect the user
  res.redirect('/login');
})


app.post("/urls/:id/delete", (req, res) => {

  let user_id = req.cookies["user_id"];
  
  //If the user is not logged in, POST /urls should respond with an HTML message that tells the user why they cannot shorten URLs.
  if (!users[user_id]) {
    return res.status(400).send('Log in is required to use this feature!');
  }

  if(!ifShortUrlAccessible(req.params.id)) {
    return res.status(401).send("Unauthorized.");
  }

  if(!getPageByShortUrl(req.params.id)) {
    return res.status(404).send("Not Found.");
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
