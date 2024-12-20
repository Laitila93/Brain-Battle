<template>
    <button 
        class="nodeButton" 
        :id="'node-' + questionId"
        :disabled="questionId === 2" 
        v-on:click="emitQuestionId">
    </button>
</template>
  
  <script>
  export default {
    name: 'NodeComponent',
    data: function () {
      return {
        nodeStatus: 0 //0: active for both, 1: active for p1, 2: active for p2, 3: taken by p1, 4: taken by p2, 5: not active, 6: disabled.
      }
    },
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
  