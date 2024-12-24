<template>
  <div class="wrapper">
    <!--                                                                         
    <button @click="checkAdjacentNodes()">Adjacent nodes</button>
    <button @click="setNodeStatus({node:7, status:1})">Set Node 7 to 1</button>
    {{ nodeStatus }}
    -->
    <div class="banner">
      <div class="player player1" v-if="playerRole === 'Player 1'">You</div>
      <div class="player player1" v-else>Opponent</div>
      <div class="poll-id">Poll ID: {{ pollId }}</div>
      <div class="player player2" v-if="playerRole === 'Player 2'">You</div>
      <div class="player player2" v-else>Opponent</div>
    </div>
    <div class="node-area">
      <div class="node-grid" :style="{ gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: dynamicGap}">
          <NodeComponent 
            v-for="index in totalQuestions" 
            :questionId="index" 
            @questionId="runQuestion($event)" 
          />
      </div>
    </div>
        <div>
          <QuestionComponent 
            v-bind:question="question" 
            v-on:answer="submitAnswer($event)" 
          />
          <hr>
          <span>{{ submittedAnswers }}</span>
        </div>
      
  </div>
</template>

<script>
import QuestionComponent from '@/components/QuestionComponent.vue';
import io from 'socket.io-client';
import NodeComponent from '../components/NodeComponent.vue';
const socket = io(localStorage.getItem("serverIP"));

