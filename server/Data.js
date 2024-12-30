'use strict';
import {readFileSync} from "fs";

// Store data in an object to keep the global namespace clean. In an actual implementation this would be interfacing a database...
function Data() {
  this.polls = {};
  this.polls['test'] = {
    lang: "en",
    questions: [
      {q: "1?", 
       a: [{a:"0-13", c:true}, {a:"14-18", c:false}, {a:"19-25", c:false}, {a:"26-35", c:false}]
      },
      {q: "2?", 
       a: [{a:"0-13", c:true}, {a:"14-18", c:false}, {a:"19-25", c:false}, {a:"26-35", c:false}]
      },
      {q: "3?", 
        a: [{a:"0-13", c:true}, {a:"14-18", c:false}, {a:"19-25", c:false}, {a:"26-35", c:false}]
       },
       {q: "4?", 
        a: [{a:"0-13", c:true}, {a:"14-18", c:false}, {a:"19-25", c:false}, {a:"26-35", c:false}]
       }
      ],
      answers: [],
      currentQuestion: [],
      participants: [],
      nodeStatus: [],
      scores: {p1Score: 1, p2Score: 1}
    }
  }

/***********************************************
For performance reasons, methods are added to the
prototype of the Data object/class
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures
***********************************************/

Data.prototype.pollExists = function (pollId) {
  return typeof this.polls[pollId] !== "undefined"
}

Data.prototype.getNodeStatus = function (pollId) {
  return this.polls[pollId].nodeStatus;
}


Data.prototype.getScores = function (pollId) {
  return this.polls[pollId].scores;
}

Data.prototype.nodeStatusUpdate = function (pollId,d) {
    this.polls[pollId].nodeStatus[d.node] = d.status;
}

Data.prototype.getUILabels = function (lang) {
  //check if lang is valid before trying to load the dictionary file
  if (!["en", "sv"].some( el => el === lang))
    lang = "en";
  const labels = readFileSync("./server/data/labels-" + lang + ".json");
  return JSON.parse(labels);
}

Data.prototype.createPoll = function(pollId, lang="en") {
  if (!this.pollExists(pollId)) {
    let poll = {};
    poll.lang = lang;  
    poll.questions = [];
    poll.answers = [];
    poll.participants = [];
    poll.currentQuestion = [];
    poll.nodeStatus = [];             
    this.polls[pollId] = poll;
    poll.counter = 0; //EMIL: for testing 
    poll.scores = {p1Score: 1, p2Score: 1};
    
  }
  return this.polls[pollId];
}

Data.prototype.getPoll = function(pollId) {
  if (this.pollExists(pollId)) {
    return this.polls[pollId];
  }
  return {};
}
//Lägger till playerName
Data.prototype.participateInPoll = function (pollId, player,playerName) {
  if (this.pollExists(pollId)) {
    const poll = this.polls[pollId];
    if (poll.participants.length < 2) {
      poll.participants.push({ player, name: playerName });
      poll.currentQuestion.push(0);
      return true;
    }
  }
  return false;
}

Data.prototype.getParticipants = function(pollId) {
  const poll = this.polls[pollId];
  console.log("DATA: participants requested for", pollId);
  if (this.pollExists(pollId)) { 
    return this.polls[pollId].participants
  }
  return [];
}
//Lagt till detta
Data.prototype.getPlayerName = function(pollId, player) {
  if (this.pollExists(pollId)) {
    const participant = this.polls[pollId].participants.find(p => p.player === player);
    return participant ? participant.name : null;
  }
  return null;
}

Data.prototype.addQuestion = function(pollId, q) {
  if (this.pollExists(pollId)) {
    this.polls[pollId].counter++;
    let counter = this.polls[pollId].counter
    this.polls[pollId].questions.push(q);
    this.polls[pollId].nodeStatus.push(0);
    this.polls[pollId].answers.push({});
  }
}

Data.prototype.getQuestion = function(pollId, player = null, qId = null) {

  if (this.pollExists(pollId)) {
    const poll = this.polls[pollId];
    if (qId !== null) {
      if (player === "Player 1") {
        poll.currentQuestion [0] = qId;
        return poll.questions[poll.currentQuestion[0]];
      }
      else if (player === "Player 2") {
        poll.currentQuestion [1] = qId;
        return poll.questions[poll.currentQuestion[1]];
      }
      else {
        return poll.questions[qId];
      }

    }
    
  }
  return {}
}

Data.prototype.getNumberOfQuestions = function(pollId) {
  if (this.pollExists(pollId)) {
    const poll = this.polls[pollId];
    return poll.questions;
  }
  return {}
}

Data.prototype.getSubmittedAnswers = function(pollId) { //Denna funktion returnerar bara svar från spelare 1!!
  if (this.pollExists(pollId)) {
    const poll = this.polls[pollId];
    const answers = poll.answers[poll.currentQuestion[0]];
    if (typeof poll.questions[poll.currentQuestion[0]] !== 'undefined') {
      return answers;
    }
  }
  return {}
}

Data.prototype.submitAnswer = function(d) { 

  if (this.pollExists(d.pollId)) {

    const poll = this.polls[d.pollId];
    let answers = {};
    console.log("checks submitted answer data")
    if(d.correct){
      if (d.playerRole === "Player 1"){ 
        if (poll.nodeStatus[poll.currentQuestion[0]] !== 1 && poll.nodeStatus[poll.currentQuestion[0]] !== 2 && poll.nodeStatus[poll.currentQuestion[0]] !== 3){
          answers = poll.answers[poll.currentQuestion[0]]; //behövs dessa answers????
          poll.nodeStatus[poll.currentQuestion[0]] = 1; // Player 1 claims
          poll.scores.p1Score++;
        }   
      }
      if (d.playerRole === "Player 2"){
        if (poll.nodeStatus[poll.currentQuestion[1]] !== 1 && poll.nodeStatus[poll.currentQuestion[1]] !== 2 && poll.nodeStatus[poll.currentQuestion[1]] !== 3){
          answers = poll.answers[poll.currentQuestion[1]];
          poll.nodeStatus[poll.currentQuestion[1]] = 2; // Player 2 claims
          poll.scores.p2Score++;
        }
      }
    }
    else {
      if (d.playerRole === "Player 1"){
        if (poll.nodeStatus[poll.currentQuestion[0]] !== 1 && poll.nodeStatus[poll.currentQuestion[0]] !== 2 && poll.nodeStatus[poll.currentQuestion[0]] !== 3){
          poll.nodeStatus[poll.currentQuestion[0]] = 3;
        }
      }
      if (d.playerRole === "Player 2"){
        if (poll.nodeStatus[poll.currentQuestion[1]] !== 1 && poll.nodeStatus[poll.currentQuestion[1]] !== 2 && poll.nodeStatus[poll.currentQuestion[1]] !== 3){
          poll.nodeStatus[poll.currentQuestion[1]] = 3;
        }
      }
    }
    console.log("Data changed") 
  }
}
export { Data };



