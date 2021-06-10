const findUserByEmail = function (email, userDatabase) {
  for (let userID in userDatabase) {
    const user = userDatabase[userID];
    console.log(user);
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

module.exports = { findUserByEmail };
