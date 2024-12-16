<template>
  <div>
    {{pollId}}
    <div v-if="!joined">
      <input type="text" v-model="userName">
      <button v-on:click="participateInPoll">
        {{ this.uiLabels.participateInPoll }}
      </button>
    </div>
    <div v-if="joined">
      <p>Waiting for host to start poll</p>
      {{ participants }}
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
      userName: "",
      pollId: "inactive poll",
      uiLabels: {},
      joined: false,
      lang: localStorage.getItem("lang") || "en",
      participants: []
    }
  },
  created: function () {
    this.pollId = this.$route.params.id;
    socket.on( "uiLabels", labels => this.uiLabels = labels );
    socket.on( "participantsUpdate", p => this.participants = p );
    socket.on( "startPoll", () => this.$router.push("/poll/" + this.pollId) );
    socket.emit( "joinPoll", this.pollId );
    socket.emit( "getUILabels", this.lang );
  },
  methods: {
    participateInPoll: function () {
      socket.emit( "participateInPoll", {pollId: this.pollId, name: this.userName} )
      this.joined = true;
      console.log("length",this.participants.length)
      this.startPoll();
      
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
