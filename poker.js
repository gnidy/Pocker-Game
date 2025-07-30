// Add button click effect helper function
function addButtonClickEffect(button, callback) {
    if (!button) return;
    
    // Add click animation class
    button.classList.add('clicked');
    
    // Remove the class after animation completes
    setTimeout(() => {
        button.classList.remove('clicked');
    }, 600);
    
    // Add a slight delay to the action for better UX
    const originalText = button.textContent;
    button.disabled = true;
    
    // Execute the callback after a short delay
    setTimeout(() => {
        if (typeof callback === 'function') {
            callback();
        }
        button.disabled = false;
    }, 200);
}

// Game state
const gameState = {
    deck: [],
    playerHand: [],
    computerHand: [],
    communityCards: [],
    pot: 0,
    playerChips: 1000,
    computerChips: 1000,
    currentBet: 0,
    currentPlayer: 'player',
    gamePhase: 'preflop',
    playerFolded: false,
    computerFolded: false,
    minRaise: 20,
    lastRaiseAmount: 0,
    currentRoundBets: { player: 0, computer: 0 },
    gameLog: []
};

// Update chips display
function updateChipsDisplay() {
    const playerChipsElement = document.getElementById('player-chips');
    const computerChipsElement = document.getElementById('opponent-chips');
    
    if (playerChipsElement) {
        playerChipsElement.textContent = `$${gameState.playerChips}`;
    }
    
    if (computerChipsElement) {
        computerChipsElement.textContent = `$${gameState.computerChips}`;
    }
}

// Add a message to the game log
function addToLog(message, type = 'system') {
    const logElement = document.getElementById('log-content');
    if (logElement) {
        const messageElement = document.createElement('p');
        messageElement.textContent = message;
        
        // Add appropriate class based on message type
        messageElement.className = type + '-message';
        
        logElement.appendChild(messageElement);
        logElement.scrollTop = logElement.scrollHeight; // Auto-scroll to bottom
        console.log('Log:', message); // Also log to console for debugging
    } else {
        console.error('Log element not found');
    }
    
    // Add to game state log
    if (!gameState.gameLog) {
        gameState.gameLog = [];
    }
    gameState.gameLog.push(message);
}

// Handle call action
function handleCall() {
    console.log('Call button clicked');
    if (gameState.currentPlayer !== 'player') {
        console.log('Not your turn to call');
        return;
    }
    
    const callAmount = gameState.currentBet - gameState.currentRoundBets.player;
    
    if (callAmount > gameState.playerChips) {
        addToLog("You don't have enough chips to call!");
        return;
    }
    
    gameState.playerChips -= callAmount;
    gameState.pot += callAmount;
    gameState.currentRoundBets.player = gameState.currentBet;
    
    addToLog(`You call $${callAmount}.`, 'player');
    updateChipsDisplay();
    updatePotDisplay();
    
    // Disable buttons until computer makes a move
    disablePlayerActions();
    
    // Computer's turn
    addToLog(`Computer's turn...`, 'computer');
    setTimeout(computerTurn, 1000);
}

// Update pot display
function updatePotDisplay() {
    const potElement = document.getElementById('pot');
    if (potElement) {
        potElement.textContent = `$${gameState.pot}`;
    }
}

// Card suits and ranks
const Suit = {
    HEARTS: '♥',
    DIAMONDS: '♦',
    CLUBS: '♣',
    SPADES: '♠'
};

const Rank = {
    TWO: '2', THREE: '3', FOUR: '4', FIVE: '5', SIX: '6', SEVEN: '7',
    EIGHT: '8', NINE: '9', TEN: '10', JACK: 'J', QUEEN: 'Q', KING: 'K', ACE: 'A'
};

// Initialize the game when the DOM is fully loaded
console.log('Poker game script loaded');

// Initialize game state with default values
window.gameState = {
    deck: [],
    playerHand: [],
    computerHand: [],
    communityCards: [],
    playerChips: 1000,
    computerChips: 1000,
    pot: 0,
    currentBet: 0,
    minRaise: 20,
    playerFolded: false,
    computerFolded: false,
    gamePhase: 'preflop',
    currentPlayer: 'player',
    currentRoundBets: { player: 0, computer: 0 },
    lastAggressor: null
};

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded, initializing game...');
    
    // Show start modal
    const startModal = document.getElementById('start-modal');
    if (startModal) {
        startModal.classList.add('show');
    } else {
        console.error('Start modal not found!');
    }
    
    // Start game button
    const startGameBtn = document.getElementById('start-game');
    if (startGameBtn) {
        startGameBtn.addEventListener('click', () => {
            console.log('Start game button clicked');
            if (startModal) startModal.classList.remove('show');
            initializeGame();
        });
    } else {
        console.error('Start game button not found!');
    }
    
    // Next round button
    const nextRoundBtn = document.getElementById('next-round');
    if (nextRoundBtn) {
        nextRoundBtn.addEventListener('click', () => {
            console.log('Next round button clicked');
            const resultModal = document.getElementById('result-modal');
            if (resultModal) resultModal.classList.remove('show');
            startNewRound();
        });
    }
    
    // Initialize bet slider
    const betSlider = document.getElementById('bet-slider');
    const betAmount = document.getElementById('bet-amount');
    
    if (betSlider && betAmount) {
        betSlider.min = gameState.minRaise;
        betSlider.max = gameState.playerChips;
        betSlider.value = Math.min(100, gameState.playerChips);
        betAmount.textContent = betSlider.value;
        
        betSlider.addEventListener('input', () => {
            betAmount.textContent = betSlider.value;
        });
    }
    
    // Initialize button listeners
    setupButtonListeners();
    
    console.log('Game initialization complete');
});

// Set up all button event listeners
function setupButtonListeners() {
    console.log('Setting up button listeners...');
    
    // Fold button
    const foldBtn = document.getElementById('fold-btn');
    if (foldBtn) {
        console.log('Found fold button, adding event listener');
        foldBtn.onclick = handleFold;
    } else {
        console.error('Fold button not found!');
    }
    
    // Action buttons with click effects
    const actionButtons = {
        'check-btn': handleCheck,
        'call-btn': handleCall,
        'fold-btn': handleFold,
        'bet-btn': handleBet
    };

    // Set up event listeners for all action buttons
    Object.entries(actionButtons).forEach(([id, handler]) => {
        const button = document.getElementById(id);
        if (button) {
            button.onclick = function() {
                addButtonClickEffect(button, () => {
                    handler.call(this);
                });
            };
            console.log(`Added click handler for ${id}`);
        } else {
            console.error(`Button not found: ${id}`);
        }
    });
    
    // Next Round button
    const nextRoundBtn = document.getElementById('next-round-btn');
    if (nextRoundBtn) {
        console.log('Found Next Round button, adding event listener');
        nextRoundBtn.onclick = startNewRound;
    } else {
        console.error('Next Round button not found!');
    }
    
    console.log('Button event listeners initialized');
}

