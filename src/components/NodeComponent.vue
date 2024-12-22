<template>
  <button 
    class="nodeButton" 
    :id="'node-' + questionId"
    :disabled="disabled" 
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
  emits:"questionId",

  methods: {
    emitQuestionId: function () {
      this.$emit("questionId", this.questionId);
    },
  }
};
</script>

  