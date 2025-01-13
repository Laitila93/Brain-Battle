<template>
  <header>
    <div class="lang-switcher">
      <button class="back-btn" v-on:click="giveUp">
        {{ uiLabels.giveUp }}
      </button>
      <div>
        {{ uiLabels.changeLanguage }}
        <button 
          v-on:click="switchLanguage" 
          v-bind:class="['button-sv', {'button-en':this.lang=='sv'},'lang-btn']">
        </button>
      </div>
    </div> 
  </header>

  <div class="main-container"> 
    <div class="banner">
      <div class="player player1" v-if="playerRole === 'Player 1'">{{ uiLabels.yourScore }}: {{ this.scores.p1Score }}</div>
      <div class="player player1" v-else>{{ uiLabels.opponentScore }}: {{ this.scores.p1Score }}</div>
      <div class="game-id-game">{{ uiLabels.whichGame }}: {{ gameId }}</div>
      <div class="player player2" v-if="playerRole === 'Player 2'">{{ uiLabels.yourScore }}: {{ this.scores.p2Score }}</div>
      <div class="player player2" v-else>{{ uiLabels.opponentScore }}: {{ this.scores.p2Score }}</div>
    </div>

    <div class="node-area">
      <div class="node-grid" :style="{ gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: dynamicGap}">
        <NodeComponent 
          v-for="index in totalQuestions" 
          :key="index"
          :questionId="index" 
          @questionId="runQuestion($event)"
        />
      </div>
    </div>
    <div v-if="!isGameOver">
      <div v-if="lastAnswer === 'correct' && showQuestionComponent !== true">{{ uiLabels.correctAnswer }}</div>
      <div v-if="lastAnswer === 'wrong' && showQuestionComponent !== true">{{ uiLabels.wrongAnswer }}</div>
      <div v-if="lastAnswer === 'start' && showQuestionComponent !== true">{{ uiLabels.clickNodePrompt }}</div>
          <div v-if="showQuestionComponent">
            <QuestionComponent
              v-bind:question="question" 
              v-on:answer="submitAnswer($event, this.playerRole)"
              v-on:answered="handleAnswered"
            />
          </div>
    </div>
    <div v-else>
      <div>{{ uiLabels.gameOver }}</div>
      <div v-if="gaveUp && winner === playerRole">{{ uiLabels.opponentGaveUp }}</div>
      <div v-if="gaveUp && winner !== playerRole">{{ uiLabels.youGaveUp }}</div>

      <div :class="'who-wins-' + playerRoleShort" v-if="winner === playerRole">{{uiLabels.youWin}}</div>
      <div :class="'who-wins-' + playerRoleShort" v-else-if="winner === ''">{{uiLabels.draw}}</div>
      <div :class="'who-wins-' + playerRoleShort" v-else>{{ uiLabels.youLoose }}</div>
        
      <button 
        class="back-btn back-btn-game" 
        onclick="location.href='/';">
          {{ uiLabels.returnHome }}
      </button>
    </div>

  </div>
</template>

<script>
import QuestionComponent from '@/components/QuestionComponent.vue';
import io from 'socket.io-client';
import NodeComponent from '../components/NodeComponent.vue';
import { setNodeStatus, checkAdjacentNodes, drawNodeColors } from "@/assets/Methods.js";
const socket = io(sessionStorage.getItem("serverIP"));

