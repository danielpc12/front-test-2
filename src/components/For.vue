<template>
    <div>
        <h4 class="text-2xl">For</h4>
       <span><a>Start</a></span>
        <input class="form-control" type="number" v-model="expr1"  @change="changeExpr"/>
        <span><a>Finish</a></span>
        <input class="form-control" type="number"  v-model="expr2" @change="changeExpr"/>
    </div>
</template>
 
<script>
/*eslint-disable */
import {h, getCurrentInstance, nextTick, render, readonly, ref, onMounted, shallowRef, onBeforeUnmount, onUpdated} from "vue";

export default {
    name: 'For',
    setup() {
        const expr1 = ref(0);
        const expr2 = ref(0);
        const nodeId = ref(0);

        let df = null;
        df = getCurrentInstance().appContext.config.globalProperties.$df.value;
        const changeExpr = (e) => {
           df.updateNodeDataFromId(nodeId.value,  {Start:expr1.value,Finish:expr2.value});
        };
        onMounted(() => {
         nodeId.value = df.nodeId;
      });
     return {expr1,expr2,changeExpr}
    }
}
</script>

<style>
    input{
        width: 100%;
    }
</style>