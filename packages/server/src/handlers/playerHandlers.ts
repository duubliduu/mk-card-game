import Player from "../controllers/Player";

export const onPlay = (player: Player, cardIndex: number) => {
  if (!player.match) {
    player.socket.emit(
      "message",
      "Cannot play a card, because you're not in a match"
    );
    return;
  }

  if (!player.inTurn) {
    player.socket.emit("message", "Not your turn!");
    return;
  }

  const cardToPlay = player.hand[cardIndex];

  delete player.hand[cardIndex];

  player.drawFromDeck(cardIndex);

  if (cardToPlay === null) {
    player.socket.emit("message", "You don't have card at that index");
    return;
  }

  player.match.play(cardToPlay);

  // the played card goes to everybody
  player.socket.nsp.to(player.match.id).emit("play", player.side, cardToPlay);

  // cards on your hand goes just to you
  player.socket.emit("hand", player.hand);
};
