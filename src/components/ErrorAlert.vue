<template>
  <div v-if="message" class="error-alert" :class="type">
    <span class="message">{{ message }}</span>
    <button class="close" @click="$emit('close')">&times;</button>
  </div>
</template>

<script>
export default {
  name: 'ErrorAlert',
  props: {
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'error',
      validator: value => ['error', 'warning', 'success'].includes(value)
    }
  },
  emits: ['close']
}
</script>

<style scoped>
.error-alert {
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.error {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

.warning {
  background-color: #fff3cd;
  border: 1px solid #ffeeba;
  color: #856404;
}

.success {
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
}

.close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0 0.5rem;
}
</style> 