<script setup lang="ts">
import logo from "@/assets/logo.png";

const state = reactive({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
});

function onRegister() {
  if (state.password !== state.confirmPassword) {
    alert("Las contraseñas no coinciden");
    return;
  }

  console.log("Registrando usuario:", state);
  // Aquí puedes hacer la llamada a tu API de registro
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

        <!-- Form -->
        <div class="w-full md:w-2/3 space-y-6">
          <h2
            class="text-2xl font-semibold text-center md:text-left text-gray-800"
          >
            Crear cuenta
          </h2>

          <UForm :state="state" class="space-y-4" @submit="onRegister">
            <UFormField label="Nombre" name="name">
              <UInput v-model="state.name" />
            </UFormField>

            <UFormField label="Email" name="email">
              <UInput v-model="state.email" type="email" />
            </UFormField>

            <UFormField label="Contraseña" name="password">
              <UInput v-model="state.password" type="password" />
            </UFormField>

            <UFormField label="Confirmar contraseña" name="confirmPassword">
              <UInput v-model="state.confirmPassword" type="password" />
            </UFormField>

            <UButton type="submit" size="sm" class="w-1/3">Registrarse</UButton>
          </UForm>
        </div>
      </div>
    </UCard>
  </div>
</template>
