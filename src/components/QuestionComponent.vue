<template>
  <p>{{question.q}}</p>
  <button v-for="a in question.a" v-on:click="answer(a)" v-bind:key="a" >
    {{ a.a }}
    {{a.c}}
  </button>
</template>

<script>
export default {
  name: 'QuestionComponent',

  props: {
    question: Object,
  },
  emits: ["answer", "answered"],
  methods: {
    answer(answer) {
      this.$emit("answer", answer);
      this.$emit("answered"); // Emit an event to indicate the question has been answered
    },
  }
}
</script>