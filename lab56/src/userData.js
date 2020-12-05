'use strict';

const auth = require('./auth');

const getUserData = async (storage, login, password) => {
  const user = await auth.getUserByLogin(storage, login);

  if (!user) {
    throw {
      statusCode: 400,
      message: 'User does not exist',
    };
  }

  const passwordVerified = await auth.verifyPassword(password, user);

  if (!passwordVerified) {
    throw {
      statusCode: 400,
      message: 'Invalid credentials',
    };
  }

  return storage.get('userData', { userId: user.id });
};

const setUserData = async (storage, login, password, field, value) => {
  const user = await auth.getUserByLogin(storage, login);

  if (!user) {
    throw {
      statusCode: 400,
      message: 'User does not exist',
    };
  }

  const passwordVerified = await auth.verifyPassword(password, user);

  if (!passwordVerified) {
    throw {
      statusCode: 400,
      message: 'Invalid credentials',
    };
  }

  await storage.update('userData', { userId: user.id }, { [field]: value });
};

module.exports = {
  getUserData,
  setUserData,
};
