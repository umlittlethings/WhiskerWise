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

    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => this.openSettings());
    }
    const soundBtn = document.getElementById('soundBtn');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => this.toggleSound());
    }
    const helpBtn = document.getElementById('helpBtn');
    if (helpBtn) {
      helpBtn.addEventListener('click', () => this.openHelp());
    }

    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
      setTimeout(() => loadingScreen.style.display = 'none', 600);
    }

    const modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
          this.closeModal();
        }
      });
    }
  }

  showModal(content) {
    const modal = document.getElementById('modalOverlay');
    const modalContent = document.getElementById('modalContent');
    if (modal && modalContent) {
      modalContent.innerHTML = content;
      modal.classList.add('show');
    }
  }

  openSettings() {
      const modalContent = `
          <h2>⚙️ Pengaturan</h2>
          <div style="margin: 20px 0;">
              <label style="display: flex; align-items: center; margin-bottom: 15px;">
                  <input type="checkbox" ${this.soundEnabled ? 'checked' : ''} id="soundToggle" style="margin-right: 10px;">
                  🔊 Suara
              </label>
              <label style="display: flex; align-items: center; margin-bottom: 15px;">
                  <input type="checkbox" ${this.autoSaveEnabled ? 'checked' : ''} id="autoSaveToggle" style="margin-right: 10px;">
                  💾 Auto Save
              </label>
              <label style="display: flex; align-items: center; margin-bottom: 15px;">
                  <input type="checkbox" ${this.behaviors.autonomous ? 'checked' : ''} id="autonomousToggle" style="margin-right: 10px;">
                  🤖 Perilaku Otomatis
              </label>
              <div style="margin-top: 20px;">
                  <button id="clearNotificationsBtn" style="padding: 8px 16px; background: #f97316; color: white; border: none; border-radius: 6px; cursor: pointer; margin-right: 10px;">
                      🗑️ Hapus Notifikasi
                  </button>
                  <button id="resetGameBtn" style="padding: 8px 16px; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer;">
                      🔄 Reset Game
                  </button>
              </div>
          </div>
          <button id="saveSettingsBtn" style="padding: 10px 20px; background: #6366f1; color: white; border: none; border-radius: 8px; cursor: pointer;">
              Simpan & Tutup
          </button>
      `;
      this.showModal(modalContent);

       setTimeout(() => {
        const clearBtn = document.getElementById('clearNotificationsBtn');
        if (clearBtn) clearBtn.addEventListener('click', () => this.clearAllNotifications());
        const resetBtn = document.getElementById('resetGameBtn');
        if (resetBtn) resetBtn.addEventListener('click', () => this.resetGame());
        const saveBtn = document.getElementById('saveSettingsBtn');
        if (saveBtn) saveBtn.addEventListener('click', () => {
            this.applySettings();
            this.closeModal();
        });
    }, 0);
  }

  clearAllNotifications() {
      const container = document.getElementById('notificationContainer');
      if (container) {
          const notifications = container.querySelectorAll('.notification');
          notifications.forEach(notification => {
              this.removeNotification(notification);
          });
      }
      
      this.notificationTimeouts.clear();
      this.lastNotificationTime = {};
      this.lastCriticalNotification = {};
      this.lastHungerWarning = null;
      this.lastBusyNotification = null;
  }

  resetGame() {
      if (confirm('Apakah Anda yakin ingin mereset game? Semua progress akan hilang!')) {
          this.destroy$.next(); 
          this.destroy$.complete();
          this.destroy$ = new rxjs.Subject(); 

          this.stats = { hunger: 100, happiness: 100, energy: 100, health: 100 };
          this.totalActions = 0;
          this.felixScore = 0;
          this.level = 1;
          this.gameStartTime = Date.now();
          
          this.behaviors.activityCooldowns = {};
          this.behaviors.lastActivity = Date.now();
          this.behaviors.preferences.activityCount = {};
          this.achievementsUnlocked = new Set();
          
          this.clearAllNotifications();
          this.clearCriticalAlert();
          
          this.isAnimating = false;
          this.setAnimation('idle', 0);
          
          localStorage.removeItem('whiskerwise-save');
          
          this.updateUI();
          showNotification('🔄 Game berhasil direset!', 'success');
          this.showSpeechBubble('Halo! Aku Felix yang baru! 😸');

          setTimeout(() => location.reload(), 500);
      }
  }

  openHelp() {
      const modalContent = `
          <h2>❓ Bantuan</h2>
          <div style="margin: 20px 0;">
              <h3>🎮 Cara Bermain:</h3>
              <ul style="margin-left: 20px; line-height: 1.8;">
                  <li><strong>Makan (F):</strong> Mengurangi rasa lapar Felix</li>
                  <li><strong>Main (P):</strong> Meningkatkan kebahagiaan Felix</li>
                  <li><strong>Tidur (S):</strong> Mengembalikan energi Felix</li>
                  <li><strong>Obat (H):</strong> Meningkatkan kesehatan Felix</li>
                  <li><strong>Elus (E):</strong> Memberikan kasih sayang</li>
                  <li><strong>Bersihkan (G):</strong> Menjaga kebersihan Felix</li>
              </ul>
              <h3>💡 Tips:</h3>
              <ul style="margin-left: 20px; line-height: 1.8;">
                  <li>Jaga semua stat di atas 20 untuk kesehatan optimal</li>
                  <li>Felix akan memberikan reaksi berbeda untuk setiap aktivitas</li>
                  <li>Gunakan keyboard shortcuts untuk aksi cepat</li>
                  <li>Klik Felix untuk memberikan perhatian ekstra</li>
                  <li>Game otomatis tersimpan setiap 30 detik</li>
              </ul>
              <h3>🔧 Troubleshooting:</h3>
              <ul style="margin-left: 20px; line-height: 1.8;">
                  <li>Jika notifikasi terlalu banyak, gunakan tombol "Hapus Notifikasi"</li>
                  <li>Jika Felix stuck "sibuk", tunggu beberapa detik atau refresh halaman</li>
                  <li>Gunakan Reset Game untuk memulai dari awal</li>
              </ul>
          </div>
          <button onclick="window.virtualPet.closeModal()" style="padding: 10px 20px; background: #6366f1; color: white; border: none; border-radius: 8px; cursor: pointer;">
              Tutup
          </button>
      `;
      this.showModal(modalContent);
  }


  applySettings() {
      const soundToggle = document.getElementById('soundToggle');
      const autoSaveToggle = document.getElementById('autoSaveToggle');
      const autonomousToggle = document.getElementById('autonomousToggle');
      
      if (soundToggle) this.soundEnabled = soundToggle.checked;
      if (autoSaveToggle) this.autoSaveEnabled = autoSaveToggle.checked;
      if (autonomousToggle) this.behaviors.autonomous = autonomousToggle.checked;
      
      this.saveGameData();
      showNotification('✅ Pengaturan tersimpan!', 'success'); // <-- perbaiki di sini
  }
  
  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    showNotification(this.soundEnabled ? '🔊 Suara diaktifkan' : '🔇 Suara dimatikan', 'info');
    // (Opsional) update tampilan tombol
    const soundBtn = document.getElementById('soundBtn');
    if (soundBtn) {
      soundBtn.textContent = this.soundEnabled ? '🔊 Suara' : '🔇 Suara';
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
    updateElementText('playTime', `${hrs}:${mins}:${secs}`); // Tambahkan baris ini
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

  closeModal() {
    const modal = document.getElementById('modalOverlay');
    if (modal) {
      modal.classList.remove('show');
    }
  }

  saveGameData() {
    saveGameData(this);
  }

 
}
