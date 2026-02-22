<template>
    <div>
        <div v-if="cargando" class="spinner-overlay">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <div class="spinner-message">Por favor espere, cargando información...</div>
        </div>
        <div v-else-if="errorCarga" class="alert alert-danger m-3">
            <h4>Error cargando información</h4>
            <p>{{ errorCarga }}</p>
            <button class="btn btn-primary" @click="cargarEncuestas">Reintentar</button>
        </div>
        <div v-else>
            <h1 class="display-6 center">{{ userData.cargo }}</h1>


            <h4>Detalle de Actividades ({{ cantEncuestasFiltradasPorConvenio }}) <small>Pendientes</small></h4>

            <!-- Mensaje cuando no hay registros -->
            <div v-if="!encuestasFiltradasPorConvenio || encuestasFiltradasPorConvenio.length === 0"
                class="alert alert-success shadow-sm text-center" role="alert">
                <i class="bi bi-check-circle-fill" style="font-size: 3rem;"></i>
                <h5 class="mt-3">¡Todo OK!</h5>
                <p class="mb-0">No hay registros pendientes en este momento.</p>
            </div>

            <div v-for="(encuesta, index) in encuestasFiltradasPorConvenio" :key="index"
                class="container rounded-lg p-2 mb-2">
                <div class="row paciente shadow-sm" style="border-radius: 5px;">
                    <div class="col-7 col-md-6">
                        <small class="d-block"><strong>{{ encuesta.nombre1 }} {{ encuesta.nombre2 }} {{
                            encuesta.apellido1 }} {{
                                    encuesta.apellido2 }}</strong></small>
                        <small>EPS: {{ encuesta.eps }} | Riesgo: {{ encuesta.poblacionRiesgo }}</small>
                        <small>Nac: {{ encuesta.fechaNac }} | Enc: {{ encuesta.fecha }}</small>
                    </div>

                    <div class="col-5 col-md-6 acciones-col">
                        <div class="btn-grid">
                            <div class="btn-row">



                                <!-- CUPS -->
                                <div v-if="encuesta.status_caracterizacion === true && userData.cargo === 'Psicologo'">
                                    <button type="button" class="btn btn-primary  agendar-btn"
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
</template>

<script>
import { mapActions, mapState } from "vuex";

export default {
    data() {
        return {
            cargando: true,
            eliminandoRegistro: null,
            rutaAnterior: null,
            errorCarga: null,
        };
    },

    methods: {
        ...mapActions([
            "removeRegEnc",
            "getEncuestasPendientesPsicologo",
            "getAsignacionesByEncuesta",
        ]),

        async eliminarRegistro(idEncuesta) {
            if (!confirm('¿Está seguro de que desea eliminar este registro?\n\nEsta acción eliminará el registro de actividades y la encuesta asociada.')) {
                return;
            }

            this.eliminandoRegistro = idEncuesta;

            try {
                const asignaciones = await this.getAsignacionesByEncuesta(idEncuesta);

                if (asignaciones && Object.keys(asignaciones).length > 0) {
                    alert('⚠️ No se puede eliminar el registro\n\nEste registro tiene asignaciones activas. Debe eliminar primero todas las asignaciones antes de eliminar el registro principal.');
                    return;
                }

                await this.removeRegEnc(idEncuesta);
                alert('✅ Registro eliminado exitosamente\n\nSe ha eliminado el registro de actividades y la encuesta asociada.');
                await this.cargarEncuestas();

            } catch (error) {
                console.error('Error al eliminar registro:', error);
                alert('⚠️ Error al eliminar el registro\n\n' + (error.message || 'Error desconocido. Intente nuevamente.'));
            } finally {
                this.eliminandoRegistro = null;
            }
        },

        cupsGestion(id) {
            sessionStorage.setItem("rutaAnterior", "/sop_psicologo");
            this.$router.push({
                name: "sop_cups",
                params: { idEncuesta: id },
            });
        },

        async cargarEncuestas() {
            this.cargando = true;
            this.errorCarga = null;

            try {
                // Esperar a que App.vue sincronice userData desde localStorage
                let intentos = 0;
                while ((!this.userData || !this.userData.numDocumento) && intentos < 30) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    intentos++;
                }

                if (!this.userData?.numDocumento) {
                    throw new Error('Usuario no disponible despues de esperar');
                }

                await Promise.race([
                    this.getEncuestasPendientesPsicologo({
                        idUsuario: this.userData.numDocumento,
                    }),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Timeout - tardo mas de 10 segundos')), 10000)
                    )
                ]);
            } catch (error) {
                console.error("Error cargando encuestas:", error.message);
                this.errorCarga = error.message || 'Error al cargar encuestas';
            } finally {
                // Esperar un minimo de 500ms para que se vea el spinner
                await new Promise(resolve => setTimeout(resolve, 500));
                this.cargando = false;
                this.$forceUpdate();
            }
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
        cantEncuestasFiltradasPorConvenio() {
            return this.encuestasFiltradasPorConvenio.length;
        }
    },

    watch: {
        '$route': {
            handler: function (to, from) {
                // Se dispara SIEMPRE que la ruta cambia, sin importar el nombre
                // Esto es crítico cuando presionas atrás del navegador
                console.log(`[sop_psicologo watch] Ruta cambió de ${from.name} a ${to.name}`);
                if (to.name === 'sop_psicologo') {
                    console.log('[sop_psicologo watch] Cargando encuestas por cambio de ruta');
                    this.cargarEncuestas();
                }
            },
            deep: true
        }
    },

    async mounted() {
        this.rutaAnterior = this.$route.name;
        this.cargando = true;
        await this.cargarEncuestas();
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

.btn-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
}

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
</style>
