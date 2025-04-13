<template>
  <div id="app">
    <nav class="main-nav">
      <div class="nav-content">
        <div class="nav-left">
          <router-link to="/" class="logo">
            <img src="@/assets/verustruct-logo.png" alt="Verustruct" class="logo-image" />
          </router-link>
          <div class="nav-links">
            <router-link to="/calculator">Calculator</router-link>
            <router-link to="/pricing">Pricing</router-link>
          </div>
        </div>
        <div class="nav-right">
          <router-link to="/admin" class="sign-in-btn">Admin Panel</router-link>
        </div>
      </div>
    </nav>
    <router-view/>
  </div>
</template>

<style>
:root {
  --primary-color: #1a1a1a;
  --secondary-color: #42b983;
  --background-color: #f5f5f5;
  --card-background: #ffffff;
  --text-color: #2c3e50;
  --border-radius: 12px;
  --shadow: 0 2px 4px rgba(0,0,0,0.1);
}

#app {
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text-color);
  background-color: var(--background-color);
  min-height: 100vh;
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'K2D', sans-serif;
  font-weight: 500;
}

h1 {
  font-weight: 700;
  font-size: 3.5rem;
  line-height: 1.2;
  margin-bottom: 1.5rem;
}

.main-nav {
  background-color: var(--card-background);
  padding: 1rem 2rem;
  box-shadow: var(--shadow);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 3rem;
}

.logo {
  display: flex;
  align-items: center;
  text-decoration: none;
}

.logo-image {
  height: 32px;
  width: auto;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-links a {
  font-family: 'Kumbh Sans', sans-serif;
  font-weight: 600;
  color: var(--text-color);
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  transition: all 0.3s ease;
}

.nav-links a:hover {
  background-color: var(--background-color);
}

.nav-links a.router-link-exact-active {
  color: var(--secondary-color);
}

.sign-in-btn {
  font-family: 'Kumbh Sans', sans-serif;
  font-weight: 600;
  background-color: var(--primary-color);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius);
  text-decoration: none;
  transition: all 0.3s ease;
}

.sign-in-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Global card styles */
.card {
  background-color: var(--card-background);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  padding: 2rem;
  margin-bottom: 2rem;
}

/* Global button styles */
.btn {
  font-family: 'Kumbh Sans', sans-serif;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-secondary {
  background-color: var(--secondary-color);
  color: white;
}

.btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}
</style> 