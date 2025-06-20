const { fromEvent, interval, merge } = rxjs;
const { filter, throttleTime, takeUntil } = rxjs.operators;

class WhiskerWiseEnhanced {
  constructor() {
    this.stats = {
        hunger: 100,
        happiness: 100,
        energy: 100,
        health: 100
    };
    
    this.currentState = 'idle';
    this.currentMood = 'happy';
    this.gameStartTime = Date.now();
    this.totalActions = 0;
    this.felixScore = 0;
    this.level = 1;
    this.isGameActive = true;
    
    this.animationQueue = [];
    this.currentAnimation = null;
    this.animationTimeout = null;
    this.isAnimating = false; 

    this.behaviors = {
        autonomous: true,
        lastActivity: Date.now(),
        activityCooldowns: {},
        moodHistory: [],
        preferences: {
            favoriteActivity: 'playing',
            dislikedActivity: null,
            personalityType: 'playful'
        }
    };
    

    this.notifications = [];
    this.soundEnabled = true;
    this.autoSaveEnabled = true;
    this.maxNotifications = 3; 
    this.notificationTimeouts = new Map(); 
    this.tips = [
        "Felix suka bermain setelah makan!",
        "Kucing yang bahagia hidup lebih lama!",
        "Jangan lupa memberi makan Felix setiap hari!",
        "Bermain membantu Felix tetap aktif dan sehat!",
        "Tidur yang cukup membuat Felix berenergi!",
        "Elus Felix untuk meningkatkan kebahagiaan!",
        "Kebersihan adalah kunci kesehatan Felix!",
        "Felix lebih suka rutinitas yang konsisten!"
    ];
    

    this.spriteMap = {
  
        idle: 'asset/cat1.gif',          
        happy: 'asset/cat2.gif',        
        eating: 'asset/cat3.gif',       
        sleeping: 'asset/cat4.gif',     
        playing: 'asset/cat5.gif',       
        sitting: 'asset/cat6.gif',       
        
        stretching: 'asset/cat7.gif',    
        active: 'asset/cat8.gif',       
        emotional: 'asset/cat9.gif',     
        sittingAlt: 'asset/cat10.gif',   
        

        sick: 'asset/cat9.gif',         
        grooming: 'asset/cat3.gif',      
        excited: 'asset/cat2.gif'        
    };
    
    this.destroy$ = new rxjs.Subject(); 
    this.init();
}

async init() {
    try {
        this.showLoadingScreen();
        await this.preloadAssets();
        this.setupEventListenersRx(); 
        this.loadGameData();
        this.startGameLoopsRx(); 
        this.hideLoadingScreen();
        this.showWelcomeMessage();
    } catch (error) {
        console.error('Initialization error:', error);
        this.showNotification('Error loading game', 'error');
    }
}

async preloadAssets() {
    const loadingProgress = document.getElementById('loadingProgress');
    let progress = 0;
    

    const sprites = Object.values(this.spriteMap);
    const totalAssets = sprites.length;
    
    for (let i = 0; i < totalAssets; i++) {
        try {
            await new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = resolve;
                img.onerror = () => {
                    console.warn(`Failed to preload: ${sprites[i]}`);
                    resolve(); 
                };
                img.src = sprites[i];
    
                setTimeout(resolve, 2000);
            });
        } catch (error) {
            console.warn(`Error preloading ${sprites[i]}:`, error);
        }
        
        progress = ((i + 1) / totalAssets) * 100;
        if (loadingProgress) {
            loadingProgress.style.width = `${progress}%`;
        }
    }
}

