'use strict';

const argon2 = require('argon2');
const nacl = require('tweetnacl');
const { deserialize } = require('@phc/format');

const {
  convert,
  ARGON_SALT_LENGTH,
  NONCE_LENGTH,
  KEY,
} = require('./utils');

const securePassword = async (password) => {
  const sha512 = nacl.hash(convert.stringToArray(password));
  const argon = await argon2.hash(sha512);
  const { salt: argonSalt } = deserialize(argon);
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
  const result = nacl.secretbox(convert.stringToArray(argon), nonce, KEY);
  return {
    argonSalt: argonSalt.toString('hex'),
    nonce: convert.arrayToString(nonce),
    result: convert.arrayToString(result),
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
  return convert.arrayToString(result) === user.password;
};

const createUser = async (firestore, login, password) => {
  const securedPassword = await securePassword(password);
  await firestore.collection('users').add({
    login,
    password: securedPassword.result,
    nonce: securedPassword.nonce,
    argonSalt: securedPassword.argonSalt,
  });
};

const doesLoginInUse = async (firestore, login) => {
  const query = await firestore.collection('users')
    .where('login', '==', login)
    .get();
  return query.size > 0;
};

const getUserByLogin = async (firestore, login) => {
  const query = await firestore.collection('users')
    .where('login', '==', login)
    .get();
  const [doc] = query.docs;
  return doc 
    ? {
      id: doc.id,
      login: doc.get('login'),
      password: doc.get('password'),
      nonce: doc.get('nonce') ||
        convert.arrayToString(nacl.randomBytes(NONCE_LENGTH)),
      argonSalt: doc.get('argonSalt') ||
        convert.arrayToString(nacl.randomBytes(ARGON_SALT_LENGTH)),
    }
    : null;
};

module.exports = {
  verifyPassword,
  createUser,
  doesLoginInUse,
  getUserByLogin,
}
