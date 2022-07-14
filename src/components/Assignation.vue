<template>
   <div>
      <h4 class="text-2xl">Assignation</h4>
      <br />
      <input class="form-control" type="text" placeholder="Nombre variable" @change="changeName" v-model="name"/>
   </div>
</template>

<script>
/*eslint-disable */
import {h, getCurrentInstance, nextTick, render, readonly, ref, onMounted, shallowRef, onBeforeUnmount, onUpdated} from "vue";
export default {
   name: "Assignation",
   setup(){
 const expr1 = ref(0);
        const name = ref('');
        const nodeId = ref(0);
        let df = null;
        const dataNode = ref(0);
        df = getCurrentInstance().appContext.config.globalProperties.$df.value;

        const changeName = (e) => {
           const dataNode = df.getNodeFromId(nodeId.value);
             df.updateNodeDataFromId(nodeId.value,  {Value: dataNode.data.value, Name: e.target.value});
        }

         onMounted(() => {
         nodeId.value = df.nodeId;
         setTimeout(() => {
            dataNode.value = df.getNodeFromId(nodeId.value);
         }, 0);
      });


        return {changeName,name, dataNode};
   }
   
};
</script>

<style>
input {
   width: 100%;
}
</style>
