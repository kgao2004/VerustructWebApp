import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// Initialize auth state from localStorage
store.dispatch('initAuth');

// Navigation guard
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isAuthenticated = store.state.isAuthenticated

  if (requiresAuth && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

const app = createApp(App)
app.use(store)
app.use(router)
app.mount('#app') 