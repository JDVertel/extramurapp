<template>
  <div class="container text-center py-4">
    <div v-if="!logoutComplete">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cerrando sesión...</span>
      </div>
      <h4 class="mt-3">Cerrando sesión...</h4>
    </div>
    <div v-else>
      <i class="bi bi-fingerprint"></i>
      <h4 class="mt-3">Sesión cerrada correctamente</h4>
      <router-link to="/login">
        <button class="btn btn-success mt-3">Ir a Login</button>
      </router-link>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  data() {
    return {
      logoutComplete: false
    };
  },
  methods: {
    ...mapActions(["userLogout"])
  },
  async mounted() {
    try {
      // Ejecutar el logout real
      await this.userLogout();
      this.logoutComplete = true;
    } catch (error) {
      console.error("Error en logout:", error);
      // Igual mostrar el mensaje de logout completado
      setTimeout(() => {
        this.logoutComplete = true;
      }, 1000);
    }
  }
};
</script>

<style scoped>
.bi-fingerprint {
  font-size: 150px;
  color: #198754;
  /* color verde bootstrap success */
}

.container {
  max-width: 400px;
  margin: 0 auto;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
  margin: 0 auto;
}
</style>
