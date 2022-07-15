<template>
   <div>
      <h4>Number</h4>
      <input class="form-control" type="number" v-model="number" @change="updateNumber" placeholder="Ingresa un Numero" df-number required />
   </div>
</template>

<script>
/*eslint-disable */
import {h, getCurrentInstance, nextTick, render, readonly, ref, onMounted, shallowRef, onBeforeUnmount, onUpdated} from "vue";
import {useStore} from "vuex";

export default {
   name: "Number",
   data() {
      return {
         number: 0,
      };
   },
   setup() {
      const nodeId = ref(0);
      let df = null;
      const dataNode = ref({});
      const {dispatch} = useStore();

      df = getCurrentInstance().appContext.config.globalProperties.$df.value;

      const updateNumber = (e) => {
         if (Number.isNaN(parseInt(e.target.value))) {
            df.updateNodeDataFromId(nodeId.value, {Number: 0});
            dispatch("setNumberAction", {id: nodeId.value, value: 0});
         } else {
            df.updateNodeDataFromId(nodeId.value, {Number: parseInt(e.target.value)});
            dispatch("setNumberAction", {id: nodeId.value, value: parseInt(e.target.value)});
         }
      };

      onMounted(() => {
         nodeId.value = df.nodeId;
         setTimeout(() => {
            dataNode.value = df.getNodeFromId(nodeId.value);
         }, 0);
      });

      return {df, nodeId, dataNode, updateNumber};
   },
};
</script>

<style>
.Number {
   width: 100%;
}
</style>