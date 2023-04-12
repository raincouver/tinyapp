
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

const getUserByEmail = function(emailPara, database) {
  const values = Object.values(database);
  for (const user of values) {
    if (user.email === emailPara) {
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
  urlsForUser
};