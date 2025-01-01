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
        <router-link to="/create/" class="create-game">
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
sessionStorage.setItem("serverIP", serverIP);
const socket = io(sessionStorage.getItem("serverIP"));

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

  header {
    background-color:#1e1e2f;
    width: 100%;
  }
  .logo {
    text-transform: uppercase;
    letter-spacing: 0.25em;
    font-size: 2.5rem;
    color: #007bff;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 10px;
    padding: 5px;

  }
  .logo img {
    height: 70px;
    min-width: 70px; 
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .text-join-section{
    text-transform: uppercase;
    display: flex;
    height: 3em;
    width: 100%;
    justify-content: center;
  }

  #error-message {
    color: red;
    font-size: 1rem;
    text-transform: none;
  }
  .footer-menu {
    position: fixed;
    background-color: #1e1e2f;
    bottom: 2px;
    left: 50px;
    width: 20em;
    height: 2em;
    display: grid;
    grid-template-columns: repeat(auto-fit, 10em);
    text-transform: uppercase;
  }
  .about-page, .rules-page {
    font-size: 1rem;
    text-decoration: none;
    letter-spacing: 0.1em;
    display: grid;
    align-items: center;
    justify-content: center;
    border-left: 1px solid white;
    border-right: 1px solid white;
    color: white;
  }
    
  .id-input {
    font-size: 1.2rem;
    max-width: 40%;
  }
  .id-input::placeholder {
    text-transform: uppercase;
    color: gray;
    opacity: 0.75;
  }
  .join-game {
    background-color: #32cd32;
    color:black;
    font-size: 0.8rem;
    text-decoration: none;
    letter-spacing: 0.1em;
    display: grid;
    align-items: center;
    width: 55%;
  }
  .hidden {
    background-color: gray;
    color:black;
    width: 55%;
    font-size: 0.8rem;
    text-decoration: none;
    letter-spacing: 0.1em;
    display: grid;
    align-items: center;
    pointer-events: none;
  }
  .create-game {
    display: flex; 
    justify-content: center; 
    align-items: center; 
    height: 3em; 
    width: 60%; 
    background-color: #ff8c00; 
    color: black; 
    font-size: 0.8rem; 
    text-decoration: none; 
    letter-spacing: 0.1em; 
    margin: 0 auto; 
}

  .or {
    text-transform: uppercase;
    letter-spacing: 0.15em;
    border-radius: 5px; 
    font-size: 1.5rem;
    color: #ffffff;
  }
  .lang-switcher {
  position: fixed;
  bottom: 10px;
  right: 20px;
  color:white;
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