function updateBetAmount() {
    const betSlider = document.getElementById('bet-slider');
    const betAmount = document.getElementById('bet-amount');
    if (!betSlider || !betAmount) return;
    
    const amount = parseInt(betSlider.value) || 0;
    betAmount.textContent = amount;
    
    // Enable/disable bet button based on valid bet amount
    const betBtn = document.getElementById('bet-btn');
    if (!betBtn) return;
    
    const minBet = Math.max(gameState.minRaise, gameState.currentBet * 2 - gameState.currentRoundBets.player);
    betBtn.disabled = amount < minBet || amount > gameState.playerChips;
    
    // Update call button text
    const callBtn = document.getElementById('call-btn');
    if (!callBtn) return;
    
    const amountToCall = gameState.currentBet - gameState.currentRoundBets.player;
    if (amountToCall > 0) {
        callBtn.textContent = `Call $${amountToCall}`;
        callBtn.disabled = false;
    }
    
    // Disable check button if there's a bet to call
    const checkBtn = document.getElementById('check-btn');
    if (checkBtn) {
        checkBtn.disabled = amountToCall > 0;
    }
}

// Clear the game log
function clearLog() {
    const logContent = document.getElementById('log-content');
    if (logContent) {
        logContent.innerHTML = '';
    }
    
    // Clear the game log in state
    gameState.gameLog = [];
}

// Clear the table (reset UI elements)
function clearTable() {
    console.log('Clearing table...');
    const playerHandElement = document.getElementById('player-hand');
    const computerHandElement = document.getElementById('opponent-hand');
    const communityCardsElement = document.getElementById('community-cards');
    
    if (playerHandElement) playerHandElement.innerHTML = '';
    if (computerHandElement) computerHandElement.innerHTML = '';
    if (communityCardsElement) communityCardsElement.innerHTML = '';
    
    // Reset any other UI elements as needed
    const betSlider = document.getElementById('bet-slider');
    const betAmount = document.getElementById('bet-amount');
    
    if (betSlider && betAmount) {
        betSlider.value = Math.min(100, gameState.playerChips);
        betAmount.textContent = betSlider.value;
    }
}

// Advance the game to the next phase
function advanceGame() {
    console.log('Advancing game to next phase...');
    
    // Reset round-specific state
    gameState.currentBet = 0;
    gameState.currentRoundBets = { player: 0, computer: 0 };
    gameState.lastAggressor = null;
    
    // Determine next game phase
    switch (gameState.gamePhase) {
        case 'preflop':
            gameState.gamePhase = 'flop';
            dealFlop();
            break;
            
        case 'flop':
            gameState.gamePhase = 'turn';
            dealTurn();
            break;
            
        case 'turn':
            gameState.gamePhase = 'river';
            dealRiver();
            break;
            
        case 'river':
            // Showdown - determine the winner
            endRound();
            return; // Don't continue to player's turn
    }
    
    // If we get here, it's the player's turn
    gameState.currentPlayer = 'player';
    updateUIForPlayerTurn();
}

