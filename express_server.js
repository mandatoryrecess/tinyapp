const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
var morgan = require("morgan");
var cookieParser = require('cookie-parser')

//middleware
app.use(cookieParser())
app.use(morgan("dev"));




//URL database
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

//USER database
const userDatabase = {
  "7474": {
    id: "7474",
    email: "1@1.com",
    password: "1"
  }, 

  "1234": {
    id: "1234", 
    email: "2@2.com", 
    password: "2"
  }
}

////////
app.get("/", function (req, res) {
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//REGISTER
app.post("/register", (req, res) => {
  let email = req.body.email;
  const password = req.body.password;
  let userid = generateRandomString();
  res.cookie('userid', userid)
  userDatabase[userid] = { userid, email, password };
  const templateVars = { urls: urlDatabase, userDatabase };
  console.log(templateVars)
  res.redirect(`/urls/`);
});

app.get("/register", (req, res) => {
  
  
  const templateVars = { urls: urlDatabase, userDatabase };
  res.render("urls_register", templateVars);
});


//urls_new
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//LOGIN POST
app.post("/login", (req, res) => {
  let username = req.body.username
  console.log(username)
  
  res.redirect(`/urls`)
})


///EDIT 
app.post("/urls/:shortURL", (req, res) => {
  const longURL = req.body.longURL; 
  const shortURL = req.params.shortURL; 
  urlDatabase[shortURL] = `http://${longURL}`; 
  res.redirect(`/urls/${shortURL}`);
});

//URLS INDEX
app.get("/urls", (req, res) => {
  const username = req.body.username
  const templateVars = { urls: urlDatabase, userDatabase, username };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

///delete URLs
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect(`/urls`);
});

//u/:shortURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[req.params.shortURL];
  const templateVars = { urls: urlDatabase, userDatabase, username, shortURL, longURL };

  res.redirect(longURL, templateVars);
});

//URLS SHOW
app.get("/urls/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  const shortURL = req.params.shortURL;
  const templateVars = { urls: urlDatabase, userDatabase, shortURL, longURL };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  const randomString = Math.random().toString(36).substring(2, 8);
  return randomString;
}
