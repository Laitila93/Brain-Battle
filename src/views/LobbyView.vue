<template>
  <div class="main-container">
    <div>
      <DominationTutorial v-bind:uiLabels="uiLabels"/>
    </div>  
    <div class="lobby-menu">
      <div class="card">
        <div class="poll-id-lobby">
          {{ uiLabels.whichGame }} : {{pollId}}
        </div>
        <div>
          <p v-if="playerRole">
            {{ uiLabels.youAre }} 
            <strong>{{ playerRole }}</strong>
          </p>
          <div class="menu-section">
            <button v-if="!joined" @click="participateInPoll" class="menu-btn join-btn">
              {{uiLabels.participateInGame}}
            </button>
          </div>
          <p v-if="waitingForPlayers && joined">{{ uiLabels.waitingForOthers }}</p>
        </div>
      </div>
    </div>
    <footer>
      <div class="lang-switcher">
        {{ uiLabels.changeLanguage }}
        <button 
          v-on:click="switchLanguage" 
          v-bind:class="['button-sv', {'button-en':this.lang=='sv'},'lang-btn']">
        </button>
      </div> 
      <button 
        class="back-btn" 
        onclick="location.href='/';">
        {{ uiLabels.returnHome }}
      </button>
    </footer>
  </div>
</template>


<script>
import io from 'socket.io-client';
import QuestionComponent from '../components/QuestionComponent.vue';
import DominationTutorial from '../components/DominationTutorial.vue';
const socket = io(sessionStorage.getItem("serverIP"));


export default {
  name: 'LobbyView',
  data: function () {
    return {
      playerRole: "",
      pollId: "inactive poll",
      uiLabels: {},
      joined: false,
      lang: sessionStorage.getItem("lang") || "en",
      participants: [],
      waitingForPlayers: true
    }
  },
  components: {
    QuestionComponent,
    DominationTutorial
  },
  created: function () {
    this.pollId = this.$route.params.id;
    
    socket.on("playerRoleAssigned", (role) => {
      this.playerRole = role;
      sessionStorage.setItem("playerRole", role);
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
    
    socket.emit( "joinPoll", this.pollId ); //Emil: se CreateView, vi verkar kunna ta bort denna tack vare
                                            //uppdateringar i servern i particpateInPoll.
    socket.emit( "getUILabels", this.lang );
  },

  methods: {
    participateInPoll() {
      console.log("participateInPoll ", this.pollId, this.uiLabels.waitingForPlayer)
      socket.emit("participateInPoll", { pollId: this.pollId });
    },

    switchLanguage: function() {
      if (this.lang === "en") {
        this.lang = "sv"
      }
      else {
        this.lang = "en"
      }
      sessionStorage.setItem( "lang", this.lang );
      socket.emit( "getUILabels", this.lang );
    }
  }
}
</script>
