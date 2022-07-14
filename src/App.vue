<template>
   <div id="app" onload="getAllFiles">
      
      <!--Layout app-->
      <div class="container" style="height: 1000px; max-width: 100%; max-height: 100%; background: white">
         <div class="row">
            <div class="col-md-6 mx-auto" style="width: 10%; left: 0%; padding-right: 0px; padding-left: 0px; max-height: 100%;">

               <!--Visualizacion de la lista de nodos-->

               <ul class="list-group" style="padding-left: 0px; ">
                  
                  <li class="list-group-item list-group-item-action rgba-red-strong drag-drawflow" v-for="n in listNodes" :key="n" draggable="true" :data-node="n.item" @dragstart="drag($event)" style="-webkit-transition-duration: 0.2s;
                     -webkit-transition-timing-function: linear; box-shadow:5px 0 0 #31708f  inset; box-shadow: 1px 1px 0px #ccc; padding-top: 1%; padding-bottom: 1%">
                     <div class="node" :style="`background: ${n.color};`">{{ n.name }}</div>
                  </li>                  
               </ul>
            </div>

            <!--Espacio de trabajo-->

            <div class="col-md-6 mx-auto" style="padding-top: 10px; height: 100vh; min-height: 492px; width: 90%; padding-right: 0px; padding-left: 0px;">
               <div id="drawflow" @drop="drop($event)" @dragover="allowDrop($event)">
                  <button  type="button" class="btn btn-warning" @click="saveFile" style="max-height: 5%; min-width: 5%; margin-left: 90%; margin-top: 1%" >Save</button>
               </div>

                  <!--Boton para abrir modal de python-->
                  
               <li class="list-group">
                  <button v-on:click="generatePythonCode($event)" type="button" class="btn btn-primary"  @click="toggleModal">Menu</button>
               </li>
            </div>
         </div>
      </div>

         <!--Menu modal de creacion codigo python-->

       <div>
            <div  ref="modal" class="modal" :class="{show, 'd-block': active}" tabindex="-1"  role="dialog"  >
               <div class="modal-dialog" role="document">
               <div class="modal-content " style="width:900px">
                  <div class="modal-header">
                     <h5 class="modal-title">Program Section</h5>
                     <button
                     type="button"
                     class="close"
                     data-dismiss="modal"
                     aria-label="Close"
                     @click="toggleModal"
                     >
                     <span aria-hidden="true">&times;</span>
                     </button>
                  </div>
                  <div class="modal-body">


                  <code-highlight language="python">
                     <code>
                        <p style="color:white;"> {{codeGenerator}} </p>
                     </code>

                     </code-highlight>
                     <!-- Display a output like as a code -->
                <code-highlight language="python">
                     <code>
                        <p style="color:white;">{{resultCode}} </p>
                     </code>
                </code-highlight>




                <button  type="button" class="btn btn-primary" @click="newWorkspace">New Program</button> &nbsp;
                <button  type="button" class="btn btn-primary" @click="runCode">Run Program</button> &nbsp;
                <button  type="button" class="btn btn-primary" @click="getAllFiles">List Programs</button> &nbsp;


                  <select class="form-select mt-3" @change="loadNodes($event)">
                  <option>Select here</option>
                  <option v-for="(item, index) in directory" :key="index" >{{ item.uid }}</option>
                  </select>

                  </div>
               </div>
               </div>
            </div>
            <div v-if="active" class="modal-backdrop fade show"></div>
         </div>



   </div>
</template>


<script>
/*eslint-disable */
import CodeHighlight from "vue-code-highlight/src/CodeHighlight.vue";
import "vue-code-highlight/themes/duotone-sea.css";
import "vue-code-highlight/themes/window.css";
import Swal from 'sweetalert2'
import {h, getCurrentInstance, render, readonly, ref, onMounted, shallowRef, onUpdated} from "vue";
import Drawflow from "drawflow";
import {useStore} from "vuex";
import styleDrawflow from "drawflow/dist/drawflow.min.css"; // eslint-disable-line no-use-before-define
import Number from "./components/Number.vue";
import String from "./components/String.vue";
import Operation from "./components/Operation.vue";
import Assignation from "./components/Assignation.vue";
import For from "./components/For.vue";
import If from "./components/If.vue";
import Else from "./components/Else.vue";
import Print from "./components/Print.vue";

