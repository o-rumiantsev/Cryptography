'use strict';

const argon2 = require('argon2');
const nacl = require('tweetnacl');
const { deserialize } = require('@phc/format');

const { convert } = require('./utils');

const securePassword = async (password) => {
  const sha512 = nacl.hash(convert.stringToArray(password));
  const argon = await argon2.hash(sha512);
  const { salt: argonSalt } = deserialize(argon);
  return {
    argonSalt: argonSalt.toString('hex'),
    result: argon,
  };
};

const verifyPassword = async (password, user) => {
  const sha512 = nacl.hash(convert.stringToArray(password));
  const argon = await argon2.hash(sha512, {
    salt: Buffer.from(user.argonSalt, 'hex'),
  });
  return argon === user.password;
};

const createUser = async (storage, login, password) => {
  const securedPassword = await securePassword(password);
  await storage.put('users', {
    login,
    password: securedPassword.result,
    argonSalt: securedPassword.argonSalt,
  });
};

const doesLoginInUse = async (storage, login) => {
  return storage.has('users', { login });
};

const getUserByLogin = async (storage, login) => {
  const [user] = await storage.get('users', { login });
  return user;
};

module.exports = {
  verifyPassword,
  createUser,
  doesLoginInUse,
  getUserByLogin,
}
