<template>
  <div class="node-area">
    <div
      class="node-grid"
      :style="columns > 0 ? { gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: dynamicGap } : {}"
    >
      <NodeComponent
        v-for="index in totalQuestions"
        :key="index"
        :questionId="index"
        :isQuestionActive="showQuestionComponent"
        @questionId="runQuestion"
      />
    </div>
  </div>
</template>

<script>
import NodeComponent from "@/components/NodeComponent.vue";
import io from "socket.io-client";

const serverIP = localStorage.getItem("serverIP");
const socket = serverIP ? io(serverIP) : null;

export default {
  name: "DominationGameComponent",
  components: {
    NodeComponent,
  },
  props: {
    showQuestionComponent: Boolean,
    lastAnswer: String,
  },
  watch: {
    nodeStatus: function (){
      this.drawNodeColors();
    }
    
  },
  data() {
    return {
      nodeStatus: [],
      totalQuestions: 0,
      columns: 1, // Default value to prevent invalid grid styles
      firstCheck: true,
      isConnected: !!socket,
      dynamicGap: "5px", // Default value for dynamic gap
      playerRole: "",
    };
  },
  computed: {},
  mounted() {
    if (!socket) {
      console.error("Socket initialization failed. Server IP is missing or invalid.");
      return;
    }

    this.updateDynamicGap();
    window.addEventListener("resize", this.updateDynamicGap);

    socket.on("connect", () => {
      this.isConnected = true;
    });

    socket.on("disconnect", () => {
      this.isConnected = false;
    });

    socket.on("sendNodeStatus", (status) => {
      this.nodeStatus = status;
      this.$nextTick(() => {
        if (this.firstCheck && this.nodeStatus.length === this.totalQuestions) {
          this.checkAdjacentNodes();
        }
      });
    });

    socket.on("numberOfQuestions", (number) => {
      this.playerRole = localStorage.getItem("playerRole");
      this.totalQuestions = number;
      this.columns = Math.floor(Math.sqrt(this.totalQuestions)); // Ensure columns is an integer
      console.log("numberOfQuestions", number);
      console.log("columns", this.columns);

      // Initialize first and last nodes
      this.setNodeStatus({ node: 0, status: 1 });
      const lastNode = this.totalQuestions - 1;
      this.setNodeStatus({ node: lastNode, status: 2 });
    });

    socket.emit("getNumberOfQuestions", this.$route.params.id);

    socket.on("submittedAnswersUpdate", (score) => {
      if (this.lastAnswer === "correct") {
        if (this.playerRole === "Player 1") {
          this.setNodeStatus({ node: this.questionNumber - 1, status: 1 });
        } else {
          this.setNodeStatus({ node: this.questionNumber - 1, status: 2 });
        }
      }
      this.getNodeStatus();
      this.drawNodeColors();
      socket.emit("refreshGame", this.$route.params.id);
    });
  },
  
  beforeUnmount() {
    if (socket) {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("sendNodeStatus");
      socket.off("numberOfQuestions");
      socket.off("submittedAnswersUpdate");
    }
    window.removeEventListener("resize", this.updateDynamicGap);
  },
  methods: {
    runQuestion(questionId) {
      try {
        console.log("runQuestion", questionId);
        this.$emit("questionNumber", questionId);
      } catch (error) {
        console.error("Error in runQuestion method:", error);
      }
    },
    checkAdjacentNodes() {
      try {
        this.firstCheck = false;
        const Nodestatus2D = this.to2DArray(this.nodeStatus, this.columns);

        const updateNodeStatus = (currentIndex, adjacentIndex, newStatus) => {
          if (
            adjacentIndex.row >= 0 &&
            adjacentIndex.row < Nodestatus2D.length &&
            adjacentIndex.col >= 0 &&
            adjacentIndex.col < Nodestatus2D[adjacentIndex.row].length
          ) {
            const currentStatus = Nodestatus2D[adjacentIndex.row][adjacentIndex.col];
            if (![1, 2, 3].includes(currentStatus)) {
              if ((newStatus === 4 && currentStatus === 5) || (newStatus === 5 && currentStatus === 4)) {
                this.setNodeStatus({ node: adjacentIndex.index, status: 6 });
                Nodestatus2D[adjacentIndex.row][adjacentIndex.col] = 6;
              } else if (![4, 5, 6].includes(currentStatus)) {
                this.setNodeStatus({ node: adjacentIndex.index, status: newStatus });
                Nodestatus2D[adjacentIndex.row][adjacentIndex.col] = newStatus;
              }
            }
          }
        };

        for (let i = 0; i < this.totalQuestions; i++) {
          if ([1, 2].includes(this.nodeStatus[i])) {
            const nodeRow = Math.floor(i / this.columns);
            const nodeCol = i % this.columns;
            const newStatus = this.nodeStatus[i] === 1 ? 4 : 5;

            if (nodeCol > 0) {
              updateNodeStatus(i, { row: nodeRow, col: nodeCol - 1, index: i - 1 }, newStatus);
            }
            if (nodeCol < this.columns - 1) {
              updateNodeStatus(i, { row: nodeRow, col: nodeCol + 1, index: i + 1 }, newStatus);
            }
            if (nodeRow > 0) {
              updateNodeStatus(i, { row: nodeRow - 1, col: nodeCol, index: i - this.columns }, newStatus);
            }
            if (nodeRow < Math.floor(this.totalQuestions / this.columns)) {
              updateNodeStatus(i, { row: nodeRow + 1, col: nodeCol, index: i + this.columns }, newStatus);
            }
          }
        }
      } catch (error) {
        console.error("Error in checkAdjacentNodes method:", error);
      }
      this.getNodeStatus();
    },
    to2DArray(arr, chunkSize) {
      const result = [];
      for (let i = 0; i < arr.length; i += chunkSize) {
        result.push(arr.slice(i, i + chunkSize));
      }
      return result;
    },
    setNodeStatus(d) {
      try {
        console.log("setNodeStatus", d);
        this.nodeStatus[d.node] = d.status;
        socket.emit("nodeStatusUpdate", this.$route.params.id, d);
        this.getNodeStatus();
      } catch (error) {
        console.error("Error in setNodeStatus method:", error);
      }
    },
    getNodeStatus() {
      try {
        socket.emit("getNodeStatus", this.$route.params.id);
      } catch (error) {
        console.error("Error in getNodeStatus method:", error);
      }
    },
    updateDynamicGap() {
      try {
        const containerWidth = this.$el.clientWidth || 0;
        const baseGap = 5; // Base gap in pixels
        if (this.columns > 1) {
          const additionalGap = (containerWidth - this.columns * 100) / (this.columns - 1);
          this.dynamicGap = `${baseGap + additionalGap}px`;
        } else {
          this.dynamicGap = `${baseGap}px`;
        }
      } catch (error) {
        console.error("Error in updateDynamicGap method:", error);
      }
    },
    drawNodeColors: function () {

for (let i = 1; i <= this.totalQuestions; i++) {
  let nodeElement = document.getElementById('node-' + i);
  if (!nodeElement) {
    console.error(`Node element with ID 'node-${i}' not found.`);
    continue;
  }
  //console.log("showQuestionComponent", this.showQuestionComponent);
  //console.log("playerRole", this.playerRole);
  //console.log("nodeStatus", this.nodeStatus[i-1]);
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
  },
};
</script>

