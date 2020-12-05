'use strict';

const AWS = require('aws-sdk');
const nacl = require('tweetnacl');

const { convert } = require('./utils');

AWS.config.update({
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.ACCESS_SECRET_KEY,
  },
  region: process.env.AWS_REGION,
})

const KMS = new AWS.KMS({
  endpoint: process.env.AWS_KMS_ENDPOINT,
});

const generateDEK = () => {
  return KMS.generateDataKey({
    KeyId: process.env.AWS_CMK_ID,
    KeySpec: 'AES_256',
  }).promise();
};

const decryptDEK = (key) => {
  return KMS.decrypt({
    CiphertextBlob: key,
  }).promise();
};

class Storage {
  constructor(firestore, encryptionSchema) {
    this.firestore = firestore;
    this.encryptionSchema = encryptionSchema;
  }

  async encrypt(props, object) {
    const dek = await generateDEK();

    for (const prop of props) {
      if (object[prop]) {
        const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
        object[prop] = convert.arrayToString(
          nacl.secretbox(
            convert.stringToArray(object[prop]),
            nonce,
            Uint8Array.from(dek.Plaintext)
          ),
          'hex',
          'hex'
        );
        object[prop + '_nonce'] = convert.arrayToString(nonce,'hex', 'hex');
      }
    }

    object.dek = dek.CiphertextBlob.toString('hex');

    return object;
  }

  async decrypt(props, object) {
    const dek = await decryptDEK(Buffer.from(object.dek, 'hex'));
    const result = {};

    for (const prop of Object.keys(object)) {
      if (prop === 'dek' || prop.endsWith('_nonce')) {
        continue
      }

      if (props.includes(prop)) {
        result[prop] = convert.arrayToString(
          nacl.secretbox.open(
            convert.stringToArray(object[prop], 'hex'),
            convert.stringToArray(object[prop + '_nonce'], 'hex'),
            Uint8Array.from(dek.Plaintext)
          ),
          'hex'
        );
      } else {
        result[prop] = object[prop];
      }
    }

    return result;
  }

  async put(collectionName, object) {
    const props = this.encryptionSchema[collectionName] || {};
    const encrypted = await this.encrypt(props, object);
    await this.firestore.collection(collectionName).add(encrypted);
  }

  async get(collectionName, query) {
    const cursor = Object.keys(query)
      .reduce(
        (cursor, prop) => cursor.where(prop, '==', query[prop]),
        this.firestore.collection(collectionName)
      );

    const result = await cursor.get();
    const props = this.encryptionSchema[collectionName];
    return Promise.all(
      result.docs.map(async (doc) => ({
        id: doc.id,
        ...(await this.decrypt(props, doc.data())),
      }))
    );
  }

  async has(collectionName, query) {
    const cursor = Object.keys(query)
      .reduce(
        (cursor, prop) => cursor.where(prop, '==', query[prop]),
        this.firestore.collection(collectionName)
      );

    const result = await cursor.get();
    return result.size > 0;
  }

  async update(collectionName, query, updateObject) {
    const props = this.encryptionSchema[collectionName];
    const encryptedUpdateObject = await this.encrypt(
      props,
      { ...query, ...updateObject }
    );

    const cursor = Object.keys(query)
      .reduce(
        (cursor, prop) => cursor.where(prop, '==', query[prop]),
        this.firestore.collection(collectionName)
      );
    const result = await cursor.get();

    if (result.size) {
      const [document] = result.docs;
      await this.firestore.collection(collectionName)
        .doc(document.id)
        .set(encryptedUpdateObject, { merge: true });
    } else {
      await this.firestore.collection(collectionName)
        .add(encryptedUpdateObject);
    }
  }
}

module.exports = Storage;
