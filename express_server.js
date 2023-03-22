const express = require('express');
const app = express();
const PORT = 8080; //default port 8080
const cookieParser = require('cookie-parser')
const morgan = require('morgan');

function generateRandomString() {
  
}

const users = {
  '123': {
    id:'123',
    email:'a@a.com',
    password:'123'
  },  
  '456': {
    id:'456',
    email:'b@b.com',
    password:'123'
  },
}

app.set("view engine", "ejs");

const urlDatabase = {
  'b2xVn2': "http://www.lighthouselabs.ca",
  '9sm5xK': "http://www.google.com"
};

app.use(cookieParser()) // Parse Cookie populate req.cookies
app.use(express.urlencoded({ extended: true })); //Parse Body populate req.body
app.use(morgan('dev'))

app.get("/", (req, res) => {
  // res.send('Hello!');
  res.redirect('/urls');
});


app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  console.log(req.cookies);
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  console.log(req.cookies);
  const templateVars = { 
    id: req.params.id, 
    longURL:urlDatabase[req.params.id],
    username: req.cookies["username"]
   };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.longURL;
  res.redirect('/urls');
});

// app.post("/logout", (req, res) => {
//   res.cookie('username', "undefined", )
//   res.redirect('/urls');
// });

// app.post("/login", (req, res) => {
//   res.cookie('username', req.body.username, )
//   res.redirect('/urls');
// });


// GET /register
app.get('/register', (req, res) => {
  res.render('registration');
})

// GET /LOGIN
app.get('/login', (req, res) => {
  res.render('login');
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
  res.cookie('userId', foundUser.id);
  res.redirect('/protected');
})

//GET /PROTECTED
app.get('/protected', (req, res) => {
  //check if the user is logged in 
  const userId = req.cookies.userId;
  const user = users[userId];

  if (!userId) {
    return res.status(401).send('You must log in to see this page!');
  }

  const templateVars = {
    user: user,
  }

  console.log(user);
  //Happy Path is render the protected template
  res.render('protected', templateVars);
})

//POST /logout
app.post('/logout', (req, res) => {
  //Clear the cookie
  res.clearCookie('userId');

  //redirect the user
  res.redirect('/login');
})


app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls');
});


// app.get('/hello', (req, res) =>{
//   res.send('<html><body>Hello <b>World</b></body></html>\n');
// });

app.get("/u/:id", (req, res) => {
  // console.log(req);
  res.redirect(urlDatabase[req.params.id]);
});



// app.get("/hello", (req, res) => {
//   const templateVars = { greeting: "Hello World!" };
//   res.render("hello_world", templateVars);
// });

// app.post("/urls", (req, res) => {
//   console.log(req.body); // Log the POST request body to the console
//   res.send("Ok"); // Respond with 'Ok' (we will replace this)
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
