<template>
  <!--Emil: the header element is not necessary for the resulting layout. Should it
  still be kept for readability reasons?-->
  <header>
    <div class="lang-switcher">
    <div></div>
      <div>
        {{ uiLabels.changeLanguage }}
        <button 
          v-on:click="switchLanguage" 
          v-bind:class="['button-sv', {'button-en':this.lang=='sv'},'lang-btn']">
        </button>
      </div>
      </div> 

    </header>
  <div class="main-container">
    <div>
    <div class="logo">
        <img src="../assets/brain.png" class="logo-image">
          Brain Battle
        <img src="../assets/swords.png" class="logo-image">
      </div>
      <div class="sub-title">{{ uiLabels.subtitle }} </div>
    </div>
    <nav class="start-menu">
      <p v-if="!gameExists && gameIsChecked" class="error-message">
        {{ uiLabels.invalidGameId }}
      </p>
      <div class="menu-section">
        <input 
          class="id-input" 
          type="text" 
          maxlength="4"
          v-on:input="checkgameID" 
          v-model="newgameId" 
          :placeholder="uiLabels.enterprompt"
          >
        <router-link 
          v-bind:class="['menu-link join-link', {'menu-link join-link--disabled':!gameExists || !gameIsChecked}]" 
          v-bind:to="'/lobby/' + newgameId">
          {{ uiLabels.participategame }}
        </router-link>
      </div>
      <div class="content-separator">
        {{ uiLabels.or }}
      </div>
      <div class="menu-section"> 
        <router-link to="/create/" class="menu-link create-link" >
          {{ uiLabels.creategame }}
        </router-link>
      </div>
    </nav>
  </div>
</template>


<script>

import io from 'socket.io-client';

sessionStorage.setItem("serverIP", "130.243.211.91:3000");

const socket = io(sessionStorage.getItem("serverIP"));

export default {
  name: 'StartView',
  data: function () {
    return {
      uiLabels: {},
      newgameId: "",
      lang: sessionStorage.getItem("lang") || "en",
      gameExists: false,
      gameIsChecked: false
    }
  },
  created: function () {
    socket.emit( "getUILabels", this.lang );
    socket.on( "uiLabels", labels => this.uiLabels = labels.StartViewLabels );
  },
  methods: {
    switchLanguage: function() {
      if (this.lang === "en") {
        this.lang = "sv"
      }
      else {
        this.lang = "en"
      }
      sessionStorage.setItem( "lang", this.lang );
      socket.emit( "getUILabels", this.lang );
    },
    
    checkgameID() {
      if(this.newgameId.length >= 0 && this.newgameId.length < 4) {
        this.gameIsChecked = false
      }
      if (this.newgameId.length === 4) {
        socket.emit('validategameId', this.newgameId, (exists) => {
          this.gameExists = exists;
          this.gameIsChecked = true;
          });
        };
    },

  }
  
}
</script>

