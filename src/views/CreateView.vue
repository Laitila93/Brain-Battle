<template>
  <div class="wrapper">
    <div class="poll-id">{{ uiLabels.whichGame }}: {{ pollId }}</div>
      <form id="createForm" class="form-grid" @submit="createAndStart">

        <div class="operator-section">
        <label for="formOperator">{{ uiLabels.chooseOperator }}</label>
          <div class="radio-group">
            <div class="radio-item" v-for="operator in operators" :key="operator.id">
              <input type="radio" :id="operator.id" name="operator" :value="operator.value" v-model="formOperator">
              <label :for="operator.id">{{ operator.label }}</label>
            </div>
          </div>
        </div>

        <div class="questions-section">
        <label for="numberOfQuestions">{{ uiLabels.chooseNumberOfQuestions }}</label>
          <div class="radio-group">
            <div class="radio-item" v-for="amountOfQuestions in amountOfQuestions" :key="amountOfQuestions.id">
              <input type="radio" :id="amountOfQuestions.id" name="questions" :value="amountOfQuestions.value" v-model="numberOfQuestions">
              <label :for="amountOfQuestions.id">{{ amountOfQuestions.label }}</label>
            </div>
          </div>
        </div>
      
        <div class="range-section">
          <label for="formMax">{{ uiLabels.chooseRange }}</label>
            <div class="radio-group">
              <div class="radio-item" v-for="range in range" :key="range.id">
                <input type="radio" :id="range.id" name="range" :value="range.value" v-model="formMax">
                <label :for="range.id">{{ range.label }}</label>
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
    <div class="lang-switcher">
      {{ uiLabels.changeLanguage }}
      <button 
      v-on:click="switchLanguage" 
      v-bind:class="['button-sv', {'button-en':this.lang=='sv'},'lang-btn']">
      </button>
    <button 
    class="back-button" 
    onclick="location.href='/';">
      {{ uiLabels.returnHome }}
    </button>
  </div>
</template>

<script>
import io from 'socket.io-client';
const socket = io(localStorage.getItem("serverIP"));
import { generateRandomQuestion } from "@/assets/Methods.js";
import options from "@/assets/options.json";

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
      operators: options.operators,
      amountOfQuestions: options.amountOfQuestions,
      range: options.range,

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
</style>
