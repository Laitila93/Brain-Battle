<template>
  <div class="wrapper">
    <div class="main-menu">
      <div class="logo">
        {{pollId}}
      </div>
      <div>
        <p v-if="playerRole">You are: <strong>{{ playerRole }}</strong></p>
        <button v-if="!joined" @click="participateInPoll">
        Participate in Poll
        </button>
        <p v-if="waitingForPlayers">{{ uiLabels.waitingForOthers }}</p>
      </div>
      <div v-if="joined">
        <p>Waiting for host to start poll</p>
      </div>
    </div>
    <div class="lang-wrapper">
      {{ uiLabels.changeLanguage }}
      <button v-on:click="switchLanguage" v-bind:class="['button-sv', {'button-en':this.lang=='sv'}]">
      </button>
    </div>
  </div>
</template>

<script>
import io from 'socket.io-client';
const socket = io(localStorage.getItem("serverIP"));

export default {
  name: 'LobbyView',
  data: function () {
    return {
      playerRole: "",
      pollId: "inactive poll",
      uiLabels: {},
      joined: false,
      lang: localStorage.getItem("lang") || "en",
      participants: [],
      waitingForPlayers: true
    }
  },
  created: function () {
    this.pollId = this.$route.params.id;
    
    socket.on("playerRoleAssigned", (role) => {
      this.playerRole = role;
      localStorage.setItem("playerRole", role);
      this.joined = true;
    });

    socket.on( "uiLabels", (labels) => {
      this.uiLabels = labels.LobbyViewLabels
      console.log(this.uiLabels);
    });
    socket.on("participantsUpdate", (participants) => {
      if (participants.length === 2) {
        this.waitingForPlayers = false;
        console.log("LOBBY: Both players joined. Starting the game!");
      }
    });
    
    socket.on("startPoll", () => {
    console.log("LOBBY: Game started!");
    this.$router.push(`/poll/${this.pollId}`);
    });

    socket.on("error", (message) => {
    alert(message);
  });
    
    socket.emit( "joinPoll", this.pollId );
    socket.emit( "getUILabels", this.lang );
  },
  methods: {
    participateInPoll() {
      console.log("participateInPoll ", this.pollId, this.uiLabels.waitingForPlayer)
      socket.emit("participateInPoll", { pollId: this.pollId });
    },
    startPoll: function () {
      if (this.participants.length > 0){
        socket.emit("startPoll", this.pollId)
        socket.emit("getNumberOfQuestions", this.pollId)
      }
    },
    switchLanguage: function() {
      if (this.lang === "en") {
        this.lang = "sv"
      }
      else {
        this.lang = "en"
      }
      localStorage.setItem( "lang", this.lang );
      socket.emit( "getUILabels", this.lang );
    }
  }
}
</script>

<style>
/*To be placed in main.css */
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
