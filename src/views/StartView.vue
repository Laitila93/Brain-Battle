<template>
  <div class="wrapper">
    <header>
      <div class="logo">
        <img src="../assets/swords.png" class="logo-image">
        Brain Battle
        <img src="../assets/brain.png" class="logo-image">
      </div>

    </header>
    <nav class="main-menu">
      <p v-if="!pollExists && pollIsChecked" id="error-message">
          {{ uiLabels.invalidGameId }}
      </p>
      <div class="text-join-section">
        <input 
        class="id-input" 
        type="text" 
        maxlength="4"
        v-on:input="checkPollID" 
        v-model="newPollId" 
        :placeholder="uiLabels.enterprompt">
        <router-link v-bind:class="['join-game', {'hidden':!pollExists || !pollIsChecked}]" v-bind:to="'/lobby/' + newPollId">
        {{ uiLabels.participatePoll }}
        </router-link>
      </div>
      <div class="or">
        {{ uiLabels.or }}
      </div>
        
      <div class="menu-item">
        <router-link to="/create/" class="create-game-start">
          {{ uiLabels.createPoll }}
        </router-link>
      </div>
    </nav>

    <nav class="footer-menu">

      <a class="about-page" href="">
        {{ uiLabels.about }}
      </a>
      <a class="rules-page" href="">
        {{ uiLabels.rules }}
      </a>
    </nav>
    <div class="lang-switcher">
      {{ uiLabels.changeLanguage }}
      <button v-on:click="switchLanguage" v-bind:class="['button-sv', {'button-en':this.lang=='sv'},'lang-btn']">
      </button>
    </div>
  </div>
</template>

<script>

import ResponsiveNav from '@/components/ResponsiveNav.vue';
import io from 'socket.io-client';
const serverIP = import.meta.env.VUE_APP_SERVER_IP || "https://brainbattle-b2p0.onrender.com";
localStorage.setItem("serverIP", serverIP);
const socket = io(serverIP);

socket.on('connect_error', (err) => {
  console.error('Connection Error:', err);
});

export default {
  name: 'StartView',
  components: {
    ResponsiveNav,
  },
  data: function () {
    return {
      uiLabels: {},
      newPollId: "",
      lang: localStorage.getItem( "lang") || "en",
      hideNav: true,
      pollExists: false,
      checkTimeout: null,
      pollIsChecked: false
    }
  },
  created: function () {
    socket.emit( "getUILabels", this.lang );
    socket.on( "uiLabels", labels => this.uiLabels = labels.StartViewLabels );
    socket.on("connect", () => {
      console.log("Connected to the server:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from the server.");
    });
  },
  methods: {
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
    toggleNav: function () {
      this.hideNav = ! this.hideNav;
    },
    checkPollID() {
      clearTimeout(this.checkTimeout);
      if(this.newPollId.length >= 0 && this.newPollId.length < 4) {
        this.pollIsChecked = false
      }
      if (this.newPollId.length === 4) {
        socket.emit('validatePollId', this.newPollId, (exists) => {
          this.pollExists = exists;
          this.pollIsChecked = true;
          });
        };
    }
  }
}
</script>
<style scoped>


</style>
