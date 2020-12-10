'use strict';

const fs = require('fs');

const input = fs.readFileSync(__dirname + '/task.txt', 'utf8')
  .split('\n\n')
  .flatMap(s => s.split('\n').filter(Boolean))

const xor = (s1, s2) => {
  const length = Math.min(s1.length, s2.length) / 2;
  const a1 = Array.from(Buffer.from(s1, 'hex')).slice(0, length);
  const a2 = Array.from(Buffer.from(s2, 'hex')).slice(0, length);
  return Buffer.from(a1.map((_, i) => a1[i] ^ a2[i])).toString('hex');
};

const cipherXOR = xor(input[0], input[1]);
const word = 'If you can make one ';

for (let i = 0; i < cipherXOR.length - word.length; i += 2) {
  console.log(
    Buffer.from(
      xor(cipherXOR.slice(i), Buffer.from(word).toString('hex')),
      'hex'
    ).toString()
  );
}
