const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

let players = {};
let game = {
  tableCards: [],
  players: {},
  scores: { "Echipa 1": 0, "Echipa 2": 0 },
  currentPlayer: null,
  finished: false
};

const allCards = ["7", "8", "9", "10", "J", "Q", "K", "A"];
let deck = [];

function shuffleDeck() {
  deck = [];
  allCards.forEach(card => {
    for (let i = 0; i < 4; i++) deck.push(card);
  });
  deck.sort(() => Math.random() - 0.5);
}

function dealCards() {
  Object.keys(game.players).forEach(id => {
    while (game.players[id].hand.length < 4 && deck.length) {
      game.players[id].hand.push(deck.pop());
    }
  });
}

function nextPlayer() {
  const ids = Object.keys(game.players);
  const currentIndex = ids.indexOf(game.currentPlayer);
  return ids[(currentIndex + 1) % ids.length];
}

function checkWin() {
  return deck.length === 0 && Object.values(game.players).every(p => p.hand.length === 0);
}

function handleCardPlay(socket, card) {
  const player = game.players[socket.id];
  const index = player.hand.indexOf(card);
  if (index === -1) return;
  player.hand.splice(index, 1);
  game.tableCards.push({ card, player: socket.id });

  if (game.tableCards.length === 2) {
    let [first, second] = game.tableCards;
    let winner = first.player;

    if (second.card === "7" || second.card === first.card) {
      winner = second.player;
    }

    const winnerTeam = (["1", "3"].includes(Object.keys(game.players).indexOf(winner).toString()))
      ? "Echipa 1" : "Echipa 2";

    game.scores[winnerTeam] += game.tableCards.reduce((acc, c) => {
      return acc + (["10", "A"].includes(c.card) ? 1 : 0);
    }, 0);

    game.tableCards = [];
    game.currentPlayer = winner;
    dealCards();
  } else {
    game.currentPlayer = nextPlayer();
  }

  if (checkWin()) {
    game.finished = true;
  }

  io.emit("game_state", game);
}

io.on("connection", (socket) => {
  if (Object.keys(game.players).length >= 4) return;

  game.players[socket.id] = { hand: [] };
  if (Object.keys(game.players).length === 4) {
    shuffleDeck();
    dealCards();
    game.currentPlayer = Object.keys(game.players)[0];
  }

  socket.emit("game_state", game);
  io.emit("game_state", game);

  socket.on("play_card", (card) => handleCardPlay(socket, card));

  socket.on("disconnect", () => {
    delete game.players[socket.id];
    game = {
      tableCards: [],
      players: {},
      scores: { "Echipa 1": 0, "Echipa 2": 0 },
      currentPlayer: null,
      finished: false
    };
    io.emit("game_state", game);
  });
});

server.listen(4000, () => console.log("Server running on port 4000"));