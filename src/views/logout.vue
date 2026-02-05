<template>
  <div class="container text-center py-4">
    <div><i class="bi bi-fingerprint"></i></div>
    <h4 class="mt-3">Sesión cerrada correctamente</h4>
    <router-link to="/">
      <button class="btn btn-success btn-sm mt-3">Cerrar</button>
    </router-link>
  </div>
</template>

<script>

</script>

<style>
.bi-fingerprint {
  font-size: 150px;
  color: #198754; /* color verde bootstrap success */
}
.container {
  max-width: 400px;
  margin: 0 auto;
}
</style>