// Computer's turn logic
function computerTurn() {
    console.log('Computer\'s turn');
    gameState.currentPlayer = 'computer';
    
    // Small delay for better UX
    setTimeout(() => {
        if (gameState.computerFolded) {
            console.log('Computer has already folded');
            return;
        }
        
        // Calculate call amount
        const callAmount = gameState.currentBet - gameState.currentRoundBets.computer;
        
        // Simple AI decision making based on hand strength and game state
        const handStrength = evaluateComputerHandStrength(callAmount);
        const randomFactor = Math.random();
        let actionTaken = false;
        
        // 1. Check if computer needs to call
        if (callAmount > 0) {
            // If computer doesn't have enough chips to call, go all-in or fold
            if (callAmount >= gameState.computerChips) {
                const allInAmount = gameState.computerChips;
                gameState.computerChips = 0;
                gameState.pot += allInAmount;
                gameState.currentRoundBets.computer += allInAmount;
                addToLog(`Computer goes all-in with $${allInAmount}!`, 'computer');
                actionTaken = true;
                
                // If computer is all-in, end the betting round
                if (gameState.computerChips === 0) {
                    advanceGame();
                } else {
                    gameState.currentPlayer = 'player';
                    updateUIForPlayerTurn();
                }
            } 
            // If computer has a weak hand and needs to call a big bet, consider folding
            else if (handStrength < 0.3 && callAmount > (gameState.computerChips * 0.3)) {
                gameState.computerFolded = true;
                addToLog('Computer folds.', 'computer');
                actionTaken = true;
                endRound('player');
            }
        }
        
        // 2. If no action taken yet, decide on next move
        if (!actionTaken) {
            // Calculate raise amount (if deciding to raise)
            const minRaise = Math.max(gameState.minRaise, callAmount * 2);
            const maxRaise = Math.min(gameState.computerChips, gameState.computerChips * 0.5); // Don't bet more than 50% of chips
            
            // More sophisticated decision making with bluffing
            const potOdds = callAmount / (gameState.pot + callAmount);
            const isPreFlop = gameState.communityCards.length === 0;
            const isFlop = gameState.communityCards.length === 3;
            const isTurn = gameState.communityCards.length === 4;
            const isRiver = gameState.communityCards.length === 5;
            
            // Create a new variable for adjusted hand strength
            let adjustedHandStrength = handStrength;
            let bluffChance = 0.1; // 10% base chance to bluff
            
            // Adjust strategy based on game phase and position
            if (isPreFlop) {
                // Tighter play pre-flop but with occasional bluffs
                adjustedHandStrength = handStrength * 0.9;
                bluffChance = 0.15; // Higher bluff chance pre-flop
            } else if (isFlop) {
                // More aggressive on the flop
                adjustedHandStrength = handStrength * 1.1;
                bluffChance = 0.2; // Even higher bluff chance on flop
            } else if (isTurn || isRiver) {
                // More conservative on later streets but with bigger bluffs
                adjustedHandStrength = handStrength * 1.2;
                bluffChance = 0.15;
            }
            
            // Calculate aggression factor with more variance for bluffing
            let aggression = 0.8 + (Math.random() * 0.4) - 0.2;
            
            // Random bluff opportunity
            const shouldBluff = Math.random() < bluffChance;
            if (shouldBluff) {
                // When bluffing, increase aggression and hand strength
                adjustedHandStrength = Math.min(1, adjustedHandStrength * 1.5);
                aggression = 1.2 + (Math.random() * 0.3); // More aggressive when bluffing
                console.log('Computer is bluffing!');
            }
        
        // Decision making based on hand strength, pot odds, and bluffing
        const shouldRaise = adjustedHandStrength > 0.6 && 
                          (adjustedHandStrength > potOdds * 1.2 || 
                           randomFactor < 0.8 || 
                           shouldBluff);
        
            if (shouldRaise) {
                // Strong hand or bluff - raise or re-raise
                let raiseFactor = 0.6 + (adjustedHandStrength * 0.5); // 0.6 to 1.1
                
                // Bigger raises when bluffing to make it convincing
                if (shouldBluff) {
                    raiseFactor = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2
                }
                
                const raiseAmount = Math.max(
                    minRaise,
                    Math.min(
                        Math.floor(raiseFactor * maxRaise * aggression),
                        maxRaise
                    )
                );
                
                if (raiseAmount >= minRaise) {
                    gameState.computerChips -= (callAmount + raiseAmount);
                    gameState.pot += (callAmount + raiseAmount);
                    gameState.currentBet = gameState.currentRoundBets.computer + callAmount + raiseAmount;
                    gameState.currentRoundBets.computer = gameState.currentBet;
                    gameState.lastAggressor = 'computer';
                    gameState.lastRaiseAmount = raiseAmount;
                    
                    let raiseMessage;
                    if (shouldBluff) {
                        // More confident-sounding messages when bluffing
                        const bluffMessages = [
                            `Computer confidently raises to $${gameState.currentBet}.`,
                            `Computer quickly raises to $${gameState.currentBet}.`,
                            `Computer doesn't hesitate and raises to $${gameState.currentBet}.`
                        ];
                        raiseMessage = bluffMessages[Math.floor(Math.random() * bluffMessages.length)];
                    } else {
                        raiseMessage = callAmount > 0 ? 
                            `Computer raises to $${gameState.currentBet}.` : 
                            `Computer bets $${raiseAmount}.`;
                    }
                addToLog(raiseMessage, 'computer');
                
                gameState.currentPlayer = 'player';
                updateUIForPlayerTurn();
                actionTaken = true;
            }
        } 
        
        // If didn't raise, check if should call/check
        if (!actionTaken) {
            if (callAmount > 0) {
                // More sophisticated call/fold decision
                const callThreshold = Math.min(0.3, potOdds * 0.8);
                const shouldCall = handStrength > callThreshold || 
                                 (handStrength > callThreshold * 0.7 && randomFactor < 0.6);
                
                if (shouldCall) {
                    gameState.computerChips -= callAmount;
                    gameState.pot += callAmount;
                    gameState.currentRoundBets.computer = gameState.currentBet;
                    
                    // More descriptive call messages
                    if (callAmount >= gameState.computerChips * 0.5) {
                        addToLog(`Computer calls all-in with $${callAmount}!`, 'computer');
                    } else if (callAmount > gameState.computerChips * 0.2) {
                        addToLog(`Computer makes a big call of $${callAmount}.`, 'computer');
                    } else {
                        addToLog(`Computer calls $${callAmount}.`, 'computer');
                    }
                } else {
                    gameState.computerFolded = true;
                    addToLog('Computer folds.', 'computer');
                    endRound('player');
                    actionTaken = true;
                }
            } else {
                // Check if no bet to call
                if (handStrength > 0.5 && randomFactor < 0.3) {
                    // Sometimes check with strong hands to trap
                    addToLog('Computer checks (trapping...).', 'computer');
                } else {
                    addToLog('Computer checks.', 'computer');
                }
            }
                
                // If we called or checked, advance the game
                if (!actionTaken) {
                    advanceGame();
                }
            }
        }
        
        // Update UI
        updateChipsDisplay();
        updatePotDisplay();
        
    }, 1000); // Delay for better UX
    
    // Helper function to evaluate computer's hand strength with more sophistication
    function evaluateComputerHandStrength(callAmount = 0) {
        const allCards = [...gameState.computerHand, ...gameState.communityCards];
        if (allCards.length < 2) return 0.4; // Slightly more conservative default
        
        // Use our improved hand evaluation
        const handScore = evaluateHandStrength(allCards);
        
        // Convert hand score to a 0-1 strength value
        let strength = handScore / 10; // Since we return 1-10 from evaluateHandStrength
        
        // Adjust based on number of players (simplified for heads-up)
        strength = Math.min(1, strength * 1.2); // Slightly more aggressive in heads-up
        
        // Consider position (later position is stronger)
        const isLatePosition = gameState.communityCards.length >= 3; // After flop
        if (isLatePosition) {
            strength = Math.min(1, strength * 1.1);
        }
        
        // Consider pot odds
        const potOdds = callAmount / (gameState.pot + callAmount);
        if (callAmount > 0) {
            // Adjust strength based on pot odds
            if (strength > potOdds * 1.5) {
                // Good pot odds - increase confidence
                strength = Math.min(1, strength * 1.2);
            } else if (strength < potOdds * 0.7) {
                // Poor pot odds - reduce confidence
                strength *= 0.8;
            }
        }
        
        // Add some randomness to make the AI less predictable
        const randomFactor = 0.9 + (Math.random() * 0.2); // Between 0.9 and 1.1
        strength = Math.max(0, Math.min(1, strength * randomFactor));
        
        return strength;
        strength += Math.min(highCards * 0.1, 0.3); // Up to 0.3 for high cards
        strength += Math.min(pairs * 0.1, 0.2);     // Up to 0.2 for pairs
        strength += threeOfAKind ? 0.2 : 0;         // 0.2 for three of a kind
        strength += flush ? 0.3 : 0;                // 0.3 for flush
        
        return Math.min(Math.max(strength, 0.1), 0.95); // Keep between 0.1 and 0.95
    }
}

