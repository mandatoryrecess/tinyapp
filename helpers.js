const findUserByEmail = function (email, userDatabase) {
  for (let userID in userDatabase) {
    const user = userDatabase[userID];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

const generateRandomString = function () {
  const randomString = Math.random().toString(36).substring(2, 8);
  return randomString;
};

const emptyFormRejection = (email, password) => {
  if (!email || !password) {
    return false;
  }
};

const urlsForUser = function (urlDatabase, userID) {
  let urlObject = {};
  for (let url in urlDatabase) {
    if (userID === urlDatabase[url].userID) {
      urlObject[url] = urlDatabase[url];
    }
  }
  return urlObject;
};


module.exports = { findUserByEmail, urlsForUser, emptyFormRejection, generateRandomString };
