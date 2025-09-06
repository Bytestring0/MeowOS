<script setup lang="ts">
import { RouterLink } from 'vue-router';
import Terminal from './components/Terminal.vue';

</script>

<template>
  <h1>home page</h1>
  <RouterLink to="/MeowOS/todolist">To Do List</RouterLink>
  <br />
  <RouterLink to="/MeowOS/conventions">Conventions</RouterLink>
  <br />
  <router-view></router-view>
  <Terminal></Terminal>
</template>

<style>
*{
  margin: 0;
  padding: 0;
}
body{
  overflow: hidden;
}
</style>
