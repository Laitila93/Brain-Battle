<template>
  <div class="centered-container">
  <div class="wrapper">
  <nav>
    <div class="poll-id">{{ uiLabels.whichGame }}: {{ pollId }}</div>
    <div>
      <form id="createForm" @submit="createAndStart">
        <div class="form-grid">
          <div class="operator-section">
            <label for="formOperator">{{ uiLabels.chooseOperator }}</label>
            <div class="radio-group">
              <div class="radio-item">
                <input type="radio" id="add" name="operator" value="+" v-model="formOperator">
                <label for="add">+</label>
              </div>
              <div class="radio-item">
                <input type="radio" id="subtract" name="operator" value="-" v-model="formOperator">
                <label for="subtract">-</label>
              </div>
              <div class="radio-item">
                <input type="radio" id="multiply" name="operator" value="*" v-model="formOperator">
                <label for="multiply">*</label>
              </div>
              <div class="radio-item">
                <input type="radio" id="divide" name="operator" value="/" v-model="formOperator">
                <label for="divide">/</label>
              </div>
            </div>
          </div>

          <div class="questions-section">
            <label for="numberOfQuestions">{{ uiLabels.chooseNumberOfQuestions }}</label>
            <div class="radio-group">
              <div class="radio-item">
                <input type="radio" id="q36" name="questions" value="36" v-model="numberOfQuestions">
                <label for="q36">36</label>
              </div>
              <div class="radio-item">
                <input type="radio" id="q49" name="questions" value="49" v-model="numberOfQuestions">
                <label for="q49">49</label>
              </div>
              <div class="radio-item">
                <input type="radio" id="q64" name="questions" value="64" v-model="numberOfQuestions">
                <label for="q64">64</label>
              </div>
              <div class="radio-item">
                <input type="radio" id="q81" name="questions" value="81" v-model="numberOfQuestions">
                <label for="q81">81</label>
              </div>
            </div>
          </div>

          <div class="range-section">
            <label for="formMax">{{ uiLabels.chooseRange }}</label>
            <div class="radio-group">
              <div class="radio-item">
                <input type="radio" id="range1-10" name="range" value="10" v-model="formMax">
                <label for="range1-10">1-10</label>
              </div>
              <div class="radio-item">
                <input type="radio" id="range1-20" name="range" value="20" v-model="formMax">
                <label for="range1-20">1-20</label>
              </div>
              <div class="radio-item">
                <input type="radio" id="range1-30" name="range" value="30" v-model="formMax">
                <label for="range1-30">1-30</label>
              </div>
              <div class="radio-item">
                <input type="radio" id="range1-40" name="range" value="40" v-model="formMax">
                <label for="range1-40">1-40</label>
              </div>
            </div>
          </div>


        </div>


        <div class="menu-item">
          <button type="submit" class="create-game">
            {{ uiLabels.header }}
          </button>
        </div>
        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
      </form>
    </div>
  </nav>
</div>
    <div class="lang-switcher">
      {{ uiLabels.changeLanguage }}
      <button v-on:click="switchLanguage" v-bind:class="['button-sv', {'button-en':this.lang=='sv'},'lang-btn']">
      </button>
    </div> 
    <button class="back-button" onclick="location.href='/';">{{ uiLabels.returnHome }}</button>
  </div>
</template>

<script>
import io from 'socket.io-client';
const socket = io(localStorage.getItem("serverIP"));
import { generateRandomQuestion } from "@/assets/Methods.js";

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
      formMin: 1,
      formMax: null,

      errorMessage: '',

      operator: null,
      min: null,
      max: null,

      numberOfQuestions: null,
      questions:
      {q: "", a: [{a:null, c:true}, {a:null, c:false}, {a:null, c:false}, {a:null, c:false}]}
      
    }
  },
  created: function () {
    
    socket.on( "uiLabels", labels => this.uiLabels = labels.CreateViewLabels );
    socket.on( "pollData", data => this.pollData = data );
    this.generatePollId();
    socket.on( "participantsUpdate", p => this.pollData.participants = p );
    socket.emit( "getUILabels", this.lang );
    socket.emit("createPoll", {pollId: this.pollId, lang: this.lang });
    socket.emit("joinPoll", this.pollId);


  },
  methods: {
    generatePollId: function () {
      this.pollId = Math.floor(1000 + Math.random() * 9000);
    },

    createAndStart: function (e) {
      e.preventDefault();
      this.errorMessage = '';

      if (this.formOperator && this.formMin && this.formMax){
        
        this.operator = this.formOperator;
        this.min = 1; 
        this.max = parseInt(this.formMax); 
        for (let i = 0; i < this.numberOfQuestions; i++){
          generateRandomQuestion( {min: this.min, max: this.max, operator: this.operator, questions: this.questions, socket: socket, pollId: this.pollId} );
        }
        socket.emit("createPoll", {pollId: this.pollId, lang: this.lang });
        socket.emit("joinPoll", this.pollId);
        this.$router.push(('/lobby/' + this.pollId))
      }
      else {
      this.errorMessage = this.uiLabels.errorMessage;
      }
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
/*To be placed in main.css */
.form-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 50px;
  width:65%;
  position:fixed;
  bottom: 135px;
  right:250px;
}


.operator-section,.questions-section,
.range-section {
  padding: 20px;
  border-radius: 10px;
  height: auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: #252537;
 
  box-shadow: 2px 8px 10px rgba(0.5, 0.5, 0.5, 0.5);
}
.operator-section label, .questions-section label, .range-section label{
  font-size: 1.1em;
  font-weight: bold;
  color: #ff8c00;
  padding: 3px;
  font-family:'Times New Roman', Times, serif;
}
.radio-item {
  display: flex;
  align-items: center;
  gap: 5px;  
 
}
.radio-group label {
  font-size: 1.1em;
  font-weight: bold;
  color: #ff8c00;  /* Ensure readability */
  font-family:'Times New Roman', Times, serif;
 
}


.poll-id{
  font-size: 20pt;
  font-family:'Times New Roman', Times, serif;
  font-family: 'Agbalumo';
  color:#ff8c00;
}


.radio-group {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: auto;  
 
}
.create-game {
  position: fixed;
  bottom: 70px;    
  left: 50%;      
  transform: translateX(-50%);
  height: 2em;
  width: 20%;
  background-color: #ff8c00;
  color: black;
  font-size: 1.2rem;
}
.error-message {
    color: red;
    font-size: 1.2rem;
    font: bold;
    text-transform: none;
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
.lang-switcher {
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
.lang-btn {
  height: 3em;
  width: 5em;
  cursor: pointer;
  border-radius: 1em;
  background-size: cover;
  background-position: center;
}


.button-sv {
  background-image: url("../assets/swedish-flag.png");
}


.button-en {
  background-image: url("../assets/uk-flag.png");
}


</style>