setupEventListenersRx() {

    const buttonIds = [
      { id: 'feedBtn', action: 'feed' },
      { id: 'playBtn', action: 'play' },
      { id: 'sleepBtn', action: 'sleep' },
      { id: 'healBtn', action: 'heal' },
      { id: 'petBtn', action: 'pet' },
      { id: 'groomBtn', action: 'groom' },
      { id: 'foodBowl', action: 'feed' },
      { id: 'toyBall', action: 'play' },
      { id: 'petBed', action: 'sleep' }
    ];
    buttonIds.forEach(({ id, action }) => {
      const el = document.getElementById(id);
      if (el) {
        fromEvent(el, 'click')
          .pipe(takeUntil(this.destroy$))
          .subscribe(() => this.performAction(action));
      }
    });


    const felixSprite = document.getElementById('felixSprite');
    if (felixSprite) {
      fromEvent(felixSprite, 'click')
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => this.onFelixClick());
    }

   
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
      fromEvent(settingsBtn, 'click')
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => this.showSettings());
    }
    const soundBtn = document.getElementById('soundBtn');
    if (soundBtn) {
      fromEvent(soundBtn, 'click')
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => this.toggleSound());
    }
    const helpBtn = document.getElementById('helpBtn');
    if (helpBtn) {
      fromEvent(helpBtn, 'click')
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => this.showHelp());
    }

    fromEvent(document, 'keydown')
      .pipe(
        filter(e => !['INPUT', 'TEXTAREA'].includes(e.target.tagName)),
        takeUntil(this.destroy$)
      )
      .subscribe(e => this.handleKeyboard(e));

  
    fromEvent(document, 'visibilitychange')
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.handleVisibilityChange());

  
    fromEvent(window, 'beforeunload')
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.saveGameData());
}

startGameLoopsRx() {

    interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.isGameActive) {
          this.updateGameClock();
          this.updateUI();
          this.checkAutonomousBehavior();
        }
      });

   
    interval(8000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.isGameActive) {
          this.updateStat('hunger', -2);
          this.checkHungerEffects();
        }
      });

    interval(12000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.isGameActive) {
          let decay = -1;
          if (this.stats.hunger < 30) decay = -2;
          this.updateStat('happiness', decay);
        }
      });

    interval(15000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.isGameActive) {
          this.updateStat('energy', -1);
        }
      });

    interval(25000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.isGameActive) {
          let healthDecay = 0;
          if (this.stats.hunger < 20) healthDecay -= 2;
          if (this.stats.happiness < 20) healthDecay -= 1;
          if (this.stats.energy < 10) healthDecay -= 1;
          if (healthDecay < 0) {
            this.updateStat('health', healthDecay);
          }
        }
      });

    interval(30000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.autoSaveEnabled) {
          this.saveGameData();
        }
      });


    interval(300000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.showRandomTip());
}

performAction(action) {
 
    if (!this.canPerformAction(action)) {
        return false;
    }
    

    this.isAnimating = true;
    this.totalActions++;
    
    const actionData = this.getActionData(action);
    
    Object.entries(actionData.statChanges).forEach(([stat, change]) => {
        this.updateStat(stat, change);
    });
    
    this.setAnimation(actionData.animation, actionData.duration);

    this.showNotification(actionData.message, 'success');
    
    this.felixScore += actionData.scoreGain;
    
    this.setCooldown(action, actionData.cooldown);
    
    this.showSpeechBubble(actionData.felixSays);
    

    this.updateBehaviorPreferences(action);
    
    this.updateUI();
    return true;
}

