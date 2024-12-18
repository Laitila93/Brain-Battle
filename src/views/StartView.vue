<template>
  <div class="wrapper">
    <header>
      <div class="logo">
        <img src="../assets/swords.png">
        Brain Battle
        <img src="../assets/brain.png">
      </div>
    </header>
    <nav class="main-menu">
      <div class="menu-item">
        <input class="id-input" type="text" v-model="newPollId" :placeholder="uiLabels.enterprompt">
        <router-link v-bind:class="['join-game', {'hidden':!newPollId}]" v-bind:to="'/lobby/' + newPollId">
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
      <button v-on:click="switchLanguage" v-bind:class="['lang-sv', {'lang-en':this.lang=='sv'}]">
      </button>
    </div>
  </div>
</template>

<script>

import ResponsiveNav from '@/components/ResponsiveNav.vue';
import io from 'socket.io-client';
const socket = io("localhost:3000");

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
      hideNav: true
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
    }
  }
}
</script>
<style scoped>

  header {
    background-color:#1e1e2f;
    width: 100%;
    padding-top: 0.2em;
  }
  .logo {
    text-transform: uppercase;
    letter-spacing: 0.25em;
    font-size: 2.5rem;
    color: #007bff;
    padding-top:0.2em;
  }
  .logo img {
    height:2.5rem;
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
    opacity: 0.5;
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

  .lang-sv {
    height: 3em;
    width: 5em;
    cursor: pointer;
    border-radius: 1em;
    background-image: url("../assets/swedish-flag.png");
    background-size: cover;
    background-position: center;
  }

  .lang-en {
    height: 3em;
    width: 5em;
    cursor: pointer;
    border-radius: 1em;
    background-image: url("../assets/uk-flag.png");
    background-size: cover;
    background-position: center;
  }

</style>
