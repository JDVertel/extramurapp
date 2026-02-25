<template>
    <div v-if="cargando" class="spinner-overlay">
        <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
        </div>
        <div class="spinner-message">Por favor espere, cargando información...</div>
    </div>
    <div v-if="!cargando">
        <h1 class="display-6 center">{{ userData.cargo }}</h1>


        <div class="container-fluid">
            <h4>Detalle de Actividades ({{ cantEncuestasConCupsActivo }}) <small>Pendientes</small></h4>

            <!-- Mensaje cuando no hay registros -->
            <div v-if="!encuestasConCupsActivo || encuestasConCupsActivo.length === 0"
                class="alert alert-success shadow-sm text-center" role="alert">
                <i class="bi bi-check-circle-fill" style="font-size: 3rem;"></i>
                <h5 class="mt-3">¡Todo OK!</h5>
                <p class="mb-0">No hay registros pendientes en este momento.</p>
            </div>

            <div v-else class="container-fluid" >
                <div v-for="(encuesta, index) in encuestasConCupsActivo" :key="index"
                    class="container rounded-lg p-2 mb-2" style="border-radius: 24px;">
                    <div class="row paciente shadow-sm">
                        <div class="col-10 col-md-10">
                            <small><strong>{{ encuesta.nombre1 }} {{ encuesta.apellido1
                                    }}</strong></small>
                            <small>EPS: {{ encuesta.eps }} | Riesgo: {{
                                encuesta.poblacionRiesgo }}</small>
                            <small c>Nac: {{ encuesta.fechaNac }} | Enc: {{ encuesta.fecha
                                }}</small>
                            <!-- Mostrar actividades si existen -->

                        </div>

                        <div class="col-2 col-md-2 acciones-col ">
                            <div class="btn-grid">
                                <!-- Fila única: Visita, Caracterización y CUPS (3 botones) -->
                                <div class="btn-row">




                                    <!-- CUPS (Auxiliar de enfermeria y Medico) -->
                                    <div
                                        v-if="encuesta.status_caracterizacion === true && (userData.cargo === 'Auxiliar de enfermeria' || userData.cargo === 'Medico')">
                                        <button type="button" class="btn btn-danger  agendar-btn"
                                            @click="cupsGestion(encuesta.id)">
                                            <i class="bi bi-calendar2-heart-fill"></i>
                                            <span class="agendar-label">Cups</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapActions, mapState } from "vuex";
import moment from "moment";
export default {
    data() {
        return {
            cargando: true,
            fechaActual: "",
        };
    },
    methods: {
        ...mapActions([
            "removeRegEnc",
            "getAllRegistersByFechaStatus",
            "getAllRegistersByIduser",
            "getAllRegistersByFecha",
            " SelectExistenteAgendas",
            "getEncuestasConActividadesMedico",
        ]),

        removeRegEncuesta(id) {
            this.removeRegEnc(id);
            alert("Registro eliminado exitosamente.");
            this.getAllRegistersByFecha({
                idUsuario: this.userData.numDocumento,
                fecha: this.fechaActual,
            });
            this.getAllRegistersByFechaStatus({
                idUsuario: this.userData.numDocumento,
            });
        },
        Agendar(id, tipo) {
            this.$router.push({
                name: "sop_agendamiento",
                params: {
                    idEncuesta: id,
                    tipo: tipo,
                },
            });
        },
        Caracterizar(id) {
            this.$router.push({
                name: "sop_caracterizacion",
                params: {
                    idEncuesta: id,
                },
            });
        },

        cupsGestion(id) {
            sessionStorage.setItem("rutaAnterior", "/sop_profesional");
            this.$router.push({
                name: "sop_cups",
                params: {
                    idEncuesta: id,
                },
            });
        },

        nombresActividades(act) {
            if (!act) return [];
            const lista = Array.isArray(act) ? act : Object.values(act);
            return lista.map((a) => a?.nombre).filter(Boolean);
        },

        nombresActividadesEncuesta(actividades) {
            if (!actividades || typeof actividades !== 'object') return 'Sin actividades';

            // Revisar si hay tipoActividad
            const tipoActividad = actividades.tipoActividad;
            if (!tipoActividad || typeof tipoActividad !== 'object') return 'Sin actividades';

            const nombres = Object.values(tipoActividad)
                .map(act => act?.nombre)
                .filter(Boolean);

            return nombres.length > 0 ? nombres.join(', ') : 'Sin actividades';
        },
    },

    computed: {
        ...mapState(["encuestas", "userData", "cantEncuestas"]),
        encuestasFiltradasPorConvenio() {
            if (!this.encuestas || this.encuestas.length === 0) return [];
            if (!this.userData || !this.userData.convenio) return this.encuestas;

            // Filtrar encuestas donde el convenio coincida con userData.convenio
            return this.encuestas.filter(encuesta =>
                encuesta.convenio === this.userData.convenio
            );
        },
        encuestasConCupsActivo() {
            return this.encuestasFiltradasPorConvenio.filter(
                (encuesta) =>
                    encuesta.status_caracterizacion === true &&
                    (this.userData?.cargo === "Auxiliar de enfermeria" ||
                        this.userData?.cargo === "Medico")
            );
        },
        cantEncuestasConCupsActivo() {
            return this.encuestasConCupsActivo.length;
        },
        documento() {
            return this.userData.numDocumento;
        },

        totalRegisters() {
            return this.encuestas.length;
        },
    },
    async mounted() {
        this.fechaActual = moment().format("YYYY-MM-DD");
        try {
            // Obtener encuestas con status_gest_aux = true para médico y sus actividades
            const encuestasConActividades = await this.getEncuestasConActividadesMedico({
                idUsuario: this.userData.numDocumento,
            });

            // Actualizar el store manualmente porque la nueva función no lo hace
            this.$store.commit('setEncuestas', encuestasConActividades);
            this.$store.commit('setcantEncuestas', encuestasConActividades.length);

            console.log("Encuestas con actividades (Médico):", encuestasConActividades);
        } catch (error) {
            console.error("Error en mounted de sop_profesional:", error);
            alert("Error cargando encuestas: " + (error?.message || error));
        } finally {
            this.cargando = false;
        }
    },
};
</script>

<style>
.spinner-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(255, 255, 255, 0.8);
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.spinner-message {
    margin-top: 20px;
    font-size: 1.2rem;
    color: #333;
}

.acciones-col {
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Layout horizontal para botones */
.btn-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
}

/* Estilos para botones redondeados */
.agendar-btn {
    width: 50px;
    height: 50px;
    padding: 0;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    line-height: 1;
    border: none;
    transition: all 0.2s ease;
}

.agendar-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.agendar-btn i {
    font-size: 16px;
}

.agendar-label {
    font-size: 9px;
    font-weight: 600;
}
</style>
