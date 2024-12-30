<template>
  <div class="wrapper">
    <div class="card">
      <div class="poll-id">
        {{ uiLabels.whichGame }}: {{pollId}}
      </div>
      
      <div>
        <p v-if="playerRole">{{ uiLabels.youAre }} <strong>{{ playerRole }}</strong></p>
        <div v-if="!joined">
          <label for="playerName">{{ uiLabels.enterName }}</label>
          <input 
            type="text" 
            id="playerName" 
            v-model="playerName" 
            :placeholder="uiLabels.namePlaceholder" 
            class="name-input"
            maxlength="15"
          />
        </div>
        <div class="menu-item">
        <button v-if="!joined" @click="participateInPoll" class="join-game">
          {{uiLabels.participateInGame}}
        </button>
      </div>
        <p v-if="waitingForPlayers">{{ uiLabels.waitingForOthers }}</p>
      </div>
    </div>
    <div class="lang-switcher">
      {{ uiLabels.changeLanguage }}
      <button v-on:click="switchLanguage" v-bind:class="['button-sv', {'button-en':this.lang=='sv'},'lang-btn']">
      </button>
    </div>
    <button class="back-button" @click="goToStartView">{{ uiLabels.backToMenu || "Back to Menu" }}</button>
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
      waitingForPlayers: true,
      playerName: ""
    }
  },
  created: function () {
    this.pollId = this.$route.params.id;
    
    socket.on("playerRoleAssigned", (role) => {
      this.playerRole = role;
      this.playerName = role.name;
      localStorage.setItem("playerRole", role.role);
      localStorage.setItem("playerName", role.name);
      this.joined = true;
    });

    socket.on( "uiLabels", (labels) => {
      this.uiLabels = labels.LobbyViewLabels
      console.log("uiLabels loaded:", this.uiLabels);
    });
    socket.on("participantsUpdate", (participants) => {
      this.participants = participants;
      if (participants.length === 2) {
        this.waitingForPlayers = false;
        console.log("LOBBY: Both players joined. Starting the game!");
      }
    });
    
    socket.on("startPoll", () => {
    console.log("LOBBY: Game started!");
    this.$router.push({
        path: `/poll/${this.pollId}`,
        query: { playerName: this.playerName }
      });
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
      if (this.playerName.trim()) {
      socket.emit("participateInPoll", { 
        pollId: this.pollId, 
        playerName: this.playerName 
      });
    } else {
      alert(this.uiLabels.enterNameFirst || "Please enter a name first");
    }
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
    },
    goToStartView: function() {
      this.$router.push('/'); 
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
  width: 30%;
  position:fixed;
  bottom:200px;
  left:400px;
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
    height: 85%;
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
.name-input {
  padding: 5px;
  font-size: 1.1em;
  width: 50%;
  margin-top: 10px;
  margin-bottom: 10px;
  border-radius: 5px;
  border: 2px solid #ccc;
}

</style>
