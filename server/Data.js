'use strict';
import {readFileSync} from "fs";

// Store data in an object to keep the global namespace clean. In an actual implementation this would be interfacing a database...
function Data() {
  this.games = {};
  }

/***********************************************
For performance reasons, methods are added to the
prototype of the Data object/class
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures
***********************************************/

Data.prototype.gameExists = function (gameId) {
  return typeof this.games[gameId] !== "undefined"
}

Data.prototype.getNodeStatus = function (gameId) {
  return this.games[gameId].nodeStatus;
}

Data.prototype.getScores = function (gameId) {
  return this.games[gameId].scores;
}

Data.prototype.nodeStatusUpdate = function (gameId,d) {
    this.games[gameId].nodeStatus[d.node] = d.status;
}

Data.prototype.getUILabels = function (lang) {
  //check if lang is valid before trying to load the dictionary file
  if (!["en", "sv"].some( el => el === lang))
    lang = "en";
  const labels = readFileSync("./server/data/labels-" + lang + ".json");
  return JSON.parse(labels);
}

Data.prototype.creategame = function(gameId, lang="en") {
  if (!this.gameExists(gameId)) {
    let game = {};
    game.lang = lang;  
    game.questions = [];
    game.answers = [];
    game.participants = [];
    game.currentQuestion = [];
    game.nodeStatus = [];             
    this.games[gameId] = game;
    game.scores = {p1Score: 1, p2Score: 1};
    
  }
  return this.games[gameId];
}

Data.prototype.getgame = function(gameId) {
  if (this.gameExists(gameId)) {
    return this.games[gameId];
  }
  return {};
}

Data.prototype.participateIngame = function (gameId, player) {
  if (this.gameExists(gameId)) {
    const game = this.games[gameId];
    if (game.participants.length < 2) {
      game.participants.push(player);
      game.currentQuestion.push(0);
    }
  }
}

Data.prototype.getParticipants = function(gameId) {
  const game = this.games[gameId];
  if (this.gameExists(gameId)) { 
    return this.games[gameId].participants
  }
  return [];
}

Data.prototype.addQuestion = function(gameId, q) {
  if (this.gameExists(gameId)) {
    this.games[gameId].questions.push(q);
    this.games[gameId].nodeStatus.push(0);
  }
}

Data.prototype.getQuestion = function(gameId, player = null, qId = null) {
  if (this.gameExists(gameId)) {
    const game = this.games[gameId];
    if (qId !== null) {
      if (player === "Player 1") {
        game.currentQuestion [0] = qId;
        return game.questions[game.currentQuestion[0]];
      }
      else if (player === "Player 2") {
        game.currentQuestion [1] = qId;
        return game.questions[game.currentQuestion[1]];
      }
      else {
        return game.questions[qId];
      }
    }
  }
  return {}
}

Data.prototype.getNumberOfQuestions = function(gameId) {
  if (this.gameExists(gameId)) {
    const game = this.games[gameId];
    return game.questions;
  }
  return {}
}

Data.prototype.getWinner = function(playerRole){
  if(playerRole === "Player 1"){
    return "Player 2";
  }
  if (playerRole === "Player 2"){
    return "Player 1"
  }
}

Data.prototype.submitAnswer = function(d) { 
  if (this.gameExists(d.gameId)) {
    const game = this.games[d.gameId];
    if(d.correct){
      if (d.playerRole === "Player 1"){ 
        if (game.nodeStatus[game.currentQuestion[0]] !== 1 && game.nodeStatus[game.currentQuestion[0]] !== 2 && game.nodeStatus[game.currentQuestion[0]] !== 3){
          game.nodeStatus[game.currentQuestion[0]] = 1; // Player 1 claims
          game.scores.p1Score++;
        }   
      }
      if (d.playerRole === "Player 2"){
        if (game.nodeStatus[game.currentQuestion[1]] !== 1 && game.nodeStatus[game.currentQuestion[1]] !== 2 && game.nodeStatus[game.currentQuestion[1]] !== 3){
          game.nodeStatus[game.currentQuestion[1]] = 2; // Player 2 claims
          game.scores.p2Score++;
        }
      }
    }
    else {
      if (d.playerRole === "Player 1"){
        if (game.nodeStatus[game.currentQuestion[0]] !== 1 && game.nodeStatus[game.currentQuestion[0]] !== 2 && game.nodeStatus[game.currentQuestion[0]] !== 3){
          game.nodeStatus[game.currentQuestion[0]] = 3;
        }
      }
      if (d.playerRole === "Player 2"){
        if (game.nodeStatus[game.currentQuestion[1]] !== 1 && game.nodeStatus[game.currentQuestion[1]] !== 2 && game.nodeStatus[game.currentQuestion[1]] !== 3){
          game.nodeStatus[game.currentQuestion[1]] = 3;
        }
      }
    } 
  }
}
export { Data };



