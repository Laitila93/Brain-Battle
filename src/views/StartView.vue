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