// Initialize a new game
function initializeGame() {
    console.log('Initializing new game...');
    
    try {
        // Reset game state
        gameState.deck = createDeck();
        gameState.playerHand = [];
        gameState.computerHand = [];
        gameState.communityCards = [];
        gameState.pot = 0;
        gameState.currentBet = 0;
        gameState.playerFolded = false;
        gameState.computerFolded = false;
        gameState.gamePhase = 'preflop';
        gameState.currentRoundBets = { player: 0, computer: 0 };
        gameState.lastAggressor = null;
        
        console.log('Game state reset');
        
        // Update UI
        updateChipsDisplay();
        updatePotDisplay();
        clearTable();
        clearLog();
        
        // Deal initial hands
        console.log('Dealing initial hands...');
        dealInitialHands();
        
        // Post blinds
        console.log('Posting blinds...');
        postBlinds();
        
        // Start the game with player's turn
        gameState.currentPlayer = 'player';
        console.log('Updating UI for player turn...');
        
        // Force UI update
        setTimeout(() => {
            updateUIForPlayerTurn();
            
            // Debug: Check if cards are in the deck
            console.log('Deck size:', gameState.deck.length);
            console.log('Player hand:', gameState.playerHand);
            console.log('Computer hand:', gameState.computerHand);
            
            // Force redraw of cards
            displayPlayerHand();
            displayComputerHand();
        }, 100);
        
        // Log game start
        addToLog('New game started! Good luck!', 'system');
        console.log('Game initialization complete');
        
    } catch (error) {
        console.error('Error initializing game:', error);
        addToLog('Error starting game. Please refresh the page.', 'system');
    }
}

// Create a new shuffled deck
function createDeck() {
    const deck = [];
    const suits = Object.values(Suit);
    const ranks = Object.values(Rank);
    
    console.log('Creating deck with suits:', suits);
    console.log('And ranks:', ranks);
    
    for (const suit of suits) {
        for (const rank of ranks) {
            deck.push({ suit, rank });
        }
    }
    
    console.log('Deck created with', deck.length, 'cards');
    
    // Shuffle the deck using Fisher-Yates algorithm
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    console.log('Deck shuffled');
    return deck;
}

// Deal initial two cards to each player
function dealInitialHands() {
    // Clear existing hands
    gameState.playerHand = [];
    gameState.computerHand = [];
    
    console.log('Dealing initial hands from deck of size:', gameState.deck.length);
    
    // Ensure we have enough cards
    if (gameState.deck.length < 4) {
        console.error('Not enough cards in deck!');
        return;
    }
    
    // Deal two cards to each player
    for (let i = 0; i < 2; i++) {
        const playerCard = gameState.deck.pop();
        const computerCard = gameState.deck.pop();
        
        if (playerCard) {
            gameState.playerHand.push(playerCard);
            console.log('Dealt to player:', playerCard);
        }
        if (computerCard) {
            gameState.computerHand.push(computerCard);
            console.log('Dealt to computer:', computerCard);
        }
    }
    
    console.log('Player hand:', gameState.playerHand);
    console.log('Computer hand:', gameState.computerHand);
    
    // Display hands
    displayPlayerHand();
    displayComputerHand();
    
    // Log player's hand
    const playerCard1 = gameState.playerHand[0];
    const playerCard2 = gameState.playerHand[1];
    addToLog(`Your cards: ${playerCard1.rank}${playerCard1.suit} ${playerCard2.rank}${playerCard2.suit}`, 'player');
}

// Post small and big blinds
function postBlinds() {
    const smallBlind = 10;
    const bigBlind = 20;
    
    // Player posts small blind
    gameState.playerChips -= smallBlind;
    gameState.currentRoundBets.player = smallBlind;
    
    // Computer posts big blind
    gameState.computerChips -= bigBlind;
    gameState.currentRoundBets.computer = bigBlind;
    
    gameState.currentBet = bigBlind;
    gameState.pot = smallBlind + bigBlind;
    
    updateChipsDisplay();
    updatePotDisplay();
    
    addToLog(`You post small blind: $${smallBlind}`, 'player');
    addToLog(`Computer posts big blind: $${bigBlind}`, 'computer');
}

// Display player's hand
function displayPlayerHand() {
    console.log('Displaying player hand...');
    const playerHandElement = document.getElementById('player-hand');
    if (!playerHandElement) {
        console.error('Player hand element not found!');
        return;
    }
    
    playerHandElement.innerHTML = '';
    
    if (!gameState.playerHand || gameState.playerHand.length === 0) {
        console.warn('No cards in player hand to display');
        return;
    }
    
    // Create a container for the cards
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'cards-container';
    cardsContainer.style.display = 'flex';
    cardsContainer.style.justifyContent = 'center';
    cardsContainer.style.flexWrap = 'wrap';
    cardsContainer.style.gap = '10px';
    
    gameState.playerHand.forEach((card, index) => {
        console.log(`Creating player card ${index}:`, card);
        const cardElement = createCardElement(card);
        if (cardElement) {
            cardsContainer.appendChild(cardElement);
        }
    });
    
    playerHandElement.appendChild(cardsContainer);
    console.log('Player hand displayed');
}

// Display computer's hand
// @param {boolean} showCards - If true, shows the actual cards. If false, shows face down.
function displayComputerHand(showCards = false) {
    console.log('Displaying computer hand. Show cards:', showCards);
    const computerHandElement = document.getElementById('opponent-hand');
    if (!computerHandElement) {
        console.error('Computer hand element not found!');
        return;
    }
    
    computerHandElement.innerHTML = '';
    
    // Create a container for the cards
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'cards-container';
    cardsContainer.style.display = 'flex';
    cardsContainer.style.justifyContent = 'center';
    cardsContainer.style.flexWrap = 'wrap';
    cardsContainer.style.gap = '10px';
    
    if (showCards) {
        // Show actual cards
        gameState.computerHand.forEach(card => {
            const cardElement = createCardElement(card);
            if (cardElement) {
                cardsContainer.appendChild(cardElement);
            }
        });
        // Add a label
        const label = document.createElement('div');
        label.textContent = "Computer's Cards:";
        label.style.width = '100%';
        label.style.textAlign = 'center';
        label.style.marginBottom = '5px';
        computerHandElement.appendChild(label);
    } else {
        // Show face down cards
        gameState.computerHand.forEach(() => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card face-down';
            cardElement.textContent = '🂠';
            cardsContainer.appendChild(cardElement);
        });
    }
    
    computerHandElement.appendChild(cardsContainer);
    console.log('Computer hand displayed');
}

