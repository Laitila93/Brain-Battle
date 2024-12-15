<template>
  <form id="app" @submit="checkValues">
  <p>
    <label for="formOperator">Operator</label>
    <select id="formOperator" v-model="formOperator" name="formOperator" required>
      <option>+</option>
      <option>-</option>
      <option>*</option>
      <option>/</option>
    </select>
  </p>
  <p>
    <label for="numberOfQuestions">Number Of Questions</label>
    <select id="numberOfQuestions" v-model="numberOfQuestions" name="numberOfQuestions" required>
      <option>16</option>
      <option>25</option>
      <option>36</option>
      <option>49</option>
    </select>
  </p>

  <p>
    <label for="formMin">Min</label>
    <input
      id="formMin"
      v-model="formMin"
      type="number"
      name="formMin"
      min="1"
      max="100"
      required
    >
  </p>

  <p>
    <label for="formMax">Max</label>
    <input
      id="formMax"
      v-model="formMax"
      type="number"
      name="formMax"
      max="100"
      min="1"
      required
    >
  </p>
  <p>
    <label for="formPollId">Poll ID: </label>
    <input
      id="formPollId"
      v-model="formPollId"
      type="text"
      name="formPollId"
      required
    >
  </p>
  <p>
    <button type="submit">
      {{this.uiLabels.createPoll}}
    </button>
  </p>

</form>
<!--
  <div>
    <div>
      {{ uiLabels.question }}:
      <input type="text" v-model="question">
      <div>
        Answers:
        <input v-for="(_, i) in answers" 
               v-model="answers[i]" 
               v-bind:key="'answer' + i">
        <button v-on:click="addAnswer">
          Add answer alternative
        </button>
      </div>
    </div>
    <button v-on:click="addQuestion">
      Add question
    </button>
    <input type="number" v-model="questionNumber">
    -->
  <div>
    <button v-on:click="startPoll">
      Start poll
    </button>
    <br>
    <button v-on:click="runQuestion">
      Run question
    </button>
    <br>
    <router-link v-bind:to="'/result/' + pollId">Check result</router-link>
    <br>
    <br>
    Data: {{ pollData }}
  </div>
</template>

<script>
import io from 'socket.io-client';
const socket = io("localhost:3000");

export default {
  name: 'CreateView',
  data: function () {
    return {
      lang: localStorage.getItem("lang") || "en",
      pollId: null,
      question: "",
      answers: ["", ""],
      questionNumber: 0,
      pollData: {},
      uiLabels: {},

      formPollId: null,
      formOperator: null,
      formMin: null,
      formMax: null,

      operator: null,
      min: null,
      max: null,

      numberOfQuestions: 0,
      questions:
      {q: "", a: [{a:null, c:true}, {a:null, c:false}, {a:null, c:false}, {a:null, c:false}]}
      
    }
  },
  created: function () {
    socket.on( "uiLabels", labels => this.uiLabels = labels );
    socket.on( "pollData", data => this.pollData = data );
    socket.on( "participantsUpdate", p => this.pollData.participants = p );
    socket.emit( "getUILabels", this.lang );
  },
  methods: {
    shuffle(array) {

      // Iterate over the array in reverse order
      for (let i = array.length - 1; i > 0; i--) {

      // Generate Random Index
      const j = Math.floor(Math.random() * (i + 1));

      // Swap elements
      [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    },
    generateRandomQuestion: function () {
      const num1 = Math.floor(Math.random() * (this.max - this.min + 1)) + this.min;
      const num2 = Math.floor(Math.random() * (this.max - this.min + 1)) + this.min;

      switch (this.operator) {
        case '+':
          this.questions.q = `${num1} + ${num2}`;
          this.questions.a[0] = {a: num1 + num2, c:true};
          this.questions.a[1] = {a:num1 + num2 + 1, c:false};
          this.questions.a[2] = {a:num1 + num2 - 1, c:false};
          this.questions.a[3] = {a:num1 + num2 + 4, c:false};
          this.shuffle(this.questions.a);
          
          break;
        case '-':
          this.questions.q = `${num1} - ${num2}`;
          this.questions.a[0] = {a: num1 - num2, c:true};
          this.questions.a[1] = {a:num1 - num2 + 1, c:false};
          this.questions.a[2] = {a:num1 - num2 - 1, c:false};
          this.questions.a[3] = {a:num1 - num2 + 4, c:false};
          this.shuffle(this.questions.a);
          break;
        case '*':
          this.questions.q = `${num1} * ${num2}`;
          this.questions.a[0] = {a: num1 * num2, c:true};
          this.questions.a[1] = {a:num1 * num2 + 1, c:false};
          this.questions.a[2] = {a:num1 * num2 - 1, c:false};
          this.questions.a[3] = {a:num1 * num2 + 4, c:false};
          this.shuffle(this.questions.a);
          break;
        case '/':

          if (num2 === 0) {
            return this.generateRandomQuestion();
          }
          this.questions.q = `${num1} / ${num2}`;
          this.questions.a[0] = {a: num1 + num2, c:true};
          this.questions.a[1] = {a:num1 / num2 + 1, c:false};
          this.questions.a[2] = {a:num1 / num2 - 1, c:false};
          this.questions.a[3] = {a:num1 / num2 + 4, c:false};
          this.shuffle(this.questions.a);
          break;
        default:
          this.questions.q = "Not valid operator";
          this.questions.a[0] = {a:null, c:true};
          this.questions.a[1] = {a:null, c:false};
          this.questions.a[2] = {a:null, c:false};
          this.questions.a[3] = {a:null, c:false};
      }
    },

    checkValues: function (e) {
      e.preventDefault();
      if (this.formOperator && this.formMin && this.formMax && this.formPollId){
        this.operator = this.formOperator;
        this.min = this.formMin;
        this.max = this.formMax;
        this.pollId = this.formPollId;
        this.createQuiz();
      }
      else {
      console.log("Please fill in all fields.");
      }
    },
    createQuiz: function () {

      socket.emit("joinPoll", this.pollId);
      for (let i = 0; i < this.numberOfQuestions; i++){
          this.generateRandomQuestion();
          this.addQuestion(); 
        }
      socket.emit("createPoll", {pollId: this.pollId, lang: this.lang });
    },
    startPoll: function () {
      socket.emit("startPoll", this.pollId)
      socket.emit("getNumberOfQuestions", this.pollId)
    },
    addQuestion: function () {
      socket.emit("addQuestion", {pollId: this.pollId, q: this.questions.q, a: this.questions.a } )
    },
    addAnswer: function () {
      this.answers.push("");
    },
    runQuestion: function () {
      socket.emit("runQuestion", {pollId: this.pollId, questionNumber: this.questionNumber})
    }
    
  }
}

</script>
