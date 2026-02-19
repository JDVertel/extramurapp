<template>
<div>

    <div v-if="getUserData">
        <div class="container mt-1">
            <div class="col-12"> <img :src="logo" alt="Logo Extramurapp" class="img-fluid mb-3" /></div>
            <h2>{{ getUserData.convenio }}</h2>

            <div class="row">

                <hr>
                <h2>Bienvenid@</h2>
                <div class="col-6 col-md-6 mb-6">
                    <h4>Usuario</h4>
                    {{ getUserData.nombre }} <br />
                    {{ getUserData.cargo }} <br />
                    Grupo: {{ getUserData.grupo }} <br />
                </div>
                <div class="col-6 col-md-6">

                    <ul>
                        <h4>IPS</h4>
                        <li class="list-group-item">{{ dataips.nombre }}</li>
                        <li class="list-group-item">Nit: {{ dataips.nit }}</li>
                        <li class="list-group-item">Cod Habilitacion: {{ dataips.codHab }}</li>
                        <li class="list-group-item">{{ dataips.dpto }}</li>
                    </ul>
                </div>
                <hr>

            </div>
        </div>

    </div>
    <p v-else>Cargando...</p>

    <footer>
        <p>© 2026 BigDataManagements SAS - All rights reserved</p>
    </footer>
</div>
</template>

<script>
import logo from "../assets/images/logo_extramurapp.png";
import {
    mapActions,
    mapGetters,
    mapState
} from "vuex";

export default {
    data() {
        return {
            logo,
            token: localStorage.getItem("token"),
            uid: localStorage.getItem("uid"),
            idips: 1,
        };
    },
    methods: {
        ...mapActions(["fetchUserDataByUid", 'getdataips']),
        getdata(id) {
            this.getdataips(id);
        }

    },
    computed: {
        ...mapGetters(["getUserData"]),
        ...mapState(["dataips"])
    },
    mounted() {
        if (this.uid) {
            this.fetchUserDataByUid(this.uid);
        } else {
            console.warn("UID no disponible para cargar datos de usuario");
        }
        this.getdata(this.idips);
    },
};
</script>

<style>
footer {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: #ececec;
    color: #333;
    padding: 8px 0;
    text-align: center;
    z-index: 1000;
    box-sizing: border-box;
}

footer p {
    margin: 0;
    font-size: 0.75rem;
    font-weight: 400;
    letter-spacing: 0.5px;
}
</style>
