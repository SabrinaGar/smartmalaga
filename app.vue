<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
<script setup>
import { onMounted } from "vue";

onMounted(() => {
  // Script inline: window.chtlConfig = {...}
  const configScript = document.createElement("script");
  configScript.innerHTML = `window.chtlConfig = { chatbotId: "1351377169" };`;
  document.head.appendChild(configScript);

  // Script externo
  const embedScript = document.createElement("script");
  embedScript.async = true;
  embedScript.src = "https://chatling.ai/js/embed.js";
  embedScript.setAttribute("data-id", "1351377169");
  embedScript.id = "chtl-script";
  embedScript.type = "text/javascript";
  document.head.appendChild(embedScript);
});
</script>
