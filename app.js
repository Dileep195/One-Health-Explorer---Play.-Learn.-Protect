// One Health Explorer Game Logic
class OneHealthExplorer {
  constructor() {
    this.currentScreen = 'welcome-screen';
    this.currentScene = 'scene-intro';
    this.gameState = {
      language: 'en',
      totalScore: 0,
      mission1: {
        cluesCollected: 0,
        visitedLocations: [],
        completed: false,
        score: 0
      },
      badges: {
        outbreakDetective: false,
        antibioticGuardian: false,
        animalAlly: false
      },
      settings: {
        soundEnabled: true
      }
    };
    
    this.clues = {
      chickens: { icon: '🐔', text: 'Sick Chickens', description: 'The chickens show respiratory symptoms. This could be Avian Influenza (Bird Flu).' },
      medicine: { icon: '💊', text: 'Ineffective Medicine', description: 'Antibiotics are not working. This suggests a viral infection, not a bacterial one.' },
      ventilation: { icon: '🌫️', text: 'Poor Ventilation & Mold', description: 'Dust and mold spores can worsen respiratory problems in both animals and humans.' }
    };
    
    this.correctTimelineOrder = ['chickens', 'ventilation', 'medicine'];
    this.currentTimelineOrder = [];
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.showScreen('welcome-screen');
    this.updateUI();
  }

