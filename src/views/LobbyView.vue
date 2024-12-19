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
          <p v-if="waitingForPlayers">Waiting for other player to join...</p>
        </div>

      <div v-if="joined">
        <p>Waiting for host to start poll</p>
      </div>
    </div>
  </div>
</template>

<script>
import io from 'socket.io-client';
const socket = io("localhost:3000");

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
      this.joined = true;
    });

    socket.on( "uiLabels", labels => this.uiLabels = labels );
    socket.on("participantsUpdate", (participants) => {
      if (participants.length === 2) {
        this.waitingForPlayers = false;
        console.log("Both players joined. Starting the game!");
      }
    });
    
    socket.on("startPoll", () => {
    console.log("Game started!");
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
      socket.emit("participateInPoll", { pollId: this.pollId });
    },
    startPoll: function () {
      if (this.participants.length > 0){
        socket.emit("startPoll", this.pollId)
        socket.emit("getNumberOfQuestions", this.pollId)
      }
    }
  }
}
</script>
