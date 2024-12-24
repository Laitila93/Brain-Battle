<template>
<p>{{question.q}}</p>
<button v-for="a in question.a" v-on:click="answer(a)" v-bind:key="a">
  {{ a.a }}
  {{ a.c }}

</button>
</template>
<script>
export default {
  name: 'QuestionComponent',
  props: {
    question: Object,
  },
  emits: ["answer"],
  methods: {
    answer: function (answer) {
      console.log('QUESTIONCOMP Answer submitted by user');
      console.log('QUESTIONCOMP Answer is; ', answer, 'type: ', typeof(answer));
      

      console.log('Answer was correct, emitting event to PollView');
      this.$emit("answer", answer);
    
    } 
  }
}
</script>