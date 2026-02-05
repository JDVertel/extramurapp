<template>
<div class="container-fluid">

    <div>
        <h1>admin ips</h1>
        <p>Datos de radicacion</p>

  

        <ul class="list-group list-group-flush">
            <li class="list-group-item">Nombre: {{ dataips.nombre }} </li>
            <li class="list-group-item">Nit: {{dataips.nit}} </li>
            <li class="list-group-item">Cod Habilitacion: {{dataips.codHab}} </li>
            <li class="list-group-item">Dpto Ubicacion: {{dataips.dpto}} </li>

        </ul>

    </div>

</div>
</template>

<script>
import {
    mapState,
    mapActions
} from 'vuex'
export default {
    data() {
        return {
            idips: 1,
        }
    },
    methods: {
        ...mapActions(['getdataips']),

        getdata(id) {
            this.getdataips(id);
        }
    },
    computed: {
        ...mapState(['dataips']),
    },
    mounted() {
        this.getdata(this.idips);
    }

}
</script>

<style>

</style>
