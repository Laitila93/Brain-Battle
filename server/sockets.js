function sockets(io, socket, data) {
  
  socket.on('getUILabels', function(lang) {
    socket.emit('uiLabels', data.getUILabels(lang));
  });

  socket.on("getNodeStatus", function(gameId) {
    socket.emit("sendNodeStatus", data.getNodeStatus(gameId));
  });

  socket.on("nodeStatusUpdate", function (gameId, d) {
    const currentStatus = data.getNodeStatus(gameId)[d.node];
  
    // Prevent overwriting status 1 or 2
    if (currentStatus === 1 || currentStatus === 2 || currentStatus === 3) {
      console.log("Invalid update: Cannot change node status from", currentStatus, "to", d.status);
      return;
    }
  
    // Allow valid updates
    data.nodeStatusUpdate(gameId, d);
    io.to(gameId).emit("sendNodeStatus", data.getNodeStatus(gameId));

    /*Emil: om man ändrar raden ovan till:
    process.nextTick(() => {
    io.to(gameId).emit("sendNodeStatus", data.getNodeStatus(gameId));
    });
    Verkar man kunna ta bort användningen av getNodeStatus helt. Personligen tkr jag det blir mer cleant,
    blir mindre kommunikation mellan server och client.
     */

  });
  

  socket.on('creategame', function(d) {
    data.creategame(d.gameId, d.lang)
    socket.emit('gameData', data.getgame(d.gameId));
  });

  socket.on('addQuestion', function(d) {
    data.addQuestion(d.gameId, {q: d.q, a: d.a});
  });

  socket.on('getNumberOfQuestions', function(gameId) {
    socket.emit('numberOfQuestions', data.getNumberOfQuestions(gameId).length);

  });

  socket.on('joingame', function(gameId) {
    socket.join(gameId); // Add the client to the game's room
    //socket.emit('submittedAnswersUpdate', data.getSubmittedAnswers(gameId));
  });

  socket.on("participateIngame", function (d) {
    const game = data.getgame(d.gameId);
  
    if (!game.participants.some((p) => p.role === "Player 1")) {
      // Assign Player 1
      data.participateIngame(d.gameId, { name: "Player 1", role: "Player 1" });
      socket.emit("playerRoleAssigned", "Player 1");
      socket.join(d.gameId);
    } else if (!game.participants.some((p) => p.role === "Player 2")) {
      // Assign Player 2
      data.participateIngame(d.gameId, { name: "Player 2", role: "Player 2" });
      socket.emit("playerRoleAssigned", "Player 2");
      socket.join(d.gameId);
    } else {
      // Reject additional players
      socket.emit("error", "The game already has two players.");
      return;
    }
  
    io.to(d.gameId).emit("participantsUpdate", data.getParticipants(d.gameId));
  
    // Start the game if both players have joined
    if (game.participants.length === 2) {
      io.to(d.gameId).emit("startgame");
    }
  });

  socket.on('runQuestion', function(d) {
    let question = data.getQuestion(d.gameId, d.playerRole, d.questionNumber);
    io.to(d.gameId).emit('questionUpdate', {q:question, playerRole:d.playerRole});
  
  });

  socket.on('submitAnswer', function(d) {
     
    data.submitAnswer(d);
    console.log("now executing emit")
    process.nextTick(() => {
      io.to(d.gameId).emit("sendNodeStatus", data.getNodeStatus(d.gameId));
      io.to(d.gameId).emit('submittedAnswersUpdate', data.getScores(d.gameId));
    });
  }); 

  socket.on('validategameId', (gameId, callback) => {
    if (typeof gameId !== 'string' || gameId.trim() === '') {
      return callback(false);
    }
    const gameExists = data.gameExists(gameId);
    callback(gameExists);
  });

  socket.on("giveUp", function(d){
    console.log("server recieve playerRole", d.playerRole)
    io.to(d.gameId).emit("handleGiveUp", data.getWinner(d.playerRole))
  });


}

export { sockets };