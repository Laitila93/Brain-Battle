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
    this.generatePollId();
    socket.emit( "getUILabels", this.lang );
    socket.emit("createPoll", {pollId: this.pollId, lang: this.lang });
    //socket.emit("joinPoll", this.pollId);


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
        //socket.emit("joinPoll", this.pollId);
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
</style>