// Create a card element
function createCardElement(card) {
    console.log('Creating card element for:', card);
    
    if (!card || !card.suit || !card.rank) {
        console.error('Invalid card data:', card);
        const errorCard = document.createElement('div');
        errorCard.className = 'card';
        errorCard.textContent = '';
        errorCard.style.color = 'red';
        errorCard.style.display = 'flex';
        errorCard.style.justifyContent = 'center';
        errorCard.style.alignItems = 'center';
        errorCard.style.fontSize = '24px';
        errorCard.style.margin = '5px';
        return errorCard;
    }
    
    const cardElement = document.createElement('div');
    const isRed = card.suit === 'H' || card.suit === 'D';
    cardElement.className = `card ${isRed ? 'red' : 'black'}`;
    cardElement.dataset.suit = card.suit; // Add data-suit attribute for styling
    
    // Map suits to symbols
    const suitSymbols = {
        'H': '',
        'D': '',
        'C': '',
        'S': ''
    };
    
    // Map ranks to display values
    const rankDisplay = {
        'T': '10',
        'J': 'J',
        'Q': 'Q',
        'K': 'K',
        'A': 'A'
    };
    
    const displayRank = rankDisplay[card.rank] || card.rank;
    const displaySuit = suitSymbols[card.suit] || card.suit;
    
    cardElement.innerHTML = `
        <div class="card-inner">
            <div class="card-top" data-suit="${card.suit}">${displayRank}</div>
            <div class="card-suit" data-suit="${card.suit}">${displaySuit}</div>
            <div class="card-bottom" data-suit="${card.suit}">${displayRank}</div>
        </div>
    `;
    
    // Add basic styling
    cardElement.style.width = '60px';
    cardElement.style.height = '90px';
    cardElement.style.border = '1px solid #000';
    cardElement.style.borderRadius = '8px';
    cardElement.style.display = 'flex';
    cardElement.style.justifyContent = 'center';
    cardElement.style.alignItems = 'center';
    cardElement.style.fontSize = '24px';
    cardElement.style.margin = '5px';
    cardElement.style.backgroundColor = '#fff';
    cardElement.style.position = 'relative';
    
    return cardElement;
}

// Handle check action
function handleCheck() {
    if (gameState.currentBet > gameState.currentRoundBets.player) {
        addToLog("You can't check when there's a bet. Please call or fold.", 'system');
        return;
    }
    
    addToLog('You check.', 'player');
    gameState.currentPlayer = 'computer';
    computerTurn();
}

// Handle fold action
function handleFold() {
    console.log('Fold button clicked');
    if (gameState.currentPlayer !== 'player') {
        console.log('Not your turn to fold');
        return;
    }
    
    gameState.playerFolded = true;
    addToLog('You folded.', 'player');
    
    // Disable all buttons after folding
    disablePlayerActions();
    
    // End the round with computer as winner
    setTimeout(() => endRound('computer'), 1000);
}

// Disable all player action buttons
function disablePlayerActions() {
    const buttons = ['fold-btn', 'check-btn', 'call-btn', 'bet-btn'];
    buttons.forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) btn.disabled = true;
    });
}

// Handle bet action
function handleBet() {
    console.log('Bet button clicked');
    
    const betSlider = document.getElementById('bet-slider');
    if (!betSlider) {
        console.error('Bet slider not found!');
        return;
    }
    
    let betAmount = parseInt(betSlider.value) || 0;
    console.log('Bet amount:', betAmount);
    
    // Validate bet amount
    if (betAmount <= 0) {
        addToLog('Please enter a valid bet amount.', 'system');
        return;
    }
    
    // Ensure player has enough chips
    if (betAmount > gameState.playerChips) {
        addToLog(`You only have $${gameState.playerChips} chips.`, 'system');
        return;
    }
    
    // Calculate minimum required bet/raise
    const callAmount = gameState.currentBet - gameState.currentRoundBets.player;
    const minRaise = Math.max(gameState.minRaise, callAmount * 2);
    
    // If this is a raise, ensure it meets the minimum raise
    if (betAmount < callAmount) {
        addToLog(`You must bet at least $${callAmount} to call.`, 'system');
        return;
    }
    
    // If raising, ensure it meets the minimum raise amount
    if (betAmount > callAmount && betAmount < (callAmount + gameState.minRaise)) {
        addToLog(`Minimum raise is $${gameState.minRaise} over the current bet.`, 'system');
        return;
    }
    
    try {
        // Calculate total chips to put in the pot
        const totalChipsToPot = betAmount + gameState.currentRoundBets.player;
        const actualBet = betAmount - callAmount;
        
        // Update game state
        gameState.playerChips -= betAmount;
        gameState.pot += betAmount;
        
        // Update bet tracking
        if (actualBet > 0) {
            // This is a raise
            gameState.currentBet = totalChipsToPot;
            gameState.lastRaiseAmount = actualBet;
            addToLog(`You raise by $${actualBet} (total bet: $${totalChipsToPot}).`, 'player');
        } else {
            // This is a call
            addToLog(`You call $${betAmount}.`, 'player');
        }
        
        gameState.currentRoundBets.player = totalChipsToPot;
        gameState.lastAggressor = 'player';
        
        console.log('New game state after bet:', {
            playerChips: gameState.playerChips,
            pot: gameState.pot,
            currentBet: gameState.currentBet,
            currentRoundBets: {...gameState.currentRoundBets}
        });
        
        // Update UI
        updateChipsDisplay();
        updatePotDisplay();
        updateBetAmount();
        
        // Disable buttons until computer makes a move
        disablePlayerActions();
        
        // Computer's turn
        gameState.currentPlayer = 'computer';
        setTimeout(computerTurn, 1000); // Small delay for better UX
    } catch (error) {
        console.error('Error in handleBet:', error);
        addToLog('An error occurred. Please try again.', 'system');
    }
}

