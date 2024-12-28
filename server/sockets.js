function sockets(io, socket, data) {
  
  socket.on('getUILabels', function(lang) {
    socket.emit('uiLabels', data.getUILabels(lang));
  });

  socket.on("getNodeStatus", function(pollId) {
    socket.emit("sendNodeStatus", data.getNodeStatus(pollId));
  });

  socket.on("nodeStatusUpdate", function (pollId, d) {
    const currentStatus = data.getNodeStatus(pollId)[d.node];
  
    // Prevent overwriting status 1 or 2
    if (currentStatus === 1 || currentStatus === 2) {
      console.log("Invalid update: Cannot change node status from", currentStatus, "to", d.status);
      return;
    }
  
    // Allow valid updates
    data.nodeStatusUpdate(pollId, d);
    io.to(pollId).emit("sendNodeStatus", data.getNodeStatus(pollId));
  });
  

  socket.on('createPoll', function(d) {
    data.createPoll(d.pollId, d.lang)
    socket.emit('pollData', data.getPoll(d.pollId));
  });

  socket.on('addQuestion', function(d) {
    data.addQuestion(d.pollId, {q: d.q, a: d.a});
    socket.emit('questionUpdate', {q:data.getQuestion(d.pollId), player:""});
  });

  socket.on('getNumberOfQuestions', function(pollId) {
    socket.emit('numberOfQuestions', data.getNumberOfQuestions(pollId).length);

  });

  socket.on('joinPoll', function(pollId) {
    socket.join(pollId); // Add the client to the poll's room
    socket.emit('questionUpdate', { q: data.getQuestion(pollId), player: "" });
    socket.emit('submittedAnswersUpdate', data.getSubmittedAnswers(pollId));
  });

  socket.on("participateInPoll", function (d) {
    const poll = data.getPoll(d.pollId);
  
    if (!poll.participants.some((p) => p.role === "Player 1")) {
      // Assign Player 1
      data.participateInPoll(d.pollId, { name: "Player 1", role: "Player 1" });
      socket.emit("playerRoleAssigned", "Player 1");
      socket.join(d.pollId);
    } else if (!poll.participants.some((p) => p.role === "Player 2")) {
      // Assign Player 2
      data.participateInPoll(d.pollId, { name: "Player 2", role: "Player 2" });
      socket.emit("playerRoleAssigned", "Player 2");
      socket.join(d.pollId);
    } else {
      // Reject additional players
      socket.emit("error", "The game already has two players.");
      return;
    }
  
    io.to(d.pollId).emit("participantsUpdate", data.getParticipants(d.pollId));
  
    // Start the game if both players have joined
    if (poll.participants.length === 2) {
      io.to(d.pollId).emit("startPoll");
    }
  });
  
  socket.on('startPoll', function(pollId) {
    io.to(pollId).emit('startPoll');
  })
  socket.on('runQuestion', function(d) {
    let question = data.getQuestion(d.pollId, d.playerRole, d.questionNumber);
    io.to(d.pollId).emit('questionUpdate', {q:question, playerRole:d.playerRole});
  
  });

  socket.on('submitAnswer', function(d) {
    console.log('SOCKETS: Answer received in sockets, forwarding to data');
    data.submitAnswer(d);                    
    io.to(d.pollId).emit("sendNodeStatus", data.getNodeStatus(d.pollId));
    io.to(d.pollId).emit('submittedAnswersUpdate', data.getScores(d.pollId)); //EDVIN: MÅSTE VARA KVAR
  }); 

  socket.on('validatePollId', (pollId, callback) => {
    if (typeof pollId !== 'string' || pollId.trim() === '') {
      return callback(false);
    }
    const pollExists = data.pollExists(pollId);
    callback(pollExists);
  });
  socket.on('nodeStatusChanged', function(d) {
    const poll = data.getPoll(d.pollId);

    if (poll) {
      // Update the node status for the specific question
      if (!poll.nodeStatusMap) poll.nodeStatusMap = {};
      poll.nodeStatusMap[d.questionId] = d.nodeStatus;

      // Broadcast the updated status to all connected clients
      io.to(d.pollId).emit('nodeStatusUpdate', d);
    }
  });

}

export { sockets };