<template>
  <div class="wrapper">
    <header>
      <div class="logo">
        <div class="img-wrapper">
          <img src="../assets/swords.png">
        </div>
        Brain Battle
        <div class="img-wrapper">
          <img src="../assets/brain.png">
        </div>
      </div>
    </header>
    <nav class="main-menu">
      <p v-if="!pollExists && pollIsChecked" id="error-message">
          {{ uiLabels.invalidGameId }}
      </p>
      <div class="menu-item">
        <input class="id-input" type="text" v-on:input="checkPollID" v-model="newPollId" :placeholder="uiLabels.enterprompt">
        <router-link v-bind:class="['join-game', {'hidden':!pollIsChecked}]" v-bind:to="'/lobby/' + newPollId">
        {{ uiLabels.participatePoll }}
        </router-link>
      </div>
      <div class="menu-item">
        <div class="or">
          {{ uiLabels.or }}
        </div>
      </div>
      <div class="menu-item">
        <router-link to="/create/" class="create-game">
          {{ uiLabels.createPoll }}
        </router-link>
      </div>
    </nav>

    <nav class="temp-menu">

      <a class="temp-menu-item" href="">
        {{ uiLabels.about }}
      </a>
      <a class="temp-menu-item" href="">
        {{ uiLabels.rules }}
      </a>
    </nav>
    <div class="lang-wrapper">
      {{ uiLabels.changeLanguage }}
      <button v-on:click="switchLanguage" v-bind:class="['button-sv', {'button-en':this.lang=='sv'}]">
      </button>
    </div>
  </div>
</template>

<script>

import ResponsiveNav from '@/components/ResponsiveNav.vue';
import io from 'socket.io-client';
localStorage.setItem("serverIP", "192.168.50.97:3000");
const socket = io(localStorage.getItem("serverIP"));

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
    socket.on( "uiLabels", labels => this.uiLabels = labels );
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
  .img-wrapper {
    height: 70px;
    min-width: 70px; /*NEED TO REVISIT THIS! I DON'T KNOW WHAT I'M DOING /Emil*/
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .logo img {
    height:100%;
    width:100%;
    vertical-align: bottom;
    margin-right: 0.5rem; 
  }

  .menu-item {
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
  .temp-menu {
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
  .temp-menu-item {
    font-size: 0.8rem;
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
    background-color: #ff8c00;
    color:black;
    width: 60%;
    font-size: 0.8rem;
    text-decoration: none;
    letter-spacing: 0.1em;
    display: grid;
    align-items: center;
  }
  .or {
    text-transform: uppercase;
    letter-spacing: 0.15em;
    font-size: 2rem;
    color: #007bff;
  }

  
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
