import React, { useEffect } from "react";
import socket from "./socket";

function App() {
  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Conectat la server Socket.IO");
    });

    // Poți adăuga aici alte evenimente (ex: primire date)
    socket.on("message", (msg) => {
      console.log("📩 Mesaj de la server:", msg);
    });

    return () => {
      socket.off("connect");
      socket.off("message");
    };
  }, []);

  return (
    <div>
      <h1>🎮 Septica Online</h1>
    </div>
  );
}

export default App;
