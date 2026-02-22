<template>
    <div v-if="cargando" class="spinner-overlay">
        <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
        </div>
        <div class="spinner-message">Por favor espere, cargando información...</div>
    </div>
    <div v-if="!cargando">
        <h1 class="display-6 center">{{ userData.cargo }}</h1>
        <nav>
            <div class="nav nav-tabs" id="nav-tab" role="tablist">
                <button class="nav-link active" id="nav-home-tab" data-bs-toggle="tab" data-bs-target="#nav-home"
                    type="button" role="tab" aria-controls="nav-home" aria-selected="true">Pendientes</button>
                <button class="nav-link" id="nav-profile-tab" data-bs-toggle="tab" data-bs-target="#nav-profile"
                    type="button" role="tab" aria-controls="nav-profile" aria-selected="false">En proceso</button>
                <!--     <button class="nav-link" id="nav-contact-tab" data-bs-toggle="tab" data-bs-target="#nav-contact"
                    type="button" role="tab" aria-controls="nav-contact" aria-selected="false">Contact</button>
                <button class="nav-link" id="nav-disabled-tab" data-bs-toggle="tab" data-bs-target="#nav-disabled"
                    type="button" role="tab" aria-controls="nav-disabled" aria-selected="false"
                    disabled>Disabled</button> -->
            </div>
        </nav>
        <div class="tab-content" id="nav-tabContent">
            <div class="tab-pane fade show active" id="nav-home" role="tabpanel" aria-labelledby="nav-home-tab"
                tabindex="0">

                <div class="container-fluid">
                    <h4>Detalle de Actividades ({{ cantEncuestasPendientes }}) <small>Pendientes</small></h4>

                    <!-- Mensaje cuando no hay registros -->
                    <div v-if="!encuestasPendientes || encuestasPendientes.length === 0"
                        class="alert alert-success shadow-sm text-center" role="alert">
                        <i class="bi bi-check-circle-fill" style="font-size: 3rem;"></i>
                        <h5 class="mt-3">¡Todo OK!</h5>
                        <p class="mb-0">No hay registros pendientes en este momento.</p>
                    </div>

                    <div v-else class="container-fluid" style="max-height: 500px; overflow-y: auto ">
                        <div v-for="(encuesta, index) in encuestasPendientes" :key="index"
                            class="container rounded-lg p-2 mb-2" style="border-radius: 24px;">
                            <div class="row paciente shadow-sm">
                                <div class="col-6 col-md-6">
                                    <small><strong>{{ encuesta.nombre1 }} {{ encuesta.apellido1
                                            }}</strong></small>
                                    <small>EPS: {{ encuesta.eps }} | Riesgo: {{
                                        encuesta.poblacionRiesgo }}</small>
                                    <small>Nac: {{ encuesta.fechaNac }} | Enc: {{ encuesta.fecha
                                        }}</small>
                                    <!-- Mostrar actividades si existen -->

                                </div>

                                <div class="col-6 col-md-6 acciones-col ">
                                    <div class="btn-grid">
                                        <!-- Fila única: Visita, Caracterización y CUPS (3 botones) -->
                                        <div class="btn-row">

                                            <!-- CUPS (Enfermero y Medico) -->
                                            <div
                                                v-if="encuesta.status_caracterizacion === true && (userData.cargo === 'Enfermero' || userData.cargo === 'Medico')">
                                                <button type="button" class="btn btn-danger btn-sm agendar-btn"
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
            <div class="tab-pane fade" id="nav-profile" role="tabpanel" aria-labelledby="nav-profile-tab" tabindex="0">


                <h4>({{ cantEncuestasEnProceso }}) <small>En proceso</small></h4>

                <!-- Mensaje cuando no hay registros -->
                <div v-if="!encuestasEnProceso || encuestasEnProceso.length === 0"
                    class="alert alert-success shadow-sm text-center" role="alert">
                    <i class="bi bi-check-circle-fill" style="font-size: 3rem;"></i>
                    <h5 class="mt-3">¡Todo OK!</h5>
                    <p class="mb-0">No hay registros en proceso en este momento.</p>
                </div>

                <div v-else class="container-fluid" style="max-height: 500px; overflow-y: auto ">
                    <div v-for="(encuesta, index) in encuestasEnProceso" :key="index"
                        class="container rounded-lg p-2 mb-2" style="border-radius: 24px;">
                        <div class="row paciente shadow-sm">
                            <div class="col-6 col-md-6">
                                <small><strong>{{ encuesta.nombre1 }} {{ encuesta.apellido1
                                        }}</strong></small>
                                <small>EPS: {{ encuesta.eps }} | Riesgo: {{
                                    encuesta.poblacionRiesgo }}</small>
                                <small>Nac: {{ encuesta.fechaNac }} | Enc: {{ encuesta.fecha
                                    }}</small>
                                <!-- Mostrar actividades si existen -->

                            </div>

                            <div class="col-6 col-md-6 acciones-col ">
                                <div class="btn-grid">
                                    <!-- Fila única: Visita, Caracterización y CUPS (3 botones) -->
                                    <div class="btn-row">
                                        <!-- CUPS (Enfermero y Medico) -->
                                        <div class="status-grid">
                                            <span v-if="'status_gest_aux' in encuesta" class="badge status-badge"
                                                :class="encuesta.status_gest_aux ? 'bg-success' : 'bg-secondary'">
                                                Aux {{ encuesta.status_gest_aux ? 'OK' : 'No' }}
                                                <span v-if="encuesta.fechagestAuxiliar" class="status-date">{{
                                                    encuesta.fechagestAuxiliar }}</span>
                                            </span>
                                            <span v-if="'status_gest_medica' in encuesta" class="badge status-badge"
                                                :class="encuesta.status_gest_medica ? 'bg-success' : 'bg-secondary'">
                                                Med {{ encuesta.status_gest_medica ? 'OK' : 'No' }}
                                                <span v-if="encuesta.fechagestMedica" class="status-date">{{
                                                    encuesta.fechagestMedica }}</span>
                                            </span>
                                            <span v-if="'status_gest_psicologo' in encuesta" class="badge status-badge"
                                                :class="encuesta.status_gest_psicologo ? 'bg-success' : 'bg-secondary'">
                                                Psi {{ encuesta.status_gest_psicologo ? 'OK' : 'No' }}
                                                <span v-if="encuesta.fechagestPsicologo" class="status-date">{{
                                                    encuesta.fechagestPsicologo }}</span>
                                            </span>
                                            <span v-if="'status_gest_tsocial' in encuesta" class="badge status-badge"
                                                :class="encuesta.status_gest_tsocial ? 'bg-success' : 'bg-secondary'">
                                                TS {{ encuesta.status_gest_tsocial ? 'OK' : 'No' }}
                                                <span v-if="encuesta.fechagestTsocial" class="status-date">{{
                                                    encuesta.fechagestTsocial }}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>




            </div>
            <!--     <div class="tab-pane fade" id="nav-contact" role="tabpanel" aria-labelledby="nav-contact-tab" tabindex="0">
                ...</div>
            <div class="tab-pane fade" id="nav-disabled" role="tabpanel" aria-labelledby="nav-disabled-tab"
                tabindex="0">...</div> -->
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
            "getAllRegistersByFecha",
            "getAllRegistersByIduserEnfer",
            " SelectExistenteAgendas",
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
            sessionStorage.setItem("rutaAnterior", "/sop_enfermero");
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
        encuestasPendientesBase() {
            if (!this.encuestas || this.encuestas.length === 0) return [];
            if (!this.userData || !this.userData.convenio) return this.encuestas;

            return this.encuestas.filter(encuesta =>
                encuesta.convenio === this.userData.convenio
            );
        },
        encuestasEnProcesoBase() {
            if (!this.encuestas || this.encuestas.length === 0) return [];
            if (!this.userData || !this.userData.convenio) return this.encuestas;

            return this.encuestas.filter(encuesta =>
                encuesta.convenio === this.userData.convenio
            );
        },
        encuestasPendientes() {
            if (!this.encuestasPendientesBase || this.encuestasPendientesBase.length === 0) return [];

            const documento = this.userData?.numDocumento;
            if (!documento) return [];

            return this.encuestasPendientesBase.filter((encuesta) =>
                encuesta.idEnfermeroAtiende === documento &&
                encuesta.status_gest_aux === true &&
                encuesta.status_gest_medica === true &&
                encuesta.status_gest_psicologo === true &&
                encuesta.status_gest_tsocial === true &&
                encuesta.status_gest_enfermera === false
            );
        },
        cantEncuestasPendientes() {
            return this.encuestasPendientes.length;
        },
        encuestasEnProceso() {
            if (!this.encuestasEnProcesoBase || this.encuestasEnProcesoBase.length === 0) return [];

            const documento = this.userData?.numDocumento;
            if (!documento) return [];

            return this.encuestasEnProcesoBase.filter((encuesta) => {
                if (encuesta.idEnfermeroAtiende !== documento) return false;

                const estados = [
                    encuesta.status_gest_aux,
                    encuesta.status_gest_medica,
                    encuesta.status_gest_psicologo,
                    encuesta.status_gest_tsocial,
                ];

                return estados.some((valor) => valor === false);
            });
        },
        cantEncuestasEnProceso() {
            return this.encuestasEnProceso.length;
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
            // Obtener encuestas del enfermero con status_gest_medica = true
            await this.getAllRegistersByIduserEnfer({
                idUsuario: this.userData.numDocumento,
                convenio: this.userData.convenio,
            });
        } catch (error) {
            console.error("Error en mounted de sop_enfermero:", error);
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

.status-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px;
}

.status-badge {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    font-size: 0.7rem;
    line-height: 1.1;
}

.status-date {
    font-size: 0.65rem;
    opacity: 0.85;
}
</style>
