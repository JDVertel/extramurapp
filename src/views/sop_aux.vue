<template>
  <div>
    <div v-if="cargando" class="spinner-overlay">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <div class="spinner-message">Por favor espere, cargando información...</div>
    </div>
    <div v-if="!cargando">
      <h1 class="display-6 center">{{ userData.cargo }}</h1>
      <div class="alert alert-warning shadow-sm  d-flex justify-content-between align-items-center" role="alert">
        Realizar nueva encuesta <RouterLink class="btn btn-warning" to="/sop_encuesta">
          <i class="bi bi-file-earmark-plus-fill"></i> <br />

        </RouterLink>
      </div>


      <div class="container-fluid">
      <h4>Detalle de Actividades ({{ cantEncuestas }}) <small>Pendientes</small></h4>

      <!-- Mensaje cuando no hay registros -->
      <div v-if="!encuestas || encuestas.length === 0" class="alert alert-success shadow-sm text-center" role="alert">
        <i class="bi bi-check-circle-fill" style="font-size: 3rem;"></i>
        <h5 class="mt-3">¡Todo OK!</h5>
        <p class="mb-0">No hay registros pendientes en este momento.</p>
      </div>

      <div v-else class="container-fluid" style="max-height: 500px; overflow-y: auto ">
        <div v-for="(encuesta, index) in encuestas" :key="index" class="container rounded-lg p-2 mb-2"
          style="border-radius: 24px;">
          <div class="row paciente shadow-sm">
            <div class="col-6 col-md-6">
              <small class="d-block"><strong>{{ encuesta.nombre1 }} {{ encuesta.apellido1 }}</strong></small>
              <small class="text-muted d-block">EPS: {{ encuesta.eps }} | Riesgo: {{ encuesta.poblacionRiesgo }}</small>
              <small class="text-muted d-block">Nac: {{ encuesta.fechaNac }} | Enc: {{ encuesta.fecha }}</small>
            </div>

            <div class="col-6 col-md-6 acciones-col ">
              <div class="btn-grid">
                <!-- Fila única: Visita, Caracterización y CUPS (3 botones) -->
                <div class="btn-row">
                  <!-- Visita (solo Auxiliar de enfermeria) -->
                  <template v-if="userData.cargo === 'Auxiliar de enfermeria'">
                    <div v-if="encuesta.Agenda_Visitamedica?.cita_visitamedica === false">
                      <button type="button" class="btn btn-info rounded-circle agendar-btn"
                        @click="Agendar(encuesta.id, 'visitamedica')">
                        <i class="bi bi-houses"></i>
                        <span class="agendar-label">Visita</span>
                      </button>
                    </div>
                    <div v-else-if="encuesta.Agenda_Visitamedica?.cita_visitamedica === undefined">
                      <button type="button" class="btn btn-info rounded-circle agendar-btn"
                        @click="Agendar(encuesta.id, 'visitamedica')">
                        <i class="bi bi-houses"></i>
                        <span class="agendar-label">Visita</span>
                      </button>
                    </div>
                    <div v-else>
                      <button type="button" class="btn btn-secondary rounded-circle agendar-btn" disabled>
                        <i class="bi bi-check2-circle"></i>
                        <span class="agendar-label">Visita</span>
                      </button>
                    </div>
                  </template>

                  <!-- Caracterización (solo Auxiliar de enfermeria) -->
                  <template v-if="userData.cargo === 'Auxiliar de enfermeria'">
                    <div v-if="encuesta.status_caracterizacion === false">
                      <button type="button" class="btn btn-warning rounded-circle agendar-btn"
                        @click="Caracterizar(encuesta.id)">
                        <i class="bi bi-calendar2-check"></i>
                        <span class="agendar-label">Caract</span>
                      </button>
                    </div>
                    <div v-else>
                      <button type="button" class="btn btn-secondary rounded-circle agendar-btn" disabled>
                        <i class="bi bi-check2-circle"></i>
                        <span class="agendar-label">Caract</span>
                      </button>
                    </div>
                  </template>

                  <!-- CUPS (Auxiliar de enfermeria y Medico) -->
                  <div
                    v-if="encuesta.status_caracterizacion === true && (userData.cargo === 'Auxiliar de enfermeria' || userData.cargo === 'Medico')">
                    <button type="button" class="btn btn-danger rounded-circle agendar-btn"
                      @click="cupsGestion(encuesta.id)">
                      <i class="bi bi-calendar2-heart-fill"></i>
                      <span class="agendar-label">Cups</span>
                    </button>
                  </div>

                  <!-- Botón Eliminar (solo Auxiliar de enfermeria) -->
                  <template v-if="userData.cargo === 'Auxiliar de enfermeria'">
                    <div>
                      <button type="button" class="btn btn-outline-danger rounded-circle agendar-btn"
                        @click="eliminarRegistro(encuesta.id)"
                        :disabled="eliminandoRegistro === encuesta.id"
                        :title="'Eliminar registro'">
                        <i class="bi bi-trash" v-if="eliminandoRegistro !== encuesta.id"></i>
                        <i class="bi bi-hourglass-split" v-else></i>
                        <span class="agendar-label">{{ eliminandoRegistro === encuesta.id ? 'Verif' : 'Elim' }}</span>
                      </button>
                    </div>
                  </template>
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
      eliminandoRegistro: null, // Para mostrar estado de carga durante eliminación
    };
  },
  methods: {
    ...mapActions([
      "removeRegEnc",
      "getAllRegistersByFechaStatus",
      "getAllRegistersByIduser",
      "getAllRegistersByFecha",
      " SelectExistenteAgendas",
      "getAsignacionesByEncuesta", // Añadimos la acción para consultar asignaciones
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

    // Nueva función para eliminar registro con validación
    async eliminarRegistro(idEncuesta) {
      if (!confirm('¿Está seguro de que desea eliminar este registro?\n\nEsta acción eliminará el registro de actividades y la encuesta asociada.')) {
        return;
      }

      this.eliminandoRegistro = idEncuesta;

      try {
        // Verificar si el registro tiene asignaciones
        const asignaciones = await this.getAsignacionesByEncuesta(idEncuesta);
        
        if (asignaciones && Object.keys(asignaciones).length > 0) {
          alert('â ️ No se puede eliminar el registro\n\nEste registro tiene asignaciones activas. Debe eliminar primero todas las asignaciones antes de eliminar el registro principal.');
          return;
        }

        // Si no tiene asignaciones, proceder con la eliminación
        await this.removeRegEnc(idEncuesta);
        
        alert('✅ Registro eliminado exitosamente\n\nSe ha eliminado el registro de actividades y la encuesta asociada.');
        
        // Recargar los datos
        await this.getAllRegistersByFechaStatus({
          idUsuario: this.userData.numDocumento,
        });

      } catch (error) {
        console.error('Error al eliminar registro:', error);
        alert('⚠️ Error al eliminar el registro\n\n' + (error.message || 'Error desconocido. Intente nuevamente.'));
      } finally {
        this.eliminandoRegistro = null;
      }
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
      sessionStorage.setItem("rutaAnterior", "/sop_aux");
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
  },

  computed: {
    ...mapState(["encuestas", "userData", "cantEncuestas", "encuestasToday"]),

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
      //encuestas diarias + contador
      // await this.getAllRegistersByFecha({
      //   idUsuario: this.userData.numDocumento,
      // fecha: this.fechaActual,
      //});
      //encuestas abiertas
      await this.getAllRegistersByFechaStatus({
        idUsuario: this.userData.numDocumento,
      });
    } catch (error) {
      console.error("Error en mounted de sop_aux:", error);
      alert("Error cargando encuestas: " + (error?.message || error));
    } finally {
    }
    this.cargando = false;
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