getActionData(action) {
    const actions = {
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
    
    return actions[action];
}


canPerformAction(action) {
 
    if (this.behaviors.activityCooldowns[action] > Date.now()) {
        const remaining = Math.ceil((this.behaviors.activityCooldowns[action] - Date.now()) / 1000);
        this.showNotification(`⏳ Tunggu ${remaining} detik lagi`, 'warning');
        return false;
    }
    
   
    if (action === 'play' && this.stats.energy < 15) {
        this.showNotification('😴 Felix terlalu lelah untuk bermain!', 'warning');
        return false;
    }
    
    if (this.isAnimating) {
        if (!this.lastBusyNotification || Date.now() - this.lastBusyNotification > 2000) {
            this.showNotification('🐱 Felix sedang sibuk!', 'warning');
            this.lastBusyNotification = Date.now();
        }
        return false;
    }
    
    return true;
}

setCooldown(action, duration) {
    this.behaviors.activityCooldowns[action] = Date.now() + duration;
    this.updateCooldownUI(action, duration);
}

updateCooldownUI(action, duration) {
    const cooldownElement = document.getElementById(`${action}Cooldown`);
    if (cooldownElement) {
        let remaining = duration;
        cooldownElement.style.width = '100%';
        
        const interval = setInterval(() => {
            remaining -= 100;
            const percentage = Math.max(0, (remaining / duration) * 100);
            cooldownElement.style.width = `${percentage}%`;
            
            if (remaining <= 0) {
                clearInterval(interval);
                cooldownElement.style.width = '0%';
            }
        }, 100);
    }
}


setAnimation(animationType, duration = 0) {
    this.currentState = animationType;
    this.currentAnimation = animationType;
    this.isAnimating = true;
    
    const felixSprite = document.getElementById('felixSprite');
    const spriteImage = document.getElementById('spriteImage');
    
    if (!felixSprite || !spriteImage) return;
    
    felixSprite.className = 'felix-sprite';
    felixSprite.classList.add(animationType);
    
    if (this.spriteMap[animationType]) {
        const img = new Image();
        img.onload = () => {
            spriteImage.src = this.spriteMap[animationType];
        };
        img.onerror = () => {
            console.warn(`Failed to load GIF: ${this.spriteMap[animationType]}`);
            spriteImage.src = this.createPlaceholderSprite(animationType);
        };
        img.src = this.spriteMap[animationType];
    } else {
        spriteImage.src = this.createPlaceholderSprite(animationType);
    }
    
    if (this.animationTimeout) {
        clearTimeout(this.animationTimeout);
    }
    
    if (duration > 0) {
        this.animationTimeout = setTimeout(() => {
            this.returnToNaturalState();
            this.isAnimating = false;
        }, duration);
    } else {
        setTimeout(() => {
            this.isAnimating = false;
        }, 1000);
    }
}

returnToNaturalState() {
    const mood = this.calculateMood();
    
    if (mood === 'sick') {
        this.setAnimation('sick', 0);
    } else if (this.stats.energy < 30) {
        this.setAnimation('sitting', 0);
    } else if (this.stats.happiness > 80) {
        this.setAnimation('happy', 0);
    } else {
        this.setAnimation('idle', 0);
    }
}

createPlaceholderSprite(type) {
    const placeholders = {
        idle: { emoji: '😺', bg: '#87CEEB', text: 'SANTAI' },
        happy: { emoji: '😸', bg: '#FFD700', text: 'SENANG' },
        eating: { emoji: '😋', bg: '#FFB347', text: 'MAKAN' },
        sleeping: { emoji: '😴', bg: '#DDA0DD', text: 'TIDUR' },
        playing: { emoji: '😹', bg: '#98FB98', text: 'MAIN' },
        sitting: { emoji: '😺', bg: '#B0E0E6', text: 'DUDUK' },
        stretching: { emoji: '🙆', bg: '#F0E68C', text: 'RENGGANG' },
        active: { emoji: '🏃', bg: '#FFA07A', text: 'AKTIF' },
        emotional: { emoji: '😊', bg: '#FFB6C1', text: 'EMOSI' },
        sick: { emoji: '🤒', bg: '#F08080', text: 'SAKIT' },
        grooming: { emoji: '🧼', bg: '#E0FFFF', text: 'BERSIH' },
        excited: { emoji: '🤩', bg: '#FF69B4', text: 'EXCITED' },
        sittingAlt: { emoji: '😸', bg: '#DEB887', text: 'DUDUK ALT' }
    };
    
    const placeholder = placeholders[type] || placeholders.idle;
    
    const svg = `
        <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" rx="15" fill="${placeholder.bg}"/>
            <text x="50" y="45" font-family="Arial" font-size="30" text-anchor="middle">${placeholder.emoji}</text>
            <text x="50" y="75" font-family="Arial" font-size="10" text-anchor="middle" fill="#333">${placeholder.text}</text>
        </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
}


updateStat(statName, change) {
    const oldValue = this.stats[statName];
    this.stats[statName] = Math.max(0, Math.min(100, this.stats[statName] + change));
    

    if (oldValue > 20 && this.stats[statName] <= 20) {
        this.onStatCritical(statName);
    }
    
    this.updateLevel();
    this.checkAchievements();
    
    if (oldValue <= 20 && this.stats[statName] > 20) {
        this.clearCriticalAlert();
    }
}

onStatCritical(statName) {
    const criticalKey = `critical_${statName}`;
    const now = Date.now();
    
    if (this.lastCriticalNotification && 
        this.lastCriticalNotification[criticalKey] && 
        now - this.lastCriticalNotification[criticalKey] < 10000) {
        return; 
    }
    
    const criticalMessages = {
        hunger: '🚨 DARURAT! Felix sangat kelaparan!',
        happiness: '😢 Felix sangat sedih dan depresi!',
        energy: '💤 Felix sangat kelelahan!',
        health: '🆘 BAHAYA! Kesehatan Felix kritis!'
    };
    
    this.showNotification(criticalMessages[statName], 'error');
    this.addCriticalAlert(statName);
    

    if (!this.lastCriticalNotification) {
        this.lastCriticalNotification = {};
    }
    this.lastCriticalNotification[criticalKey] = now;
    

    const felixContainer = document.getElementById('felixContainer');
    if (felixContainer) {
        felixContainer.style.animation = 'shake 0.6s ease-in-out';
        setTimeout(() => {
            felixContainer.style.animation = '';
        }, 600);
    }
}


clearCriticalAlert() {
    const alertsContainer = document.getElementById('statusAlerts');
    if (alertsContainer) {
        alertsContainer.textContent = '';
    }
}

calculateMood() {
    const avg = (this.stats.hunger + this.stats.happiness + this.stats.energy + this.stats.health) / 4;
    
    if (avg >= 80) return 'very_happy';
    if (avg >= 60) return 'happy';
    if (avg >= 40) return 'neutral';
    if (avg >= 20) return 'sad';
    return 'sick';
}

updateLevel() {
    const totalScore = this.felixScore;
    const newLevel = Math.floor(totalScore / 100) + 1;
    
    if (newLevel > this.level) {
        this.level = newLevel;
        this.showNotification(`🎉 Felix naik level ${this.level}!`, 'success');
        this.showSpeechBubble(`Wow! Level ${this.level}! 🌟`);
    }
}


checkAutonomousBehavior() {
    if (!this.behaviors.autonomous || this.isAnimating) return;
    
    const now = Date.now();
    const timeSinceLastActivity = now - this.behaviors.lastActivity;
    

    if (timeSinceLastActivity > 45000 && Math.random() < 0.05) {
        this.performAutonomousAction();
    }
    
  
    if (this.stats.energy > 80 && Math.random() < 0.02) {
        this.setAnimation('stretching', 2000);
        this.showSpeechBubble('Ahh... peregangan! 🙆');
    }
    
    if (this.stats.happiness > 90 && Math.random() < 0.01) {
        this.setAnimation('excited', 2500);
        this.showSpeechBubble('Aku sangat bahagia! 🤩');
    }
}

performAutonomousAction() {
    const actions = ['sitting', 'stretching', 'emotional', 'active'];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    
    this.setAnimation(randomAction, 3000);
    this.behaviors.lastActivity = Date.now();
    
    const messages = {
        sitting: 'Felix duduk santai 😺',
        stretching: 'Felix meregangkan tubuh 🙆',
        emotional: 'Felix menunjukkan emosi 😊',
        active: 'Felix bergerak aktif 🏃'
    };
    
    this.showSpeechBubble(messages[randomAction] || 'Meow! 🐱');
}


updateUI() {
    this.updateStatsDisplay();
    this.updateMoodDisplay();
    this.updateGameInfo();
    this.updateButtons();
}

updateStatsDisplay() {
    Object.entries(this.stats).forEach(([stat, value]) => {
        const fillElement = document.getElementById(`${stat}Fill`);
        const textElement = document.getElementById(`${stat}Text`);
        const cardElement = fillElement?.closest('.stat-card');
        
        if (fillElement && textElement) {
            fillElement.style.width = `${value}%`;
            textElement.textContent = `${value}%`;
            
            if (cardElement) {
                cardElement.classList.remove('critical', 'warning');
                if (value <= 20) {
                    cardElement.classList.add('critical');
                } else if (value <= 40) {
                    cardElement.classList.add('warning');
                }
            }
        }
    });
}

updateMoodDisplay() {
    const mood = this.calculateMood();
    const moodElement = document.getElementById('petMood');
    const activityElement = document.getElementById('petActivity');
    
    const moodData = {
        very_happy: { emoji: '😻', text: 'Sangat Bahagia' },
        happy: { emoji: '😊', text: 'Senang' },
        neutral: { emoji: '😐', text: 'Biasa' },
        sad: { emoji: '😢', text: 'Sedih' },
        sick: { emoji: '🤒', text: 'Sakit' }
    };
    
    const activityText = {
        idle: 'Sedang santai',
        eating: 'Sedang makan',
        playing: 'Sedang bermain',
        sleeping: 'Sedang tidur',
        sitting: 'Sedang duduk',
        happy: 'Sedang senang',
        stretching: 'Sedang meregangkan tubuh',
        grooming: 'Sedang membersihkan diri',
        emotional: 'Sedang berekspresi',
        active: 'Sedang aktif bergerak',
        sick: 'Sedang tidak enak badan',
        excited: 'Sedang sangat excited',
        sittingAlt: 'Sedang duduk santai'
    };
    
    if (moodElement) {
        moodElement.textContent = `${moodData[mood].emoji} ${moodData[mood].text}`;
    }
    
    if (activityElement) {
        let activityText_display = activityText[this.currentState] || 'Sedang beraktivitas';
        if (this.currentState === 'idle' && !this.isAnimating) {
            activityText_display = 'Siap bermain';
        }
        activityElement.textContent = activityText_display;
    }
    
    this.currentMood = mood;
}

updateGameInfo() {
    const elements = {
        totalActions: this.totalActions,
        felixScore: this.felixScore,
        levelBadge: `Lv. ${this.level}`,
        gameStatus: this.getGameStatus()
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
}

updateButtons() {
    const buttons = ['feed', 'play', 'sleep', 'heal', 'pet', 'groom'];
    
    buttons.forEach(action => {
        const button = document.getElementById(`${action}Btn`);
        if (button) {
            const isOnCooldown = this.behaviors.activityCooldowns[action] > Date.now();
            const hasEnergy = !(action === 'play' && this.stats.energy < 15);
            
            button.disabled = isOnCooldown || !hasEnergy;
        }
    });
}

updateGameClock() {
    const elapsed = Date.now() - this.gameStartTime;
    const hours = Math.floor(elapsed / 3600000);
    const minutes = Math.floor((elapsed % 3600000) / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    const clockElement = document.getElementById('gameClock');
    const playTimeElement = document.getElementById('playTime');
    
    if (clockElement) clockElement.textContent = timeString;
    if (playTimeElement) playTimeElement.textContent = timeString;
}


onFelixClick() {
    if (this.canPerformAction('pet')) {
        this.performAction('pet');
        this.showSpeechBubble('Halo! Terima kasih sudah memperhatikanku! 😽');
    }
}

handleKeyboard(event) {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;
    
    const keyActions = {
        'f': 'feed',
        'p': 'play',
        's': 'sleep',
        'h': 'heal',
        'e': 'pet',
        'g': 'groom'
    };
    
    const action = keyActions[event.key.toLowerCase()];
    if (action) {
        event.preventDefault();
        this.performAction(action);
    }
}

handleVisibilityChange() {
    this.isGameActive = !document.hidden;
    
    if (this.isGameActive) {
        this.showNotification('Selamat datang kembali! 👋', 'info');
        this.showSpeechBubble('Kamu kembali! Aku merindukanmu! 😽');
    }
}


showSpeechBubble(text, duration = 3000) {
    const bubble = document.getElementById('speechBubble');
    const bubbleText = document.getElementById('bubbleText');
    
    if (bubble && bubbleText) {
        bubbleText.textContent = text;
        bubble.classList.add('show');
        
        setTimeout(() => {
            bubble.classList.remove('show');
        }, duration);
    }
}

showNotification(message, type = 'success') {
    const container = document.getElementById('notificationContainer');
    if (!container) return;
    
    const activeNotifications = container.querySelectorAll('.notification');
    if (activeNotifications.length >= this.maxNotifications) {
        const oldest = activeNotifications[0];
        if (oldest) {
            this.removeNotification(oldest);
        }
    }
    
    const notificationKey = `${message}_${type}`;
    const now = Date.now();
    if (this.lastNotificationTime && 
        this.lastNotificationTime[notificationKey] && 
        now - this.lastNotificationTime[notificationKey] < 1000) {
        return;
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    container.appendChild(notification);
    

    if (!this.lastNotificationTime) {
        this.lastNotificationTime = {};
    }
    this.lastNotificationTime[notificationKey] = now;
    
  
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    const removeTimeout = setTimeout(() => {
        this.removeNotification(notification);
    }, 4000);
    
    this.notificationTimeouts.set(notification, removeTimeout);
}

removeNotification(notification) {
    if (!notification || !notification.parentNode) return;
    
    const timeout = this.notificationTimeouts.get(notification);
    if (timeout) {
        clearTimeout(timeout);
        this.notificationTimeouts.delete(notification);
    }
    
    notification.classList.remove('show');
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

addCriticalAlert(statName) {
    const alertsContainer = document.getElementById('statusAlerts');
    const alertMessages = {
        hunger: '🚨 SANGAT LAPAR!',
        happiness: '😢 SANGAT SEDIH!',
        energy: '💤 SANGAT LELAH!',
        health: '🆘 KESEHATAN KRITIS!'
    };
    
    if (alertsContainer) {
        alertsContainer.textContent = alertMessages[statName] || '';
    }
}


getGameStatus() {
    if (this.felixScore >= 1000) return 'Master';
    if (this.felixScore >= 500) return 'Expert';
    if (this.felixScore >= 200) return 'Advanced';
    if (this.felixScore >= 50) return 'Intermediate';
    return 'Pemula';
}

showRandomTip() {
    const randomTip = this.tips[Math.floor(Math.random() * this.tips.length)];
    const tipElement = document.getElementById('dailyTip');
    
    if (tipElement && tipElement.textContent !== randomTip) {
        tipElement.textContent = randomTip;
    }
}

checkHungerEffects() {
    if (this.stats.hunger < 20) {
        const now = Date.now();
        if (!this.lastHungerWarning || now - this.lastHungerWarning > 15000) {
            this.showNotification('⚠️ Felix sangat lapar!', 'warning');
            this.lastHungerWarning = now;
        }
    }
}

checkAchievements() {
    if (!this.achievementsUnlocked) {
        this.achievementsUnlocked = new Set();
    }
    
    const achievements = [
        { id: 'first_steps', condition: this.totalActions === 10, title: '🏆 Achievement: First Steps!' },
        { id: 'caring_owner', condition: this.totalActions === 50, title: '🏆 Achievement: Caring Owner!' },
        { id: 'felix_friend', condition: this.felixScore >= 100, title: '🏆 Achievement: Felix Friend!' },
        { id: 'dedicated_owner', condition: this.totalActions === 100, title: '🏆 Achievement: Dedicated Owner!' },
        { id: 'felix_master', condition: this.felixScore >= 500, title: '🏆 Achievement: Felix Master!' }
    ];
    
    achievements.forEach(achievement => {
        if (achievement.condition && !this.achievementsUnlocked.has(achievement.id)) {
            this.achievementsUnlocked.add(achievement.id);
            this.showNotification(achievement.title, 'success');
        }
    });
}

updateBehaviorPreferences(action) {
    if (!this.behaviors.preferences.activityCount) {
        this.behaviors.preferences.activityCount = {};
    }
    
    this.behaviors.preferences.activityCount[action] = 
        (this.behaviors.preferences.activityCount[action] || 0) + 1;
    
    const activities = Object.entries(this.behaviors.preferences.activityCount);
    if (activities.length > 0) {
        const mostFrequent = activities.sort(([,a], [,b]) => b - a)[0];
        this.behaviors.preferences.favoriteActivity = mostFrequent[0];
    }
}


showSettings() {
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
                <button onclick="window.virtualPet.clearAllNotifications()" style="padding: 8px 16px; background: #f97316; color: white; border: none; border-radius: 6px; cursor: pointer; margin-right: 10px;">
                    🗑️ Hapus Notifikasi
                </button>
                <button onclick="window.virtualPet.resetGame()" style="padding: 8px 16px; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer;">
                    🔄 Reset Game
                </button>
            </div>
        </div>
        <button onclick="window.virtualPet.closeModal(); window.virtualPet.applySettings();" style="padding: 10px 20px; background: #6366f1; color: white; border: none; border-radius: 8px; cursor: pointer;">
            Simpan & Tutup
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
    this.showNotification('✅ Pengaturan tersimpan!', 'success');
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
        this.showNotification('🔄 Game berhasil direset!', 'success');
        this.showSpeechBubble('Halo! Aku Felix yang baru! 😸');
    }
}

showHelp() {
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

showModal(content) {
    const modal = document.getElementById('modalOverlay');
    const modalContent = document.getElementById('modalContent');
    
    if (modal && modalContent) {
        modalContent.innerHTML = content;
        modal.classList.add('show');
    }
}

closeModal() {
    const modal = document.getElementById('modalOverlay');
    if (modal) {
        modal.classList.remove('show');
    }
}

toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    const soundBtn = document.getElementById('soundBtn');
    if (soundBtn) {
        soundBtn.textContent = this.soundEnabled ? '🔊 Suara' : '🔇 Suara';
    }
    this.showNotification(`Suara ${this.soundEnabled ? 'aktif' : 'nonaktif'}`, 'info');
}


saveGameData() {
    const gameData = {
        stats: this.stats,
        gameStartTime: this.gameStartTime,
        totalActions: this.totalActions,
        felixScore: this.felixScore,
        level: this.level,
        behaviors: this.behaviors,
        soundEnabled: this.soundEnabled,
        autoSaveEnabled: this.autoSaveEnabled,
        achievementsUnlocked: Array.from(this.achievementsUnlocked || []),
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

loadGameData() {
    try {
        const saved = localStorage.getItem('whiskerwise-save');
        if (saved) {
            const gameData = JSON.parse(saved);
            
            this.stats = { ...this.stats, ...gameData.stats };
            this.gameStartTime = gameData.gameStartTime || this.gameStartTime;
            this.totalActions = gameData.totalActions || 0;
            this.felixScore = gameData.felixScore || 0;
            this.level = gameData.level || 1;
            this.behaviors = { ...this.behaviors, ...gameData.behaviors };
            this.soundEnabled = gameData.soundEnabled !== undefined ? gameData.soundEnabled : true;
            this.autoSaveEnabled = gameData.autoSaveEnabled !== undefined ? gameData.autoSaveEnabled : true;
            this.achievementsUnlocked = new Set(gameData.achievementsUnlocked || []);
            
            this.showNotification('✅ Game berhasil dimuat!', 'success');
            return true;
        }
    } catch (error) {
        console.error('Load failed:', error);
    }
    return false;
}


showLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.classList.remove('hidden');
    }
}

hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
        }, 500);
    }
}

showWelcomeMessage() {
    setTimeout(() => {
        this.showNotification('🎉 Selamat datang di WhiskerWise!', 'success');
        this.showSpeechBubble('Halo! Aku Felix! Mari bermain bersama! 😸');
        
        this.isAnimating = false;
        this.setAnimation('idle', 0);
    }, 1000);
}
}

document.addEventListener('DOMContentLoaded', () => {
window.virtualPet = new WhiskerWiseEnhanced();

const modalOverlay = document.getElementById('modalOverlay');
if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
        if (e.target.id === 'modalOverlay') {
            window.virtualPet.closeModal();
        }
    });
}
});