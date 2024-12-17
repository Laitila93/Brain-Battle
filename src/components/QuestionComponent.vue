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
    question: Object
  },
  emits: ["answer"],
  methods: {
    answer: function (answer) {
      if (answer.c){
        this.$emit("answer", answer);
      }
    } 
  }
}
</script>