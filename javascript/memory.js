function hideCards(){
  for (var i = 0; i < window.board.cardsVisible.length; i++){
    window.board.cardsVisible[i].flip();
  }
}

function removeCardsFromBoard(){
  for (var i = 0; i < window.board.cardsVisible.length; i++){
    window.board.cardsVisible[i].remove();
  }
}

function clickCard(row, col) {

  var card = window.board.cards[row][col];

  card.flip();
  window.board.cardsVisible.push(card);

  if ((window.turn == 'com') && (window.board.cardsVisible.length == 1) && (window.computerWillMatch)) {
    // do nothing because second click is coming from computerPickMatchingPair
    window.computerWillMatch = false;
  } else if ((window.turn == 'com') && (window.board.cardsVisible.length == 1)) {
    computerPlays();
  }

  if (window.board.cardsVisible.length == 2) {

    setTimeout(function(){

      if (compareCards()) {
        updateScore(window.turn);
        removeCardsFromBoard();
        resetCardsVisible();
        if (window.turn == 'com') {
          computerPlays();
        }
      } else {
        hideCards();
        switchTurn();
      }
    }, 1000);
  }
}

function switchTurn(){
  resetCardsVisible();
  if (window.turn == 'com'){
    window.turn = 'p';
    $('#current-player').html('Your turn');
  } else if (window.turn == 'p') {
    window.turn = 'com';
    $('#current-player').html("Computer's turn");
    computerPlays();
  }
}

function computerPlays(){
  setTimeout(function(){
    if ((window.board.knownCards.length > 2) && (window.board.knownCardsMatch()) && (window.board.cardsVisible.length == 0)){
      var num = Math.floor(Math.random() * 10) + 1
      if (num > 7) {
        computerPickMatchingPair();
      } else {
        computerPickRandomCard();
      }
    } else {
      computerPickRandomCard();
    }
  }, 1000);
}

function computerPickMatchingPair(){
  var [card1, card2] = window.board.pickMatch();

  window.computerWillMatch = true;
  clickCard(card1.row, card1.col);
  clickCard(card2.row, card2.col);
}

function computerPickRandomCard(){
  var card = window.board.pickRandom();
  clickCard(card.row, card.col);
}

function compareCards(){
  var card1 = window.board.cardsVisible[0];
  var card2 = window.board.cardsVisible[1];
  return (card1.value === card2.value) && (card1.suit !== card2.suit);
}

function updateScore(currentPlayer){
  var card1 = window.board.cardsVisible[0];
  var card2 = window.board.cardsVisible[1];
  if (currentPlayer !== 'com') {
    window.playerScore++;
    $('#score #player .total').html('You matched ' + window.playerScore + ' pairs');
  } else {
    window.computerScore++
    $('#score #computer .total').html('Computer matched ' + window.computerScore + ' pairs');
  }
  addCardToScreen(card1, currentPlayer);
  addCardToScreen(card2, currentPlayer);

  if (window.playerScore + window.computerScore == 26) {
    if (window.playerScore > window.computerScore){
      var message = 'Game over. You win!'
    } else {
      var message = 'Game over. You lose.'
    }
    $('.game-end-title').html(message);
    $('#game-end-modal').modal().show();
  }
}

function addCardToScreen(card, currentPlayer) {
  if (currentPlayer == 'p') {
    $('#score #player .matched-pairs').append('<div class="small-card" id="'+ card.id +'"></div>');
    $('#score #player .matched-pairs .small-card#' + card.id).append('<img src="images/' + card.id + '.png" alt="'+ card.id +'" class="face-up">');
  } else {
    $('#score #computer .matched-pairs').append('<div class="small-card" id="'+ card.id +'"></div>');
    $('#score #computer .matched-pairs .small-card#' + card.id).append('<img src="images/' + card.id + '.png" alt="'+ card.id +'" class="face-up">');
  }
}

function resetCardsVisible(){
  window.board.cardsVisible = [];
}

$(function() {
  window.playerScore = 0;
  window.computerScore = 0;

  createBoard();

  setNumberOfPlayers();

  $('body').on('click', '#game-deck .card', function() {
    var row = $(this).parent().index();
    var col = $(this).index();
    if ((window.board.cardsVisible.length < 2) && (window.turn !== 'com')){
      clickCard(row, col);
    }
  });

  $('body').on('click', '#play-again', function() {
    window.location.reload();
  });

  $('body').on('click', '#single-player', function() {
    sessionStorage.removeItem('singlePlayer');
    window.location.reload();
  });

  $('body').on('click', '#against-computer', function() {
    sessionStorage.setItem('singlePlayer', 'false');
    window.location.reload();
  });
});

