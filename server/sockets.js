function sockets(io, socket, data) {
  
  socket.on('getUILabels', function(lang) {
    socket.emit('uiLabels', data.getUILabels(lang));
  });

  socket.on('createPoll', function(d) {
    data.createPoll(d.pollId, d.lang)
    socket.emit('pollData', data.getPoll(d.pollId));
  });

  socket.on('addQuestion', function(d) {
    data.addQuestion(d.pollId, {q: d.q, a: d.a});
    socket.emit('questionUpdate', data.getQuestion(d.pollId));
  });

  socket.on('getNumberOfQuestions', function(pollId) {
    socket.emit('numberOfQuestions', data.getNumberOfQuestions(pollId).length);

  });

  socket.on('joinPoll', function(pollId) {
    socket.join(pollId);
    socket.emit('questionUpdate', data.getQuestion(pollId))
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
    let question = data.getQuestion(d.pollId, d.questionNumber);
    io.to(d.pollId).emit('questionUpdate', question);
    io.to(d.pollId).emit('submittedAnswersUpdate', data.getSubmittedAnswers(d.pollId));
  });

  socket.on('submitAnswer', function(d) {
    data.submitAnswer(d.pollId, d.answer);
    io.to(d.pollId).emit('submittedAnswersUpdate', data.getSubmittedAnswers(d.pollId));
  }); 
}

export { sockets };