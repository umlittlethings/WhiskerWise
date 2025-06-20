import { showNotification } from './uiHelpers.js';

export function saveGameData(instance) {
  const gameData = {
    stats: instance.stats,
    gameStartTime: instance.gameStartTime,
    totalActions: instance.totalActions,
    felixScore: instance.felixScore,
    level: instance.level,
    behaviors: instance.behaviors,
    soundEnabled: instance.soundEnabled,
    autoSaveEnabled: instance.autoSaveEnabled,
    achievementsUnlocked: Array.from(instance.achievementsUnlocked || []),
    saveTime: Date.now()
  };

  try {
    localStorage.setItem('whiskerwise-save', JSON.stringify(gameData));
    return true;
  } catch (error) {
    console.error('Save failed:', error);
    return false;
  }
}

export function loadGameData(instance) {
  try {
    const saved = localStorage.getItem('whiskerwise-save');
    if (saved) {
      const gameData = JSON.parse(saved);

      instance.stats = { ...instance.stats, ...gameData.stats };
      instance.gameStartTime = gameData.gameStartTime || instance.gameStartTime;
      instance.totalActions = gameData.totalActions || 0;
      instance.felixScore = gameData.felixScore || 0;
      instance.level = gameData.level || 1;
      instance.behaviors = { ...instance.behaviors, ...gameData.behaviors };
      instance.soundEnabled = gameData.soundEnabled !== undefined ? gameData.soundEnabled : true;
      instance.autoSaveEnabled = gameData.autoSaveEnabled !== undefined ? gameData.autoSaveEnabled : true;
      instance.achievementsUnlocked = new Set(gameData.achievementsUnlocked || []);

      showNotification('✅ Game berhasil dimuat!', 'success');
      return true;
    }
  } catch (error) {
    console.error('Load failed:', error);
  }
  return false;
}
