<template>
  <div class="login-container d-flex align-items-center justify-content-center">
    <div class="card p-4 shadow-lg">
      <h3 class="text-center mb-3">Login</h3>
      <form @submit.prevent="handleLogin">
        <div class="mb-3">
          <label for="email" class="form-label">Email address</label>
          <input
            type="email"
            v-model="email"
            class="form-control"
            id="email"
            required
          />
        </div>
        <div class="mb-3">
          <label for="password" class="form-label">Password</label>
          <input
            type="password"
            v-model="password"
            class="form-control"
            id="password"
            required
          />
        </div>
        <button type="submit" class="btn btn-primary w-100">Login</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const email = ref("");
const password = ref("");

const handleLogin = () => {
  console.log("Logging in with:", email.value, password.value);
  // Implement authentication logic here
};
</script>

<style scoped>
.login-container {
  height: 100vh;
  background: #f8f9fa;
}
.card {
  width: 350px;
  border-radius: 10px;
}
</style>
