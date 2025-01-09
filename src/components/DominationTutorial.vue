<template>
    <div class="form-grid">
        <div class="card">
            <div v-html="uiLabels.dominationText"></div>
        </div>
        <div class="card">
            <div><h3>{{ uiLabels.notClickable }}</h3></div>
            <div id="domination-tutorial">
                <NodeComponent :key="1" :questionId="1" @questionId="runQuestion" />
                <div>{{uiLabels.takenp1}}</div>
                <NodeComponent :key="2" :questionId="2" @questionId="runQuestion" />
                <div>{{uiLabels.takenp2}}</div>
                <NodeComponent :key="3" :questionId="3" @questionId="runQuestion" />
                <div>{{uiLabels.deadNode}}</div>
            </div>
        </div>
        <div class="card">
            <div><h3>{{uiLabels.clickable}}</h3></div>
            <div id="domination-tutorial">
                <NodeComponent :key="4" :questionId="4" @questionId="runQuestion" />
                <div>{{uiLabels.reachp1}}</div>
                <NodeComponent :key="5" :questionId="5" @questionId="runQuestion" />
                <div>{{uiLabels.reachp2}}</div>
                <NodeComponent :key="6" :questionId="6" @questionId="runQuestion" />
                <div>{{uiLabels.reachAll}}</div>
            </div>
        </div>

    </div>
</template>
  
<script>
import NodeComponent from './NodeComponent.vue';

  export default {
    name: "DominationTutorial",
    components: {
        NodeComponent
    },
    props: {
        uiLabels: Object
    },
    methods: {
      runQuestion(event) {
        console.log("Question triggered:", event);
      },
      createTutorial() {
        const nodes = {
          node1: document.getElementById("node-1"),
          node2: document.getElementById("node-2"),
          node3: document.getElementById("node-3"),
          node4: document.getElementById("node-4"),
          node5: document.getElementById("node-5"),
          node6: document.getElementById("node-6"),
        };
  
        if (nodes.node1) {
          nodes.node1.style.backgroundColor = "#32cd32";
        }
  
        if (nodes.node2) {
          nodes.node2.style.backgroundColor = "#ff8c00";
        }
  
        if (nodes.node3) {
          nodes.node3.style.backgroundColor = "#1e1e2f";
          nodes.node3.style.borderColor = "#1e1e2f";
        }
  
        if (nodes.node4) {
          nodes.node4.style.backgroundColor = "#9cca9cff";
          nodes.node4.disabled = false;
          nodes.node4.style.animation = "pulse 2s infinite";
        }
  
        if (nodes.node5) {
          nodes.node5.style.backgroundColor = "#ffc379ff";
          nodes.node5.disabled = false;
          nodes.node5.style.animation = "pulse 2s infinite";
        }
  
        if (nodes.node6) {
          nodes.node6.style.backgroundColor = "#f7ffa1ff";
          nodes.node6.disabled = false;
          nodes.node6.style.animation = "pulse 2s infinite";
        }
      },
    },
    mounted() {
      this.createTutorial();
    },
  };
</script>
  
  