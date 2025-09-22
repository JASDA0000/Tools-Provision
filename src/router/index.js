// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import MailsendVM from '../views/MailsendVM.vue'
import MailsendSale from '../views/MailsendSale.vue'
import PasswordGen from '../views/PasswordGen.vue'
import Policy from '../views/Policy.vue'


const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/MailsendVM', name:'MailsendVM', component: MailsendVM},
  { path: '/MailsendSale', name:'MailsendSale', component: MailsendSale},
  { path: '/PasswordGen', name:'PasswordGen',component: PasswordGen},
  { path: '/Policy', name:'Policy',component: Policy},
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
