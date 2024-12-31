<template>
  <div class="wrapper">
    <div class="main-menu">
      <div class="card">
      <div class="poll-id">
        {{ uiLabels.whichGame }} : {{pollId}}
      </div>
      <div>
        <p v-if="playerRole">{{ uiLabels.youAre }} <strong>{{ playerRole }}</strong></p>
        <div class="menu-item">
        <button v-if="!joined" @click="participateInPoll" class="join-game">
          {{uiLabels.participateInGame}}
        </button>
      </div>
        <p v-if="waitingForPlayers">{{ uiLabels.waitingForOthers }}</p>
      </div>
    </div>
    </div>
    <div class="lang-switcher">
      {{ uiLabels.changeLanguage }}
      <button v-on:click="switchLanguage" v-bind:class="['button-sv', {'button-en':this.lang=='sv'},'lang-btn']">
      </button>
    </div> 
    <button class="back-button" onclick="location.href='/';">{{ uiLabels.returnHome }}</button>
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
      console.log("LOBBY: Player role assigned: ", role);
      this.joined = true;
    });

    socket.on( "uiLabels", labels => this.uiLabels = labels.LobbyViewLabels );
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
.card {
  border-radius: 5px;
  padding: 20px;
  box-shadow: 0px 4px 6px rgba(0.3, 0.1, 0.2, 0.4);
  background-color: #252537;
  width: 65%;
  position:fixed;
  top: 50%; /* Vertically center */
  left: 50%; /* Horizontally center */
  transform: translate(-50%, -50%); /* Adjust to perfectly center it */
}
.poll-id{
  font-size: 20pt;
  font-family:'Times New Roman', Times, serif;
  color:#007bff;
}
.lang-switcher {
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

  .card label{
    color:white;
    padding: 3px;
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
.join-game {
    background-color: #32cd32;
    color:black;
    font-size: 0.8rem;
    text-decoration: none;
    letter-spacing: 0.1em;
    display: grid;
    align-items: center;
    height: 3em;
    width: 55%;
  }
.back-button {
  position: fixed;
  background-color: #1e1e2f;
  bottom: 4px;
  left: 50px;
  width: 13em;
  height: 2em;
  display: grid;
  color: white;
  text-transform: uppercase;
}

.back-button:hover {
  background-color:#007bff;
  cursor: pointer;
}

</style>
