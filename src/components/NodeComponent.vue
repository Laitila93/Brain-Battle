<template>
    <!-- Pass the questionId to the parent when the button is clicked -->
    <button v-on:click="emitQuestionId">
      o
    </button>
  </template>
  
  <script>
  export default {
    name: 'NodeComponent',
    props: {
      questionId: Number  // Accept questionId as a prop
    },
    emits: ["questionId"],  // Declare the event name to emit
    methods: {
      emitQuestionId: function () {
        // Emit the questionId to the parent component
        this.$emit("questionId", this.questionId);
      }
    }
  }
  </script>
  