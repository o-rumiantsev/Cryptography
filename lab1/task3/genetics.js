'use strict';

const { readFile, probably } = require('../utils');
const { createSubstitutionCipher } = require('./cipher');

const TRIGRAMS = Object.fromEntries(
  readFile(__dirname + '/english_trigrams.csv')
    .split('\n')
    .map(line => line.split(','))
    .map(entry => [entry[0], parseFloat(entry[1])])
);

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

  tournament(encodedText) {
    this.fitnesses = new Map(
      this.generation
        .map((chromosome) => {
          const cipher = createSubstitutionCipher(this.alphabet, chromosome);
          const decoded = cipher.decode(encodedText);
          const trigrams = this.#getTrigrams(decoded);
          const fitness = Object
            .entries(trigrams)
            .reduce(
              (sum, [trigram, frequency]) => 
                sum + frequency * Math.log2(TRIGRAMS[trigram] || 0),
              0
            );
          return [chromosome, fitness];
        })
        .sort((c1, c2) => c2[1] - c1[1])
    );
  }

  select(winnersPercentage, winnerProbability) {
    const fitnesses = new Map(this.fitnesses.entries());
    const selectedCount = Math.floor(
      this.generation.length * winnersPercentage
    );
    this.selected = [];

    while (this.selected.length < selectedCount) {
      const winners = 
        [...fitnesses.keys()]
          .filter(
            (_, i) => 
              probably(winnerProbability * ((1 - winnerProbability) ** i))
          )
          .slice(0, selectedCount - this.selected.length);
      
      winners.forEach(key => fitnesses.delete(key));
      this.selected.push(...winners);
    }
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

  #getTrigrams(text) {
    const trigrams = {};
    let overallTrigramsOccurrences = 0;
  
    for (let i = 0; i < text.length - 2; ++i) {
      const trigram = text.slice(i, i + 3);
      if (!trigrams.hasOwnProperty(trigram)) {
        const occurrencesCount = text.match(new RegExp(trigram, 'g')).length;
        trigrams[trigram] = occurrencesCount;
        overallTrigramsOccurrences += occurrencesCount;
      }
    }
  
    for (const trigram in trigrams) {
      trigrams[trigram] = trigrams[trigram] / overallTrigramsOccurrences * 100;
    }
  
    return trigrams;
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
}

module.exports = { Population };
