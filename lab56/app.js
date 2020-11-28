'use strict';

const fs = require('fs');
const path = require('path');
const fastify = require('fastify');
const owasp = require('owasp-password-strength-test');
const { Firestore } = require('@google-cloud/firestore');

const auth = require('./src/auth')
const userData = require('./src/userData');
const utils = require('./src/utils');

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

app.post('/signin', async (req) => {
  const { login, password } = req.body;
  const user = await auth.getUserByLogin(firestore, login);

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

  if (await auth.doesLoginInUse(firestore, login)) {
    throw {
      statusCode: 400,
      message: 'User already exists',
    };
  }

  await auth.createUser(firestore, login, password);
  reply.code(204);
});

app.post('/setdata', async (req, reply) => {
  const { login, password, field, value } = req.body;
  await userData.setUserData(firestore, login, password, field, value);
  reply.code(204);
});

app.post('/getdata', async (req) => {
  const { login, password } = req.body;
  return userData.getUserData(firestore, login, password);
});

app.listen(process.env.PORT, process.env.HOST);
