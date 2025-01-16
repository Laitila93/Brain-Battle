<template>
  <p>{{question.q}}</p>
  <button :class="'answer-btn-' + playerRoleShort"
   v-for="a in question.a" 
   v-on:click="answer(a)" 
   v-bind:key="a" >
    {{ a.a }}
  </button>
</template>

<script>
export default {
  name: 'QuestionComponent',
  data: function () {
    return {
      playerRole: sessionStorage.getItem("playerRole") || ""
    };
  },
  props: {
    question: Object,
  },
  emits: ["answer"],
  computed: {
    playerRoleShort() {
      // Transform "Player 1" -> "p1" and "Player 2" -> "p2"
      return this.playerRole === "Player 1" ? "p1" : 
             this.playerRole === "Player 2" ? "p2" : "";
    }
  },
  methods: {
    answer(answer) {
      this.$emit("answer", answer);
    },
  }
}
</script>