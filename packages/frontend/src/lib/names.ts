const ADJECTIVES = [
  "Swift",
  "Clever",
  "Bold",
  "Calm",
  "Eager",
  "Gentle",
  "Happy",
  "Kind",
  "Lively",
  "Neat",
  "Quick",
  "Wise",
];

const ANIMALS = [
  "Fox",
  "Owl",
  "Bear",
  "Deer",
  "Hawk",
  "Lynx",
  "Wolf",
  "Hare",
  "Crow",
  "Seal",
  "Wren",
  "Dove",
];

export function getRandomName(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  return `${adj} ${animal}`;
}
