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
import { setNodeStatus, getNodeStatus, checkAdjacentNodes, drawNodeColors } from "@/assets/Methods.js";
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
      drawNodeColors({ nodeStatus: this.nodeStatus, showQuestionComponent: this.showQuestionComponent, totalQuestions: this.totalQuestions, playerRole: this.playerRole });
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
          checkAdjacentNodes({
            nodeStatus: this.nodeStatus,
            columns: this.columns,
            totalQuestions: this.totalQuestions,
            pollId: this.$route.params.id,
            socket: socket, // Ensure socket is correctly passed here
          });
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
      setNodeStatus({d:{ node: 0, status: 1 }, pollId: this.$route.params.id, nodeStatus: this.nodeStatus, socket: socket });
      const lastNode = this.totalQuestions - 1;
      setNodeStatus({d:{ node: lastNode, status: 2 }, pollId: this.$route.params.id, nodeStatus: this.nodeStatus, socket: socket });
    });

    socket.emit("getNumberOfQuestions", this.$route.params.id);

    socket.on("submittedAnswersUpdate", (score) => {
      if (this.lastAnswer === "correct") {
        if (this.playerRole === "Player 1") {
          setNodeStatus({d:{ node: this.questionNumber - 1, status: 1 }, pollId: this.$route.params.id, nodeStatus: this.nodeStatus, socket: socket });
        } else {
          setNodeStatus({d:{ node: this.questionNumber - 1, status: 2 }, pollId: this.$route.params.id, nodeStatus: this.nodeStatus, socket: socket });
        }
      }
      getNodeStatus(this.pollId, socket);
      drawNodeColors();
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
  },
};
</script>

