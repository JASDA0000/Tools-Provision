// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import MailsendVM from '../views/MailsendVM.vue'
import MailsendSale from '../views/MailsendSale.vue'


const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/MailsendVM', name:'MailsendVM', component: MailsendVM},
  { path: '/MailsendSale', name:'MailsendSale', component: MailsendSale}
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