export default {
   name: "App",
   components:{
      CodeHighlight,
   },
   setup() {
      const listNodes = readonly([
         {
            name: "Number",
            item: "Number",
            input: 0,
            output: 1,
         },
         {
            name: "String",
            item: "String",
            input: 0,
            output: 1,
         },
         {
            name: "Add",
            item: "Add",
            input: 2,
            output: 1,
         },
         {
            name: "Sub",
            item: "Sub",
            input: 2,
            output: 1,
         },
         {
            name: "Multiply",
            item: "Multiply",
            input: 2,
            output: 1,
         },
         {
            name: "Divide",
            item: "Divide",
            input: 2,
            output: 1,
         },
         {
            name: "Assignation",
            item: "Assignation",
            input: 1,
            output: 1,
         },
         {
            name: "For",
            item: "For",
            input: 1,
            output: 1,
         },
         {
            name: "If",
            item: "If",
            input: 2,
            output: 2,
         },
         {
            name: "Else",
            item: "Else",
            input: 1,
            output: 1,
         },
         {
            name: "Print",
            item: "Print",
            input: 1,
            output: 1,
         },
      ]);

      const codeGenerator = ref("");
      const resultCode = ref("");
      const directory = ref({});
      const active = ref(false);
      const show = ref(false);
      const editor = shallowRef({});
      const dialogVisible = ref(false);
      const dialogData = ref({});
      const internalInstance = getCurrentInstance();
      internalInstance.appContext.app._context.config.globalProperties.$df = editor;
      const Vue = {version: 3, h, render};
      const {state, dispatch} = useStore();

     const toggleModal = () => {
      resultCode.value = "";
      const body = document.querySelector("body");
      active.value = !active.value;
      active.value
        ? body.classList.add("modal-open")
        : body.classList.remove("modal-open");
      setTimeout(() => (show.value = !show.value), 10);
    }

      const drag = (ev) => {
         if (ev.type === "touchstart") {
            mobile_item_selec = ev.target.closest(".drag-drawflow").getAttribute("data-node");
         } else {
            ev.dataTransfer.setData("node", ev.target.getAttribute("data-node"));
         }
      };

      const drop = (ev) => {
         if (ev.type === "touchend") {
            var parentdrawflow = document.elementFromPoint(mobile_last_move.touches[0].clientX, mobile_last_move.touches[0].clientY).closest("#drawflow");
            if (parentdrawflow != null) {
               addNodeToDrawFlow(mobile_item_selec, mobile_last_move.touches[0].clientX, mobile_last_move.touches[0].clientY);
            }
            mobile_item_selec = "";
         } else {
            ev.preventDefault();
            var data = ev.dataTransfer.getData("node");
            addNodeToDrawFlow(data, ev.clientX, ev.clientY);
         }
      };
      const allowDrop = (ev) => {
         ev.preventDefault();
      };
      let mobile_item_selec = '';
      let mobile_last_move = null;

      function positionMobile(ev) {
      mobile_last_move = ev;
      }

      const addNodeToDrawFlow = (name, pos_x, pos_y) => {
         pos_x =
            pos_x * (editor.value.precanvas.clientWidth / (editor.value.precanvas.clientWidth * editor.value.zoom)) -
            editor.value.precanvas.getBoundingClientRect().x * (editor.value.precanvas.clientWidth / (editor.value.precanvas.clientWidth * editor.value.zoom));
         pos_y =
            pos_y * (editor.value.precanvas.clientHeight / (editor.value.precanvas.clientHeight * editor.value.zoom)) -
            editor.value.precanvas.getBoundingClientRect().y * (editor.value.precanvas.clientHeight / (editor.value.precanvas.clientHeight * editor.value.zoom));

         const nodeSelected = listNodes.find((ele) => ele.item == name);
         assignDefaultValues(nodeSelected, name, pos_x, pos_y);
      };

      const assignDefaultValues = (nodeSelected, name, pos_x, pos_y) => {
         if (nodeSelected.name == "Add" || nodeSelected.name == "Sub" || nodeSelected.name == "Multiply" || nodeSelected.name == "Divide") {
            editor.value.addNode(name, nodeSelected.input, nodeSelected.output, pos_x, pos_y, name, {Number1: 0, Number2: 0, Result: 0}, name, "vue");
         } else if (nodeSelected.name == "Number") {
            editor.value.addNode(name, nodeSelected.input, nodeSelected.output, pos_x, pos_y, name, {Number: 0}, name, "vue");
         } else if (nodeSelected.name == "String") {
            editor.value.addNode(name, nodeSelected.input, nodeSelected.output, pos_x, pos_y, name, {String: ""}, name, "vue");
         } else if(nodeSelected.name == "For"){
            editor.value.addNode(name, nodeSelected.input, nodeSelected.output, pos_x, pos_y, name, {Start:0,Finish:0}, name, "vue");
         }else if(nodeSelected.name == "If"){
            editor.value.addNode(name, nodeSelected.input, nodeSelected.output, pos_x, pos_y, name, {Expression1:0, Operator:'', Expression2:0, Result: 'True'}, name, "vue");
         }else if(nodeSelected.name == "Else"){
            editor.value.addNode(name, nodeSelected.input, nodeSelected.output, pos_x, pos_y, name, {}, name, "vue");
         }else if(nodeSelected.name == "Print"){
            editor.value.addNode(name, nodeSelected.input, nodeSelected.output, pos_x, pos_y, name, {}, name, "vue");
         }else if(nodeSelected.name == "Assignation"){
            editor.value.addNode(name, nodeSelected.input, nodeSelected.output, pos_x, pos_y, name, {Value:0,Name:""}, name, "vue");
         }
      };

      const assignValues = (data) => {
         const input = editor.value.getNodeFromId(data.input_id);
         const output = editor.value.getNodeFromId(data.output_id);
         if ((input.class == "Add" || input.class == "Sub" || input.class == "Multiply" || input.class == "Divide") && (output.class == "Add" || output.class == "Sub" || output.class == "Multiply" || output.class == "Divide")) {
            if (data.input_class == "input_1") {
               const result = evaluateExpressions(input.class, parseInt(output.data.Result), parseInt(input.data.Number2));
               const object = {Number1: parseInt(output.data.Result), Number2: parseInt(input.data.Number2), Result: result};
               editor.value.updateNodeDataFromId(data.input_id, object);
               dispatch("setOperationAction", {id: data.input_id, value: object});
            } else if (data.input_class == "input_2") {
               const result = evaluateExpressions(input.class, parseInt(input.data.Number1), parseInt(output.data.Result));
               const object = {Number1: parseInt(input.data.Number1), Number2: parseInt(output.data.Result), Result: result};
               editor.value.updateNodeDataFromId(data.input_id, object);
               dispatch("setOperationAction", {id: data.input_id, value: object});
            }

            //console.log("Operaciones arimeticas validas");
         } else if ((input.class == "Add" || input.class == "Sub" || input.class == "Multiply" || input.class == "Divide") && (output.class == "Assignation")) {
            if (data.input_class == "input_1") {
               console.log(output)
               const result = evaluateExpressions(input.class, output.data.Value);
               const object = {Number1: output.data.Value, Number2: parseInt(input.data.Number2), Result: result};
               editor.value.updateNodeDataFromId(data.input_id, object);
               dispatch("setOperationAction", {id: data.input_id, value: object});
            } else if (data.input_class == "input_2") {
               console.log(output)
               const result = evaluateExpressions(input.class, parseInt(input.data.Number1), parseInt(output.data.Value));
               const object = {Number1: parseInt(input.data.Number1), Number2: parseInt(output.data.Value), Result: result};
               editor.value.updateNodeDataFromId(data.input_id, object);
               dispatch("setOperationAction", {id: data.input_id, value: object});
            }

         }else if ((input.class == "Add" || input.class == "Sub" || input.class == "Multiply" || input.class == "Divide") && (output.class == "If")) {
            if (data.input_class == "input_1") {
               const result = evaluateExpressions(input.class, output.data.Expression1);
               const object = {Number1: output.data.Expression1, Number2: parseInt(input.data.Number2), Result: result};
               editor.value.updateNodeDataFromId(data.input_id, object);
               dispatch("setOperationAction", {id: data.input_id, value: object});
            } else if (data.input_class == "input_2") {
               console.log(output)
               const result = evaluateExpressions(input.class, parseInt(input.data.Number1), parseInt(output.data.Expression1));
               const object = {Number1: parseInt(input.data.Number1), Number2: parseInt(output.data.Expression1), Result: result};
               editor.value.updateNodeDataFromId(data.input_id, object);
               dispatch("setOperationAction", {id: data.input_id, value: object});
            }

         }else if ((input.class == "If") && (output.class == "Add" || output.class == "Sub" || output.class == "Multiply" || output.class == "Divide")) {
            if (data.input_class == "input_1") {
               const result = evaluateExpressions(input.class, parseInt(output.data.Result), parseInt(input.data.Expression2), input.data.Operator);
               const object = {Expression1: output.data.Result, Operator: input.data.Operator, Expression2: parseInt(input.data.Expression2), Result: result};
               editor.value.updateNodeDataFromId(data.input_id, object);

            } else if (data.input_class == "input_2") {
               const result = evaluateExpressions(input.class, parseInt(input.data.Expression1), parseInt(output.data.Result), input.data.Operator);
               const object = {Expression1: input.data.Expression1, Operator: input.data.Operator, Expression2: parseInt(output.data.Result), Result: result};
               editor.value.updateNodeDataFromId(data.input_id, object);
            }

         }else{
           // console.log(data)
           if(output.class == "For" || output.class == "Else"){
              return;
           }
            if(input.class == "Assignation" && (output.class == "Add" || output.class == "Sub" || output.class =="Multiply" || output.class == "Divide")){
              editor.value.updateNodeDataFromId(input.id,{Value: output.data.Result, Name: input.data.Name});

            } else if(input.class == "Assignation" && (output.class == "Number")){
              editor.value.updateNodeDataFromId(input.id,{Value: output.data.Number, Name: input.data.Name});

            }else if(input.class == "Assignation" && (output.class == "String")){
              editor.value.updateNodeDataFromId(input.id,{Value: output.data.number, Name: input.data.Name});

            }else if(input.class == "Assignation" && (output.class == "If")){
              editor.value.updateNodeDataFromId(input.id,{Value: output.data.Expression1, Name: input.data.Name});

            }else if (data.input_class == "input_1" && input.class !="For"&& input.class !="Else"&& input.class !="Print") {
               console.log('Entre')
               const result = evaluateExpressions(input.class, parseInt(output.data.Number), parseInt(input.data.Number2));
               const object = {Number1: parseInt(output.data.Number), Number2: parseInt(input.data.Number2), Result: result};
               editor.value.updateNodeDataFromId(data.input_id, object);
               dispatch("setOperationAction", {id: data.input_id, value: object});
            } else if (data.input_class == "input_2" && input.class !="If"&& input.class !="For"&& input.class !="Else"&& input.class !="Print") {
               const result = evaluateExpressions(input.class, parseInt(input.data.Number1), parseInt(output.data.Number));
               const object = {Number1: parseInt(input.data.Number1), Number2: parseInt(output.data.Number), Result: result};
               editor.value.updateNodeDataFromId(data.input_id, object);
               dispatch("setOperationAction", {id: data.input_id, value: object});
            } 
            
         }
      };

      const updateValues = (id) => {
         const input = editor.value.getNodeFromId(id);
         
         const {
            outputs: {
               output_1: {connections},
            },
         } = input;
            console.log("input")
            console.log(input.class)
         if (connections.length == 1 && input.class == "Number") {
            const {node, output} = connections[0];
            const expression = editor.value.getNodeFromId(node);
            console.log("input")
            console.log(input) //Saca el nodo que le entra
            console.log("actual")
            console.log(expression.class) //Saca el nodo que le entra
            
            if(expression.class == "Add"|| expression.class == "Sub"|| expression.class == "Multiply"|| expression.class == "Divide"){
               if (output == "input_1") {
                  const result = evaluateExpressions(expression.class, parseInt(input.data.number), parseInt(expression.data.Number2));
                  const object = {Number1: parseInt(input.data.number), Number2: parseInt(expression.data.Number2), Result: result};
                  editor.value.updateNodeDataFromId(node, object);
                  dispatch("setOperationAction", {id: node, value: object});

                  updateNodes(node);
               } else if (output == "input_2") {
                  const result = evaluateExpressions(expression.class, parseInt(expression.data.Number1), parseInt(input.data.number));
                  const object = {Number1: parseInt(expression.data.Number1), Number2: parseInt(input.data.number), Result: result};
                  editor.value.updateNodeDataFromId(node, object);
                  dispatch("setOperationAction", {id: node, value: object});
                  updateNodes(node);
               }
            } else if (expression.class == "Assignation"){
               const object = {Name: expression.data.Name, Value: parseInt(input.data.number)};
               editor.value.updateNodeDataFromId(node, object);
               
               if (expression.outputs.output_1.connections.length > 0){
                  console.log("if length")
                  const assignOutput = expression.outputs.output_1.connections[0].output
                  const inputOperation = editor.value.getNodeFromId(expression.outputs.output_1.connections[0].node);
                  const operationId = inputOperation.id;
                  if(inputOperation.class == "Add"|| inputOperation.class == "Sub"|| inputOperation.class == "Multiply"|| inputOperation.class == "Divide"){
                     if (assignOutput == "input_1") {
                        const inputValue1 = editor.value.getNodeFromId(inputOperation.inputs.input_1.connections[0].node)
                        const result = evaluateExpressions(inputOperation.class, parseInt(inputValue1.data.Value), parseInt(inputOperation.data.Number2));
                        const object = {Number1: parseInt(inputValue1.data.Value), Number2: parseInt(inputOperation.data.Number2), Result: result};
                        editor.value.updateNodeDataFromId(operationId, object);
                        dispatch("setOperationAction", {id: operationId, value: object});
                        updateNodes(operationId);
                     } else if (assignOutput == "input_2") {
                        const inputValue2 = editor.value.getNodeFromId(inputOperation.inputs.input_2.connections[0].node)
                        const result = evaluateExpressions(inputOperation.class, parseInt(inputOperation.data.Number1), parseInt(inputValue2.data.Value));
                        const object = {Number1: parseInt(inputOperation.data.Number1), Number2: parseInt(inputValue2.data.Value), Result: result};
                        editor.value.updateNodeDataFromId(operationId, object);
                        dispatch("setOperationAction", {id: operationId, value: object});
                        updateNodes(operationId);
                     }
                  } else if(inputOperation.class == "If"){
                        if (assignOutput == "input_1") {
                           const inputValue1 = editor.value.getNodeFromId(inputOperation.inputs.input_1.connections[0].node)
                           const result = evaluateExpressions(inputOperation.class, parseInt(inputValue1.data.Value), parseInt(inputOperation.data.Expression2));
                           const object = {Expression1: parseInt(inputValue1.data.Value), Operator: inputOperation.data.Operator, Expression2: parseInt(inputOperation.data.Expression2), Result: result};
                           editor.value.updateNodeDataFromId(operationId, object);
                        } else if (assignOutput == "input_2") {
                           const inputValue2 = editor.value.getNodeFromId(inputOperation.inputs.input_2.connections[0].node)
                           const result = evaluateExpressions(inputOperation.class, parseInt(inputOperation.data.Expression1), parseInt(inputValue2.data.Value));
                           const object = {Expression1: parseInt(inputOperation.data.Expression1), Operator: inputOperation.data.Operator, Expression2: parseInt(inputValue2.data.Value), Result: result};
                           editor.value.updateNodeDataFromId(operationId, object);
                        }
                     }
               }
               
            } else if (expression.class == "If"){
               if(output == "input_1"){
                  const result = evaluateExpressions(expression.class, parseInt(input.data.number), parseInt(expression.data.Expression2), expression.data.Operator);
                  const object = {Expression1: parseInt(input.data.number), Operator: expression.data.Operator, Expression2: parseInt(expression.data.Expression2), Result: result};
                  editor.value.updateNodeDataFromId(node, object);

                  if (expression.outputs.output_1.connections.length > 0){
                     console.log("if length")
                     const assignOutput = expression.outputs.output_1.connections[0].output
                     const inputOperation = editor.value.getNodeFromId(expression.outputs.output_1.connections[0].node);
                     const operationId = inputOperation.id;
                     
                     if (assignOutput == "input_1") {
                        const inputValue1 = editor.value.getNodeFromId(inputOperation.inputs.input_1.connections[0].node)
                        const result = evaluateExpressions(inputOperation.class, parseInt(inputValue1.data.Expression1), parseInt(inputOperation.data.Number2));
                        const object = {Number1: parseInt(inputValue1.data.Expression1), Number2: parseInt(inputOperation.data.Number2), Result: result};
                        editor.value.updateNodeDataFromId(operationId, object);
                        dispatch("setOperationAction", {id: operationId, value: object});
                        updateNodes(operationId);
                     } else if (assignOutput == "input_2") {
                        const inputValue2 = editor.value.getNodeFromId(inputOperation.inputs.input_2.connections[0].node)
                        const result = evaluateExpressions(inputOperation.class, parseInt(inputOperation.data.Number1), parseInt(inputValue2.data.Expression1));
                        const object = {Number1: parseInt(inputOperation.data.Number1), Number2: parseInt(inputValue2.data.Expression1), Result: result};
                        editor.value.updateNodeDataFromId(operationId, object);
                        dispatch("setOperationAction", {id: operationId, value: object});
                        updateNodes(operationId);
                     }
                  }
               } else if(output == "input_2"){
                  const result = evaluateExpressions(expression.class, parseInt(expression.data.Expression1), parseInt(input.data.number), expression.data.Operator);
                  const object = {Expression1: parseInt(expression.data.Expression1), Operator: expression.data.Operator, Expression2: parseInt(input.data.number), Result: result};
                  editor.value.updateNodeDataFromId(node, object);
               }
            }

         }
      };

      const updateNodes = (id) => {
         let actualizar = id;
         while (true) {
            const to = editor.value.getNodeFromId(actualizar);
            const {
               outputs: {
                  output_1: {connections},
               },
            } = to;
            if (connections.length == 1) {
               const {node, output} = connections[0];
               const expression = editor.value.getNodeFromId(node);
                  if(expression.class == "Assignation"){
                   editor.value.updateNodeDataFromId(expression.id,{Value: to.data.Result, Name: expression.data.Name});
                   break;
                  }

               if (output == "input_1") {
                  const result = evaluateExpressions(expression.class, parseInt(to.data.Result), parseInt(expression.data.Number2));
                  const object = {Number1: parseInt(to.data.Result), Number2: parseInt(expression.data.Number2), Result: result};
                  editor.value.updateNodeDataFromId(node, object);
                  dispatch("setOperationAction", {id: node, value: object});
                  actualizar = node;
               } else if (output == "input_2") {
                  const result = evaluateExpressions(expression.class, parseInt(expression.data.Number1), parseInt(to.data.Result));
                  const object = {Number1: parseInt(expression.data.Number1), Number2: parseInt(to.data.Result), Result: result};
                  editor.value.updateNodeDataFromId(node, object);
                  dispatch("setOperationAction", {id: node, value: object});
                  actualizar = node;
               }
            } else {
               break;
            }
         }
      };

      const evaluateExpressions = (expressionType, number1, number2, operator) => {
         number1 = isNaN(number1) ? 0 : number1;
         number2 = isNaN(number2) ? 0 : number2;
         let result = 0;
         if (expressionType == "Add" || expressionType == "Sub" || expressionType == "Multiply" || expressionType == "Divide"){
            if (expressionType == "Add") {
               result = number1 + number2;
            } else if (expressionType == "Sub") {
               result = number1 - number2;
            } else if (expressionType == "Multiply") {
               result = number1 * number2;
            } else if (expressionType == "Divide") {
               result = number1 / number2;
            }
            if (isNaN(result)) {
               result = 0;
            }
         } else if (expressionType == "If"){
            if (operator == "<") {
               if(number1 < number2){
                  result = "True"
               } else{
                  result = "False"
               }
            } if (operator == ">") {
               if(number1 > number2){
                  result = "True"
               }else{
                  result = "False"
               }
            }if (operator == "!=") {
               if(number1 != number2){
                  result = "True"
               }else{
                  result = "False"
               }
            }if (operator == "==") {
               if(number1 == number2){
                  result = "True"
               }else{
                  result = "False"
               }
            }if (operator == "<=") {
               if(number1 <= number2){
                  result = "True"
               }else{
                  result = "False"
               }
            }if (operator == ">=") {
               if(number1 >= number2){
                  result = "True"
               }else{
                  result = "False"
               }
            }
         }
         
         return result;
      };

      onMounted(() => {

         var elements = document.getElementsByClassName('drag-drawflow');

         for (var i = 0; i < elements.length; i++) {

            elements[i].addEventListener('touchend', drop, false);
            elements[i].addEventListener('touchmove', positionMobile, false);
            elements[i].addEventListener('touchstart', drag, false );
         }

         var id = document.getElementById("drawflow");
         
         editor.value = new Drawflow(id, Vue, internalInstance.appContext.app._context);
         editor.value.start();
         

         editor.value.on("nodeCreated", (id) => {
            const typeNode = editor.value.getNodeFromId(id).class;
            if (typeNode == "Number") {
               dispatch("setNumberAction", {id: id, value: 0});
            } else if (typeNode == "String") {
               dispatch("setStringAction", {id: id, value: ""});
            }else if (typeNode == "Add" || typeNode == "Sub" || typeNode == "Multiply" || typeNode == "Divide") {
               dispatch("setOperationAction", {id: id, value: {Number1: 0, Number2: 0, Result: 0}});
            }
         });

         editor.value.on("nodeRemoved", (id) => {
            dispatch("deleteOperationAction", {id: id});
            dispatch("deleteNumberAction", {id: id});
            dispatch("deleteStringAction", {id: id});
         });

         editor.value.on("nodeDataChanged", (dataNode) => {
            updateValues(dataNode);
         });

         editor.value.on("connectionCreated", (dataNode) => {
            assignValues(dataNode);//Finish
         });

         editor.value.on("connectionRemoved", (dataNode) => {
            //console.log("connectionRemoved");
            removeValues(dataNode);
            
         });

         editor.value.registerNode("Number", <Number />, {}, {});
         editor.value.registerNode("String", <String />, {}, {});
         editor.value.registerNode("Add", <Operation title="Add" />, {}, {});
         editor.value.registerNode("Sub", <Operation title="Sub" />, {}, {});
         editor.value.registerNode("Multiply", <Operation title="Multiply" />, {}, {});
         editor.value.registerNode("Divide", <Operation title="Divide" />, {}, {});
         editor.value.registerNode("Assignation", <Assignation />, {}, {});
         editor.value.registerNode("For", <For />, {}, {});
         editor.value.registerNode("If", <If />, {}, {});
         editor.value.registerNode("Else", <Else />, {}, {});
         editor.value.registerNode("Print", <Print />, {}, {});
         
      });

      const removeValues = (data) => {
         const input = editor.value.getNodeFromId(data.input_id);
         if (data.input_class == "input_1") {
            const result = evaluateExpressions(input.class, 0, parseInt(input.data.Number2));
            const object = {Number1: 0, Number2: parseInt(input.data.Number2), Result: result};
            editor.value.updateNodeDataFromId(data.input_id, object);
            dispatch("setOperationAction", {id: data.input_id, value: object});
            updateNodes(data.input_id);
         } else if (data.input_class == "input_2") {
            const result = evaluateExpressions(input.class, parseInt(input.data.Number1), 0);
            const object = {Number1: parseInt(input.data.Number1), Number2: 0, Result: result};
            editor.value.updateNodeDataFromId(data.input_id, object);
            dispatch("setOperationAction", {id: data.input_id, value: object});
            updateNodes(data.input_id);
         }
      };

      const getParentsNodes =(exportdata) =>{
         const dataNodes = exportdata.drawflow.Home.data;
         const array = Object.values(dataNodes);
         const isRoot = ({inputs,name}) => {
               if(name == "Assignation"){
                  if (inputs.input_1.connections.length == 1) {
                     return true;
                  }
               }
               if (inputs.hasOwnProperty('input_1') && (name == "For" || name == "If" )) {
                  if (inputs.input_1.connections.length == 0) {
                     return true;
                  }
               } 
               return false;
         };
         
         return array.filter((node) => isRoot(node,node.class)=== true && node.class !== "Number" && node.class !== "String" && node.class !== "Add" && node.class !== "Sub" && node.class !== "Multiply" && node.class !== "Divide" && node.class !=="Print");
      }
      const codex = (array) =>{
         let code = "";
         let i = 0;
         while(array.length > 0){
            let flag = false;
          const node = array.shift();
          //console.log(node);
            let tabs = "";
            if(node.name == "For"){
                tabs = "\t";
               code += "for i "+ "in" + " range(" + node.data.Start + "," + node.data.Finish + "):\n";
            }else if(node.name == "If"){
               code += "if "+ node.data.Expression1 +" "+  node.data.Operator+" " + node.data.Expression2 + ":\n";
               tabs = "\t";
            }else if(node.name == "Assignation"){
               console.log(node.data)
               code += node.data.Name + " = " + node.data.Value + "\n";
               tabs = "";
            }
            let ifTabs = "";
            if(node.outputs.output_1.connections.length == 1){
               let nodeId = node.outputs.output_1.connections[0].node;
               let tmp = 0;
              while(true){
                  let nodeActual =  editor.value.getNodeFromId(nodeId);
                  console.log(nodeActual);
               if(nodeActual.name == "For"){
                  code += tabs+"for i "+ "in" + " range(" + nodeActual.data.Start + "," + nodeActual.data.Finish + "):\n";
               }else if(nodeActual.name == "If"){
                  code += tabs+"if "+ nodeActual.data.Expression1 +" "+  nodeActual.data.Operator+" " + nodeActual.data.Expression2 + ":\n";
                  ifTabs = tabs;
               }else if(nodeActual.name == "Assignation"){
                  code += tabs+nodeActual.data.Name + " = " + nodeActual.data.Value + "\n";
               }else if(nodeActual.name =="Else"){
                  code += ifTabs+"else:"+"\n";
               }else if(nodeActual.name == "Print"){
                 const valor  = editor.value.getNodeFromId(nodeActual.inputs.input_1.connections[0].node); 
                 code += tabs+"print("+valor.data.Name+")"+"\n";
               }
                 if(nodeActual.outputs.output_1.connections.length == 1){
                        if(nodeActual.name == "For" || nodeActual.name =="If" ){
                        tabs +="\t";
                        }else{
                           tabs += "";
                        }
                        nodeId = nodeActual.outputs.output_1.connections[0].node;

                       
                  } else if(nodeActual.outputs.output_1.connections.length == 2){
                     if(nodeActual.name =="If"){
                        flag = true;
                        nodeId = nodeActual.outputs.output_1.connections[0].node;
                        tmp = nodeActual.outputs.output_1.connections[1].node;
                        tabs += "\t";
                     }
                    
                  } else{
                     if(flag){
                        nodeId = tmp
                        flag = false;
                     }else{
                        break;
                     }
                  }
            }
            }
          
            }
            codeGenerator.value = code
        // console.log(code);

      }
      const generatePythonCode = (e) => {
         var exportdata = editor.value.export();
         const dataNodes = exportdata.drawflow.Home.data;
         const array = Object.values(dataNodes);

         const parentsArray = getParentsNodes(exportdata);
         const code = codex(parentsArray);

         const lola = JSON.stringify(editor.value.export())
         console.log(dataNodes);
       
         //const statements = 

        //console.log("Datas",exportdata);
      };

      //request to api to get the data with axios
      const  saveFile=async()=>{
           const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Code: [codeGenerator.value], flow: JSON.stringify(editor.value.export())})
         };
         console.log(requestOptions.body)
         //console.log(requestOptions.body)
         await fetch("http://localhost:9000/insertCode",requestOptions)
         Swal.fire({
            position: 'center',
            icon: 'success',
            title: "Program Saved",
            showConfirmButton: false,
            timer: 1500,
         });
      }
      const getAllFiles = async()=>{
         const requestOptions = {
            method: "GET",
            headers: { "Content-Type": "application/json" },
         };
         const response = await fetch("http://localhost:9000/getAll",requestOptions);
         const data = await response.json();
         console.log(data)
         directory.value = data.getAll;
         Swal.fire({
            position: 'center',
            icon: 'success',
            title: "Files Loaded",
            showConfirmButton: false,
            timer: 1500,
         });
      }

      const setCode = (event)=>{
         const code =directory.value.find(x=> x.uid ==event.target.value )
         //console.log(code)
         codeGenerator.value = code.Code[0];
         console.log(code.flow)
      }
      const loadNodes = (event)=>{
         const code =directory.value.find(x=> x.uid ==event.target.value )
         const workspaceGenerator = JSON.parse(code.flow);
         editor.value.clear()
         
         editor.value.on("nodeCreated", (id) => {
            const typeNode = editor.value.getNodeFromId(id).class;
            if (typeNode == "Number") {
               dispatch("setNumberAction", {id: id, value: 0});
            } else if (typeNode == "String") {
               dispatch("setStringAction", {id: id, value: ""});
            }else if (typeNode == "Add" || typeNode == "Sub" || typeNode == "Multiply" || typeNode == "Divide") {
               dispatch("setOperationAction", {id: id, value: {Number1: 0, Number2: 0, Result: 0}});
            }
         });

         editor.value.on("nodeRemoved", (id) => {
            dispatch("deleteOperationAction", {id: id});
            dispatch("deleteNumberAction", {id: id});
            dispatch("deleteStringAction", {id: id});
         });

         editor.value.on("nodeDataChanged", (dataNode) => {
            updateValues(dataNode);
         });

         editor.value.on("connectionCreated", (dataNode) => {
            assignValues(dataNode);//Finish
         });

         editor.value.on("connectionRemoved", (dataNode) => {
            //console.log("connectionRemoved");
            removeValues(dataNode);
            
         });


         editor.value.registerNode("Number", <Number />, {}, {});
         editor.value.registerNode("String", <String />, {}, {});
         editor.value.registerNode("Add", <Operation title="Add" />, {}, {});
         editor.value.registerNode("Sub", <Operation title="Sub" />, {}, {});
         editor.value.registerNode("Multiply", <Operation title="Multiply" />, {}, {});
         editor.value.registerNode("Divide", <Operation title="Divide" />, {}, {});
         editor.value.registerNode("Assignation", <Assignation />, {}, {});
         editor.value.registerNode("For", <For />, {}, {});
         editor.value.registerNode("If", <If />, {}, {});
         editor.value.registerNode("Else", <Else />, {}, {});
         editor.value.registerNode("Print", <Print />, {}, {});
         
         setTimeout(function(){ editor.value.import(workspaceGenerator)}, 1000);
         
         //console.log(workspaceGenerator.value)
      }

      const newWorkspace = async()=>{
         editor.value.clear()
      }
      const runCode = async () =>{
          const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Code: [codeGenerator.value] })

         };
         const response = await fetch("http://localhost:9000/runProgram",requestOptions);
         const data = await response.json();
        // console.log(data);
         resultCode.value = data;
      }
      const showDiv = () => {
         document.getElementById('saveDiv').style.display = "block";
      }

      return {listNodes, drag, drop, allowDrop, dialogVisible, dialogData, generatePythonCode, internalInstance,toggleModal,active,show,codeGenerator,saveFile,getAllFiles,directory,setCode,runCode,resultCode, showDiv, loadNodes, newWorkspace};
   }
}
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Roboto&display=swap");
#app {
   font-family: "Roboto", sans-serif;
   text-align: center;
   color: #050505;
   font-size: 13px;
   text-align: initial;
   width: 100vw;
   height: 100vh;
   padding: 0px;
   margin: 0px;
   background: #2b2c30;
   background-size: 20px 20px;
   background-image: radial-gradient(#494949 1px, transparent 1px);
}
#drawflow {
   box-sizing: border-box;
   width: 100%;
   height: 95%;

   text-align: initial;
   background: #2b2c30;
   background-size: 20px 20px;
   background-image: radial-gradient(#494949 1px, transparent 1px);
}
.column {
   width: 25px;
   border-right: 1px solid #494949;
}
.column ul {
   padding-inline-start: 0px;
   padding: 10px 10px;
}

ul {
   list-style-type: none;
}
.column li {
   background: transparent;
}
.pre-formatted {
  white-space: pre;
}
.node {
   /* border-radius: 8px;
    border: 2px solid #000000; */
   display: block;
   height: 40px;
   line-height: 40px;
   margin: 10px 0px;
   cursor: move;
   text-align: center;
}

.drawflow .drawflow-node {
   border-radius: 8px;
   background: #181818;
   border: 2px solid #494949;
   color: white;
   min-width: 250px;
}

.drawflow .drawflow-node.selected {
   background: #181818;
   border: 2px solid rgb(241, 241, 241);
}

.drawflow .drawflow-node .drawflow_content_node input,
.drawflow .drawflow-node .drawflow_content_node .el-select,
.drawflow .drawflow-node .drawflow_content_node button {
   width: 100%;
}

.drawflow .drawflow-node .output_1 {
    background: rgb(52, 182, 0);
}
.drawflow .drawflow-node .output_2 {
    background: rgb(216, 0, 0);
}

</style>
