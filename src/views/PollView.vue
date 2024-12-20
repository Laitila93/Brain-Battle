<template>
  <div class="wrapper">
    <div class="main-menu">
    <div class="node" :style="{ gap: gap }" v-if="totalQuestions > 0">
      <NodeComponent 
        v-for="index in totalQuestions" 
        :key="index" 
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
      gap: ""
    };
  },

  created: function () {
    this.pollId = this.$route.params.id;
    socket.on("questionUpdate", d => {
      console.log(d.playerRole,"this playerId: ", this.playerRole)
      if (d.playerRole === this.playerRole) {
        this.question = d.q
      }

    });
    socket.emit("getNumberOfQuestions", this.pollId);
    socket.on("numberOfQuestions", number => {
      this.totalQuestions = number;
      this.setNodeWidth();
    });
    socket.on("playerRoleAssigned", (role) => {
      this.playerRole = role;
      localStorage.setItem("playerRole", role); // Update locally just in case
    });
    socket.on("submittedAnswersUpdate", answers => this.submittedAnswers = answers.a);
    socket.on("uiLabels", labels => this.uiLabels = labels);
    socket.emit("getUILabels", this.lang);
    socket.emit("joinPoll", this.pollId);
  },
  methods: {
    setNodeWidth: function () {
      console.log("total questions", this.totalQuestions);
      console.log(this.gap);
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
    runQuestion: function (questionNumber) {
      this.questionNumber = questionNumber;
      socket.emit("runQuestion", { pollId: this.pollId, questionNumber: this.questionNumber - 1, playerRole: this.playerRole});
      console.log(this.playerRole);
      // Adjusted questionNumber - 1 for correct indexing
    }
  }
}
</script>
