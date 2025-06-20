export const ACTIONS = {
  feed: {
    statChanges: { hunger: 25, health: 5 },
    animation: 'eating',
    duration: 3000,
    message: '🍎 Felix makan dengan lahap!',
    felixSays: 'Yummy! Terima kasih! 😋',
    scoreGain: 10,
    cooldown: 5000
  },
  play: {
    statChanges: { happiness: 30, energy: -10, hunger: -5 },
    animation: 'playing',
    duration: 4000,
    message: '🎾 Felix bermain dengan gembira!',
    felixSays: 'Wah seru sekali! 😸',
    scoreGain: 15,
    cooldown: 8000
  },
  sleep: {
    statChanges: { energy: 35, health: 8, happiness: 5 },
    animation: 'sleeping',
    duration: 5000,
    message: '😴 Felix tidur nyenyak dan damai',
    felixSays: 'Zzz... mimpi indah... 💤',
    scoreGain: 12,
    cooldown: 10000
  },
  heal: {
    statChanges: { health: 40, happiness: 10 },
    animation: 'happy',
    duration: 2500,
    message: '💊 Felix merasa jauh lebih sehat!',
    felixSays: 'Aku merasa hebat! ✨',
    scoreGain: 20,
    cooldown: 15000
  },
  pet: {
    statChanges: { happiness: 15, health: 3 },
    animation: 'happy',
    duration: 2000,
    message: '👋 Felix menikmati belaian lembut',
    felixSays: 'Ahh... ini menyenangkan! 😽',
    scoreGain: 8,
    cooldown: 3000
  },
  groom: {
    statChanges: { health: 20, happiness: 8 },
    animation: 'grooming',
    duration: 3500,
    message: '🧼 Felix bersih dan wangi sekarang!',
    felixSays: 'Aku jadi bersih! 🐱',
    scoreGain: 12,
    cooldown: 6000
  }
};

export function getActionData(action) {
  return ACTIONS[action];
}
