'use strict';

const fs = require('fs');
const path = require('path');
const fastify = require('fastify');
const owasp = require('owasp-password-strength-test');
const argon2 = require('argon2');
const nacl = require('tweetnacl');
const { deserialize } = require('@phc/format');
const { Firestore } = require('@google-cloud/firestore');

const ARGON_SALT_LENGTH = 16;
const NONCE_LENGTH = nacl.secretbox.nonceLength;
const KEY = Uint8Array.from(fs.readFileSync(process.env.CIPHER_KEY_FILE));
const COMMON_PASSWORDS = fs
  .readFileSync(process.env.COMMON_PASSWORDS_FILE, 'utf8')
  .split('\n');

const app = fastify({
  logger: true,
});

app.register(require('fastify-static'), {
  root: path.join(__dirname, 'public'),
});

const firestore = new Firestore({
  projectId: process.env.GOOGLE_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: 
      fs.readFileSync(process.env.GOOGLE_CLIENT_PRIVATE_KEY_FILE, 'utf8'),
  },
});

const convert = {
  stringToArray: (string, encoding) => Uint8Array.from(
    Buffer.from(string, encoding)
  ),
  arrayToString: (array) => Buffer.from(array).toString('hex'),
};

const doesLoginInUse = async (login) => {
  const query = await firestore.collection('users')
    .where('login', '==', login)
    .get();
  return query.size > 0;
};

const getPasswordByLogin = async (login) => {
  const query = await firestore.collection('users')
    .where('login', '==', login)
    .get();
  const [doc] = query.docs;
  return doc 
    ? {
      password: doc.get('password'),
      nonce: doc.get('nonce') ||
        convert.arrayToString(nacl.randomBytes(NONCE_LENGTH)),
      argonSalt: doc.get('argonSalt') ||
        convert.arrayToString(nacl.randomBytes(ARGON_SALT_LENGTH)),
    }
    : null;
};

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

const verifyPassword = async (password, userPassword) => {
  const sha512 = nacl.hash(convert.stringToArray(password));
  const argon = await argon2.hash(sha512, {
    salt: Buffer.from(userPassword.argonSalt, 'hex'),
  });
  const result = nacl.secretbox(
    convert.stringToArray(argon),
    convert.stringToArray(userPassword.nonce, 'hex'),
    KEY
  );
  return convert.arrayToString(result) === userPassword.password;
};

const createUser = async (login, password) => {
  const securedPassword = await securePassword(password);
  await firestore.collection('users').add({
    login,
    password: securedPassword.result,
    nonce: securedPassword.nonce,
    argonSalt: securedPassword.argonSalt,
  });
};

app.post('/signin', async (req) => {
  const { login, password } = req.body;
  const userPassword = await getPasswordByLogin(login);

  if (!userPassword) {
    throw {
      statusCode: 400,
      message: 'User does not exist',
    };
  }

  const passwordVerified = await verifyPassword(password, userPassword);

  if (!passwordVerified) {
    throw {
      statusCode: 400,
      message: 'Invalid credentials',
    };
  }

  return passwordVerified;
});

app.post('/signup', async (req, reply) => {
  const { login, password } = req.body;
  
  if (COMMON_PASSWORDS.includes(password)) {
    throw {
      statusCode: 400,
      message: 'Your password is too weak.',
    };
  }

  const { errors } = owasp.test(password);

  if (errors.length) {
    throw {
      statusCode: 400,
      message: 'Your password is too weak.',
    };
  }

  if (await doesLoginInUse(login)) {
    throw {
      statusCode: 400,
      message: 'User already exists',
    };
  }

  await createUser(login, password);
  reply.code(204);
});

app.listen(process.env.PORT, process.env.HOST);
