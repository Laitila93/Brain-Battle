<template>
  <div class="wrapper">
    <header>
      <div class="logo">
        <img src="/img/logo.png">
        Brain Battle
        <img src="../assets/logo.svg">
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
      <button v-on:click="switchLanguage">
        {{ uiLabels.changeLanguage }}
      </button>
      <a class="temp-menu-item" href="">
        {{ uiLabels.about }}
      </a>
      <a class="temp-menu-item" href="">
        {{ uiLabels.rules }}
      </a>
    </nav>
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

    console.log(this.lang);
    socket.emit( "getUILabels", this.lang );
    socket.on( "uiLabels", labels => this.uiLabels = labels );
    
    console.log(this.uiLabels);
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
  .wrapper{
    width:100%;
    height:100vh;
    background-color: #1e1e2f;
  }
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
  .main-menu {
    position:fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    gap: 2em;
    width: 26em;
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
    background-color: lightgray;
    bottom: 2px;
    left: 50px;
    width: 30em;
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
    border-left: 1px solid gray;
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
  button {
    height: 2em;
    width: 10em;
    cursor: pointer;
  } 
</style>
