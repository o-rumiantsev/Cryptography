'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');
const fastify = require('fastify');
const owasp = require('owasp-password-strength-test');
const { Firestore } = require('@google-cloud/firestore');

const auth = require('./src/auth')
const userData = require('./src/userData');
const utils = require('./src/utils');
const Storage = require('./src/storage');

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

const encryptionSchema = yaml.parse(
  fs.readFileSync('./encryption-schema.yml', 'utf8')
);

const storage = new Storage(firestore, encryptionSchema);

app.post('/signin', async (req) => {
  const { login, password } = req.body;
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

  return passwordVerified;
});

app.post('/signup', async (req, reply) => {
  const { login, password } = req.body;

  if (utils.COMMON_PASSWORDS.includes(password)) {
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

  if (await auth.doesLoginInUse(storage, login)) {
    throw {
      statusCode: 400,
      message: 'User already exists',
    };
  }

  await auth.createUser(storage, login, password);
  reply.code(204);
});

app.post('/setdata', async (req, reply) => {
  const { login, password, field, value } = req.body;
  await userData.setUserData(storage, login, password, field, value);
  reply.code(204);
});

app.post('/getdata', async (req) => {
  const { login, password } = req.body;
  return userData.getUserData(storage, login, password);
});

app.listen(process.env.PORT, process.env.HOST);