// Update the UI for the player's turn
function updateUIForPlayerTurn() {
    console.log('Updating UI for player turn');
    
    try {
        const checkBtn = document.getElementById('check-btn');
        const callBtn = document.getElementById('call-btn');
        const betBtn = document.getElementById('bet-btn');
        const foldBtn = document.getElementById('fold-btn');
        const betSlider = document.getElementById('bet-slider');
        const betAmount = document.getElementById('bet-amount');
        
        if (!checkBtn || !callBtn || !betBtn || !foldBtn || !betSlider || !betAmount) {
            console.error('One or more UI elements not found!');
            return;
        }
        
        const amountToCall = Math.max(0, gameState.currentBet - gameState.currentRoundBets.player);
        const minRaise = Math.max(gameState.minRaise, gameState.currentBet * 2 - gameState.currentRoundBets.player);
        
        console.log('UI Update - Amount to call:', amountToCall, 'Min raise:', minRaise);
        
        // Update call amount display
        const callAmountElement = document.getElementById('call-amount');
        if (callAmountElement) {
            callAmountElement.textContent = amountToCall;
        }
        
        // Reset all buttons first
        if (foldBtn) {
            foldBtn.style.display = 'inline-block';
            foldBtn.disabled = (gameState.currentPlayer !== 'player');
            foldBtn.onclick = handleFold;
        }

        // Handle Check and Call buttons based on game state
        if (gameState.currentPlayer !== 'player') {
            // Not player's turn - disable all action buttons
            if (checkBtn) {
                checkBtn.style.display = 'none';
                checkBtn.disabled = true;
            }
            if (callBtn) {
                callBtn.style.display = 'none';
                callBtn.disabled = true;
            }
        } else if (amountToCall > 0) {
            // When there's a bet to call, show Call button
            callBtn.style.display = 'inline-block';
            callBtn.disabled = false;
            callBtn.onclick = handleCall;
            
            if (checkBtn) {
                checkBtn.style.display = 'none'; // Hide Check button when there's a bet
                checkBtn.disabled = true;
            }
        } else if (gameState.currentBet === 0 || gameState.currentBet <= gameState.currentRoundBets.player) {
            // When checking is allowed (no bet to call)
            if (checkBtn) {
                checkBtn.style.display = 'inline-block';
                checkBtn.disabled = false;
                checkBtn.onclick = handleCheck;
            }
            if (callBtn) {
                callBtn.style.display = 'none'; // Hide Call button when checking
                callBtn.disabled = true;
            }
        } else {
            // Default fallback - show Call button
            if (callBtn) {
                callBtn.style.display = 'inline-block';
                callBtn.disabled = false;
                callBtn.onclick = handleCall;
            }
            if (checkBtn) {
                checkBtn.style.display = 'none';
                checkBtn.disabled = true;
            }
        }
        
        // Update bet button and slider
        const canBet = gameState.playerChips >= minRaise;
        betBtn.disabled = !canBet;
        
        // Update slider
        betSlider.min = minRaise;
        betSlider.max = gameState.playerChips;
        betSlider.value = Math.min(Math.max(minRaise, betSlider.min), betSlider.max);
        betAmount.textContent = betSlider.value;
        
        // Ensure all buttons are visible
        [checkBtn, callBtn, betBtn, foldBtn].forEach(btn => {
            if (btn) btn.style.display = 'inline-block';
        });
        
        console.log('UI update complete');
    } catch (error) {
        console.error('Error in updateUIForPlayerTurn:', error);
    }
}

// Deal the flop (first three community cards)
function dealFlop() {
    // Burn a card
    gameState.deck.pop();
    
    // Deal three cards to the community
    for (let i = 0; i < 3; i++) {
        gameState.communityCards.push(gameState.deck.pop());
    }
    
    displayCommunityCards();
    addToLog('Flop dealt.', 'system');
}

// Deal the turn (fourth community card)
function dealTurn() {
    // Burn a card
    gameState.deck.pop();
    
    // Deal one card to the community
    gameState.communityCards.push(gameState.deck.pop());
    
    displayCommunityCards();
    addToLog('Turn dealt.', 'system');
}

// Deal the river (fifth community card)
function dealRiver() {
    // Burn a card
    gameState.deck.pop();
    
    // Deal one card to the community
    gameState.communityCards.push(gameState.deck.pop());
    
    displayCommunityCards();
    addToLog('River dealt.', 'system');
}

// Display community cards
function displayCommunityCards() {
    console.log('Displaying community cards:', gameState.communityCards);
    const communityCardsDiv = document.getElementById('community-cards');
    if (!communityCardsDiv) {
        console.error('Community cards container not found');
        return;
    }
    
    // Clear existing cards
    communityCardsDiv.innerHTML = '';
    
    // Create a container for the community cards with proper styling
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'community-cards-container';
    cardsContainer.style.display = 'flex';
    cardsContainer.style.justifyContent = 'center';
    cardsContainer.style.gap = '10px';
    cardsContainer.style.flexWrap = 'wrap';
    
    // Add each card to the container
    gameState.communityCards.forEach((card, index) => {
        if (!card) {
            console.warn('Undefined card at index', index);
            return;
        }
        
        try {
            const cardElement = createCardElement(card);
            if (cardElement) {
                cardElement.style.margin = '0 5px';
                cardElement.style.transform = 'translateY(0)';
                cardElement.setAttribute('data-index', index);
                cardsContainer.appendChild(cardElement);
            }
        } catch (error) {
            console.error('Error creating card element:', error, 'Card data:', card);
        }
    });
    
    // Add the cards container to the DOM
    communityCardsDiv.appendChild(cardsContainer);
    
    // Log for debugging
    console.log('Community cards displayed:', communityCardsDiv.innerHTML);
}

// Function to find and highlight the best 5-card hand
function highlightBestHand() {
    // Remove any existing best-hand classes
    document.querySelectorAll('.card').forEach(card => {
        card.classList.remove('best-hand');
    });
    
    // Get all community cards and player's hand
    const allCards = [...gameState.playerHand, ...gameState.communityCards];
    
    // Find the best 5-card combination
    let bestHand = [];
    let bestScore = -1;
    
    // Check all 5-card combinations from the 7 available cards (2 in hand + 5 community)
    const combinations = getCombinations(allCards, 5);
    combinations.forEach(combo => {
        const score = evaluateHandStrength(combo);
        if (score > bestScore) {
            bestScore = score;
            bestHand = combo;
        }
    });
    
    // Highlight the cards in the best hand that are community cards
    const communityCardElements = document.querySelectorAll('#community-cards .card');
    communityCardElements.forEach(cardElement => {
        const cardIndex = parseInt(cardElement.getAttribute('data-index'));
        const card = gameState.communityCards[cardIndex];
        
        // Check if this card is in the best hand
        const isInBestHand = bestHand.some(bestCard => 
            bestCard.rank === card.rank && bestCard.suit === card.suit
        );
        
        if (isInBestHand) {
            cardElement.classList.add('best-hand');
        }
    });
}

// Helper function to get all combinations of a specific length
function getCombinations(array, length) {
    const result = [];
    
    function generateCombos(current, start) {
        if (current.length === length) {
            result.push([...current]);
            return;
        }
        
        for (let i = start; i < array.length; i++) {
            current.push(array[i]);
            generateCombos(current, i + 1);
            current.pop();
        }
    }
    
    generateCombos([], 0);
    return result;
}

// ترتيب الأوراق من الأصغر للأكبر
const RANK_ORDER = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

// تحقق من وجود ستريت (خمسة أوراق متتالية)
function hasStraight(ranks) {
    // تحويل الرتب إلى أرقام
    const rankValues = [...new Set(ranks.map(rank => RANK_ORDER.indexOf(rank)))];
    rankValues.sort((a, b) => a - b);
    
    // حالة خاصة: A-2-3-4-5
    if (rankValues.includes(12) && // A
        rankValues.includes(0) &&  // 2
        rankValues.includes(1) &&  // 3
        rankValues.includes(2) &&  // 4
        rankValues.includes(3)) {  // 5
        return true;
    }
    
    // تحقق من وجود 5 أوراق متتالية
    for (let i = 0; i <= rankValues.length - 5; i++) {
        if (rankValues[i+4] - rankValues[i] === 4) {
            return true;
        }
    }
    return false;
}

