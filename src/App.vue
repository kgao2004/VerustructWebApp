<template>
  <div id="app">
    <nav>
      <router-link to="/">Client Calculator</router-link> |
      <router-link to="/admin">Admin Panel</router-link>
    </nav>
    <router-view/>
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

nav {
  padding: 30px;
  background-color: #f8f9fa;
  margin-bottom: 20px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
  text-decoration: none;
  padding: 10px 20px;
  border-radius: 4px;
}

nav a.router-link-exact-active {
  color: #fff;
  background-color: #42b983;
}
</style> 