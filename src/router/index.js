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
      path: '/game/:id',
      name: 'gameView',
      component: () => import('../views/gameView.vue')
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
