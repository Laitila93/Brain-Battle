<template>

  <form id="createForm" class="form-grid" @submit="createAndStart">
    <div> </div>
    <div class="poll-id">
    <h1>{{ uiLabels.whichGame }}: {{ pollId }} </h1>
    </div>
    <div> </div>
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
          <label :for="range.id">
            {{ range.value === 'custom' ? uiLabels.custom : range.label }}
          </label>
        </div>
      </div>
      <input 
        v-if="formMax === 'custom'" 
        type="number" 
        v-model.number="customRange" 
        :placeholder="uiLabels.enterCustomRange"
        min="2"
        max="1000">
    </div>
    <div class="content-separator"></div>
      <div class="menu-section">
        <button type="submit" class="menu-btn create-btn">
          {{ uiLabels.header }}
        </button>
      </div>
  </form>

  <p v-if="errorMessage" class="error-message">
    {{ errorMessage }}
  </p>
  <div class="lang-switcher">
    {{ uiLabels.changeLanguage }}
    <button v-on:click="switchLanguage" v-bind:class="['button-sv', {'button-en':this.lang=='sv'},'lang-btn']">
    </button>
  </div>
  <button class="back-btn" onclick="location.href='/';">
    {{ uiLabels.returnHome }}
  </button>
</template>

<script>
import io from 'socket.io-client';
const socket = io(sessionStorage.getItem("serverIP"));
import { generateRandomQuestion } from "@/assets/Methods.js";
import options from "@/assets/options.json";

export default {
  name: 'CreateView',
  data: function () {
    return {
      lang: sessionStorage.getItem("lang") || "en",
      pollId: null,
      question: "",
      answers: ["", ""],
      questionNumber: 0, //Emil: verkar kunna tas bort av samma anledning som nedan
      pollData: {}, //EmiL: den här tycker jag verkar onödig, har testat att ta bort den och allt verkar funka.
      uiLabels: {},
      operators: options.operators,
      amountOfQuestions: options.amountOfQuestions,
      range: options.range,

      formOperator: null,
      formMin: 1,
      formMax: null,
      customRange: null,

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
    socket.on( "pollData", data => this.pollData = data ); //Emil: Även denna tkr jag vi kan ta bort, se ovan
    this.generatePollId();
    socket.on( "participantsUpdate", p => this.pollData.participants = p ); //Emil: och denna
    socket.emit( "getUILabels", this.lang );
    socket.emit("createPoll", {pollId: this.pollId, lang: this.lang });
    socket.emit("joinPoll", this.pollId); //Emil: har kollat på joinPoll events som skapas i Create och Lobby. De verkar onödiga
                                          //om jag inte missar något. Föreslår att vi testar att ta bort dem.


  },
  methods: {
    generatePollId: function () {
      this.pollId = Math.floor(1000 + Math.random() * 9000);
    },

    createAndStart: function (e) {
      e.preventDefault();
      this.errorMessage = '';
      
      const isCustom = this.formMax === 'custom' && this.customRange > 0;
      const isRange = this.formMax !== 'custom' && this.formMax !== null;

      if (this.formOperator && this.formMin && (isCustom || isRange)){
        this.operator = this.formOperator;
        this.min = 1; 
        this.max = isCustom ? parseInt(this.customRange) : parseInt(this.formMax); 
        for (let i = 0; i < this.numberOfQuestions; i++){
          generateRandomQuestion( {min: this.min, max: this.max, operator: this.operator, questions: this.questions, socket: socket, pollId: this.pollId} );
        }
        socket.emit("createPoll", {pollId: this.pollId, lang: this.lang });
        socket.emit("joinPoll", this.pollId); //Emil: joinPoll event som verkar kunna tas bort
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
      sessionStorage.setItem( "lang", this.lang );
      socket.emit( "getUILabels", this.lang );
    }
  }
}
</script>
