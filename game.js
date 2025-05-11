let hand = [];
let suits = ['hearts', 'diamonds', 'clubs', 'spades'];
let ranks = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A'];
let suitSymbols = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠'
};

let score = 0;
let targetScore = 500;
let lastHandResult = '';
let lastHandPoints = 0;
let handEvaluated = false;
let handsPlayed = 0;
let maxHands = 6;
let gamePhase = 'playing';
let win = false;
let rerollsLeft = 6;
let scoreMultiplier = 1.0;
let money = 0;
let deck = [];
let cardsLeft = 52;
let selectedCardIndex = -1;
let showHandValues = false;
let roundNumber = 1;

let shopItems = [
  { name: "Buy 3 Rerolls", cost: 500, action: () => { rerollsLeft += 3; } },
  { name: "Increase Max Hands", cost: 800, action: () => { maxHands++; } },
  { name: "Boost Score Multiplier", cost: 1000, action: () => { scoreMultiplier += 0.5; } }
];

function setup() {
  let canvas = createCanvas(1000, 600);
  canvas.parent('game-canvas');
  startNewGame();
}

function draw() {
  background(30, 120, 70);

  if (gamePhase === 'playing') {
    drawGame();
  } else if (gamePhase === 'shop') {
    drawShop();
  } else if (gamePhase === 'gameover') {
    drawGameOver();
  }
}

function startNewGame() {
  score = 0;
  hand = [];
  handsPlayed = 0;
  handEvaluated = false;
  lastHandResult = '';
  lastHandPoints = 0;
  gamePhase = 'playing';
  win = false;
  cardsLeft = 52;
  deck = createDeck();
  shuffleDeck(deck);
  targetScore = 500;
  rerollsLeft = 6;
  scoreMultiplier = 1.0;
  roundNumber = 1;
  money = 0;
  drawHand();
}

function restartGame() {
  startNewRound();
}

function showRules() {
  alert(
    `Rules:\n
- Draw 5 cards to form hands.\n
- Score based on poker hands (Flush, Straight, Pairs, etc.).\n
- Reach the target score to move to the shop.\n
- Beat 5 rounds to win the game!\n
- You can reroll individual cards using "W" key.\n
- You earn money after each round to spend in the shop!`
  );
}

// GAME LOOP FUNCTIONS

function drawGame() {
  fill(255);
  textSize(24);
  textAlign(CENTER, CENTER);
  text(`Score: ${score}`, width / 2, 30);
  text(`Hands Played: ${handsPlayed}/${maxHands}`, width / 2, 70);
  text(`Target: ${targetScore}`, width / 2, 110);
  text(`Rerolls Left: ${rerollsLeft}`, width / 2, 150);

  // Draw hand
  for (let i = 0; i < hand.length; i++) {
    drawCard(hand[i], width / 2 - 250 + i * 125, height / 2);
    if (selectedCardIndex === i) {
      stroke(255, 255, 0);
      noFill();
      rect(width / 2 - 250 + i * 125 - 5, height / 2 - 80 - 5, 100 + 10, 120 + 10);
    }
  }

  if (handEvaluated) {
    textSize(20);
    fill(255);
    text(`Result: ${lastHandResult} (+${lastHandPoints} pts)`, width / 2, height - 120);
    text(`Money: $${money}`, width / 2, height - 80);
    text("Click to continue...", width / 2, height - 40);
  }
}

function drawShop() {
  background(20, 20, 50);
  fill(255);
  textSize(30);
  textAlign(CENTER);
  text(`SHOP - Money: $${money}`, width / 2, 50);

  for (let i = 0; i < shopItems.length; i++) {
    let item = shopItems[i];
    textSize(20);
    text(`${item.name} - $${item.cost}`, width / 2, 150 + i * 100);
  }
  textSize(18);
  text("Click item to buy. Click anywhere else to continue.", width / 2, height - 50);
}

function drawGameOver() {
  background(20, 20, 20);
  fill(255);
  textSize(36);
  textAlign(CENTER, CENTER);

  if (win) {
    text("You Won the Game!", width / 2, height / 2 - 50);
  } else {
    text("Game Over!", width / 2, height / 2 - 50);
  }

  textSize(24);
  text("Click to Restart", width / 2, height / 2 + 20);
}

// MOUSE/KEY INPUT

