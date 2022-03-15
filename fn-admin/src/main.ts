import "vfonts/OpenSans.css";
import "vfonts/FiraCode.css";
import "./styles.less";

import { createPinia } from "pinia";
import { createApp } from "vue";

import App from "./App.vue";
import router from "./router";

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.use(router);

app.mount("body");
