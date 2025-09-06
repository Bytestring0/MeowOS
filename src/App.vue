<script setup lang="ts">
import { RouterLink } from 'vue-router';


</script>

<template>
  <h1>home page</h1>
  <RouterLink to="/MeowOS/todolist">To Do List</RouterLink>
  <br />
  <RouterLink to="/MeowOS/conventions">Conventions</RouterLink>
  <br />
  <router-view></router-view>
</template>

<style scoped></style>
