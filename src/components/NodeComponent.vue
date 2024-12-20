<template>
  <button 
    class="nodeButton" 
    :id="'node-' + questionId" 
    v-on:click="handleClick">
  </button>
</template>

<script>
export default {
  name: 'NodeComponent',
  data: function () {
    return {
      nodeStatus: 3 /*0: not active, 
                      1: active for p1, 
                      2: active for p2, 
                      3: active for both, 
                      4: taken by 1, 
                      5: taken by 2, 
                      6: disabled. */
    };
  },
  props: {
    questionId: Number
  },
  emits: ["questionId", "nodeStatusChanged"],

  methods: {
    handleClick: function () {
      this.emitQuestionId();
      this.updateNodeStatus(0); // Set to 0 on click for now
      console.log(this.nodeStatus);
      
    },
    emitQuestionId: function () {
      this.$emit("questionId", this.questionId);
    },
    updateNodeStatus: function (newStatus) {
      this.nodeStatus = newStatus;
      this.$emit("nodeStatusChanged", {
        questionId: this.questionId,
        nodeStatus: this.nodeStatus
      });
    }
  }
};
</script>

  