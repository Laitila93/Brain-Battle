<template>
  <div class="wrapper"> 
    <div class="banner">
      <div class="player player1" v-if="playerRole === 'Player 1'">Your score: {{ scores.p1Score }}</div>
      <div class="player player1" v-else>Opponents score: {{ scores.p1Score }}</div>
      <div class="poll-id">Poll ID: {{ pollId }}</div>
      <div class="player player2" v-if="playerRole === 'Player 2'">Your score: {{ scores.p2Score }}</div>
      <div class="player player2" v-else>Opponents score: {{ scores.p2Score }}</div>
    </div>
    <DominationGameComponent
      :showQuestionComponent="showQuestionComponent"
      :lastAnswer="lastAnswer"
      @isGameOver="checkGameOver"
      @questionNumber="setQuestionNumber"
      @showQuestionComponent="setShowQuestionComponent"
    />
    <div v-if="!isGameOver">
      <div v-if="lastAnswer === 'correct' && !showQuestionComponent">Correct answer!</div>
      <div v-if="lastAnswer === 'wrong' && !showQuestionComponent">Wrong answer!</div>
      <div v-if="lastAnswer === 'start' && !showQuestionComponent">Click a node</div>
      <div v-if="showQuestionComponent">
        <QuestionComponent 
          :question="question" 
          @answer="setAnswer"
          @answered="handleAnswered"
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
import DominationGameComponent from '@/components/DominationGameComponent.vue';
import io from 'socket.io-client';
const socket = io(localStorage.getItem("serverIP"));

export default {
  name: 'PollView',
  components: {
    QuestionComponent,
    DominationGameComponent
  },
  data() {
    return {
      question: { q: "", a: [] },
      playerRole: localStorage.getItem("playerRole") || "",
      pollId: "inactive poll",
      submittedAnswers: {},
      questionNumber: 0,
      totalQuestions: 0,
      scores: { p1Score: 1, p2Score: 1 },
      showQuestionComponent: false,
      lastAnswer: "",
      isGameOver: false,
      winner: "",
    };
  },
  created() {
    this.gameSetup();
  },
  methods: {
    setQuestionNumber(event) {
      this.questionNumber = event;
      this.runQuestion();
    },
    setShowQuestionComponent(event) {
      this.showQuestionComponent = event;
    },
    checkGameOver(winner) {
      this.winner = winner;
      if ((this.winner === "Player 1" && this.scores.p1Score > this.scores.p2Score) ||
          (this.winner === "Player 2" && this.scores.p2Score > this.scores.p1Score)) {
        this.showQuestionComponent = false;
        this.isGameOver = true;
      }
    },
    gameSetup() {
      this.pollId = this.$route.params.id;
      socket.on("numberOfQuestions", number => {
        this.totalQuestions = number;
      });
      socket.emit("getNumberOfQuestions", this.pollId);
      socket.on("playerRoleAssigned", role => {
        this.playerRole = role;
        localStorage.setItem("playerRole", role);
      });
      socket.on("submittedAnswersUpdate", scores => {
        this.scores = scores;
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
    handleAnswered() {
      this.showQuestionComponent = false;
    },
    setAnswer(answer) {
      if (answer.c) {
        this.lastAnswer = "correct";
      } else {
        this.lastAnswer = "wrong";
      }
      console.log("submitAnswer", answer);
      socket.emit("submitAnswer", { pollId: this.pollId, answer: answer.a, isCorrect: answer.c, playerRole: this.playerRole });
    },
    runQuestion() {
      socket.emit("runQuestion", { pollId: this.pollId, questionNumber: this.questionNumber - 1, playerRole: this.playerRole });
      this.showQuestionComponent = true;
    },
  }
}
</script>
