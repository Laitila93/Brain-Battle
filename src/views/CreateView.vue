<template>
  <div class="wrapper" >
    CREATE GAME
    <nav class="main-menu">
      <div class="logo">Poll ID: {{ pollId }}</div>
        <div>
          <form id="createForm" @submit="createAndStart">
            <p>
              <label for="formOperator">Operator: </label>
                <select id="formOperator" v-model="formOperator" name="formOperator" required>
                  <option>+</option>
                  <option>-</option>
                  <option>*</option>
                  <option>/</option>
                </select>
            </p>
            <p>
              <label for="numberOfQuestions">Number Of Questions: </label>
                <select id="numberOfQuestions" v-model="numberOfQuestions" name="numberOfQuestions" required>
                  <option>16</option>
                  <option>25</option>
                  <option>36</option>
                  <option>49</option>
                  <option>64</option>
                  <option>81</option>
                </select>
            </p>
            <p>
              <label for="formMin">Min: </label>
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
              <label for="formMax">Max: </label>
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
              <button type="submit">
                {{uiLabels.createPoll}}
              </button>
            </p>
          </form>
        </div>
    </nav>
    <div class="lang-wrapper">
      {{ uiLabels.changeLanguage }}
      <button v-on:click="switchLanguage" v-bind:class="['button-sv', {'button-en':this.lang=='sv'}]">
      </button>
    </div>
  </div>
</template>

<script>
import io from 'socket.io-client';
const socket = io(localStorage.getItem("serverIP"));

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

      formOperator: "+",
      formMin: 1,
      formMax: 10,

      operator: null,
      min: null,
      max: null,

      numberOfQuestions: 81,
      questions:
      {q: "", a: [{a:null, c:true}, {a:null, c:false}, {a:null, c:false}, {a:null, c:false}]}
      
    }
  },
  created: function () {
    
    socket.on( "uiLabels", labels => this.uiLabels = labels );
    socket.on( "pollData", data => this.pollData = data );
    this.generatePollId();
    socket.on( "participantsUpdate", p => this.pollData.participants = p );
    socket.emit( "getUILabels", this.lang );
    
    this.createQuiz();

  },
  methods: {
    generatePollId: function () {
      this.pollId = Math.floor(1000 + Math.random() * 9000);
    },

    shuffle: function (array) {

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

    createAndStart: function (e) {
      e.preventDefault();
      if (this.formOperator && this.formMin && this.formMax){
        this.operator = this.formOperator;
        this.min = this.formMin;
        this.max = this.formMax;
        for (let i = 0; i < this.numberOfQuestions; i++){
          this.generateRandomQuestion();
          this.addQuestion(); 
        }
        socket.emit("createPoll", {pollId: this.pollId, lang: this.lang });
        socket.emit("joinPoll", this.pollId);
        this.$router.push(('/lobby/' + this.pollId))
      }
      else {
        console.log("Please fill in all fields.");
      }
    },
    createQuiz: function () {
      socket.emit("createPoll", {pollId: this.pollId, lang: this.lang });
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
    runQuestion: function () { //Är denna överflödig?
      socket.emit("runQuestion", {pollId: this.pollId, questionNumber: this.questionNumber})
    },
    switchLanguage: function() {
      if (this.lang === "en") {
        this.lang = "sv"
      }
      else {
        this.lang = "en"
      }
      localStorage.setItem( "lang", this.lang );
      socket.emit( "getUILabels", this.lang );
    }
    
  }
}

</script>

<style>
/*"wrapper" and "main-menu" classes are styled in main.css */

.lang-wrapper {
    position:fixed;
    bottom: 10px;
    right: 20px;
    color:#007bff;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1em;
    font-size: 1em;
    letter-spacing: 0.1rem;
    text-transform: uppercase;
  }

  .button-sv {
    height: 3em;
    width: 5em;
    cursor: pointer;
    border-radius: 1em;
    background-image: url("../assets/swedish-flag.png");
    background-size: cover;
    background-position: center;
  }

  .button-en {
    height: 3em;
    width: 5em;
    cursor: pointer;
    border-radius: 1em;
    background-image: url("../assets/uk-flag.png");
    background-size: cover;
    background-position: center;
  }


</style>
