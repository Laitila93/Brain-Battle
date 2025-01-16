<template>
    <div class="node-area">
      <div class="node-grid" :style="{ gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: dynamicGap}">
        <button v-for="index in totalQuestions" 
            class="nodeButton" 
            :id="'node-' + index"
            :disabled=true
            v-on:click="runQuestion(index)">
        </button>
      </div>
    </div>

  </template>
  
<script>
    import { setNodeStatus, checkAdjacentNodes, drawNodeColors } from "@/assets/Methods.js";
    import io from 'socket.io-client';
    const socket = io(sessionStorage.getItem("serverIP"));

    export default {
        name: 'DominationComponent',
        data: function () {
        return {
            disabled: true,
            nodeStatus: [],
            columns: 0,
            showQuestionComponent: false,
            totalQuestions: null

        }; 
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
        }
    },
    props: {
        playerRole: String,
        isGameOver: Boolean

    },
 
    watch: {
    nodeStatus: function () {
        this.$emit("refreshGame")
        console.log("inside nodestatus watch")
        drawNodeColors({ 
          nodeStatus: this.nodeStatus, 
          showQuestionComponent: this.showQuestionComponent, 
          totalQuestions: this.totalQuestions, 
          playerRole: this.playerRole });
      },
    isGameOver: function () {
        for (let i = 1; i <= this.totalQuestions; i++) {
        let nodeElement = document.getElementById('node-' + i);
        nodeElement.disabled = true;
        nodeElement.style.animation = "none";
      }
    },
    showQuestionComponent: function() {
        this.$emit("showQuestionComponent", this.showQuestionComponent);
    }
  },
  created: function () {
    socket.on("sendNodeStatus", status => {
        this.nodeStatus = status;
        console.log("inside socket.on.sendNodeStats")
      });

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
          console.log(this.nodeStatus)
      });
    
    socket.on("submitAnswer", d => {
    this.showQuestionComponent = false;
    });
    socket.emit("getNumberOfQuestions", this.$route.params.id);

    socket.on("submittedAnswersUpdate", scores => {
        checkAdjacentNodes({
            nodeStatus: this.nodeStatus,
            columns: this.columns,
            totalQuestions: this.totalQuestions,
            gameId: this.$route.params.id,
            socket: socket, // Ensure socket is correctly passed here
          }); 
          this.checkIsGameOver();                           

      });



  },
    emits:["qestionNumber", "showQuestionComponent", "refreshGame"],
  
    methods: {
        runQuestion: function (questionNumber) {
            this.$emit("qestionNumber", qestionNumber);
            sessionStorage.setItem("currentQuestionNumber", questionNumber);
            sessionStorage.setItem("showQuestionComponent", true);

            socket.emit("runQuestion", { gameId: this.$route.params.id, questionNumber: questionNumber - 1, playerRole: this.playerRole });
            this.showQuestionComponent = true;
            if (this.playerRole === "Player 1") {
                setNodeStatus({d:{ node: this.questionNumber-1, status: 7 /*set to 7 instead of 0 */ }, gameId: this.$route.params.id, nodeStatus: this.nodeStatus, socket: socket });
            }
            else {
                setNodeStatus({d:{ node: this.questionNumber-1, status: 8 /*set to 8 instead of 0 */ }, gameId: this.$route.params.id, nodeStatus: this.nodeStatus, socket: socket });
            }
        },

      emitQuestionId: function () {
        this.$emit("questionId", this.questionId);
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
    }
  };
  </script>