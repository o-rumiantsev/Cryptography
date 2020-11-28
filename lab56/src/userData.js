'use strict';

const auth = require('./auth');

const getUserData = async (firestore, login, password) => {
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

  const query = await firestore.collection('userData')
    .where('userId', '==', user.id)
    .get();

  return query.docs.map(doc => doc.data());
};

const setUserData = async (firestore, login, password, field, value) => {
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

  const userDataQuery = await firestore.collection('userData')
    .where('userId', '==', user.id)
    .get();

  if (userDataQuery.size) {
    const [document] = userDataQuery.docs;
    await firestore.collection('userData')
      .doc(document.id)
      .set({ [field]: value }, { merge: true });
  } else {
    console.log('creating', { userId: user.id, [field]: value })
    await firestore.collection('userData')
      .add({ userId: user.id, [field]: value });
  }
};

module.exports = {
  getUserData,
  setUserData,
};
