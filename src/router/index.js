// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../Views/Home.vue'
import MailsendVM from '../views/MailsendVM.vue'


const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/MailsendVM', name:'Mail-All', component: MailsendVM}
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
