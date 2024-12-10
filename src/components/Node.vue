<template>
</template>
    
<script>
    //frågorna ska ligga i Data, Enbart form och färg här. och metoder för att ändra på dem.
    
    export default {
      name: 'Node',
      data: function () {
        return {
            /*
            Värde 0 - 7, standard 0 är när noden inte är tagen, död eller nåbar
             0 = standdard
             1 = tagen av spelare 1
             2 = tagen av spelare 2
             3 = borttagen/död
             4 = nåbar för spelare 1
             5 = nåbar för spelare 2
             6 = nåbar för 1 och 2
             7 = låst (aktiv fråga)
            */
            nodeStatus: 0,
            nodecolor: "blue",
            
 
        }
    },
    methods: {

    }
}
</script>
    
    <!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>