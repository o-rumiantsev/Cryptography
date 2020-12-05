'use strict';

const argon2 = require('argon2');
const nacl = require('tweetnacl');
const { deserialize } = require('@phc/format');

const { convert, KEY } = require('./utils');

const securePassword = async (password) => {
  const sha512 = nacl.hash(convert.stringToArray(password));
  const argon = await argon2.hash(sha512);
  const { salt: argonSalt } = deserialize(argon);
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
  const result = nacl.secretbox(convert.stringToArray(argon), nonce, KEY);
  return {
    argonSalt: argonSalt.toString('hex'),
    nonce: convert.arrayToString(nonce, 'hex', 'hex'),
    result: convert.arrayToString(result, 'hex', 'hex'),
  };
};

const verifyPassword = async (password, user) => {
  const sha512 = nacl.hash(convert.stringToArray(password));
  const argon = await argon2.hash(sha512, {
    salt: Buffer.from(user.argonSalt, 'hex'),
  });
  const result = nacl.secretbox(
    convert.stringToArray(argon),
    convert.stringToArray(user.nonce, 'hex'),
    KEY
  );
  return convert.arrayToString(result, 'hex', 'hex') === user.password;
};

const createUser = async (storage, login, password) => {
  const securedPassword = await securePassword(password);
  await storage.put('users', {
    login,
    password: securedPassword.result,
    nonce: securedPassword.nonce,
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