function mousePressed() {
  if (gamePhase === 'playing' && !handEvaluated) {
    for (let i = 0; i < hand.length; i++) {
      let cardX = width / 2 - 250 + i * 125;
      let cardY = height / 2;
      if (mouseX > cardX && mouseX < cardX + 100 && mouseY > cardY - 80 && mouseY < cardY + 40) {
        selectedCardIndex = i;
        return;
      }
    }
  } else if (gamePhase === 'playing' && handEvaluated) {
    startNewRound();
  } else if (gamePhase === 'shop') {
    for (let i = 0; i < shopItems.length; i++) {
      let itemY = 150 + i * 100;
      if (mouseY > itemY - 20 && mouseY < itemY + 20) {
        if (money >= shopItems[i].cost) {
          money -= shopItems[i].cost;
          shopItems[i].action();
        }
        return;
      }
    }
    startNewRound();
  } else if (gamePhase === 'gameover') {
    startNewGame();
  }
}

function keyPressed() {
  if (key === 'W' && selectedCardIndex !== -1 && rerollsLeft > 0) {
    rerollCard(selectedCardIndex);
    selectedCardIndex = -1;
    rerollsLeft--;
  }
  if (key === 'E' && !handEvaluated) {
    evaluateHand();
  }
}

// GAME HELPERS

function createDeck() {
  let newDeck = [];
  for (let suit of suits) {
    for (let rank of ranks) {
      newDeck.push({ suit, rank });
    }
  }
  return newDeck;
}

function shuffleDeck(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    let j = floor(random(i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

function drawHand() {
  hand = [];
  for (let i = 0; i < 5; i++) {
    hand.push(deck.pop());
    cardsLeft--;
  }
}

function rerollCard(index) {
  if (cardsLeft > 0) {
    hand[index] = deck.pop();
    cardsLeft--;
  }
}

function startNewRound() {
  handsPlayed++;
  handEvaluated = false;
  selectedCardIndex = -1;
  
  if (handsPlayed >= maxHands) {
    if (score >= targetScore) {
      money += floor(score / 10);
      roundNumber++;
      targetScore = floor(targetScore * 1.4);
      gamePhase = 'shop';
    } else {
      gamePhase = 'gameover';
    }
  } else {
    if (cardsLeft < 5) {
      deck = createDeck();
      shuffleDeck(deck);
      cardsLeft = 52;
    }
    drawHand();
  }
}

function evaluateHand() {
  handEvaluated = true;
  
  let ranksInHand = hand.map(card => card.rank);
  let suitsInHand = hand.map(card => card.suit);

  let rankCounts = {};
  for (let rank of ranksInHand) {
    rankCounts[rank] = (rankCounts[rank] || 0) + 1;
  }

  let counts = Object.values(rankCounts).sort((a, b) => b - a);

  let flush = suitsInHand.every(suit => suit === suitsInHand[0]);
  let numericRanks = ranksInHand.map(rank => (rank === 'J' ? 11 : rank === 'Q' ? 12 : rank === 'K' ? 13 : rank === 'A' ? 14 : rank));
  numericRanks.sort((a, b) => a - b);
  let straight = numericRanks.every((rank, i, arr) => i === 0 || rank === arr[i - 1] + 1);

  let result = '';
  let points = 0;

  if (flush && straight) {
    result = "Straight Flush!";
    points = 200;
  } else if (counts[0] === 4) {
    result = "Four of a Kind!";
    points = 150;
  } else if (counts[0] === 3 && counts[1] === 2) {
    result = "Full House!";
    points = 120;
  } else if (flush) {
    result = "Flush!";
    points = 100;
  } else if (straight) {
    result = "Straight!";
    points = 80;
  } else if (counts[0] === 3) {
    result = "Three of a Kind!";
    points = 50;
  } else if (counts[0] === 2 && counts[1] === 2) {
    result = "Two Pair!";
    points = 30;
  } else if (counts[0] === 2) {
    result = "One Pair!";
    points = 10;
  } else {
    result = "High Card!";
    points = 5;
  }

  points = floor(points * scoreMultiplier);
  score += points;
  lastHandResult = result;
  lastHandPoints = points;
}

function drawCard(card, x, y) {
  fill(255);
  rect(x, y - 80, 100, 120, 10);

  fill(0);
  textSize(20);
  textAlign(CENTER, CENTER);
  text(`${card.rank}${suitSymbols[card.suit]}`, x + 50, y - 20);
}