  setupEventListeners() {
    // Back button handlers
    document.querySelectorAll('.back-btn-top').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetScreen = btn.dataset.backTo;
        this.showScreen(targetScreen);
      });
    });
    
    document.querySelectorAll('.back-btn-scene').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetScene = btn.dataset.backTo;
        this.showGameScene(targetScene);
      });
    });

    // Welcome screen
    document.getElementById('start-game').addEventListener('click', () => {
      this.showScreen('intro-screen');
    });
    
    document.getElementById('settings-btn').addEventListener('click', () => {
      this.showModal('settings-modal');
    });
    
    document.getElementById('language').addEventListener('change', (e) => {
      this.gameState.language = e.target.value;
      this.updateUI();
    });

    // Character introduction
    document.getElementById('ready-btn').addEventListener('click', () => {
      this.showScreen('missions-screen');
    });
    
    document.getElementById('tell-more-btn').addEventListener('click', () => {
      this.showModal('one-health-modal');
    });
    
    document.getElementById('got-it-btn').addEventListener('click', () => {
      this.hideModal('one-health-modal');
    });

    // Mission selection
    document.getElementById('mission-1').addEventListener('click', () => {
      this.startMission1();
    });
    
    document.getElementById('view-badges-btn').addEventListener('click', () => {
      this.showScreen('badges-screen');
    });
    
    document.getElementById('back-to-missions').addEventListener('click', () => {
      this.showScreen('missions-screen');
    });

    // Game scenes
    document.getElementById('start-investigation').addEventListener('click', () => {
      this.showGameScene('scene-map');
    });

    // Location navigation
    document.querySelectorAll('.location').forEach(location => {
      location.addEventListener('click', () => {
        const locationName = location.dataset.location;
        this.visitLocation(locationName);
      });
    });

    // Back to map buttons
    document.querySelectorAll('[id^="back-to-map"]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.showGameScene('scene-map');
      });
    });

    // Clickable items in locations
    document.getElementById('clickable-chicken').addEventListener('click', () => {
      this.showDialogue('👨‍🌾', "Aye, they've been like this for a week. I thought it would pass. We handle them every day, you know.", () => {
        this.collectClue('chickens');
      });
    });
    
    document.getElementById('clickable-medicine').addEventListener('click', () => {
      this.showDialogue('👩', "My son, Timmy, has a high fever and a terrible cough. The doctor gave us antibiotics, but they don't seem to be working!", () => {
        this.collectClue('medicine');
      });
    });
    
    document.getElementById('clickable-corner').addEventListener('click', () => {
      this.showDialogue('💡', 'This shed is poorly ventilated and the feed stored here is old and moldy.', () => {
        this.collectClue('ventilation');
      });
    });

    // Puzzle
    document.getElementById('solve-puzzle-btn').addEventListener('click', () => {
      this.showGameScene('scene-puzzle');
    });
    
    document.getElementById('check-solution').addEventListener('click', () => {
      this.checkPuzzleSolution();
    });

    // Completion actions
    document.getElementById('view-all-badges').addEventListener('click', () => {
      this.showScreen('badges-screen');
    });
    
    document.getElementById('back-to-missions-final').addEventListener('click', () => {
      this.showScreen('missions-screen');
    });

    // Modal controls
    document.getElementById('dialogue-close').addEventListener('click', () => {
      this.hideModal('dialogue-modal');
      if (this.dialogueCallback) {
        this.dialogueCallback();
        this.dialogueCallback = null;
      }
    });
    
    document.getElementById('clue-continue').addEventListener('click', () => {
      this.hideModal('clue-modal');
      if (this.clueCallback) {
        this.clueCallback();
        this.clueCallback = null;
      }
    });
    
    document.getElementById('info-continue').addEventListener('click', () => {
      this.hideModal('info-modal');
    });
    
    document.getElementById('settings-close').addEventListener('click', () => {
      this.hideModal('settings-modal');
    });

    // Quiz system
    document.getElementById('check-quiz').addEventListener('click', () => {
      this.checkQuizAnswer();
    });

    // Settings
    document.getElementById('sound-toggle').addEventListener('change', (e) => {
      this.gameState.settings.soundEnabled = e.target.checked;
    });
    
    document.getElementById('settings-language').addEventListener('change', (e) => {
      this.gameState.language = e.target.value;
      document.getElementById('language').value = e.target.value;
      this.updateUI();
    });

    this.setupDragAndDrop();
  }

  setupDragAndDrop() {
    // Quiz drag and drop
    const dragItems = document.querySelectorAll('.drag-item');
    const dropArea = document.querySelector('.drop-area');
    
    dragItems.forEach(item => {
      item.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', item.textContent);
        e.dataTransfer.setData('application/json', JSON.stringify({
          text: item.textContent,
          correct: item.dataset.correct === 'true'
        }));
        item.classList.add('dragging');
      });
      
      item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
      });
      
      // Touch support
      item.addEventListener('touchstart', (e) => {
        this.handleTouchStart(e, item);
      }, { passive: false });
    });

    if (dropArea) {
      dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropArea.parentElement.classList.add('drag-over');
      });
      
      dropArea.addEventListener('dragleave', () => {
        dropArea.parentElement.classList.remove('drag-over');
      });
      
      dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dropArea.parentElement.classList.remove('drag-over');
        
        const data = JSON.parse(e.dataTransfer.getData('application/json'));
        const droppedItem = document.createElement('div');
        droppedItem.className = 'dropped-item';
        droppedItem.textContent = data.text;
        droppedItem.dataset.correct = data.correct;
        droppedItem.style.cssText = 'background: var(--color-bg-3); padding: 8px; margin: 4px 0; border-radius: 4px; border: 1px solid var(--color-success);';
        
        dropArea.appendChild(droppedItem);
        
        // Enable check button if items are dropped
        if (dropArea.children.length > 0) {
          document.getElementById('check-quiz').disabled = false;
        }
      });
    }

    // Puzzle drag and drop
    const clueCards = document.querySelectorAll('.clue-card');
    const dropZones = document.querySelectorAll('.drop-zone');
    
    clueCards.forEach(card => {
      card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', card.dataset.clue);
        card.classList.add('dragging');
      });
      
      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
      });
      
      // Touch support
      card.addEventListener('touchstart', (e) => {
        this.handleTouchStartPuzzle(e, card);
      }, { passive: false });
    });

    dropZones.forEach(zone => {
      zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('drag-over');
      });
      
      zone.addEventListener('dragleave', () => {
        zone.classList.remove('drag-over');
      });
      
      zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('drag-over');
        
        // Clear any existing content
        zone.innerHTML = '';
        
        const clueType = e.dataTransfer.getData('text/plain');
        const clueData = this.clues[clueType];
        
        if (clueData) {
          const clueElement = document.createElement('div');
          clueElement.className = 'dropped-clue';
          clueElement.innerHTML = `
            <div class="clue-icon">${clueData.icon}</div>
            <div class="clue-text">${clueData.text}</div>
          `;
          clueElement.style.cssText = 'background: white; border: 2px solid var(--game-primary); border-radius: 8px; padding: 8px; text-align: center;';
          
          zone.appendChild(clueElement);
          zone.classList.add('filled');
          zone.dataset.clue = clueType;
          
          // Update timeline order
          const slotIndex = ['start', 'spread', 'impact'].indexOf(zone.parentElement.dataset.slot);
          this.currentTimelineOrder[slotIndex] = clueType;
          
          // Check if all slots are filled
          const filledSlots = document.querySelectorAll('.drop-zone.filled').length;
          if (filledSlots === 3) {
            document.getElementById('check-solution').disabled = false;
          }
        }
      });
    });
  }

  handleTouchStart(e, item) {
    e.preventDefault();
    const touch = e.touches[0];
    const dropArea = document.querySelector('.drop-area');
    
    // Simple touch handling - move item to drop area on touch
    const data = {
      text: item.textContent,
      correct: item.dataset.correct === 'true'
    };
    
    const droppedItem = document.createElement('div');
    droppedItem.className = 'dropped-item';
    droppedItem.textContent = data.text;
    droppedItem.dataset.correct = data.correct;
    droppedItem.style.cssText = 'background: var(--color-bg-3); padding: 8px; margin: 4px 0; border-radius: 4px; border: 1px solid var(--color-success);';
    
    dropArea.appendChild(droppedItem);
    
    if (dropArea.children.length > 0) {
      document.getElementById('check-quiz').disabled = false;
    }
  }

  handleTouchStartPuzzle(e, card) {
    e.preventDefault();
    
    // Simple touch handling for puzzle - cycle through drop zones
    const dropZones = document.querySelectorAll('.drop-zone:not(.filled)');
    if (dropZones.length > 0) {
      const zone = dropZones[0];
      
      // Clear any existing content
      zone.innerHTML = '';
      
      const clueType = card.dataset.clue;
      const clueData = this.clues[clueType];
      
      if (clueData) {
        const clueElement = document.createElement('div');
        clueElement.className = 'dropped-clue';
        clueElement.innerHTML = `
          <div class="clue-icon">${clueData.icon}</div>
          <div class="clue-text">${clueData.text}</div>
        `;
        clueElement.style.cssText = 'background: white; border: 2px solid var(--game-primary); border-radius: 8px; padding: 8px; text-align: center;';
        
        zone.appendChild(clueElement);
        zone.classList.add('filled');
        zone.dataset.clue = clueType;
        
        // Update timeline order
        const slotIndex = ['start', 'spread', 'impact'].indexOf(zone.parentElement.dataset.slot);
        this.currentTimelineOrder[slotIndex] = clueType;
        
        // Check if all slots are filled
        const filledSlots = document.querySelectorAll('.drop-zone.filled').length;
        if (filledSlots === 3) {
          document.getElementById('check-solution').disabled = false;
        }
      }
    }
  }

  showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('active');
    });
    
    // Show target screen
    const targetScreen = document.getElementById(screenId);
    targetScreen.classList.add('active');
    this.currentScreen = screenId;
    
    // Smooth scroll to top of new screen
    targetScreen.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Update UI when showing certain screens
    if (screenId === 'missions-screen') {
      this.updateMissionScreen();
    } else if (screenId === 'badges-screen') {
      this.updateBadgesScreen();
    }
  }

  showGameScene(sceneId) {
    // Hide all game scenes
    document.querySelectorAll('.game-scene').forEach(scene => {
      scene.classList.remove('active');
    });
    
    // Show target scene
    const targetScene = document.getElementById(sceneId);
    targetScene.classList.add('active');
    this.currentScene = sceneId;
    
    // Smooth scroll to the scene
    setTimeout(() => {
      targetScene.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  showModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('active');
    modal.style.display = 'flex';
  }

  hideModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
    modal.style.display = 'none';
  }

  startMission1() {
    this.showScreen('game-screen');
    setTimeout(() => {
      this.showGameScene('scene-intro');
    }, 300);
    // Reset mission state
    this.gameState.mission1 = {
      cluesCollected: 0,
      visitedLocations: [],
      completed: false,
      score: 0
    };
    this.currentTimelineOrder = [];
    // Reset puzzle state
    document.querySelectorAll('.drop-zone').forEach(zone => {
      zone.innerHTML = '';
      zone.classList.remove('filled');
      delete zone.dataset.clue;
    });
    document.getElementById('check-solution').disabled = true;
    this.updateUI();
  }

  visitLocation(locationName) {
    const locationMap = {
      'coop': 'location-coop',
      'house': 'location-house', 
      'shed': 'location-shed'
    };
    
    if (locationMap[locationName]) {
      this.showGameScene(locationMap[locationName]);
      
      // Mark location as visited
      if (!this.gameState.mission1.visitedLocations.includes(locationName)) {
        this.gameState.mission1.visitedLocations.push(locationName);
        document.getElementById(locationName === 'coop' ? 'chicken-coop' : locationName === 'house' ? 'farmhouse' : 'feed-shed')
          .classList.add('visited');
      }
    }
  }

  showDialogue(character, text, callback) {
    document.getElementById('dialogue-character').textContent = character;
    document.getElementById('dialogue-text').textContent = text;
    this.dialogueCallback = callback;
    this.showModal('dialogue-modal');
  }

  collectClue(clueType) {
    const clue = this.clues[clueType];
    if (!clue) return;
    
    // Show clue unlock animation
    document.getElementById('clue-icon').textContent = clue.icon;
    document.getElementById('clue-description').textContent = clue.description;
    
    this.gameState.mission1.cluesCollected++;
    this.gameState.mission1.score += 5; // Points for collecting clue
    
    this.clueCallback = () => {
      // Show location-specific content after clue
      if (clueType === 'chickens') {
        this.showQuiz();
      } else if (clueType === 'medicine') {
        this.showInfoGraphic();
      } else {
        // For ventilation clue, just return to map
        this.showGameScene('scene-map');
      }
    };
    
    this.showModal('clue-modal');
    this.updateUI();
  }

  showQuiz() {
    this.showModal('quiz-modal');
  }

  checkQuizAnswer() {
    const droppedItems = document.querySelectorAll('.dropped-item');
    let correctCount = 0;
    let totalCount = droppedItems.length;
    
    droppedItems.forEach(item => {
      if (item.dataset.correct === 'true') {
        correctCount++;
      }
    });
    
    const feedback = document.getElementById('quiz-feedback');
    
    if (correctCount >= 2 && totalCount <= 4) { // At least 2 correct, not too many total
      feedback.textContent = 'Correct! Diseases like Bird Flu can spread through close contact with sick birds or their droppings, making the air dusty and dangerous to breathe. +10 points!';
      feedback.className = 'quiz-feedback correct';
      this.gameState.mission1.score += 10;
    } else {
      feedback.textContent = 'Not quite! Remember: Bird flu spreads through direct contact with sick birds, their droppings, and airborne dust particles. Try again!';
      feedback.className = 'quiz-feedback incorrect';
    }
    
    feedback.style.display = 'block';
    
    setTimeout(() => {
      this.hideModal('quiz-modal');
      this.showGameScene('scene-map');
      // Reset quiz
      document.querySelector('.drop-area').innerHTML = '';
      document.getElementById('check-quiz').disabled = true;
      feedback.style.display = 'none';
    }, 3000);
  }

  showInfoGraphic() {
    this.showModal('info-modal');
  }

  checkPuzzleSolution() {
    const isCorrect = JSON.stringify(this.currentTimelineOrder) === JSON.stringify(this.correctTimelineOrder);
    
    if (isCorrect) {
      this.gameState.mission1.score += 20; // Puzzle completion points
      this.gameState.mission1.completed = true;
      
      // Award badges
      this.gameState.badges.outbreakDetective = true;
      this.gameState.badges.antibioticGuardian = true;
      this.gameState.badges.animalAlly = true;
      
      // Add mission completion bonus
      this.gameState.mission1.score += 50;
      this.gameState.totalScore += this.gameState.mission1.score;
      
      this.showGameScene('scene-completion');
      
      // Update final score display
      document.getElementById('mission-score').textContent = this.gameState.mission1.score;
    } else {
      alert('Not quite right! Think about the order: What started the problem? How did it spread? What was the human impact?');
    }
    
    this.updateUI();
  }

  updateUI() {
    // Update clue counter
    const cluesFound = document.getElementById('clues-found');
    if (cluesFound) {
      cluesFound.textContent = this.gameState.mission1.cluesCollected;
    }
    
    // Show puzzle button when all clues collected
    const puzzleBtn = document.getElementById('solve-puzzle-btn');
    if (puzzleBtn) {
      puzzleBtn.style.display = this.gameState.mission1.cluesCollected >= 3 ? 'block' : 'none';
    }
    
    // Update stats
    document.getElementById('total-score').textContent = this.gameState.totalScore;
    
    const earnedBadges = Object.values(this.gameState.badges).filter(Boolean).length;
    document.getElementById('badge-count').textContent = `${earnedBadges}/9`;
  }

  updateMissionScreen() {
    // Update mission card states based on completion
    const mission1Card = document.getElementById('mission-1');
    if (this.gameState.mission1.completed) {
      mission1Card.classList.add('completed');
    }
  }

  updateBadgesScreen() {
    const badgesGrid = document.getElementById('badges-grid');
    const badges = [
      { key: 'outbreakDetective', name: 'Outbreak Detective', icon: '🕵️‍♂️', description: 'Solved a complex zoonotic disease case' },
      { key: 'antibioticGuardian', name: 'Antibiotic Guardian', icon: '🛡️', description: 'Prevented antibiotic misuse and fought AMR' },
      { key: 'animalAlly', name: 'Animal Ally', icon: '🤝', description: 'Improved animal welfare' },
      { key: 'waterProtector', name: 'Water Protector', icon: '💧', description: 'Protected water sources from contamination' },
      { key: 'diseaseTracker', name: 'Disease Tracker', icon: '🔍', description: 'Traced disease transmission pathways' },
      { key: 'communityHero', name: 'Community Hero', icon: '🏆', description: 'Helped entire communities stay healthy' },
      { key: 'environmentGuardian', name: 'Environment Guardian', icon: '🌱', description: 'Protected environmental health' },
      { key: 'oneHealthChampion', name: 'One Health Champion', icon: '⭐', description: 'Mastered all One Health principles' },
      { key: 'globalProtector', name: 'Global Protector', icon: '🌍', description: 'Contributed to worldwide health security' }
    ];
    
    badgesGrid.innerHTML = badges.map(badge => {
      const earned = this.gameState.badges[badge.key] || false;
      return `
        <div class="badge-item ${earned ? 'earned' : 'locked'}">
          <div class="badge-icon">${badge.icon}</div>
          <h4 class="badge-name">${badge.name}</h4>
          <p class="badge-description">${badge.description}</p>
          ${earned ? '<div class="earned-indicator">✓ EARNED</div>' : '<div class="locked-indicator">🔒 LOCKED</div>'}
        </div>
      `;
    }).join('');
    
    // Update progress bar
    const earnedCount = Object.values(this.gameState.badges).filter(Boolean).length;
    const progress = (earnedCount / badges.length) * 100;
    document.getElementById('progress-fill').style.width = `${progress}%`;
  }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.game = new OneHealthExplorer();
});