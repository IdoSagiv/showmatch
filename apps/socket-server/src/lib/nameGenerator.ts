const ADJECTIVES = [
  'Popcorn', 'Reel', 'Plot', 'Spoiler', 'Silver Screen',
  'Box Office', 'Oscar', 'Blockbuster', 'Indie', 'Cult Classic',
  'Binge', 'Streaming', 'Sequel', 'Premiere', 'Matinee',
];

const NOUNS = [
  'Bandit', 'Twister', 'Alert', 'Deal', 'Guru',
  'Ninja', 'Wizard', 'Legend', 'Champion', 'Explorer',
  'Hunter', 'Critic', 'Buff', 'Addict', 'Whisperer',
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateDisplayName(existingNames: string[]): string {
  const nameSet = new Set(existingNames);
  let name: string;
  let attempts = 0;
  do {
    name = `${pick(ADJECTIVES)} ${pick(NOUNS)}`;
    attempts++;
    if (attempts > 100) break;
  } while (nameSet.has(name));
  return name;
}
