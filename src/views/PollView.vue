<template>
  <div v-if="totalQuestions > 0">
    <NodeComponent 
      v-for="index in totalQuestions" 
      :key="index" 
      :questionId="index"  
      v-on:questionId="runQuestion($event)"  
    />
  </div>
  <hr>
  <div>
    {{ pollId }}
    <QuestionComponent 
      v-bind:question="question" 
      v-on:answer="submitAnswer($event)" 
    />
    <hr>
    <span>{{ submittedAnswers }}</span>
  </div>
</template>

<script>
import QuestionComponent from '@/components/QuestionComponent.vue';
import io from 'socket.io-client';
import NodeComponent from '../components/NodeComponent.vue';
const socket = io("localhost:3000");

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
      pollId: "inactive poll",
      submittedAnswers: {},
      questionNumber: 0,
      totalQuestions: 0,
      nodeNumber: 0
    };
  },
  created: function () {
    this.pollId = this.$route.params.id;
    socket.on("questionUpdate", q => this.question = q);
    socket.emit("getNumberOfQuestions", this.pollId);
    socket.on("numberOfQuestions", number => {
      this.totalQuestions = number;
    });
    socket.on("submittedAnswersUpdate", answers => this.submittedAnswers = answers.a);
    socket.on("uiLabels", labels => this.uiLabels = labels);
    socket.emit("getUILabels", this.lang);
    socket.emit("joinPoll", this.pollId);
  },
  methods: {
    submitAnswer: function (answer) {
      socket.emit("submitAnswer", { pollId: this.pollId, answer: answer.a });
      console.log(this.totalQuestions);
    },
    updateQuestionNumber: function (num) {
      // Handle question number if needed
    },
    runQuestion: function (questionNumber) {
      this.questionNumber = questionNumber;
      socket.emit("runQuestion", { pollId: this.pollId, questionNumber: this.questionNumber - 1 });
      // Adjusted questionNumber - 1 for correct indexing
    }
  }
}
</script>
