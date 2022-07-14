import {createStore} from "vuex";

export default createStore({
   state: {
      Numbers: {},
      Strings: {},
      Operations: {},
      Statements: {},
   },
   mutations: {
      addNumber(state, number) {
         state.Numbers[number.id] = number.value;
      },
      deleteNumber(state, number) {
         delete state.Numbers[number.id];
      },
      addString(state, string) {
         state.Strings[string.id] = string.value;
      },
      deleteString(state, string) {
         delete state.Strings[string.id];
      },
      addOperation(state, operation) {
         state.Operations[operation.id] = operation.value;
      },
      deleteOperation(state, operation) {
         // state.Operations[operation.id] = null;
         delete state.Operations[operation.id];
         // console.log(state.Operations);
      },
      addStatement(state, statement) {
         state.Statements[statement] = statement;
      },
   },
   actions: {
      setNumberAction({commit}, number) {
         commit("addNumber", number);
      },
      deleteNumberAction({commit}, number) {
         commit("deleteNumber", number);
      },
      setStringAction({commit}, string) {
         commit("addString", string);
      },
      deleteStringAction({commit}, string) {
         commit("addString", string);
      },
      setOperationAction({commit}, operation) {
         commit("addOperation", operation);
      },
      deleteOperationAction({commit}, operation) {
         commit("deleteOperation", operation);
      },
      addStatementAction({commit}, statement) {
         commit("addStatement", statement);
      },
   },
   getters: {
      getNumbers: (state) => state.Numbers,
      getNumberbyId: (state) => (id) => state.Numbers[id],
      getStrings: (state) => state.Strings,
      getStringsbyId: (state) => (id) => state.Strings[id],
      getOperations: (state) => state.Operations,
      getStatements: (state) => state.Statements,
   },
   modules: {},
});
