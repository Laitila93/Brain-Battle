<template>
  <div class="wrapper" >
    <div class="poll-id">Poll ID: {{ pollId }}</div>
    <nav class="option-menu">
        <div>
          <form id="createForm" @submit="createAndStart">
            
            <p>
              <label for="formOperator">Choose A Math Operator: </label>
                <select id="formOperator" v-model="formOperator" name="formOperator" required>
                  <option>+</option>
                  <option>-</option>
                  <option>*</option>
                  <option>/</option>
                </select>
            </p>
    
            <p>
              <label for="numberOfQuestions">Select the Number Of Questions: </label>
                <select id="numberOfQuestions" v-model="numberOfQuestions" name="numberOfQuestions" required>
                  <option>16</option>
                  <option>25</option>
                  <option>36</option>
                  <option>49</option>
                </select>
            </p>
            <p>
              <label for="formMin">Minimum of questions: </label>
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
              <label for="formMax">Maximum of questions: </label>
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
    <div class="lang-switcher">
      {{ uiLabels.changeLanguage }}
      <button v-on:click="switchLanguage" v-bind:class="['button-sv', {'button-en':this.lang=='sv'},'lang-btn']">
      </button>
    </div>
    <button class="back-button" @click="goToStartView">{{ uiLabels.backToMenu || "Back to Menu"}}</button>
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
        console.log(this.pollData)
      }
      else {
        console.log("Please fill in all fields.");
      }
    },
    createQuiz: function () {
      socket.emit("createPoll", {pollId: this.pollId, lang: this.lang });
      socket.emit("joinPoll", this.pollId);
      console.log("first createQuiz")

      
    },
    addQuestions: function () {

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
    },
    goToStartView: function() {
  this.$router.push('/'); 
},
    
  }
}

</script>

<style>
/*"wrapper" and "main-menu" classes are styled in main.css */
.option-menu{
  position:fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  gap: 2em;
  width: 26em;
  color: #ff8c00;
}
.poll-id{
  font-size: 20pt;
  font-family:'Times New Roman', Times, serif;
  font-family: 'Agbalumo';
  color:#ff8c00;
}
#createForm label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  background-color:#1e1e2f;
}
#createForm select,
#createForm input[type="number"] {
  background-color: rgb(99, 55, 2);
  width: 80%;
  padding: 8px;
  border: 1px solid #ff8c00;
  border-radius: 10px;
}
#createForm button[type="submit"] {
  width: 80%;
  padding: 10px;
  background-color: #ff8c00;
  color: black;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

#createForm select option {
  background-color: #1e1e2f; 
}
.back-button {
  position: fixed;
  background-color: #1e1e2f;
  bottom: 4px;
  left: 50px;
  width: 13em;
  height: 2em;
  display: grid;
  color: white;
  text-transform: uppercase;
}

.back-button:hover {
  background-color: #e67e00;
  cursor: pointer;
}

</style>
