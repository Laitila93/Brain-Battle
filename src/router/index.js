import { createRouter, createWebHistory } from 'vue-router'
import StartView from '../views/StartView.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Start',
      component: StartView
    },
      {
      path: '/domination/:id',
      name: 'DominationView',
      component: () => import('../views/DominationView.vue')
    },
    {
      path: '/timeTrial/:id',
      name: 'TimeTrialView',
      component: () => import('../views/TimeTrialView.vue')
    },
    {
      path: '/lobby/:id',
      name: 'LobbyView',
      component: () => import('../views/LobbyView.vue')
    },
    {
      path: '/create/',
      name: 'CreateView',
      component: () => import('../views/CreateView.vue')
    },
  ]
})

export default router
