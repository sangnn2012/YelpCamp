import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue')
    },
    {
      path: '/campgrounds',
      name: 'campgrounds',
      component: () => import('@/views/CampgroundsView.vue')
    },
    {
      path: '/campgrounds/new',
      name: 'campground-new',
      component: () => import('@/views/CampgroundNewView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/campgrounds/:id',
      name: 'campground-detail',
      component: () => import('@/views/CampgroundDetailView.vue')
    },
    {
      path: '/campgrounds/:id/edit',
      name: 'campground-edit',
      component: () => import('@/views/CampgroundEditView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue')
    }
  ]
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router
