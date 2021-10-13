<template>
  <div class="logo-box">
    <img
      style="height: 200px"
      src="./assets/electron.png"
      alt="Electron logo"
    />
    <img alt="Vue logo" src="./assets/logo.png" />
  </div>
  <HelloWorld msg="Electron@13、Vue@3、Vite@2" />
</template>

<script setup lang="ts">
import HelloWorld from "./components/HelloWorld.vue";
</script>

<style>
.logo-box {
  display: flex;
  width: 100%;
  justify-content: center;
}
</style>
