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
      currentQuestion: 0,
      participants: [],
      nodeStatus: []
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
    poll.currentQuestion = 0;
    poll.nodeStatus = [];             
    this.polls[pollId] = poll;
    poll.counter = 0; //EMIL: for testing 
    
  }
  return this.polls[pollId];
}

Data.prototype.getPoll = function(pollId) {
  if (this.pollExists(pollId)) {
    return this.polls[pollId];
  }
  return {};
}

Data.prototype.participateInPoll = function (pollId, player) {
  if (this.pollExists(pollId)) {
    const poll = this.polls[pollId];
    if (poll.participants.length < 2) {
      poll.participants.push(player);
    }
  }
}

Data.prototype.getParticipants = function(pollId) {
  const poll = this.polls[pollId];
  console.log("DATA: participants requested for", pollId);
  if (this.pollExists(pollId)) { 
    return this.polls[pollId].participants
  }
  return [];
}

Data.prototype.addQuestion = function(pollId, q) {
  if (this.pollExists(pollId)) {
    this.polls[pollId].counter++;
    let counter = this.polls[pollId].counter
    this.polls[pollId].questions.push(q);
    this.polls[pollId].nodeStatus.push(0);
    console.log("DATA: question ", counter, " added"); //EMIL: testing stuff
    this.polls[pollId].answers.push({});
  }
}

Data.prototype.getQuestion = function(pollId, qId = null) {
  console.log("DATA: getQuestion reached"); //EMIL: testing stuff
  if (this.pollExists(pollId)) {
    const poll = this.polls[pollId];
    if (qId !== null) {
      console.log("Found qId not null"); //EMIL: testing stuff
      poll.currentQuestion = qId;
      console.log("currentQuestion updated"); //EMIL: testing stuff
    }
    return poll.questions[poll.currentQuestion];
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

Data.prototype.getSubmittedAnswers = function(pollId) {
  if (this.pollExists(pollId)) {
    const poll = this.polls[pollId];
    const answers = poll.answers[poll.currentQuestion];
    if (typeof poll.questions[poll.currentQuestion] !== 'undefined') {
      return answers;
    }
  }
  return {}
}

Data.prototype.submitAnswer = function(pollId, answer, playerRole) {
  console.log('DATA: Answer arrived in data, processing and storing answer: ', answer, ' type: ', typeof(answer));
  if (this.pollExists(pollId)) {
    console.log('DATA: found poll ', pollId);
    const poll = this.polls[pollId];
    console.log('DATA: found value of currentQuestion: ', poll.currentQuestion);
    let answers = poll.answers[poll.currentQuestion];
    
    console.log("status before answering: ",poll.nodeStatus[poll.currentQuestion])
    if(poll.nodeStatus[poll.currentQuestion] > 3){
      if(answer){
        if(playerRole === "Player 1"){
          poll.nodeStatus[poll.currentQuestion] = 1;
          console.log("DATA: answer is true, p1, setting status to:", poll.nodeStatus[poll.currentQuestion])
        }
        else {
          poll.nodeStatus[poll.currentQuestion] = 2;
          console.log("DATA: answer is true, p2, setting status to:", poll.nodeStatus[poll.currentQuestion])
        }
      }
      else {
        poll.nodeStatus[poll.currentQuestion] = 3;
        console.log("DATA: answer is false, setting status to: ",poll.nodeStatus[poll.currentQuestion])
      }
    }
    else {
      console.log("The other player got the question first") //GÖR SÅ ATT DEN ANDRAS FRPGEFÄLT FÖRSVINNER? KANSKE VIA SUBMITTED ANSERSARRAYEN?
    }
    

    console.log('DATA: answers-array has length: ', poll.answers.length);
    // create answers object if no answers have yet been submitted
    if (typeof answers !== 'object') {
      console.log("DATA: No 'answers' object found, creating new answers object")
      answers = {};
      answers[answer] = 1;
      poll.answers.push(answers);
    }
    // create answer property if that specific answer has not yet been submitted
    else if (typeof answers[answer] === 'undefined') {
      console.log(`DATA: Found 'answers' but no earlier property of value ${answer} exists, creating new property` );
      answers[answer] = 1;
    }
    // if the property already exists, increase the number
    else
      answers[answer] += 1;
    console.log("DATA: Answers look like ", answers, " type: ", typeof(answers));
    console.log("DATA: poll.answers looks like ", poll.answers, " type: ", typeof(poll.answers));
  }
}

export { Data };



