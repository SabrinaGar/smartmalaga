<script setup lang="ts">
import logo from "@/assets/logo.png";

const state = reactive({
  email: "",
  password: "",
});

function onSubmit() {
  console.log("Email:", state.email);
  console.log("Password:", state.password);
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <UCard class="w-full max-w-4xl p-6 shadow-xl rounded-2xl">
      <div class="flex flex-col md:flex-row items-center md:items-start gap-8">
        <!-- Logo -->
        <div class="flex justify-center md:justify-start md:w-1/3">
          <img :src="logo" alt="Smartmalaga Logo" class="h-24 md:h-32 w-auto" />
        </div>

        <!-- Form content -->
        <div class="w-full md:w-2/3 space-y-6">
          <!-- Title -->
          <h2
            class="text-2xl font-semibold text-center md:text-left text-gray-800"
          >
            Iniciar sesión
          </h2>

          <UForm :state="state" class="space-y-4" @submit="onSubmit">
            <UFormField label="Email" name="email">
              <UInput v-model="state.email" />
            </UFormField>

            <UFormField label="Password" name="password">
              <UInput v-model="state.password" type="password" />
            </UFormField>

            <UButton type="submit" class="w-1/3">Entrar</UButton>
          </UForm>
        </div>
      </div>
    </UCard>
  </div>
</template>
