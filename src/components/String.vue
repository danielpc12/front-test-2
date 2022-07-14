<template>
   <div ref="el">
      <h4>String</h4>
      {{ $store.getters.getNumberbyId(nodeId) }}
      <input class="form-control" type="textarea" v-model="message" @change="updateSelect" placeholder="Ingresa un texto" df-number required />
   </div>
</template>

<script>
/*eslint-disable */
import {h, getCurrentInstance, nextTick, render, readonly, ref, onMounted, shallowRef, onBeforeUnmount, onUpdated} from "vue";
import {useStore} from "vuex";

export default {
   name: "String",
   data() {
      return {
         string: "",
      };
   },

   setup() {
      const nodeId = ref(0);
      let df = null;
      const dataNode = ref({});
      const {dispatch} = useStore();

      df = getCurrentInstance().appContext.config.globalProperties.$df.value;

      const updateString = (e) => {

         df.updateNodeDataFromId(nodeId.value, {String: e.target.value});
         dispatch("setStringAction", {id: nodeId.value, value: e.target.value});
      
      };

      onMounted(() => {
         nodeId.value = df.nodeId;
         setTimeout(() => {
            dataNode.value = df.getNodeFromId(nodeId.value);
         }, 0);
      });

      return {df, nodeId, dataNode, updateString};
   },
};
</script>

<style>
.Number {
   width: 100%;
}
</style>