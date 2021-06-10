const { assert } = require('chai');

const { findUserByEmail } = require('../helpers.js');

const users = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('findUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", users) 
    const expectedOutput = "user@example.com";
    assert.equal(user['email'], expectedOutput)
  });
  
  it('should return undefined when non-existent email submitted', function() {
    const user = findUserByEmail("madeupEmail@what.com", users)
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput)
  });
    
});
