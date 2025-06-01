import { createRouter, createWebHistory } from 'vue-router'
import ClientCalculator from '../views/ClientCalculator.vue'
import AdminPanel from '../views/AdminPanel.vue'
import LoginView from '../views/LoginView.vue'

import BuildHome from '../views/BuildHome.vue';

const routes = [
  {
    path: '/',
    name: 'client',
    component: ClientCalculator
  },
  { 
    path:'/calculator',
    name: 'BuildHome',
    //component: BuildHome
    component: () => import('../views/BuildHome.vue')
  },

  
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminPanel,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router 