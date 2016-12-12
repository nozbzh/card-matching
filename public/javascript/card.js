function Card(value, suit) {
  this.value = value;
  this.suit = suit;
  this.id = this.value + '-' + this.suit;
  this.row;
  this.col;
}

Card.prototype.flip = function() {
  var card = $('#game-board #' + this.id);
  var img = card.find('.face-up');

  if (img.is(":visible")) {
    img.addClass('hidden');
    card.addClass('clickable');
    card.find('.face-down').show();
  } else {
    img.removeClass('hidden');
    card.removeClass('clickable');
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
    // increment count if value exists, else set to 1
    window.board.knownCardsValues[this.value] = window.board.knownCardsValues[this.value] + 1 || 1;
  }
}

Card.prototype.remove = function() {
  var card = $('#game-board #' + this.id);
  window.board.cards[this.row][this.col] = null; // remove from board object
  var index = window.board.knownCards.indexOf(this);
  window.board.knownCards.splice(index, 1); // remove from knownCards
  window.board.knownCardsValues[this.value]--; // decrement count
  card.removeClass('card');
  card.html('');
  card.css('outline', 'none')
}
