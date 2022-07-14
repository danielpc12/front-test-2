
<template>
    <div>
        <h2 class="text-2xl">If-Else</h2>
        <span class="text-lg"><a>Condition</a></span>

        <input  class="form-control" type="number" v-model="expr1" disabled/>


        <select class="form-select mt-3" aria-label="Default select example" v-model="operator" @change="changeExpr">
        <option selected style="text-align: center;" value="<"> <h1>  &lt; </h1> </option>
        <option style="text-align: center;" value=">"> <h1> > </h1> </option>
        <option style="text-align: center;" value="=="> <h1>==</h1> </option>
        <option style="text-align: center;" value="!="> <h1>!=</h1> </option>
        <option style="text-align: center;" value=">="> <h1>>=</h1> </option>
        <option style="text-align: center;" value="<="> <h1> &lt;= </h1> </option>
      

        </select>
        <input  class="form-control mt-3" type="number" v-model="expr2" disabled/>
        <span class="text-lg"><a>Result</a></span>
        <input  class="form-control mt-3" type="message" v-model="result" disabled/>
    </div>
</template>

<script>
/*eslint-disable */
import {h, getCurrentInstance, nextTick, render, readonly, ref, onMounted, shallowRef, onBeforeUnmount, onUpdated} from "vue";

export default {
    name: 'If',
    setup() {
        const expr1 = ref(0);
        const expr2 = ref(0);
        const operator = ref('');
        const nodeId = ref(0);
        const result = ref('');
        let df = null;
        const dataNode = ref(0);
        df = getCurrentInstance().appContext.config.globalProperties.$df.value;

        const changeExpr = (e) => {
            const dataNode = df.getNodeFromId(nodeId.value);
             df.updateNodeDataFromId(nodeId.value,  {Expression1:dataNode.data.Expression1, Operator:e.target.value, Expression2:dataNode.data.Expression2, Result: dataNode.data.Result});
        }


    onMounted(() => {
         nodeId.value = df.nodeId;
         setTimeout(() => {
            dataNode.value = df.getNodeFromId(nodeId.value);
         }, 0);
      });


        return {changeExpr,expr1,expr2,operator, result, dataNode};
    }
}
</script>
