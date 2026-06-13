<script setup>
defineProps({
  code: { type: String, required: true }
})
</script>

<template>
  <!-- España -->
  <svg
    v-if="code === 'es'"
    width="22" height="15"
    viewBox="0 0 22 15"
    xmlns="http://www.w3.org/2000/svg"
    style="border-radius: 2px; flex-shrink: 0; display: block;"
  >
    <rect width="22" height="15" fill="#c60b1e"/>
    <rect y="3.75" width="22" height="7.5" fill="#ffc400"/>
  </svg>

  <!-- Estados Unidos -->
  <svg
    v-else-if="code === 'en'"
    width="22" height="15"
    viewBox="0 0 22 15"
    xmlns="http://www.w3.org/2000/svg"
    style="border-radius: 2px; flex-shrink: 0; display: block;"
  >
    <!-- Base roja -->
    <rect width="22" height="15" fill="#b22234"/>
    <!-- 6 franjas blancas -->
    <rect y="1.15" width="22" height="1.15" fill="white"/>
    <rect y="3.46" width="22" height="1.15" fill="white"/>
    <rect y="5.77" width="22" height="1.15" fill="white"/>
    <rect y="8.08" width="22" height="1.15" fill="white"/>
    <rect y="10.38" width="22" height="1.15" fill="white"/>
    <rect y="12.69" width="22" height="1.15" fill="white"/>
    <!-- Cantón azul (cubre las primeras 7 franjas) -->
    <rect width="9" height="8.08" fill="#3c3b6e"/>
  </svg>
</template>
