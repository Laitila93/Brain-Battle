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