export default {
  name: 'PollView',
  components: {
    QuestionComponent,
    NodeComponent
  },
  //--------------------------------------------------------------------------------
  data: function () {
    return {
      question: {
        q: "",
        a: []
      },
      playerRole: localStorage.getItem("playerRole") || "",
      pollId: "inactive poll",
      submittedAnswers: {},
      questionNumber: 0,
      totalQuestions: 0,
      nodeNumber: 0,
      columns: 0,
      nodeStatus: [],
      firstCheck: true, // Guard variable
    };
  },
//--------------------------------------------------------------------------------
  created: function () {
    this.gameSetup();
  },
  computed: {
    dynamicGap() {
      const containerWidth = this.$el.clientWidth;
      const baseGap = 5; // Base gap in pixels
      const additionalGap = (containerWidth - (this.columns * 100)) / (this.columns - 1);
      return `${baseGap + additionalGap}px`;
    }
  },
  watch: {
    nodeStatus: function () {
        this.drawNodeColors();
      }
  },
  //--------------------------------------------------------------------------------
  methods: {
    updateGap: function () {
      this.$forceUpdate(); // Force re-render to update the gap
    },
    gameSetup: function () {
      socket.on("sendNodeStatus", status => {
        this.nodeStatus = status;
        this.$nextTick(() => {  //la till detta
          
          if (this.firstCheck){
            this.checkAdjacentNodes();
          }
        }); 
      });
      this.pollId = this.$route.params.id;
      socket.on("numberOfQuestions", number => {
        this.totalQuestions = number;
        this.setNodeStatus({ node: 0, status: 1 });
        let lastNode = this.totalQuestions - 1;
        this.columns = Math.sqrt(this.totalQuestions);
        this.setNodeStatus({ node: lastNode, status: 2 });       
      });
      
      socket.emit("getNumberOfQuestions", this.pollId);

      socket.on("playerRoleAssigned", role => {
        this.playerRole = role;
        localStorage.setItem("playerRole", role); // Update locally just in case
      });

      socket.on("submittedAnswersUpdate", answers => {
      if (answers) {
        this.submittedAnswers = answers;
      }
      });

      socket.on("uiLabels", labels => {
      this.uiLabels = labels;
      });
      socket.emit("getUILabels", this.lang);

      socket.emit("joinPoll", this.pollId);



      socket.on("questionUpdate", d => {
      if (d.playerRole === this.playerRole) {
        this.question = d.q;
      }
      });
      
    },

    to2DArray: function(arr, chunkSize) {
      const result = [];
      for (let i = 0; i < arr.length; i += chunkSize) {
        result.push(arr.slice(i, i + chunkSize));
      }
      return result;
    },

    /**
     * Checks the adjacent nodes of the given node and updates their status based on the player's role.
     * 
     * @param {number} node - The node number to check adjacent nodes for.
     * 
     * The function performs the following checks and updates:
     * - For "Player 1":
     *   - If the node is within the valid range (0 < node < totalQuestions - 1):
     *     - Checks the left, top, right, and bottom adjacent nodes.
     *     - Updates the status of the adjacent nodes to 1 if their current status is not 4, 5, or 6.
     *   - If the node is the first node (nodeNumber === 0):
     *     - Checks the right and bottom adjacent nodes.
     *     - Updates the status of the adjacent nodes to 1 if their current status is not 4, 5, or 6.
     *   - If the node is the last node (nodeNumber === totalQuestions - 1):
     *     - Checks the left and top adjacent nodes.
     *     - Updates the status of the adjacent nodes to 1 if their current status is not 4, 5, or 6.
     * - For "Player 2":
     *   - If the node is within the valid range (0 < node < totalQuestions - 1):
     *     - Checks the left, top, right, and bottom adjacent nodes.
     *     - Updates the status of the adjacent nodes to 2 if their current status is not 4, 5, or 6.
     * 
     * After performing the checks and updates, the function calls `getNodeStatus` to refresh the node statuses.
     */
    checkAdjacentNodes: function () {
      this.firstCheck = false;
      let Nodestatus2D = this.to2DArray(this.nodeStatus, this.columns);
      
      for (let i = 0; i <= this.totalQuestions; i++) {
        if (this.nodeStatus[i] === 1 || this.nodeStatus[i] === 2) {
          let nodeRow = Math.floor(i / this.columns);
          let nodeCol = i % this.columns;

          if (this.nodeStatus[i] === 1) {
            if (i === 0) {
              if (Nodestatus2D[nodeRow][nodeCol + 1] !== 1 && Nodestatus2D[nodeRow][nodeCol + 1] !== 2 && Nodestatus2D[nodeRow][nodeCol + 1] !== 3){
                if (Nodestatus2D[nodeRow][nodeCol + 1] === 5 || Nodestatus2D[nodeRow][nodeCol + 1] === 6){ // lös krockar om tillgänglig för båda
                  this.setNodeStatus({ node: i + 1, status: 6 });
                  Nodestatus2D[nodeRow][nodeCol + 1] = 6;
                }
                else {
                  this.setNodeStatus({ node: i + 1, status: 4 });
                  Nodestatus2D[nodeRow][nodeCol + 1] = 4;
                }
              }
              if (Nodestatus2D[nodeRow + 1][nodeCol] !== 1 && Nodestatus2D[nodeRow + 1][nodeCol] !== 2 && Nodestatus2D[nodeRow + 1][nodeCol] !== 3){
                if (Nodestatus2D[nodeRow + 1][nodeCol] === 5 || Nodestatus2D[nodeRow + 1][nodeCol] === 6){
                  this.setNodeStatus({ node: i + this.columns, status: 6 });
                  Nodestatus2D[nodeRow + 1][nodeCol] = 6;
                }
                else {
                  this.setNodeStatus({ node: i + this.columns, status: 4 });
                  Nodestatus2D[nodeRow + 1][nodeCol] = 4; 
                }
              }
            }

            if (nodeCol > 0) {                                             
              if (Nodestatus2D[nodeRow][i - 1] !== 1 && Nodestatus2D[nodeRow][i - 1] !== 2 && Nodestatus2D[nodeRow][i - 1] !== 3) {
                if (Nodestatus2D[nodeRow][i - 1] === 5 || Nodestatus2D[nodeRow][i - 1] === 6){
                  this.setNodeStatus({ node: i - 1, status: 6 });
                  Nodestatus2D[nodeRow][i - 1] = 6;
                }
                else {
                  this.setNodeStatus({ node: i - 1, status: 4 });
                  Nodestatus2D[nodeRow][i - 1] = 4;
                }
              }
            }
            if (nodeRow > 0) {
              if (Nodestatus2D[nodeRow - 1][nodeCol] !== 1 && Nodestatus2D[nodeRow - 1][nodeCol] !== 2 && Nodestatus2D[nodeRow - 1][nodeCol] !== 3) {
                if (Nodestatus2D[nodeRow - 1][nodeCol] === 5 || Nodestatus2D[nodeRow - 1][nodeCol] === 6){
                  this.setNodeStatus({ node: i - this.columns, status: 6 });
                  Nodestatus2D[nodeRow - 1][nodeCol] = 6;
                }
                else {
                  this.setNodeStatus({ node: i - this.columns, status: 4 });
                  Nodestatus2D[nodeRow - 1][nodeCol] = 4;
                }
              }
            }
            if (nodeCol < this.columns - 1) {
              if (Nodestatus2D[nodeRow][nodeCol + 1] !== 1 && Nodestatus2D[nodeRow][nodeCol + 1] !== 2 && Nodestatus2D[nodeRow][nodeCol + 1] !== 3) {
                if(Nodestatus2D[nodeRow][nodeCol + 1] === 5 || Nodestatus2D[nodeRow][nodeCol + 1] === 6){
                  this.setNodeStatus({ node: i + 1, status: 6 });
                  Nodestatus2D[nodeRow][nodeCol + 1] = 6;
                }
                else {
                  this.setNodeStatus({ node: i + 1, status: 4 });
                  Nodestatus2D[nodeRow][nodeCol + 1] = 4;
                }
              }
            }
            if (nodeRow < this.columns - 1) {
              if (Nodestatus2D[nodeRow + 1][nodeCol] !== 1 && Nodestatus2D[nodeRow + 1][nodeCol] !== 2 && Nodestatus2D[nodeRow + 1][nodeCol] !== 3) {
                if (Nodestatus2D[nodeRow + 1][nodeCol] === 5 || Nodestatus2D[nodeRow + 1][nodeCol] === 6){
                  this.setNodeStatus({ node: i + this.columns, status: 6 });
                  Nodestatus2D[nodeRow + 1][nodeCol] = 6;
                }
                else {
                  this.setNodeStatus({ node: i + this.columns, status: 4 });
                  Nodestatus2D[nodeRow + 1][nodeCol] = 4;
                }
              }
            }
          } 
          else if (this.nodeStatus[i] === 2) {
            if (i === this.totalQuestions - 1) {
              if (Nodestatus2D[nodeRow][nodeCol - 1] !== 1 && Nodestatus2D[nodeRow][nodeCol - 1] !== 2 && Nodestatus2D[nodeRow][nodeCol - 1] !== 3){
                if(Nodestatus2D[nodeRow][nodeCol - 1] === 4 || Nodestatus2D[nodeRow][nodeCol - 1] === 6){
                  this.setNodeStatus({ node: i - 1, status: 6 });
                  Nodestatus2D[nodeRow][nodeCol - 1] = 6;
                }
                else {
                  this.setNodeStatus({ node: i - 1, status: 5 });
                  Nodestatus2D[nodeRow][nodeCol - 1] = 5;
                }
              }
              if (Nodestatus2D[nodeRow - 1][nodeCol] !== 1 && Nodestatus2D[nodeRow - 1][nodeCol] !== 2 && Nodestatus2D[nodeRow - 1][nodeCol] !== 3){
                if (Nodestatus2D[nodeRow - 1][nodeCol] === 4 || Nodestatus2D[nodeRow - 1][nodeCol] === 6){
                  this.setNodeStatus({ node: i - this.columns, status: 6 });
                  Nodestatus2D[nodeRow - 1][nodeCol] = 6;
                }
                else {
                  this.setNodeStatus({ node: i - this.columns, status: 5 });
                  Nodestatus2D[nodeRow - 1][nodeCol] = 5;
                }
              }
            }
            if (nodeCol > 0) {
              if (Nodestatus2D[nodeRow][nodeCol - 1] !== 1 && Nodestatus2D[nodeRow][nodeCol - 1] !== 2 && Nodestatus2D[nodeRow][nodeCol - 1] !== 3) {
                if (Nodestatus2D[nodeRow][nodeCol - 1] === 4 || Nodestatus2D[nodeRow][nodeCol - 1] === 6){
                  this.setNodeStatus({ node: i - 1, status: 6 });
                  Nodestatus2D[nodeRow][nodeCol - 1] = 6;
                }
                else {
                  this.setNodeStatus({ node: i - 1, status: 5 });
                  Nodestatus2D[nodeRow][nodeCol - 1] = 5;
                }
              }
            }
            if (nodeRow > 0) {
              if (Nodestatus2D[nodeRow - 1][nodeCol] !== 1 && Nodestatus2D[nodeRow - 1][nodeCol] !== 2 && Nodestatus2D[nodeRow - 1][nodeCol] !== 3) {
                if (Nodestatus2D[nodeRow - 1][nodeCol] === 4 || Nodestatus2D[nodeRow - 1][nodeCol] === 6){
                  this.setNodeStatus({ node: i - this.columns, status: 6 });
                  Nodestatus2D[nodeRow - 1][nodeCol] = 6;
                }
                else {
                  this.setNodeStatus({ node: i - this.columns, status: 5 });
                  Nodestatus2D[nodeRow - 1][nodeCol] = 5;
                }
              }
            }
            if (nodeCol < this.columns - 1) {
              if (Nodestatus2D[nodeRow][nodeCol + 1] !== 1 && Nodestatus2D[nodeRow][nodeCol + 1] !== 2 && Nodestatus2D[nodeRow][nodeCol + 1] !== 3) {
                if (Nodestatus2D[nodeRow][nodeCol + 1] === 4 || Nodestatus2D[nodeRow][nodeCol + 1] === 6){
                  this.setNodeStatus({ node: i + 1, status: 6 });
                  Nodestatus2D[nodeRow ][nodeCol + 1] = 6;
                }
                else {
                  this.setNodeStatus({ node: i + 1, status: 5 });
                  Nodestatus2D[nodeRow ][nodeCol + 1] = 5;
                }
              }
            }
            if (nodeRow < this.columns - 1) {
              if (Nodestatus2D[nodeRow + 1][nodeCol] !== 1 && Nodestatus2D[nodeRow + 1][nodeCol] !== 2 && Nodestatus2D[nodeRow + 1][nodeCol] !== 3) {
                if (Nodestatus2D[nodeRow + 1][nodeCol] === 4 || Nodestatus2D[nodeRow + 1][nodeCol] === 6){
                  this.setNodeStatus({ node: i + this.columns, status: 6 });
                  Nodestatus2D[nodeRow + 1][nodeCol] = 6;
                }
                else {
                  this.setNodeStatus({ node: i + this.columns, status: 5 });
                  Nodestatus2D[nodeRow + 1][nodeCol] = 5;
                }

              }
            }
          }
        }
      }
    },
                /*
            Värde 0 - 7, standard 0 är när noden inte är tagen, död eller nåbar
             0 = standdard
             1 = tagen av spelare 1
             2 = tagen av spelare 2
             3 = borttagen/död
             4 = nåbar för spelare 1
             5 = nåbar för spelare 2
             6 = nåbar för 1 och 2
            */

    drawNodeColors: function () {

      for (let i = 1; i <= this.totalQuestions; i++) {
        let nodeElement = document.getElementById('node-' + i);
        if (!nodeElement) {
          console.error(`Node element with ID 'node-${i}' not found.`);
          continue;
        }

        switch (this.nodeStatus[i-1]) {
          case 1:
            nodeElement.style.backgroundColor = "#32cd32";
            break;
          
          case 2:
            nodeElement.style.backgroundColor = "#ff8c00";
            break;
          case 3:
            nodeElement.style.backgroundColor = "#ff8c00";
            break;
          case 4:
            nodeElement.style.backgroundColor = "#ffb6c1"; 
            if (this.playerRole === "Player 1") {
              nodeElement.disabled = false;
            }
            break;
          
          case 5:
            nodeElement.style.backgroundColor = "#ffb6c1";
            if (this.playerRole === "Player 2"){
              nodeElement.disabled = false; 
            }
            break;
          case 6:
            nodeElement.style.backgroundColor = "#ffff00"; // Yellow to indicate reachability by both players
            nodeElement.disabled = false;
            break;
          default:
            break;
        }
      }
    },
    getNodeStatus: function() {
      socket.emit("getNodeStatus", this.pollId);
    },
    setNodeStatus: function(d) {
      this.nodeStatus[d.node] = d.status;
      socket.emit("nodeStatusUpdate", this.pollId, d);
      this.getNodeStatus();
      
    },

    submitAnswer: function (answer) {
      console.log('POLLVIEW Answer received in PollView, answer is: ', answer, ' type: ', typeof(answer));
      console.log('POLLVIEW information sent to server will be: ', answer.a, ' type: ', typeof(answer.a));
      socket.emit("submitAnswer", { pollId: this.pollId, answer: answer.a });
    },

    /**
     * Runs the specified question based on the question number.
     * 
     * @param {number} questionNumber - The number of the question to run.
     * 
     * This function performs the following actions:
     * 1. Sets the current question number.
     * 2. Retrieves the DOM element associated with the question.
     * 3. Emits a "runQuestion" event via socket if the node element is found and conditions are met.
     * 4. Disables the node element and changes its background color based on the node status and player role.
     * 
     * Node statuses:
     * - 0: Node is disabled.
     * - 1: If player role is "Player 1", emits the event and sets background color to green.
     * - 2: If player role is "Player 2", emits the event and sets background color to dark orange.
     * - 3: Emits the event and sets background color based on player role.
     * - 4, 5, 6: Node is disabled.
     * 
     * Logs an error if the node element is not found.
     * Logs a warning if the node status is unhandled.
     */
    runQuestion: function (questionNumber) {
      console.log("POLLVIEW: runQuestion was run");
      this.questionNumber = questionNumber;
      let nodeElement = document.getElementById('node-' + questionNumber);
      if (!nodeElement) {
        console.error(`Node element with ID 'node-${questionNumber}' not found.`);
        return;
      }
      socket.emit("runQuestion", { pollId: this.pollId, questionNumber: this.questionNumber - 1, playerRole: this.playerRole });



    },
  }
}
</script>
