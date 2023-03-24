const { assert } = require('chai');

const helper = require('../helper.js');

const testUsers = {
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

const testURLs = {
  'b2xVn2': {
    longURL : "http://www.lighthouselabs.ca",
    id : 'userRandomID'
  },
  '9sm5xK':{
    longURL : "http://www.google.com",
    id : 'userRandomID'
  },
  'b6UTxQ': {
    longURL: "https://www.tsn.ca",
    id : "aJ48lW"
  },

};
describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = helper.getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert.deepEqual(user,testUsers[expectedUserID]);
  });
  
  it('should not return a user with invalid email', function() {
    const user = helper.getUserByEmail("user1@example.com", testUsers)
    // const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert.strictEqual(user,undefined);
  });
});

describe('generateRandomString', function() {
  it('should return a string with length of assigned number of random characters', function() {
    const actual = helper.generateRandomString(6).length;
    const expected = 6;
    // Write your assert statement here
    assert.strictEqual(expected,actual);
  });
  
  it('should return a string with length of assigned number of random characters', function() {
    const actual = helper.generateRandomString(9).length;
    const expected = 9;
    // Write your assert statement here
    assert.strictEqual(expected,actual);
  });
});

describe('getPageByShortUrl', function() {
  it('should return undefined if the given shortURL is not in the database', function() {
    const actual = helper.getPageByShortUrl('x29J0c', testURLs);
    const expected = undefined;
    // Write your assert statement here
    assert.strictEqual(expected,actual);
  });
  
  it('should return true if the given shortURL is in the database', function() {
    const actual = helper.getPageByShortUrl('9sm5xK', testURLs);
    const expected = true;
    // Write your assert statement here
    assert.strictEqual(expected,actual);
  });
});

describe('urlsForUser', function() {
  it('should return an object with all the urls (Short urls as the keys and long urls as the values) belongs to the logged in user', function() {
    const actual = helper.urlsForUser('userRandomID', testURLs);
    const expected = {
      'b2xVn2':"http://www.lighthouselabs.ca",
      '9sm5xK':"http://www.google.com"
    };
    // Write your assert statement here
    assert.deepEqual(expected,actual);
  });
  
  it("should not return an object with urls (Short urls as the keys and long urls as the values) doesn't belongs to the logged in user", function() {
    const actual = helper.urlsForUser('user2RandomID', testURLs);
    const expected = {
      'b2xVn2':"http://www.lighthouselabs.ca",
      '9sm5xK':"http://www.google.com"
    };
    // Write your assert statement here
    assert.notDeepEqual(expected,actual);
  });
});
