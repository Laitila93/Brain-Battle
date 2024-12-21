<template>
  <div class="wrapper">
    <button @click="getNodeStatus()">Get Node Status</button>
    <button @click="setNodeStatus({node:totalQuestions-1, status:3})">Set Node 0 to 5</button>
    {{ totalQuestions }}
    {{ nodeStatus }}
    <div class="main-menu">
      <div class="node" :style="{ gap: gap }" v-if="totalQuestions > 0">
        <NodeComponent 
          v-for="index in totalQuestions" 
          :questionId="index" 
          :status="nodeStatus[index]"
          v-on:questionId="runQuestion($event)"
          v-on:nodeStatusChanged="processNodeStatusChange($event)"  
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
      nodeStatus: []
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
      this.pollId = this.$route.params.id;

      socket.on("questionUpdate", d => {
      if (d.playerRole === this.playerRole) {
        this.question = d.q;
      }
      });

      socket.emit("getNumberOfQuestions", this.pollId);
      socket.on("numberOfQuestions", number => {
      this.totalQuestions = number;
      this.setNodeWidth();
      this.getNodeStatus();
      });


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

      this.setNodeStatus({ node: 0, status: 4 });
      let lastNode = this.totalQuestions - 1;
      this.setNodeStatus({ node: lastNode, status: 5 });
      this.getNodeStatus();
      this.checkAdjacentNodes(0); // Check adjacent nodes
      this.checkAdjacentNodes(lastNode); // Check adjacent nodes
      this.drawNodeColors();
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
    checkAdjacentNodes: function (node) {
      let nodeNumber = node;
      let columns = Math.sqrt(this.totalQuestions);
      if (this.playerRole === "Player 1") {

        if ( 0< nodeNumber < this.totalQuestions - 1) {
          if (node-1 % columns !== 0) {
            if (this.nodeStatus[node - 1] !== 6 || this.nodeStatus[node - 1] !== 5 || this.nodeStatus[node - 1] !== 4) {
              this.setNodeStatus({node: nodeNumber, status:1});
            }
          }
          if (node - columns > 0) {
            if (this.nodeStatus[node - columns] !== 6 || this.nodeStatus[node - columns] !== 5 || this.nodeStatus[node - columns] !== 4) {
              this.setNodeStatus({node: nodeNumber, status:1});
            }
          }
      
          if ((node + 1) % columns !== 0) {
            if (this.nodeStatus[node + 1] !== 6 || this.nodeStatus[node + 1] !== 5 || this.nodeStatus[node + 1] !== 4) {
              this.setNodeStatus({node: nodeNumber, status:1});
            }
          }
          if (node + columns < this.totalQuestions-1) {
            if (this.nodeStatus[node + columns] !== 6 || this.nodeStatus[node + columns] !== 5 || this.nodeStatus[node + columns] !== 4) {
              this.setNodeStatus({node: nodeNumber, status:1});
            }
          }
        } 
      if (nodeNumber === 0) {
        if (this.nodeStatus[node + 1] !== 6 || this.nodeStatus[node + 1] !== 5 || this.nodeStatus[node + 1] !== 4) {
          this.setNodeStatus({node: nodeNumber, status:1});
        }
        if (this.nodeStatus[node + columns] !== 6 || this.nodeStatus[node + columns] !== 5 || this.nodeStatus[node + columns] !== 4) {
          this.setNodeStatus({node: nodeNumber, status:1});
        }
      }
      if (nodeNumber === this.totalQuestions - 1) {
        if (this.nodeStatus[node - 1] !== 6 || this.nodeStatus[node - 1] !== 5 || this.nodeStatus[node - 1] !== 4) {
          this.setNodeStatus({node: nodeNumber, status:1});
        }
        if (this.nodeStatus[node - columns] !== 6 || this.nodeStatus[node - columns] !== 5 || this.nodeStatus[node - columns] !== 4) {
          this.setNodeStatus({node: nodeNumber, status:1});
        }
      }
    }
    if (this.playerRole === "Player 2") {
      if ( 0< nodeNumber < this.totalQuestions - 1) {
        if (node-1 % columns !== 0) {
          if (this.nodeStatus[node - 1] !== 6 || this.nodeStatus[node - 1] !== 5 || this.nodeStatus[node - 1] !== 4) {
            this.setNodeStatus({node: nodeNumber, status:2});
          }
        }
        if (node - columns > 0) {
          if (this.nodeStatus[node - columns] !== 6 || this.nodeStatus[node - columns] !== 5 || this.nodeStatus[node - columns] !== 4) {
            this.setNodeStatus({node: nodeNumber, status:2});
          }
        }
    
        if ((node + 1) % columns !== 0) {
          if (this.nodeStatus[node + 1] !== 6 || this.nodeStatus[node + 1] !== 5 || this.nodeStatus[node + 1] !== 4) {
            this.setNodeStatus({node: nodeNumber, status:2});
          }
        }
        if (node + columns < this.totalQuestions-1) {
          if (this.nodeStatus[node + columns] !== 6 || this.nodeStatus[node + columns] !== 5 || this.nodeStatus[node + columns] !== 4) {
            this.setNodeStatus({node: nodeNumber, status:2});
          }
        }
      }
    }
      this.getNodeStatus();
    },
    /**
     * Updates the background color of node elements based on their status.
     * Iterates through all questions and sets the background color of each node element
     * according to its status in the `nodeStatus` array.
     * 
     * Node status color mapping:
     * - 1: Green (#32cd32)
     * - 2: Dark Orange (#ff8c00)
     * - 3: Green (#32cd32)
     * - 4: Green (#32cd32)
     * - 5: Dark Orange (#ff8c00)
     * - 6: Gray (#808080)
     */
    drawNodeColors: function () {
      for (let i = 0; i < this.totalQuestions; i++) {
        let nodeElement = document.getElementById('node-' + i);
        if (this.nodeStatus[i] === 1) {
          nodeElement.style.backgroundColor = "#32cd32";
        }
        if (this.nodeStatus[i] === 2) {
          nodeElement.style.backgroundColor = "#ff8c00";
        }
        if (this.nodeStatus[i] === 3) {
          nodeElement.style.backgroundColor = "#32cd32";
        }
        if (this.nodeStatus[i] === 4) {
          nodeElement.style.backgroundColor = "#32cd32";
        }
        if (this.nodeStatus[i] === 5) {
          nodeElement.style.backgroundColor = "#ff8c00";
        }
        if (this.nodeStatus[i] === 6) {
          nodeElement.style.backgroundColor = "#808080";
        }
      }
    },
    getNodeStatus: function() {
      socket.emit("getNodeStatus", this.pollId);
      socket.on("sendNodeStatus", status => {
      this.nodeStatus = status;
      });
    },
    setNodeStatus: function(d) {
      socket.emit("nodeStatusUpdate", this.pollId,d);
      
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

    updateQuestionNumber: function (num) {
      // Handle question number if needed
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
      let nodeElement = document.getElementById('node-' + questionNumber);

      if (!nodeElement) {
        console.error(`Node element with ID 'node-${questionNumber}' not found.`);
        return;
      }

      const emitRunQuestion = () => {
        socket.emit("runQuestion", { pollId: this.pollId, questionNumber: this.questionNumber - 1, playerRole: this.playerRole });
        nodeElement.disabled = true;
      };

      switch (this.nodeStatus[questionNumber-1]) {
        case 0:
          nodeElement.disabled = true;
          break;
        case 1:
          if (this.playerRole === "Player 1") {
            emitRunQuestion();
            nodeElement.style.backgroundColor = "#32cd32";
          }
          break;
        case 2:
          if (this.playerRole === "Player 2") {
            emitRunQuestion();
            nodeElement.style.backgroundColor = "#ff8c00";
          }
          break;
        case 3:
          emitRunQuestion();
          nodeElement.style.backgroundColor = this.playerRole === "Player 2" ? "#ff8c00" : "#32cd32";
          break;
        case 4:
        case 5:
        case 6:
          nodeElement.disabled = true;
          break;
        default:
          console.warn(`Unhandled node status: ${this.nodeStatus[questionNumber]}`);
      }
    },
  }
}
</script>
