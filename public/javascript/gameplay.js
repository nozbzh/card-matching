// Page load function to initialize gameplay variables (turns, players, score)
$(function() {
  window.playerScore = 0;
  window.computerScore = 0;

  createBoard();

  setNumberOfPlayers();

  $('body').on('click', '#game-board .card.clickable', function() {
    // prevent click unless it's player's turn and less than 2 visible cards
    if ((window.board.cardsVisible.length < 2) && (window.turn !== 'com')){
      clickCard($(this).parent().index(), $(this).index()); // row, col
    }
  });

  $('body').on('click', '#play-again', function() {
    window.location.reload();
  });

  // set session variable to initiate 2 player mode when user switches mode
  $('body').on('click', '#against-computer', function() {
    sessionStorage.setItem('vsCom', 'true');
    window.location.reload();
  });

  // remove session variable to go back to default single player mode
  $('body').on('click', '#single-player', function() {
    sessionStorage.removeItem('vsCom');
    window.location.reload();
  });
});

// Create a board object
function createBoard() {
  window.board = new Board(4, 13);
  createCards();
  window.board.placeCards();
}

// Create 52 card objects
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

// Set number of players based on session variable vsCom
function setNumberOfPlayers(){
  var vsCom = sessionStorage.getItem('vsCom');

  if (vsCom == 'true'){
    window.turn = 'p';
    $('#number-players').html('Currently playing <i class="fa fa-desktop" aria-hidden="true"></i> Vs Computer');
    $('#current-player').html('Your turn');
  } else {
    window.turn = 'single';
    $('#number-players').html('Currently playing <i class="fa fa-user" aria-hidden="true"></i> Single Player');
  }

}

// Called everytime a player (including computer) chooses a card
// Handles showing and hiding the card, switching turn and updating score
function clickCard(row, col) {
  var card = window.board.cards[row][col];

  card.flip();
  window.board.cardsVisible.push(card); // add to visible cards (the ones the user sees on the board)

  if ((window.computerWillMatch)) { // skip computerPlays when computer already has a matching pair
    window.computerWillMatch = false;
  } else if ((window.turn == 'com') && (window.board.cardsVisible.length == 1)) {
    computerPlays();
  }

  // 2 visible cards means end of turn
  if (window.board.cardsVisible.length == 2) {

    // timeout so user has time to see what the last card was
    setTimeout(function(){

      if (cardsMatch()) {
        updateScore(window.turn);
        window.board.removeCardsFromBoard();
        window.board.resetCardsVisible();

        if (window.turn == 'com') { // computer plays again if it finds a match
          computerPlays();
        }
      } else {
        // if no match, turn cards over and switch turn
        window.board.hideCards();
        switchTurn();
      }
    }, 1000);
  }
}

function switchTurn(){
  window.board.resetCardsVisible();
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
  // timeout so user has time to see computer's pick
  setTimeout(function(){
    if (window.board.computerCanMatch()){
      var num = Math.floor(Math.random() * 10)

      if (num < 3) { // probabilty that computer finds a match (5 is 50%, 3 is 30%)
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
  // set flag to skip computerPlays in the first clickCard call
  window.computerWillMatch = true;

  clickCard(card1.row, card1.col);
  clickCard(card2.row, card2.col);
}

function computerPickRandomCard(){
  var card = window.board.pickRandom();
  clickCard(card.row, card.col);
}

function cardsMatch(){
  var card1 = window.board.cardsVisible[0];
  var card2 = window.board.cardsVisible[1];
  return (card1.value === card2.value) && (card1.suit !== card2.suit);
}

function updateScore(currentPlayer){
  var card1 = window.board.cardsVisible[0];
  var card2 = window.board.cardsVisible[1];

  if (currentPlayer === 'com') {
    window.computerScore++
    $('#score #computer .total').html('Computer matched ' + window.computerScore + ' pairs');
  } else {
    window.playerScore++;
    $('#score #player .total').html('You matched ' + window.playerScore + ' pairs');
  }

  addCardToScoreArea(card1, currentPlayer);
  addCardToScoreArea(card2, currentPlayer);

  // display game end message
  if (window.playerScore + window.computerScore == 26) {
    if (window.playerScore > window.computerScore){
      var message = 'You win!'
      $('#winning-gif').removeClass('hidden');
    } else {
      var message = 'Game over. You lose...'
      $('#losing-gif').removeClass('hidden');
    }

    $('.game-end-title').html(message);
    $('#game-end-modal').modal().show();
  }
}

function addCardToScoreArea(card, currentPlayer) {
  if (currentPlayer === 'com') {
    var target = '#computer';
  } else {
    var target = '#player';
  }

  $('#score ' + target + ' .matched-pairs').append('<div class="small-card" id="'+ card.id +'"></div>');
  $('#score ' + target + ' .matched-pairs .small-card#' + card.id).append('<img src="images/' + card.id + '.png" alt="'+ card.id +'" class="face-up">');
}

