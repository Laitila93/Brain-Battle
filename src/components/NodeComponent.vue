<template>
    <button class="nodeButton" v-on:click="emitQuestionId">
      O
    </button>
</template>
  
  <script>
  export default {
    name: 'NodeComponent',
    props: {
      questionId: Number
    },
    emits: ["questionId"],
    methods: {
      emitQuestionId: function () {
        this.$emit("questionId", this.questionId);
      }
    }
  }
  </script>
  