import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('https://septica-cu-amicii.onrender.com');

const Table = () => {
  const [game, setGame] = useState(null);
  const [myId, setMyId] = useState(null);

  useEffect(() => {
    socket.on('connect', () => setMyId(socket.id));
    socket.on('game_state', (data) => setGame({ ...data }));
    return () => socket.disconnect();
  }, []);

  const playCard = (card) => {
    if (game.currentPlayer === myId) {
      socket.emit('play_card', card);
    }
  };

  if (!game || !game.players[myId]) return <div className="text-white p-4">Așteaptă alți jucători...</div>;

  const hand = game.players[myId].hand;
  const table = game.tableCards;
  const isMyTurn = game.currentPlayer === myId;

  return (
    <div className="min-h-screen bg-green-900 flex flex-col items-center p-6 text-white">
      <h1 className="text-3xl font-bold mb-4">Șeptica</h1>

      <div className="bg-green-700 rounded-2xl p-6 shadow-xl w-full max-w-4xl">
        <div className="flex justify-between mb-4">
          <div>Echipa 1: {game.scores['Echipa 1']} pct</div>
          <div>Echipa 2: {game.scores['Echipa 2']} pct</div>
        </div>

        <div className="bg-green-800 rounded-xl p-4 mb-4 shadow-inner">
          <h2 className="text-xl font-semibold mb-2">Masa</h2>
          <div className="flex justify-center gap-4">
            {table.map((entry, idx) => (
              <div key={idx} className="text-4xl bg-white text-black px-4 py-2 rounded-lg shadow-md">
                {entry.card}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-green-800 rounded-xl p-4 shadow-inner">
          <h2 className="text-xl font-semibold mb-2">Mâna ta {isMyTurn ? '🎯' : ''}</h2>
          <div className="flex justify-center gap-4">
            {hand.map((card, idx) => (
              <button
                key={idx}
                onClick={() => playCard(card)}
                disabled={!isMyTurn}
                className="text-3xl bg-white text-black px-4 py-2 rounded-lg shadow hover:scale-105 transition-transform"
              >
                {card}
              </button>
            ))}
          </div>
        </div>

        {game.finished && (
          <div className="text-center text-yellow-400 text-2xl mt-6">
            Joc terminat! Câștigă: {
              game.scores['Echipa 1'] > game.scores['Echipa 2']
                ? 'Echipa 1'
                : game.scores['Echipa 1'] < game.scores['Echipa 2']
                ? 'Echipa 2'
                : 'Egalitate'
            }
          </div>
        )}
      </div>
    </div>
  );
};

export default Table;