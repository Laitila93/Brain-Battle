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
  emits: ["answer", "answered"],
  computed: {
    playerRoleShort() {
      // Transform "P1" -> "p1" and "P2" -> "p2"
      return this.playerRole === "P1" ? "p1" : 
             this.playerRole === "P2" ? "p2" : "";
    }
  },
  methods: {
    answer(answer) {
      this.$emit("answer", answer);
      this.$emit("answered"); // Emit an event to indicate the question has been answered
    },
  }
}
</script>