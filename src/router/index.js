import { createRouter, createWebHistory } from 'vue-router';
import Fuxa from "@/pages/fuxa/fuxa";

const routes = [
  {
    path: "/",
    name: "Fuxa",
    component: Fuxa
  }
]

export default createRouter({
  history: createWebHistory("/good"),
  routes: routes
})