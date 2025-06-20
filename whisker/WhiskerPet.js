import { spriteMap, tips } from './constants.js';
import { getActionData } from './actions.js';
import { setupEventListenersRx } from './events.js';
import { startGameLoops } from './gameLoops.js';
import { saveGameData, loadGameData } from './storage.js';
import { updateStatsDisplay, updateElementText, showNotification } from './uiHelpers.js';
import { setAnimation } from './animations.js';

export class WhiskerPet {
  constructor() {
    this.stats = { hunger: 100, happiness: 100, energy: 100, health: 100 };
    this.spriteMap = spriteMap;
    this.tips = tips;
    this.totalActions = 0;
    this.felixScore = 0;
    this.level = 1;
    this.currentState = 'idle';
    this.behaviors = {
      activityCooldowns: {},
      lastActivity: Date.now(),
      autonomous: true
    };
    this.soundEnabled = true;
    this.autoSaveEnabled = true;
    this.gameStartTime = Date.now();
    this.isGameActive = true;
    this.achievementsUnlocked = new Set();
    this.destroy$ = new rxjs.Subject();

    this.init();
  }

  async init() {
    setupEventListenersRx(this);
    loadGameData(this);
    startGameLoops(this);
    this.updateUI();

    setAnimation(this, 'idle');

    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
      setTimeout(() => loadingScreen.style.display = 'none', 600);
    }
  }

  performAction(action) {
    if (this.behaviors.activityCooldowns[action] > Date.now()) return;
    const data = getActionData(action);
    Object.entries(data.statChanges).forEach(([s, v]) => this.updateStat(s, v));
    setAnimation(this, data.animation, data.duration, data.felixSays); // Kirim felixSays!
    this.felixScore += data.scoreGain;
    this.totalActions++;
    this.behaviors.activityCooldowns[action] = Date.now() + data.cooldown;
    showNotification(data.message, 'success');
  }

  updateStat(name, delta) {
    this.stats[name] = Math.max(0, Math.min(100, this.stats[name] + delta));
  }

  updateGameClock() {
    const elapsed = Date.now() - this.gameStartTime;
    const hrs = String(Math.floor(elapsed / 3600000)).padStart(2, '0');
    const mins = String(Math.floor((elapsed % 3600000) / 60000)).padStart(2, '0');
    const secs = String(Math.floor((elapsed % 60000) / 1000)).padStart(2, '0');
    updateElementText('gameClock', `${hrs}:${mins}:${secs}`);
  }

  updateUI() {
    updateStatsDisplay(this.stats);
    updateElementText('felixScore', this.felixScore);
    updateElementText('totalActions', this.totalActions);
  }

  onFelixClick() {
    this.performAction('pet');
  }

  handleKeyboard(e) {
    const keys = { f: 'feed', p: 'play', s: 'sleep', h: 'heal', e: 'pet', g: 'groom' };
    const action = keys[e.key.toLowerCase()];
    if (action) {
      e.preventDefault();
      this.performAction(action);
    }
  }

  saveGameData() {
    saveGameData(this);
  }

  closeModal() {
    const modal = document.getElementById('modalOverlay');
    if (modal) modal.classList.remove('show');
  }
}
