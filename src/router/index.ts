import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Editor',
    component: () => import('@/views/EditorView.vue')
  },
  {
    path: '/preview',
    name: 'Preview',
    component: () => import('@/views/PreviewView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
