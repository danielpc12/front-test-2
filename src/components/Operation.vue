<template>
   <div>
      <h3 class="text-2xl">{{ title }}</h3>
      <input class="form-control" type="number" :value="operation?.Result" disabled />
      <span
         ><a>Number {{ operation?.Number1 }}</a></span
      >
      <br />
      <span
         ><a>Number {{ operation?.Number2 }}</a></span
      >
   </div>
</template>

<script>
/*eslint-disable */
import {getCurrentInstance, ref, onMounted, onUnmounted} from "vue";
import {useStore} from "vuex";
// import store from "./store";

export default {
   props: {
      title: String,
   },
   data() {
      return {
         store: useStore(),
         nodeId: getCurrentInstance().appContext.config.globalProperties.$df.value.nodeId,
      };
   },
   setup({title}) {
      const nodeId = ref(0);
      const number1 = ref(0);
      const number2 = ref(0);
      const result = ref(0);
      let df = null;
      const store = useStore();
      df = getCurrentInstance().appContext.config.globalProperties.$df.value;

      onMounted(() => {
         nodeId.value = df.nodeId;
      });


      return {nodeId, number1, number2, result};
   },
   computed: {
      operation() {
         return this.store.state.Operations[this.nodeId];
      },
   },
   watch: {
      "store.state.Operations": function () {
         console.log(this.store.state.Operations);
      },
   },
};
</script>

<style scoped></style>