export default {
  name: 'gameView',
  components: {
    QuestionComponent,
    NodeComponent
  },
  //--------------------------------------------------------------------------------
  data: function () {
    return {
      question: { //convertera till en array så flera frågor kan vara laddade samtidigt
        q: "",
        a: []
      },
      uiLabels: {},
      lang: sessionStorage.getItem( "lang") || "en",
      playerRole: sessionStorage.getItem("playerRole") || "",
      gameId: "inactive game",
      submittedAnswers: {}, //Emil: kan tas bort, alt lägg till funktionalitet så att denna uppdateras och kan nås i Result?
      questionNumber: 0,
      totalQuestions: 0,
      nodeNumber: 0, //Emi: kan tas bort?
      columns: 0,
      nodeStatus: [],
      firstCheck: true, // Guard variable //Emil: Kan tas bort? 
      scores: {p1Score: 1, p2Score: 1},
      showQuestionComponent: false, // Control the visibility of the QuestionComponent
      lastAnswer: "start", 
      isGameOver:false,
      winner: "",
      gaveUp: false
    };
  },
//--------------------------------------------------------------------------------
  created: function () {
    this.gameSetup();
    //lines below to handle bugs after refresh
    const savedQuestionNumber = sessionStorage.getItem("currentQuestionNumber");
    const showQuestionComponent = sessionStorage.getItem("showQuestionComponent") === "true";
    const savedP1Score = sessionStorage.getItem("savedP1Score");
    const savedP2Score = sessionStorage.getItem("savedP2Score");

    if (savedQuestionNumber && showQuestionComponent) {
      this.questionNumber = parseInt(savedQuestionNumber, 10);
      this.showQuestionComponent = true;

      socket.emit("runQuestion", { 
        gameId: this.gameId, 
        questionNumber: this.questionNumber - 1, 
        playerRole: this.playerRole 
      });
    }
    if (savedP1Score && savedP2Score) {
      this.scores.p1Score = savedP1Score;
      this.scores.p2Score = savedP2Score;
    }
    //this.checkIsGameOver();
  },
  computed: {
    dynamicGap() {
      if (!this.$el) {
        return '5px'; // Default gap value
      }
      const containerWidth = this.$el.clientWidth;
      const baseGap = 5; // Base gap in pixels
      const additionalGap = (containerWidth - (this.columns * 100)) / (this.columns - 1);
      return `${baseGap + additionalGap}px`;
    },
    playerRoleShort() {
      // Transform "Player 1" -> "p1" and "Player 2" -> "p2"
      return this.playerRole === "Player 1" ? "p1" : 
             this.playerRole === "Player 2" ? "p2" : "";
    }
  },
  watch: {
    nodeStatus: function () {
      console.log("NodeStatus changed, calling drawNodeColors", this.nodeStatus[3]);
        drawNodeColors({ 
          nodeStatus: this.nodeStatus, 
          showQuestionComponent: this.showQuestionComponent, 
          totalQuestions: this.totalQuestions, 
          playerRole: this.playerRole });
      }
  },
  //--------------------------------------------------------------------------------
  methods: {
    gameSetup: function () {
      socket.on("sendNodeStatus", status => {
        console.log("SendNodeStatus event caught, nodeStatus updated");
        this.nodeStatus = status;
      });
      this.gameId = this.$route.params.id;
      socket.on("numberOfQuestions", number => {
        this.totalQuestions = number;
        setNodeStatus({d:{ node: 0, status: 1 }, gameId: this.$route.params.id, nodeStatus: this.nodeStatus, socket: socket });
        let lastNode = this.totalQuestions - 1;
        this.columns = Math.sqrt(this.totalQuestions);
        setNodeStatus({d:{ node: lastNode, status: 2 }, gameId: this.$route.params.id, nodeStatus: this.nodeStatus, socket: socket });
        checkAdjacentNodes({
            nodeStatus: this.nodeStatus,
            columns: this.columns,
            totalQuestions: this.totalQuestions,
            gameId: this.$route.params.id,
            socket: socket, // Ensure socket is correctly passed here
          }); 
      });
      socket.emit("getNumberOfQuestions", this.gameId);
      socket.on("playerRoleAssigned", role => {
        this.playerRole = role;
        sessionStorage.setItem("playerRole", role); // Update locally just in case
      });

      socket.on("submittedAnswersUpdate", scores => {
        console.log("submittedAnswersUpdate event caught, calling checkAdjacent");
        checkAdjacentNodes({
            nodeStatus: this.nodeStatus,
            columns: this.columns,
            totalQuestions: this.totalQuestions,
            gameId: this.$route.params.id,
            socket: socket, // Ensure socket is correctly passed here
          });                            
        this.scores = scores;
        sessionStorage.setItem("savedP1Score", this.scores.p1Score);
        sessionStorage.setItem("savedP2Score", this.scores.p2Score);

        this.checkIsGameOver();

      });
      socket.on("uiLabels", labels => {this.uiLabels = labels.gameViewLabels;});
      socket.emit("getUILabels", this.lang);
      socket.emit("joingame", this.gameId);
      socket.on("questionUpdate", d => {if (d.playerRole === this.playerRole) {this.question = d.q;}});
      
      socket.on("handleGiveUp", (winner)=>{
        this.gaveUp = true;
        this.winner = winner;
        
        this.isGameOver = true;

        this.stopGame();
      });
      
    },

    handleAnswered() {
      this.showQuestionComponent = false; // Hide the QuestionComponent
      sessionStorage.removeItem("currentQuestionNumber");
      sessionStorage.removeItem("showQuestionComponent");
    },

    checkIsGameOver: function(){
      let isReachablePlayer1 = false;
      let isReachablePlayer2 = false;

      for (let i = 0; i < this.totalQuestions; i++) {
        if (this.nodeStatus[i] === 4 || this.nodeStatus[i] === 6) {
          isReachablePlayer1 = true;
        }
        if (this.nodeStatus[i] === 5 || this.nodeStatus[i] === 6) {
          isReachablePlayer2 = true;
        }
      }
      if (!isReachablePlayer1 && this.scores.p2Score > this.scores.p1Score){
        this.isGameOver = true;
        this.winner = "Player 2";
        this.showQuestionComponent = true;
      }
      if (!isReachablePlayer2 && this.scores.p1Score > this.scores.p2Score){
        this.isGameOver = true;
        this.winner = "Player 1";
        this.showQuestionComponent = true;
      }
      if (!isReachablePlayer2 && !isReachablePlayer1 && this.scores.p1Score === this.scores.p2Score){
        this.isGameOver = true;
        this.winner = ""
      }
      if (this.isGameOver){
        this.stopGame();
        
      }
    },

    stopGame: function(){
      for (let i = 1; i <= this.totalQuestions; i++) {
        let nodeElement = document.getElementById('node-' + i);
        nodeElement.disabled = true;
        nodeElement.style.animation = "none";
      }
      sessionStorage.removeItem("savedP1Score");
      sessionStorage.removeItem("savedP2Score");
      sessionStorage.removeItem("currentQuestionNumber");
      sessionStorage.removeItem("showQuestionComponent");
    },

    submitAnswer: function (answer, playerRole) {
      if (answer.c) {
        socket.emit("submitAnswer", { gameId: this.gameId, answer: answer.a, correct: answer.c, playerRole: playerRole }); 
        drawNodeColors({ 
          nodeStatus: this.nodeStatus, 
          showQuestionComponent: this.showQuestionComponent, 
          totalQuestions: this.totalQuestions, 
          playerRole: this.playerRole });
        this.lastAnswer = "correct";
      }
      else {
        console.log("wrong answer");
        //this.setNodeStatus({ node: this.questionNumber-1, status: 3 }); //kommenterade bort denna för att sätta status i Data ist, buggade annars
        socket.emit("submitAnswer", { gameId: this.gameId, answer: answer.a, correct: answer.c, playerRole: playerRole }); //la till för att kommunicera checkisgameover
        drawNodeColors({ 
          nodeStatus: this.nodeStatus, 
          showQuestionComponent: this.showQuestionComponent, 
          totalQuestions: this.totalQuestions, 
          playerRole: this.playerRole });
        this.lastAnswer = "wrong";
      
      } 
    },
    runQuestion: function (questionNumber) {
      this.questionNumber = questionNumber;
      sessionStorage.setItem("currentQuestionNumber", questionNumber);
      sessionStorage.setItem("showQuestionComponent", true);

      socket.emit("runQuestion", { gameId: this.gameId, questionNumber: this.questionNumber - 1, playerRole: this.playerRole });
      this.showQuestionComponent = true;
      if (this.playerRole === "Player 1") {
        setNodeStatus({d:{ node: this.questionNumber-1, status: 7 /*set to 7 instead of 0 */ }, gameId: this.$route.params.id, nodeStatus: this.nodeStatus, socket: socket });
      }
      else {
        setNodeStatus({d:{ node: this.questionNumber-1, status: 8 /*set to 8 instead of 0 */ }, gameId: this.$route.params.id, nodeStatus: this.nodeStatus, socket: socket });
      }
    },

    switchLanguage: function() {
      if (this.lang === "en") {
        this.lang = "sv"
      }
      else {
        this.lang = "en"
      }
      sessionStorage.setItem( "lang", this.lang );
      socket.emit( "getUILabels", this.lang );
    },

    giveUp: function(){
      socket.emit("giveUp",{gameId: this.gameId, playerRole: this.playerRole});
    }

  }
}
</script>
