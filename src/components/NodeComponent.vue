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
  data: function () {
    return {
      disabled: true
    }; 
  },
  props: {
    questionId: Number
  },
  emits: ["questionId", "nodeStatusChanged"],

  methods: {
    handleClick: function () {
      this.emitQuestionId();

    },
    emitQuestionId: function () {
      this.$emit("questionId", this.questionId);
    },
  }
};
</script>

  