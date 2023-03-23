
////////////////////////////////////////////////////////
//Function /////////////////////////////////////////////
////////////////////////////////////////////////////////
const generateRandomString = function(length) {
  const charRange = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  let num = 0;
  while (num < length) {
    result += charRange .charAt(Math.floor(Math.random() * charRange.length));
    num += 1;
  }
  return result;
};

const getUserByEmail = function(email, database) {
  for (const userId in database) {
    const user = database[userId];
    if (user.email === email) {
      // return true;
      return user;
    }
  }
};

const getPageByShortUrl = function(shortUrl, database) {
  for (const url in database) {
    if (url === shortUrl) {
      return true;
    }
  }
};

const ifShortUrlAccessible = function(shortUrl, urlData, userData) {
  for (const userId in userData) {
    if (userId === urlData[shortUrl].id) {
      return true;
    }
  }
};

const urlsForUser = function(id, database) {
  const result = {};

  for (let urlId in database) {
    let value = database[urlId];
    if (value.id === id) {
      result[`${urlId}`] = value.longURL;
    }
  }
  return result;
};

module.exports = {
  generateRandomString,
  getUserByEmail,
  getPageByShortUrl,
  ifShortUrlAccessible,
  urlsForUser
};