<template>
    <button 
        class="nodeButton" 
        :id="'node-' + questionId" 
        v-on:click="emitQuestionId">
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
  