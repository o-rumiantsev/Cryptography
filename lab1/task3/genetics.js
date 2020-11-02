'use strict';

const { TRIGRAMS, probably, getTrigrams } = require('../utils');
const { createCipher } = require('./cipher');

class Population {
  size;
  alphabet;
  generation = [];
  selected = [];
  children = [];
  fitnesses = null;

  constructor(size, alphabet, count) {
    this.size = size;
    this.alphabet = alphabet;

    for (let i = 0; i < count; ++i) {
      this.generation.push(
        this.alphabet
          .slice(i, 26)
          .concat(this.alphabet.slice(0, i))
      );
    }
  }

  tournament(encipheredText) {
    this.fitnesses = new Map(
      this.generation
        .map((chromosome) => 
          [chromosome, this.getFitness(chromosome, encipheredText)]
        )
        .sort((c1, c2) => c2[1] - c1[1])
    );
  }

  select(winnersPercentage) {
    const fitnesses = new Map(this.fitnesses.entries());
    const selectedCount = Math.floor(
      this.generation.length * winnersPercentage
    );
    this.selected = [...fitnesses.keys()].slice(0, selectedCount);
  }

  crossover(crossoverProbability, crossoverCoefficient, mutationProbability) {
    const childrenCount = this.size - this.selected.length;

    this.children = Array.from({ length: childrenCount }, () => {
      const [parent1, parent2] = this.#randomParents(this.selected);
      const shouldCrossover = probably(crossoverProbability);
      const child = shouldCrossover 
        ? this.#crossover(parent1, parent2, crossoverCoefficient)
        : parent1;
      const shouldMutate = probably(mutationProbability);
      return shouldMutate ? this.#mutate(child) : child;
    });
  }

  next() {
    this.generation = [...new Set([...this.selected, ...this.children])];
  }

  #randomParents(chromosomes) {
    const candidates = new Set(chromosomes);
  
    const parent1Index = Math.floor(Math.random() * chromosomes.length);
    const parent1 = chromosomes[parent1Index];
    candidates.delete(parent1);
  
    const parent2Index = Math.floor(Math.random() * (chromosomes.length - 1));
    const parent2 = [...candidates][parent2Index];
  
    if (!parent1 || !parent2) {
      console.log(chromosomes, parent1Index, parent2Index);
    }
  
    return [parent1, parent2];
  };

  #crossover(parent1, parent2, crossoverCoefficient) {
    const indexes =
      Array
        .from({ length: 26 }, (_, i) => i)
        .filter(() => probably(crossoverCoefficient));

    const fillersSet = new Set(parent2);

    const child = Array.from({ length: 26 });
    indexes.forEach(index => {
      const symbol = parent1[index]
      child[index] = symbol;
      fillersSet.delete(symbol);
    });
    const fillers = [...fillersSet];

    return child.map(symbol => symbol || fillers.shift()).join('');
  }

  #mutate(chromosome) {
    const gene1Index = Math.floor(Math.random() * chromosome.length);
    let gene2Index = Math.floor(Math.random() * chromosome.length);
    
    while (gene2Index === gene1Index) {
      gene2Index = Math.floor(Math.random() * chromosome.length);
    }
  
    const gene1 = chromosome[gene1Index];
    const gene2 = chromosome[gene2Index];
    const [part1, part2, part3] = chromosome.split(
      new RegExp(`${gene1}|${gene2}`, 'g')
    );
  
    return part1 + gene2 + part2 + gene1 + part3;
  };

  getFitness(chromosome, encipheredText) {
    const cipher = createCipher(this.alphabet, chromosome);
    const decipheredText = cipher.decipher(encipheredText);    
    const trigrams = getTrigrams(decipheredText);
    return Object
      .entries(trigrams)
      .reduce(
        (sum, [trigram, frequency]) => 
          sum + frequency * Math.log2(TRIGRAMS[trigram] || 0),
        0
      );
  }
}

module.exports = { Population };
