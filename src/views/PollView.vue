<template>
  <div class="wrapper">
    <button @click="getNodeStatus()">Get Node Status</button>
    <button @click="setNodeStatus({node:totalQuestions-2, status:4})">Set Node 0 to 6</button>
    {{ totalQuestions }}
    {{ nodeStatus }}
    <div class="main-menu">
      <div class="node" :style="{ gap: gap }" v-if="totalQuestions > 0">
        <NodeComponent 
          v-for="index in totalQuestions" 
          :questionId="index" 
          v-on:questionId="runQuestion($event)" 
        />
      </div>
    
        <div>
          <div>
            Poll ID: {{ pollId }} <span v-if="playerRole">(You: {{ playerRole }})</span>
          </div>
          <QuestionComponent 
            v-bind:question="question" 
            v-on:answer="submitAnswer($event)" 
          />
          <hr>
          <span>{{ submittedAnswers }}</span>
        </div>
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
      gap: "",
      nodeStatus: [],
    };
  },
//--------------------------------------------------------------------------------
  created: function () {
    this.gameSetup();

  },
  watch: {
    nodeStatus: function () {
        this.drawNodeColors();
      }
  },
  //--------------------------------------------------------------------------------
  methods: {
    gameSetup: function () {
      socket.on("sendNodeStatus", status => {
        this.nodeStatus = status;
      });
      this.pollId = this.$route.params.id;
      socket.on("numberOfQuestions", number => {
        this.totalQuestions = number;
        this.setNodeWidth();
        this.setNodeStatus({ node: 0, status: 1 });
        let lastNode = this.totalQuestions - 1;
        this.columns = Math.sqrt(this.totalQuestions);
        this.setNodeStatus({ node: lastNode, status: 2 });
        console.log("nodeStatus", this.nodeStatus);
        this.checkAdjacentNodes(); // Check adjacent nodes
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
      let Nodestatus2D = this.to2DArray(this.nodeStatus, this.columns);

      for (let i = 1; i <= this.totalQuestions; i++) {
        console.log("inside player", this.playerRole);
        if (this.nodeStatus[i] === 1 || this.nodeStatus[i] === 2) {

          let nodeRow = Math.floor(i / this.columns);
          let nodeCol = i % this.columns;
          
          if (this.playerRole === "Player 1") {
            console.log("inside checkAdjacentNodes player 1", i);
              if (i === 0) {
                console.log("inside checkAdjacentNodes player 1 node 0", i);
                this.setNodeStatus({ node: i + 1, status: 4 });
                this.setNodeStatus({ node: i + this.columns, status: 4 });
              }
            if (nodeCol > 0) {
              
              if (Nodestatus2D[nodeRow][i - 1] !== 1 && Nodestatus2D[nodeRow][i - 1] !== 2 && Nodestatus2D[nodeRow][i - 1] !== 3) {
                this.setNodeStatus({ node: i - 1, status: 4 });
              }
            }
            if (nodeRow > 0) {
              if (Nodestatus2D[nodeRow - 1][nodeCol] !== 1 && Nodestatus2D[nodeRow - 1][nodeCol] !== 2 && Nodestatus2D[nodeRow - 1][nodeCol] !== 3) {
                this.setNodeStatus({ node: i - this.columns, status: 4 });
              }
            }
            if (nodeCol < this.columns - 1) {
              if (Nodestatus2D[nodeRow][nodeCol + 1] !== 1 && Nodestatus2D[nodeRow][nodeCol + 1] !== 2 && Nodestatus2D[nodeRow][nodeCol + 1] !== 3) {
                this.setNodeStatus({ node: i + 1, status: 4 });
              }
            }
            if (nodeRow < this.columns - 1) {
              if (Nodestatus2D[nodeRow + 1][nodeCol] !== 1 && Nodestatus2D[nodeRow + 1][nodeCol] !== 2 && Nodestatus2D[nodeRow + 1][nodeCol] !== 3) {
                this.setNodeStatus({ node: i + this.columns, status: 4 });
              }
            }
          } 
          else if (this.playerRole === "Player 2") {
            if (i === this.totalQuestions - 1) {
              this.setNodeStatus({ node: i - 1, status: 5 });
              this.setNodeStatus({ node: i - this.columns, status: 5 });
            }
            if (nodeCol > 0) {
              if (Nodestatus2D[nodeRow][nodeCol - 1] !== 1 && Nodestatus2D[nodeRow][nodeCol - 1] !== 2 && Nodestatus2D[nodeRow][nodeCol - 1] !== 3) {
                this.setNodeStatus({ node: i - 1, status: 5 });
              }
            }
            if (nodeRow > 0) {
              if (Nodestatus2D[nodeRow - 1][nodeCol] !== 1 && Nodestatus2D[nodeRow - 1][nodeCol] !== 2 && Nodestatus2D[nodeRow - 1][nodeCol] !== 3) {
                this.setNodeStatus({ node: i - this.columns, status: 5 });
              }
            }
            if (nodeCol < this.columns - 1) {
              if (Nodestatus2D[nodeRow][nodeCol + 1] !== 1 && Nodestatus2D[nodeRow][nodeCol + 1] !== 2 && Nodestatus2D[nodeRow][nodeCol + 1] !== 3) {
                this.setNodeStatus({ node: i + 1, status: 5 });
              }
            }
            if (nodeRow < this.columns - 1) {
              if (Nodestatus2D[nodeRow + 1][nodeCol] !== 1 && Nodestatus2D[nodeRow + 1][nodeCol] !== 2 && Nodestatus2D[nodeRow + 1][nodeCol] !== 3) {
                this.setNodeStatus({ node: i + this.columns, status: 5 });
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
            nodeElement.disabled = false;
            break;
          
          case 5:
            nodeElement.style.backgroundColor = "#ffb6c1";
            nodeElement.disabled = false; 
            break;
          case 6:
            nodeElement.style.backgroundColor = "#ffff00"; // Yellow to indicate reachability by both players
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
      socket.emit("nodeStatusUpdate", this.pollId, d);
      this.getNodeStatus();
      
    },
    setNodeWidth: function () {
      switch (this.totalQuestions) {
        case 16:
          this.gap = "100px";
          break;
        case 25:
          this.gap = "70px";
          break;
        case 36:
          this.gap = "40px";
          break;
        case 49:
          this.gap = "30px";
          break;
        default:
          this.gap = "0px";
      }
    },

    submitAnswer: function (answer) {
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
      console.log("questionNumber", questionNumber);
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
