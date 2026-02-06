<script setup>

</script>

<template>
<div>
    <h6>Caracterizaciones registradas</h6>
    <hr>
    <div class="container">

        <div class="col-6 col-md-2">
            <label for="fechaInicio" class="form-label">Fecha de Inicio</label>
            <input type="date" id="fechaInicio" class="form-control" v-model="fechaInicio" required />
        </div>
        <div class="col-6 col-md-2">
            <label for="fechaFin" class="form-label">Fecha de Fin</label>
            <input type="date" id="fechaFin" class="form-control" v-model="fechaFin" required />
        </div>
        <div class="col-12 col-md-2 mt-3">
            <button type="button" class="btn btn-warning  mt-3" @click="generarInforme()">
                <i class="bi bi-clipboard2-data h6"></i> Generar Informe
            </button>
        </div>

    </div>

</div>
</template>

<style>

</style>
