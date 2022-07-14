import {createApp} from "vue";
import App from "./App.vue";
import store from "./store";
import VueCodeHighlight from "vue-code-highlight";

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
import './index.css'
import './assets/tailwind.css'


createApp(App).use(VueCodeHighlight);

createApp(App).use(store).mount("#app");


