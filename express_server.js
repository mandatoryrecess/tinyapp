const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
var morgan = require("morgan");
var cookieSession = require("cookie-session");

//middleware
app.use(morgan("dev"));
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
  })
);



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

////////////////POST 

app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  console.log("email", email)
  const user = findUserByEmail(email, userDatabase);
  console.log('user', user)

  // if (!user) {
  //   return res.status(403).send("wrong credentials!");
  // }
  // if (!bcrypt.compareSync(password, user.password)) {
  //   return res.status(403).send("wrong password");
  // }
  
  req.session["id"] = user.id;
  
  res.redirect(`/urls`)
})

app.post("/urls/:shortURL", (req, res) => {
  const longURL = req.body.longURL; 
  const shortURL = req.params.shortURL; 
  urlDatabase[shortURL] = `http://${longURL}`; 
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls", (req, res) => {
  let user = {}; 
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  user["userID"] = req.session["id"];
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect(`/urls`);
});

app.post("/register", (req, res) => {
  let email = req.body.email;
  const password = req.body.password;
  let id = generateRandomString();

  if (findUserByEmail(email)) {
    res.status(401).send("We have found your email in the database");
  } else if (emptyFormRejection(email, password) === false) {
     res.status(401).send("wrong credentials!");
  }

  userDatabase[id] = { id, email, password};
  req.session["id"] = id;
  res.redirect(`/urls/`);
});

app.post("/logout", (req, res) => {
  let id = req.session["email"];
  req.session = null;
  res.redirect(`/register`);
});

//////////////////GET 
app.get("/", function (req, res) {
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const userID = req.session["id"];
  console.log(userID)
  const username = req.body.username
  const user = userDatabase[userID];
  const templateVars = { urls: urlDatabase, userDatabase, username, user };
  res.render("urls_index", templateVars);
});


app.get("/register", (req, res) => {
  const userId = req.session["id"];
  const user = userDatabase[userId];
  console.log(userDatabase)
  const templateVars = { urls: urlDatabase, user };
  res.render("urls_register", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.session["id"];
  const user = userDatabase[userId];
  const templateVars = { urls: urlDatabase, user };
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL]
  res.redirect(`http://${longURL}`);
});

app.get("/urls/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  const shortURL = req.params.shortURL;
  const userID = req.session["id"];
  const user = userDatabase[userID];
  const templateVars = { urls: urlDatabase, userDatabase, shortURL, longURL, user };
  res.render("urls_show", templateVars);
});

app.get("/login", (req, res) => {
  const userId = req.session["id"];
  const templateVars = { urls: urlDatabase, user: {} };
  res.render("login", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

///////////FUNCTIONS///// 

function generateRandomString() {
  const randomString = Math.random().toString(36).substring(2, 8);
  return randomString;
}

const emptyFormRejection = (email, password) => {
  if (!email || !password) {
    return false;
  }
};

const findUserByEmail = function (email, userDatabase) {
  for (let userID in userDatabase) {
    const user = userDatabase[userID];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};
