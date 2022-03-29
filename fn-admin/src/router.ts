import {
  type RouteRecordRaw,
  createRouter,
  createWebHistory,
} from "vue-router";

import FunctionDetailView from "./views/FunctionDetailView";
import FunctionListView from "./views/FunctionListView";
import HomeView from "./views/HomeView";
import LoginView from "./views/LoginView";
import SchedulerListView from "./views/SchedulerListView";
import UserListView from "./views/UserListView";

const routes: RouteRecordRaw[] = [
  { path: "/login", name: "login", component: LoginView },
  {
    path: "",
    name: "home",
    component: HomeView,
    children: [
      { path: "", redirect: "functions" },
      {
        name: "functions",
        path: "functions",
        component: FunctionListView,
        children: [
          {
            name: "function",
            path: ":functionId(.+)",
            component: FunctionDetailView,
          },
        ],
      },
      {
        name: "schedulers",
        path: "schedulers",
        component: SchedulerListView,
      },
      {
        name: "users",
        path: "users",
        component: UserListView,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
