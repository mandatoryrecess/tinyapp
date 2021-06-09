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
app.get("/", function (req, res) {
  res.send("hello, world!");
});

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
//urls_new
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//LOGIN POST
app.post("/login", (req, res) => {
  let username = req.body.username
  console.log(username)
  res.cookie('username', username)
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
  const templateVars = { urls: urlDatabase, username: req.body.username };
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
  res.redirect(longURL);
});

//URLS SHOW
app.get("/urls/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  const shortURL = req.params.shortURL;
  const templateVars = { shortURL: shortURL, longURL: longURL };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  const randomString = Math.random().toString(36).substring(2, 8);
  return randomString;
}
