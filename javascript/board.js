function Board(rows, cols) {
  this.rows = rows;
  this.cols = cols;
  this.cards;
  this.unknownCards;
  this.knownCards = [];
  this.cardsVisible = [];
  this.knownCardsValues = {};
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

Board.prototype.computerCanMatch = function() {
  return (this.knownCards.length > 2) && (this.knownCardsMatch()) && (this.cardsVisible.length == 0);
}

Board.prototype.resetCardsVisible = function() {
  this.cardsVisible = [];
}

Board.prototype.hideCards = function() {
  for (var i = 0; i < this.cardsVisible.length; i++){
    this.cardsVisible[i].flip();
  }
}

Board.prototype.removeCardsFromBoard = function() {
  for (var i = 0; i < this.cardsVisible.length; i++){
    this.cardsVisible[i].remove();
  }
}

Board.prototype.placeCards = function() {
  this.cards = new Array(this.rows);

  for (var i = 0; i < this.rows; i++) {
    $('#game-board').append('<tr></tr>');

    this.cards[i] = new Array(this.cols);

    for (var j = 0; j < this.cols; j++) {

      var randomIndex = Math.floor(Math.random() * gameSetup.cards.length);
      var card = gameSetup.cards[randomIndex];
      gameSetup.cards.splice(randomIndex, 1);

      this.cards[i][j] = card;

      card.row = i;
      card.col = j;

      $('#game-board tr:nth-child(' + (i + 1) + ')').append('<td id="' + card.id + '" class="card clickable"></td>');
      $('#' + card.id).append('<img src="images/' + card.id + '.png" alt="'+ card.id +'" class="face-up hidden">');
      $('#' + card.id).append('<div class="face-down"><img src="images/groove.png" alt="groove"></div>');
    }
  }

  this.unknownCards = jQuery.extend(true, [], this.cards);
}