// تقييم قوة اليد في البوكر
function evaluateHandStrength(cards) {
    // حساب عدد تكرار كل رتبة
    const rankCounts = {};
    const suits = {};
    const ranks = [];
    
    cards.forEach(card => {
        rankCounts[card.rank] = (rankCounts[card.rank] || 0) + 1;
        suits[card.suit] = (suits[card.suit] || 0) + 1;
        ranks.push(card.rank);
    });
    
    // حساب عدد الأزواج والثلاثيات والرباعيات
    const pairs = Object.values(rankCounts).filter(count => count === 2).length;
    const threeOfAKind = Object.values(rankCounts).some(count => count === 3);
    const fourOfAKind = Object.values(rankCounts).some(count => count === 4);
    const hasFlush = Object.values(suits).some(count => count >= 5);
    const hasStraightResult = hasStraight(ranks);
    
    // الترتيب من الأقوى للأضعف
    
    // 1. رويال فلاش (A-K-Q-J-10 من نفس النوع)
    // 2. ستريت فلاش (خمسة أوراق متتالية من نفس النوع)
    if (hasFlush && hasStraightResult) {
        // تحقق من رويال فلاش
        const flushSuit = Object.keys(suits).find(suit => suits[suit] >= 5);
        const flushCards = cards.filter(card => card.suit === flushSuit);
        const flushRanks = flushCards.map(card => RANK_ORDER.indexOf(card.rank));
        flushRanks.sort((a, b) => a - b);
        
        // تحقق من وجود A-K-Q-J-10
        const hasRoyal = [8, 9, 10, 11, 12].every(rank => flushRanks.includes(rank));
        if (hasRoyal) return 10; // رويال فلاش
        
        return 9; // ستريت فلاش عادي
    }
    
    // 3. أربعة من نفس النوع
    if (fourOfAKind) return 8;
    
    // 4. فول هاوس (ثلاثة من نوع مع زوج)
    if (threeOfAKind && pairs >= 1) return 7;
    
    // 5. فلاش (خمسة أوراق من نفس النوع)
    if (hasFlush) return 6;
    
    // 6. ستريت (خمسة أوراق متتالية)
    if (hasStraightResult) return 5;
    
    // 7. ثلاثة من نفس النوع
    if (threeOfAKind) return 4;
    
    // 8. زوجان
    if (pairs >= 2) return 3;
    
    // 9. زوج واحد
    if (pairs === 1) return 2;
    
    // 10. أعلى ورقة
    return 1;
}

// Highlight the winning cards with a green glow and elevation
function highlightWinningCards(winner) {
    // Remove any existing winner classes first
    document.querySelectorAll('.card').forEach(card => {
        card.classList.remove('winner');
    });
    
    if (winner === 'player') {
        // Highlight player's cards
        const playerCards = document.querySelectorAll('#player-hand .card');
        playerCards.forEach(card => {
            card.classList.add('winner');
        });
    } else if (winner === 'computer') {
        // Highlight computer's cards
        const computerCards = document.querySelectorAll('#opponent-hand .card');
        computerCards.forEach(card => {
            card.classList.add('winner');
        });
    } else if (winner === 'tie') {
        // Highlight both hands in case of tie
        const allCards = document.querySelectorAll('.card');
        allCards.forEach(card => {
            card.classList.add('winner');
        });
    }
}

// Function to highlight the best 5-card hand
function highlightBestHand() {
    // Remove any existing best-hand classes
    document.querySelectorAll('.card').forEach(card => {
        card.classList.remove('best-hand');
    });
    
    // Get all community cards and player's hand
    const allCards = [...gameState.playerHand, ...gameState.communityCards];
    
    // Find the best 5-card combination
    let bestHand = [];
    let bestScore = -1;
    
    // Check all 5-card combinations from the 7 available cards (2 in hand + 5 community)
    const combinations = getCombinations(allCards, 5);
    combinations.forEach(combo => {
        const score = evaluateHandStrength(combo);
        if (score > bestScore) {
            bestScore = score;
            bestHand = combo;
        }
    });
    
    // Highlight the cards in the best hand that are community cards
    const communityCardElements = document.querySelectorAll('#community-cards .card');
    communityCardElements.forEach(cardElement => {
        const cardIndex = parseInt(cardElement.getAttribute('data-index'));
        const card = gameState.communityCards[cardIndex];
        
        // Check if this card is in the best hand
        const isInBestHand = bestHand.some(bestCard => 
            bestCard.rank === card.rank && bestCard.suit === card.suit
        );
        
        if (isInBestHand) {
            cardElement.classList.add('best-hand');
        }
    });
}

// End the current round and determine the winner
function endRound(winner) {
    console.log('Ending round. Winner:', winner);
    
    // Show the computer's cards before determining the winner
    displayComputerHand(true);
    
    // If no winner is specified (showdown), determine the winner
    if (!winner) {
        const playerHandStrength = evaluateHandStrength([...gameState.playerHand, ...gameState.communityCards]);
        const computerHandStrength = evaluateHandStrength([...gameState.computerHand, ...gameState.communityCards]);
        
        if (playerHandStrength > computerHandStrength) {
            winner = 'player';
            addToLog(`Your hand was stronger!`, 'player');
            highlightWinningCards('player');
        } else if (computerHandStrength > playerHandStrength) {
            winner = 'computer';
            addToLog(`Computer's hand was stronger!`, 'computer');
            highlightWinningCards('computer');
        } else {
            winner = 'tie';
            addToLog(`It's a tie!`, 'system');
            highlightWinningCards('tie');
        }
        
        // Highlight the best 5-card hand
        highlightBestHand();
        
        // Log the hands for debugging
        console.log('Player hand strength:', playerHandStrength);
        console.log('Computer hand strength:', computerHandStrength);
    } else if (winner === 'player') {
        // If player won by fold, still highlight player's cards
        highlightWinningCards('player');
    } else if (winner === 'computer') {
        // If computer won by fold, highlight computer's cards
        highlightWinningCards('computer');
    }
    
    // Create a message showing the computer's cards
    const computerCards = gameState.computerHand.map(card => 
        `${card.rank}${card.suit}`
    ).join(', ');
    
    const resultMessage = `Computer's cards: ${computerCards}\n\n`;
    
    // Log the winner and amount won
    const winAmount = gameState.pot;
    
    // Award the pot to the winner
    if (winner === 'player') {
        const winAmount = gameState.pot;
        gameState.playerChips += winAmount;
        addToLog(`You win $${winAmount}!`, 'player');
        showResult('You Win!', resultMessage + `You won $${winAmount} with a better hand!`);
    } else if (winner === 'computer') {
        const winAmount = gameState.pot;
        gameState.computerChips += winAmount;
        addToLog(`Computer wins $${winAmount}.`, 'computer');
        showResult('Computer Wins', resultMessage + `Computer wins $${winAmount}. Better luck next time!`);
    } else {
        // Tie - split the pot
        const halfPot = Math.floor(gameState.pot / 2);
        const playerWin = halfPot;
        const computerWin = gameState.pot - halfPot;
        gameState.playerChips += playerWin;
        gameState.computerChips += computerWin;
        addToLog(`It's a tie! Pot of $${gameState.pot} is split. You get $${playerWin}, computer gets $${computerWin}.`, 'system');
        showResult('Tie Game', resultMessage + `Pot of $${gameState.pot} is split. You get $${playerWin}, computer gets $${computerWin}.`);
    }
    
    // Update UI
    updateChipsDisplay();
    updatePotDisplay();
    
    // Show the Next Round button
    const nextRoundBtn = document.getElementById('next-round-btn');
    if (nextRoundBtn) {
        nextRoundBtn.style.display = 'block';
    }
    
    // Disable all action buttons
    disablePlayerActions();
    
    // Check for game over conditions
    checkGameOver();
}

