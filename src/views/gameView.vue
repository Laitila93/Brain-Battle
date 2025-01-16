<template>
    <div class="header-container">
      <button class="back-btn" v-on:click="giveUp">
        {{ uiLabels.giveUp }}
      </button>
      <div class="lang-container">
        {{ uiLabels.changeLanguage }}
        <button 
          v-on:click="switchLanguage" 
          v-bind:class="['button-sv', {'button-en':this.lang=='sv'},'lang-btn']">
        </button>
      </div>
    </div> 

  <div class="main-container"> 
    <div class="banner">
      <div class="player player1" v-if="playerRole === 'Player 1'">
        {{ uiLabels.yourScore }}: {{ this.scores.p1Score }}
      </div>
      <div class="player player1" v-else>
        {{ uiLabels.opponentScore }}: {{ this.scores.p1Score }}
      </div>
      <div class="game-id-game">
        {{ uiLabels.whichGame }}: {{ gameId }}
      </div>
      <div class="player player2" v-if="playerRole === 'Player 2'">
        {{ uiLabels.yourScore }}: {{ this.scores.p2Score }}
      </div>
      <div class="player player2" v-else>
        {{ uiLabels.opponentScore }}: {{ this.scores.p2Score }}
      </div>
    </div>
    <DominationComponent
      v-bind:playerRole="playerRole"
      v-bind:isGameOver="isGameOver"
      v-bind:key="refresh"
      v-on:questionNumber="setQuestionNumber($event)"
      v-on:showQuestionComponent="setshowQuestionComponent($event)"
      v-on:refreshGame="refreshGame()"
      />

    <div v-if="!isGameOver">
      <div v-if="lastAnswer === 'correct' && showQuestionComponent !== true">
        {{ uiLabels.correctAnswer }}
      </div>
      <div v-if="lastAnswer === 'wrong' && showQuestionComponent !== true">
        {{ uiLabels.wrongAnswer }}
      </div>
      <div v-if="lastAnswer === 'start' && showQuestionComponent !== true">
        {{ uiLabels.clickNodePrompt }}
      </div>
        <div v-if="showQuestionComponent">
          <QuestionComponent
            v-bind:question="question" 
            v-on:answer="submitAnswer($event, this.playerRole)"
            />
        </div>
    </div>
    <div v-else>
      <div>
        {{ uiLabels.gameOver }}
      </div>
      <div v-if="gaveUp && winner === playerRole">
        {{ uiLabels.opponentGaveUp }}
      </div>
      <div v-if="gaveUp && winner !== playerRole">
        {{ uiLabels.youGaveUp }}
      </div>
      <div :class="'who-wins-' + playerRoleShort" v-if="winner === playerRole">
        {{uiLabels.youWin}}
      </div>
      <div :class="'who-wins-' + playerRoleShort" v-else-if="winner === ''">
        {{uiLabels.draw}}
      </div>
      <div :class="'who-wins-' + playerRoleShort" v-else>
        {{ uiLabels.youLoose }}
      </div>
      <button class="back-btn back-btn-game" onclick="location.href='/';">
          {{ uiLabels.returnHome }}
      </button>
    </div>
  </div>
</template>

<script>
import QuestionComponent from '@/components/QuestionComponent.vue';
import io from 'socket.io-client';
import DominationComponent from '../components/DominationComponent.vue';

const socket = io(sessionStorage.getItem("serverIP"));

export default {
  name: 'gameView',
  components: {
    QuestionComponent,
    DominationComponent

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
      questionNumber: 0,
      scores: {p1Score: 1, p2Score: 1},
      showQuestionComponent: false, // Control the visibility of the QuestionComponent
      lastAnswer: "start", 
      isGameOver:false,
      winner: "",
      gaveUp: false,
      refresh: 0
    };
  },
//--------------------------------------------------------------------------------
  created: function () {
    this.gameSetup();
    //lines below to handle bugs after refresh in game.
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
  },
  computed: {
    playerRoleShort() {
      // Transform "Player 1" -> "p1" and "Player 2" -> "p2"
      return this.playerRole === "Player 1" ? "p1" : 
             this.playerRole === "Player 2" ? "p2" : "";
    }
  },

  //--------------------------------------------------------------------------------
  methods: {
    gameSetup: function () {
      this.gameId = this.$route.params.id;

      socket.on("playerRoleAssigned", role => {
        this.playerRole = role;
        sessionStorage.setItem("playerRole", role); // Update locally just in case
      });

      socket.on("submittedAnswersUpdate", scores => {                            
        this.scores = scores;
        sessionStorage.setItem("savedP1Score", this.scores.p1Score);
        sessionStorage.setItem("savedP2Score", this.scores.p2Score);
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

    setQuestionNumber(number) {
      this.questionNumber = number;
    },

    setshowQuestionComponent(is) {
      this.showQuestionComponent = is;
    },

    refreshGame() {
      this.refresh += 1;
    },

    stopGame: function(){
      sessionStorage.removeItem("savedP1Score");
      sessionStorage.removeItem("savedP2Score");
      sessionStorage.removeItem("currentQuestionNumber");
      sessionStorage.removeItem("showQuestionComponent");
    },

    submitAnswer: function (answer, playerRole) {
      if (answer.c) {
        socket.emit("submitAnswer", { gameId: this.gameId, correct: answer.c, playerRole: playerRole }); 
        this.lastAnswer = "correct";
      }
      else {
        //this.setNodeStatus({ node: this.questionNumber-1, status: 3 }); //kommenterade bort denna för att sätta status i Data ist, buggade annars
        socket.emit("submitAnswer", { gameId: this.gameId, answer: answer.a, correct: answer.c, playerRole: playerRole }); //la till för att kommunicera checkisgameover
        this.lastAnswer = "wrong";
      } 
      sessionStorage.removeItem("currentQuestionNumber");
      sessionStorage.removeItem("showQuestionComponent");
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