function setNumberOfPlayers(){
  var singlePlayer = sessionStorage.getItem('singlePlayer');

  if (singlePlayer == 'false'){
    window.turn = 'p';
    $('#number-players').html('Currently playing against the computer');
    $('#current-player').html('Your turn');
  } else {
    window.turn = 'single';
    $('#number-players').html('Currently playing single player');
  }

}


function Board(rows, cols) {
  this.rows = rows;
  this.cols = cols;
  this.cards;
  this.unknownCards;
  this.knownCards = [];
  this.cardsVisible = [];
  this.knownCardsValues = {};
  this.singlePlayer = true;
}

Board.prototype.pickRandom = function() {
  var cards = this.unknownCards.reduce(function(a, b) {
    return a.concat(b);
  }, []);

  function isNotNull(card){
    return card !== null;
  }

  cards = cards.filter(isNotNull);

  if (cards.length > 0){
    var index = Math.floor(Math.random() * cards.length);
    var card = cards[index];
  } else {
    var index = Math.floor(Math.random() * this.knownCards.length);
    var card = this.knownCards[index];
  }

  return card;
}

Board.prototype.knownCardsMatch = function() {
  var cards = this.knownCards;
  for (var i = 0; i < cards.length; i++){
    if (this.knownCardsValues[cards[i].value] > 1){
      return true;
    }
  }
}

Board.prototype.pickMatch = function() {
  var cards = this.knownCards;
  var matchingPair = [];

  for (var i = 0; i < cards.length; i++){

    if (this.knownCardsValues[cards[i].value] > 1){
      matchingPair.push(cards[i]);
      for (var j = i + 1; j < cards.length; j++){
        if (cards[j].value == cards[i].value) {
          matchingPair.push(cards[j]);
          break;
        }
      }
    }
  }

  return matchingPair;
}

function Card(value, suit) {
  this.value = value;
  this.suit = suit;
  this.id = this.value + '-' + this.suit;
  this.row;
  this.col;
}

Card.prototype.flip = function() {
  var card = $('#game-deck #' + this.id);
  var img = card.find('.face-up');

  if (img.is(":visible")) {
    img.addClass('hidden');
    card.find('.face-down').show();
  } else {
    img.removeClass('hidden');
    card.find('.face-down').hide();
    this.addToKnownCards();
    this.removeFromUnknownCards();
  }
}

Card.prototype.removeFromUnknownCards = function() {
  if (window.board.unknownCards[this.row][this.col] !== null) {
    window.board.unknownCards[this.row][this.col] = null;
  }
}

Card.prototype.addToKnownCards = function() {
  if (window.board.knownCards.indexOf(this) == -1) {
    window.board.knownCards.push(this);
    window.board.knownCardsValues[this.value] = window.board.knownCardsValues[this.value] + 1 || 1;
  }
}

Card.prototype.remove = function() {
  var card = $('#game-deck #' + this.id);
  window.board.cards[this.row][this.col] = null;
  var index = window.board.knownCards.indexOf(this);
  window.board.knownCards.splice(index, 1);
  window.board.knownCardsValues[this.value]--;
  card.removeClass('card');
  card.html('');
  card.css('outline', 'none')
}

function createCards() {
  gameSetup = {};
  gameSetup.cards = [];
  var suits = ['spades', 'diamonds', 'clubs', 'hearts'];
  var values = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  for (var i = 0; i < suits.length; i++){
    for (var j = 0; j < values.length; j++){
      gameSetup.cards.push(new Card(values[j], suits[i]));
    }
  }
}

function placeCards(board){

  board.cards = new Array(board.rows);

  for (var i = 0; i < board.rows; i++) {
    $('#game-deck').append('<tr></tr>');

    board.cards[i] = new Array(board.cols);

    for (var j = 0; j < board.cols; j++) {

      var randomIndex = Math.floor(Math.random() * gameSetup.cards.length);
      var card = gameSetup.cards[randomIndex];
      gameSetup.cards.splice(randomIndex, 1);

      board.cards[i][j] = card;

      card.row = i;
      card.col = j;

      $('#game-deck tr:nth-child(' + (i + 1) + ')').append('<td id="' + card.id + '" class="card"></td>');
      $('#' + card.id).append('<img src="images/' + card.id + '.png" alt="'+ card.id +'" class="face-up hidden">');
      $('#' + card.id).append('<div class="face-down"><img src="images/groove.png" alt="groove"></div>');
    }
  }

  board.unknownCards = jQuery.extend(true, [], board.cards);
}

function createBoard() {
  window.board = new Board(4, 13);
  createCards();
  placeCards(window.board);
}

