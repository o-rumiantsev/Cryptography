'use strict';

/**
 * Add the ability to decipher any kind of polyalphabetic substitution ciphers.
 * The one used in the cipher texts here has 26 independent randomly 
 * chosen monoalphabetic subtitution patterns for each letter from english alphabet. 
 * It is clear that you can no longer rely on the same simple routine of guessing 
 * the key by exhaustive search which you probably used to decipher the previous 
 * paragraph. Will the index of coincidence still work as a suggsetion?
 * You can try to divide the message in parts by the number of characters in a key
 * and apply frequency analysis to each of them. Can you find a way to use higher order
 * frequency staticstics with this type of cipher?
 */

const { readFile, getKeyLength } = require('../utils');
const { createCipher } = require('./cipher');
const { Population } = require('./genetics');

const SELECTION_WINNERS_PERCENTAGE = 0.2;
const MUTATION_PROBABILITY = 0.3;
const CROSSOVER_PROBABILITY = 0.7;
const CROSSOVER_COEFFICIENT = 0.3;
const POPULATION_SIZE = 300;
const GENERATIONS_COUNT = 500;

const ALPHABET = Buffer.from(
  Array.from({ length: 26 }, (_, i) => 'A'.charCodeAt(0) + i)
).toString();

const INPUT = readFile(__dirname + '/task5-text.txt');

const keyLength = getKeyLength(INPUT)

const populations = Array.from({
  length: keyLength}, 
  (_, i) => new Population(POPULATION_SIZE, ALPHABET, ALPHABET.length, i)
);

for (let i = 0; i < GENERATIONS_COUNT; ++i) {
  const keys = populations.map(population => population.generation[0]);

  populations.forEach(population => {
    population.updateKeys(keys);
    population.tournament(INPUT);
    population.select(SELECTION_WINNERS_PERCENTAGE);
    population.crossover(CROSSOVER_PROBABILITY, CROSSOVER_COEFFICIENT, MUTATION_PROBABILITY);
    population.next();

    const [bestFit] = [...population.fitnesses.values()];
    const key = population.generation[0];
    console.log(`Generation ${i + 1}; Population: ${population.index}, Key: ${key}; Best fit: ${bestFit}`);
  });
}

const key = populations.map(p => p.generation[0]);
const cipher = createCipher(ALPHABET, key);
console.log({
  keyLength,
  key,
  output: cipher.decipher(INPUT),
});
