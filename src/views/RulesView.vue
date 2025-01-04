<template>
  <!--Emil: the header element is not necessary for the resulting layout. Should it
  still be kept for readability reasons?-->
  <header>
    <div class="logo">
      <img src="../assets/swords.png" class="logo-image">
      The Rules
      <img src="../assets/brain.png" class="logo-image">
    </div>
  </header>
  <nav class="main-menu">
    This is the main menu
    <div class="menu-section">
      This is a menu section
    </div>
    <div class="menu-section">
      This is a menu section
    </div>
  </nav>
  <button
    class="back-btn" 
    onclick="location.href='/';">
    {{ uiLabels.returnHome }}
  </button>
  <div class="lang-switcher">
    {{ uiLabels.changeLanguage }}
    <button 
      v-bind:class="['button-sv', {'button-en':this.lang=='sv'},'lang-btn']"
      v-on:click="switchLanguage">
    </button>
  </div>
</template>


<script>

import io from 'socket.io-client';

localStorage.setItem("serverIP", "192.168.10.149:3000");

const socket = io(localStorage.getItem("serverIP"));

export default {
  name: 'RulesView',
  data: function () {
    return {
      uiLabels: {},
      lang: localStorage.getItem( "lang") || "en",
    }
  },

  created: function () {
    socket.emit( "getUILabels", this.lang );
    socket.on( "uiLabels", labels => this.uiLabels = labels.RulesViewLabels );
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
    
  }
}

</script>