// Check for game over conditions
function checkGameOver() {
    if (gameState.playerChips <= 0) {
        // Show game over modal
        const gameOverModal = document.getElementById('game-over-modal');
        if (gameOverModal) {
            gameOverModal.classList.add('show');
        }
        // Disable all player actions
        disablePlayerActions();
        // Hide next round button
        const nextRoundBtn = document.getElementById('next-round-btn');
        if (nextRoundBtn) {
            nextRoundBtn.style.display = 'none';
        }
        return true;
    } else if (gameState.computerChips <= 0) {
        // Player wins the game
        const gameOverModal = document.getElementById('game-over-modal');
        if (gameOverModal) {
            const messageElement = gameOverModal.querySelector('p');
            if (messageElement) {
                messageElement.textContent = 'Congratulations! You won the game!';
            }
            gameOverModal.classList.add('show');
        }
        // Disable all player actions
        disablePlayerActions();
        // Hide next round button
        const nextRoundBtn = document.getElementById('next-round-btn');
        if (nextRoundBtn) {
            nextRoundBtn.style.display = 'none';
        }
        return true;
    }
    return false;
}

// Show result modal with computer's cards and result message
function showResult(title, message) {
    // Don't show result modal if game is over
    if (checkGameOver()) {
        return;
    }
    
    const modal = document.getElementById('result-modal');
    if (!modal) return;
    
    // Update modal content
    const titleElement = modal.querySelector('#result-title');
    const messageElement = modal.querySelector('#result-message');
    const cardsContainer = modal.querySelector('#result-cards');
    
    if (titleElement) titleElement.textContent = title;
    if (messageElement) messageElement.textContent = message;
    
    // Clear previous cards
    if (cardsContainer) {
        cardsContainer.innerHTML = '';
        
        // Add computer's cards to the modal
        gameState.computerHand.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.textContent = `${card.rank}${card.suit}`;
            
            // Add suit color
            if (card.suit === '♥' || card.suit === '♦') {
                cardElement.style.color = '#e74c3c'; // Red for hearts and diamonds
            } else {
                cardElement.style.color = '#2c3e50'; // Black for clubs and spades
            }
            
            cardsContainer.appendChild(cardElement);
        });
    }
    
    // Show the modal
    modal.classList.add('show');
    
    // Add close button functionality
    const closeButton = modal.querySelector('#close-result-modal');
    if (closeButton) {
        closeButton.onclick = function() {
            modal.classList.remove('show');
        };
    }
    
    // Close modal when clicking outside content
    modal.onclick = function(event) {
        if (event.target === modal) {
            modal.classList.remove('show');
        }
    };
}

// Favicon cycling functionality
const favicon = document.getElementById('favicon');
const suits = [
    { char: '♥', color: 'e74c3c' },  // heart
    { char: '♠', color: '2c3e50' },  // spade
    { char: '♦', color: 'e74c3c' },  // diamond
    { char: '♣', color: '2c3e50' }   // club
];
let currentSuit = 0;

function updateFavicon() {
    const suit = suits[currentSuit];
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
        <text x='50' y='60' font-size='115' fill='#${suit.color}' font-family='Arial' text-anchor='middle' dominant-baseline='middle'>${suit.char}</text>
    </svg>`;
    favicon.href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
    
    currentSuit = (currentSuit + 1) % suits.length;
}

// Change favicon every 1.5 seconds
setInterval(updateFavicon, 1500);

// Initial favicon update
updateFavicon();

// Add event listener for New Game button in game over modal
const newGameBtn = document.getElementById('new-game');
if (newGameBtn) {
    newGameBtn.addEventListener('click', function() {
        // Hide the game over modal
        const gameOverModal = document.getElementById('game-over-modal');
        if (gameOverModal) {
            gameOverModal.classList.remove('show');
        }
        
        // Reset game state
        gameState.playerChips = 1000;
        gameState.computerChips = 1000;
        gameState.pot = 0;
        
        // Start a new game
        startNewRound();
        
        // Reset the game over message in case it was changed
        const messageElement = document.querySelector('#game-over-modal p');
        if (messageElement) {
            messageElement.textContent = "You've run out of chips. Better luck next time!";
        }
    });
}

// Start a new round
function startNewRound() {
    // Reset round-specific state
    gameState.deck = createDeck();
    gameState.playerHand = [];
    gameState.computerHand = [];
    gameState.communityCards = [];
    gameState.currentBet = 0;
    gameState.playerFolded = false;
    gameState.computerFolded = false;
    gameState.gamePhase = 'preflop';
    gameState.currentRoundBets = { player: 0, computer: 0 };
    gameState.lastRaiseAmount = 0;
    
    // Clear the table
    clearTable();
    
    // Update UI
    updateChipsDisplay();
    updatePotDisplay();
    
    // Deal new hands
    dealInitialHands();
    
    // Post blinds
    postBlinds();
    
    // Player's turn
    gameState.currentPlayer = 'player';
    updateUIForPlayerTurn();
    
    addToLog('New round started!');
    
    // Hide result modal if it's still showing
    document.getElementById('result-modal').classList.remove('show');
    
    // Hide the Next Round button
    const nextRoundBtn = document.getElementById('next-round-btn');
    if (nextRoundBtn) {
        nextRoundBtn.style.display = 'none';
    }
    
    // Check for game over conditions
    checkGameOver();
}
