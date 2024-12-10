<template>
    <button v-on:click="generateQuestion">
          generateQuestion
    </button>

</template>
    
<script>
    export default {
      name: 'Node',
      data: function () {
        return {
            question:{
                questionText: "",
                answers: [  {answerText: "", isCorrect: false},
                            {answerText: "", isCorrect: false},
                            {answerText: "", isCorrect: false},
                            {answerText: "", isCorrect: false}  ]
            } 
        }
    },
    methods: {
        //a skapas i createView och ska innehålla vald operator samt min och max
        generateQuestion: function() {
            let x = (Math.random() * (5 - 1) + 1);
            let y = (Math.random() * (5 - 1) + 1);
            this.questionText = (x, "*", y)
            console.log(this.questionText)
        }
    }

}
</script>
    
    <!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>