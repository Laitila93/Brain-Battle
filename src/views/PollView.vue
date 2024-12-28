<template>
  <div class="wrapper"> 
    <div class="banner">
      <div class="player player1" v-if="playerRole === 'Player 1'">Your score: {{ this.scores.p1Score }}</div>
      <div class="player player1" v-else>Opponents score: {{ this.scores.p1Score }}</div>
      <div class="poll-id">Poll ID: {{ pollId }}</div>
      <div class="player player2" v-if="playerRole === 'Player 2'">Your score: {{ this.scores.p2Score }}</div>
      <div class="player player2" v-else>Opponents score: {{ this.scores.p2Score }}</div>
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
      <div v-if="lastAnswer === 'correct' && showQuestionComponent !== true">Correct answer!</div>
      <div v-if="lastAnswer === 'wrong' && showQuestionComponent !== true">Wrong answer!</div>
      <div v-if="lastAnswer === 'start' && showQuestionComponent !== true">Click a node</div>
          <div v-if="showQuestionComponent">
            <QuestionComponent 
              v-bind:question="question" 
              v-on:answer="submitAnswer($event, this.playerRole)"
              v-on:answered="handleAnswered"
            />
          </div>
      </div>
      <div v-else>
        <div>Game over!</div>
        <div>{{ winner }} wins!</div>
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
      question: { //convertera till en array så flera frågor kan vara laddade samtidigt
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
      scores: {p1Score: 1, p2Score: 1},
      showQuestionComponent: false, // Control the visibility of the QuestionComponent
      lastAnswer: "",
      isGameOver:false,
      winner: "",
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

      socket.on("submittedAnswersUpdate", scores => {
        this.checkAdjacentNodes();                            
        this.scores = scores;
        this.checkIsGameOver();
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

    handleAnswered() {
      this.showQuestionComponent = false; // Hide the QuestionComponent
    },

    //Exempel på gameOver funktion
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
    },

    /**
     * This method checks the adjacent nodes of each node in the grid and updates their statuses based on specific conditions.
     * 
     * - If the current node's status is 1:
     *   - It checks the adjacent nodes (left, right, top, bottom) and updates their statuses to 4 or 6 based on their current status.
     * - If the current node's status is 2:
     *   - It checks the adjacent nodes (left, right, top, bottom) and updates their statuses to 5 or 6 based on their current status.
     * 
     * The method uses a 2D array representation of the node statuses to facilitate the checking of adjacent nodes.
     * 
     * @method checkAdjacentNodes
     */
    checkAdjacentNodes: function () {
      this.firstCheck = false;
      let Nodestatus2D = this.to2DArray(this.nodeStatus, this.columns);

      const updateNodeStatus = (currentIndex, adjacentIndex, newStatus) => {
        const currentStatus = Nodestatus2D[adjacentIndex.row][adjacentIndex.col];
        if (currentStatus !== 1 && currentStatus !== 2 && currentStatus !== 3) {
          if ((newStatus === 4 && currentStatus === 5) || (newStatus === 5 && currentStatus === 4)) {
            this.setNodeStatus({ node: adjacentIndex.index, status: 6 });
            Nodestatus2D[adjacentIndex.row][adjacentIndex.col] = 6;
          } else if (currentStatus !== 4 && currentStatus !== 5 && currentStatus !== 6) {
            this.setNodeStatus({ node: adjacentIndex.index, status: newStatus });
            Nodestatus2D[adjacentIndex.row][adjacentIndex.col] = newStatus;
          }
        }
      };

      for (let i = 0; i < this.totalQuestions; i++) {
        if (this.nodeStatus[i] === 1 || this.nodeStatus[i] === 2) {
          let nodeRow = Math.floor(i / this.columns);
          let nodeCol = i % this.columns;
          let newStatus = this.nodeStatus[i] === 1 ? 4 : 5;

          // Check left
          if (nodeCol > 0) {
            updateNodeStatus(i, { row: nodeRow, col: nodeCol - 1, index: i - 1 }, newStatus);
          }
          // Check right
          if (nodeCol < this.columns - 1) {
            updateNodeStatus(i, { row: nodeRow, col: nodeCol + 1, index: i + 1 }, newStatus);
          }
          // Check top
          if (nodeRow > 0) {
            updateNodeStatus(i, { row: nodeRow - 1, col: nodeCol, index: i - this.columns }, newStatus);
          }
          // Check bottom
          if (nodeRow < this.columns - 1) {
            updateNodeStatus(i, { row: nodeRow + 1, col: nodeCol, index: i + this.columns }, newStatus);
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

    /**
     * Function to update the background color of node elements based on their status.
     * Iterates through all questions and sets the background color of each node element
     * according to its status. Also enables the node element if certain conditions are met.
     *
     * Node statuses and their corresponding colors:
     * - 1: Green (#32cd32)
     * - 2: Dark Orange (#ff8c00)
     * - 3: Dark Slate Blue (#1e1e2f)
     * - 4: Light Green (#9cca9cff) - Enables node if playerRole is "Player 1"
     * - 5: Light Orange (#ffc379ff) - Enables node if playerRole is "Player 2"
     * - 6: Light Yellow (#f7ffa1ff) - Enables node
     * - Default: Light Gray (#f5f5f5ff)
     *
     * Logs an error if a node element with the expected ID is not found.
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
            nodeElement.disabled = true;
            nodeElement.style.animation = "none"; 
            break;
          
          case 2:
            nodeElement.style.backgroundColor = "#ff8c00";
            nodeElement.disabled = true;
            nodeElement.style.animation = "none"; 
            break;
          case 3:
            nodeElement.style.backgroundColor = "#1e1e2f";
            nodeElement.disabled = true;
            nodeElement.style.animation = "none"; 
            break;
          case 4:
            if (this.showQuestionComponent === true){
              nodeElement.disabled = true;
              nodeElement.style.animation = "none"; 
              break;
            }
            nodeElement.style.backgroundColor = "#9cca9cff";
            if (this.playerRole === "Player 1") {
              nodeElement.disabled = false;
              nodeElement.style.animation = "pulse 2s infinite";
            }
            break;
          case 5:
          if (this.showQuestionComponent === true){
              nodeElement.disabled = true;
              nodeElement.style.animation = "none"; 
              break;
            }
            nodeElement.style.backgroundColor = "#ffc379ff";
            if (this.playerRole === "Player 2"){
              nodeElement.disabled = false;
              nodeElement.style.animation = "pulse 2s infinite"; 
            }
            break;
          case 6:
          if (this.showQuestionComponent === true){
              nodeElement.disabled = true;
              nodeElement.style.animation = "none"; 
              break;
            }
            nodeElement.style.backgroundColor = "#f7ffa1ff";
            nodeElement.disabled = false;
            nodeElement.style.animation = "pulse 2s infinite";
            break;
          default:
            nodeElement.style.backgroundColor = "#f5f5f5ff"
            nodeElement.disabled = true;
            nodeElement.style.animation = "none"; 
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

    submitAnswer: function (answer, playerRole) {
      if (answer.c) {
        socket.emit("submitAnswer", { pollId: this.pollId, answer: answer.a, playerRole: playerRole }); 
        this.drawNodeColors();
        this.lastAnswer = "correct";
      }
      else {
        console.log("wrong answer");
        this.setNodeStatus({ node: this.questionNumber-1, status: 3 });
        this.drawNodeColors();
        this.lastAnswer = "wrong";

      }

      
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
      this.questionNumber = questionNumber;
      socket.emit("runQuestion", { pollId: this.pollId, questionNumber: this.questionNumber - 1, playerRole: this.playerRole });
      this.showQuestionComponent = true;
      this.setNodeStatus({ node: this.questionNumber-1, status: 0 });
    },
  }
}
</script>
