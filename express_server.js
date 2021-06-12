const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");


//middleware
app.use(morgan("dev"));
app.use(
  cookieSession({
    name: "Cookie Session",
    keys: ["key1", "key2"],
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

//URL database
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID" },
};
//USER database
const userDatabase = {
  7474: {
    id: "7474",
    email: "1@1.com",
    password: bcrypt.hashSync("1", 10),
  },

  1234: {
    id: "1234",
    email: "2@2.com",
    password: bcrypt.hashSync("2", 10),
  },
};

const { findUserByEmail, 
  urlsForUser, 
  emptyFormRejection,
  generateRandomString  } = require("./helpers");
////////////////POST 

app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  const user = findUserByEmail(email, userDatabase);
  //check if user is present in database by email
  if (!user) {
    return res.status(403).send("wrong credentials (email)!");
  }
  //compare passwords
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("wrong password");
  }
  
  req.session["id"] = user.id;
  res.redirect(`/urls`);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  let id = generateRandomString();

  if (findUserByEmail(email, userDatabase)) {
    return res
      .status(401)
      .send("We have found your email in the database, please Login");
  } else if (emptyFormRejection(email, password) === false) {
    return res
      .status(401)
      .send(
        "wrong credentials, please make sure you've included a password to your registration."
      );
  }

  userDatabase[id] = { id, email, password: hashedPassword };
  req.session["id"] = id;
  res.redirect(`/urls/`);
});

app.post("/urls/:shortURL", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = req.params.shortURL;
  if (longURL.includes("http://")) {
    urlDatabase[shortURL].longURL = `${longURL}`;
  } else {
    urlDatabase[shortURL].longURL = `http://${longURL}`;
  }
  res.redirect(`/urls`);
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  let user = {};
  if (longURL.includes("http://")) {
    user["longURL"] = `${longURL}`;
  } else if (longURL.includes("https://")) {
    user["longURL"] = `${longURL}`;
  } else {
    user["longURL"] = `http://${longURL}`;
  }
  console.log(urlDatabase)
  user["userID"] = req.session["id"];
  urlDatabase[shortURL] = user;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session["id"];
  const urls = urlsForUser(urlDatabase, userID);
  
  if(!urls) {
      return res.render("urls_error_url");
  }
  if(urls) {
    delete urlDatabase[shortURL];
    return res.redirect("/urls");
  }
 
 
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/login`);
});

//////////////////GET
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/", function (req, res) {
  const userId = req.session["id"];
  if (userId) {
    return res.redirect("/urls");
  }
  res.redirect("/login");
});

app.get("/urls", (req, res) => {
  const userID = req.session["id"];
  const urls = urlsForUser(urlDatabase, userID);
  const user = userDatabase[userID];
  const templateVars = { urls, user, urlDatabase };

  if (!userID) {
    return res.render("urls_error_login", templateVars);
  }

  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  const userID = req.session["id"];
  const user = userDatabase[userID];
  const templateVars = { urls: urlDatabase, user, urlDatabase };
  if (userID) {
    return res.redirect("/urls")
  }
  return res.render("urls_register", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.session["id"];
  const user = userDatabase[userId];
  const templateVars = { urls: urlDatabase, user };
  if (!userId) {
    return res.render("login", templateVars);
  }
  return res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL]["longURL"];

  if (longURL.includes("http://")) {
    return res.redirect(`${longURL}`);
  }
  res.redirect(`http://${longURL}`);
});

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session["id"];
  const longURL = urlDatabase[req.params.shortURL].longURL;
  const shortURL = req.params.shortURL;
  const user = userDatabase[userId];
  const templateVars = {
    urls: urlDatabase,
    userid: userDatabase[userId],
    shortURL: req.params.shortURL,
    longURL,
    userId,
    user,
  };
  const urlBelongToUser =
    urlDatabase[shortURL] && urlDatabase[shortURL].userID === userId;
  if (!urlBelongToUser) {
    return res.render("urls_error_url", templateVars);
  }

  if (!userId) {
    return res.render("urls_error_login", templateVars);
  }
  return res.render("urls_show", templateVars);
});

app.get("/login", (req, res) => {
  const userID = req.session["id"];
  const user = userDatabase[userID];
  const templateVars = { urls: urlDatabase, user, urlDatabase };

  if(!userID) {
    return res.render("login", templateVars)
  }
 
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


