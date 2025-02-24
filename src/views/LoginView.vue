<template>
  <div class="login">
    <div class="login-card">
      <h2>Admin Login</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email:</label>
          <input 
            type="email" 
            id="email" 
            v-model="credentials.email" 
            required
          >
        </div>
        
        <div class="form-group">
          <label for="password">Password:</label>
          <input 
            type="password" 
            id="password" 
            v-model="credentials.password" 
            required
          >
        </div>

        <div class="error" v-if="error">
          {{ error }}
        </div>

        <button type="submit" :disabled="loading">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'LoginView',
  setup() {
    const store = useStore()
    const router = useRouter()
    const credentials = ref({ email: '', password: '' })
    const error = ref('')
    const loading = ref(false)

    const handleLogin = async () => {
      loading.value = true
      error.value = ''
      
      try {
        const success = await store.dispatch('login', credentials.value)
        if (success) {
          router.push('/admin')
        } else {
          error.value = 'Invalid credentials'
        }
      } catch (e) {
        error.value = 'An error occurred during login'
      } finally {
        loading.value = false
      }
    }

    return {
      credentials,
      error,
      loading,
      handleLogin
    }
  }
}
</script>

<style scoped>
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.login-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
}

.form-group input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.error {
  color: #dc3545;
  margin-bottom: 1rem;
}

button {
  width: 100%;
  padding: 0.75rem;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #94d3b7;
}
</style> 