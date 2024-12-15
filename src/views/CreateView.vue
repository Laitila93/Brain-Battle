<template>
  <form id="app" @submit="createPoll">
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
    <input
      type="submit"
      value="Create game"
    >
  </p>

</form>
  <div>
    Poll link: 
    <input type="text" v-model="pollId">
    <button v-on:click="createPoll">
      Create poll
    </button>
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
    operator: {{formOperator}}
      min: {{min}}
      max: {{max}}
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
      pollId: "",
      question: "",
      answers: ["", ""],
      questionNumber: 0,
      pollData: {},
      uiLabels: {},
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
          break;
        case '-':
          this.questions.q = `${num1} - ${num2}`;
          this.questions.a[0] = {a: num1 - num2, c:true};
          this.questions.a[1] = {a:num1 - num2 + 1, c:false};
          this.questions.a[2] = {a:num1 - num2 - 1, c:false};
          this.questions.a[3] = {a:num1 - num2 + 4, c:false};
          break;
        case '*':
          this.questions.q = `${num1} * ${num2}`;
          this.questions.a[0] = {a: num1 * num2, c:true};
          this.questions.a[1] = {a:num1 * num2 + 1, c:false};
          this.questions.a[2] = {a:num1 * num2 - 1, c:false};
          this.questions.a[3] = {a:num1 * num2 + 4, c:false};
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
          break;
        default:
          this.questions.q = "Not valid operator";
          this.questions.a[0] = {a:null, c:true};
          this.questions.a[1] = {a:null, c:false};
          this.questions.a[2] = {a:null, c:false};
          this.questions.a[3] = {a:null, c:false};
      }
    },

    createPoll: function () {
      this.operator = this.formOperator;
      this.min = this.formMin;
      this.max = this.formMax;
      for (let i = 0; i < this.numberOfQuestions; i++){
        this.generateRandomQuestion();
        this.addQuestion();

      }
      socket.emit("createPoll", {pollId: this.pollId, lang: this.lang })
      socket.emit("joinPoll", this.pollId);
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
