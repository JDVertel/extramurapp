<template>
  <div v-if="cargando" class="spinner-overlay">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Cargando...</span>
    </div>
    <div class="spinner-message">Por favor espere, cargando información...</div>
  </div>
  <div v-if="!cargando">
    <h1 class="display-6 center">{{ userData.cargo }}</h1>

    <div class="row">
      <div class="col-4 center">
        <h6 class="display-6">{{ cantEncuestas }}</h6>
        <p>Pendientes</p>
      </div>
      <div class="col-4 center">
        <h6 class="display-6">{{ encuestasToday.length }}</h6>
        <p>Diarias</p>
      </div>
      <div class="col-4 center">
        <RouterLink class="btn btn-warning btn-sm" to="/sop_encuesta">
          <i class="bi bi-file-earmark-plus-fill"></i> <br />
          Agregar
        </RouterLink>
      </div>
    </div>

    <ul class="nav nav-tabs" id="myTab" role="tablist">
      <li class="nav-item" role="presentation">
        <button
          class="nav-link active"
          id="contact-tab"
          data-bs-toggle="tab"
          data-bs-target="#contact-tab-pane"
          type="button"
          role="tab"
          aria-controls="contact-tab-pane"
          aria-selected="false"
        >
          Abiertas
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button
          class="nav-link"
          id="today-tab"
          data-bs-toggle="tab"
          data-bs-target="#today-tab-pane"
          type="button"
          role="tab"
          aria-controls="wait-tab-pane"
          aria-selected="true"
        >
          Diarias
        </button>
      </li>
    </ul>
    <div class="tab-content" id="myTabContent">
      <div
        class="tab-pane fade show active"
        id="contact-tab-pane"
        role="tabpanel"
        aria-labelledby="contact-tab"
        tabindex="0"
      >
        <h5>Encuestas Pendientes x visita</h5>
        <br />
        <div class="container-fluid">
          <h4>Detalle de Actividades</h4>
          <hr />
          <div class="container-fluid" style="max-height: 500px; overflow-y: auto">
            <div v-for="(encuesta, index) in encuestas" :key="index">
              <div class="row">
                <div class="col-12 col-md-2 paciente">
                  <small>
                    <strong
                      >Paciente: {{ encuesta.nombre1 }} {{ encuesta.nombre2 }}
                      {{ encuesta.apellido1 }} {{ encuesta.apellido2 }} </strong
                    >
                    <hr />
                    <strong>Eps:</strong>{{ encuesta.eps }}
                    <hr />
                    <strong>F Nacimiento:</strong> {{ encuesta.fechaNac }}
                  </small>
                </div>
                <div class="col-12 col-md-3 Riesgos">
                  <small
                    ><strong>F Encuesta:</strong>
                    <strong>{{ encuesta.fecha }}</strong></small
                  >
                  <hr />
                  <small>
                    <strong>P Riesgo:</strong> {{ encuesta.poblacionRiesgo }}</small
                  >
                </div>
                <div
                  class="d-none d-md-block border-start border-1 border-secondary h-100"
                  style="width: 0; min-height: 80px"
                ></div>
                <div class="col-12 col-md-3 Actividades">
                  <small>
                    <strong>Actividades:</strong>
                    {{ this.nombresActividades(encuesta.tipoActividad) }}</small
                  >
                </div>
                <div
                  class="d-none d-md-block border-start border-1 border-secondary h-100"
                  style="width: 0; min-height: 80px"
                ></div>
                <div class="col-12 col-md-2 acciones-col">
                  <div class="btn-group" role="group" aria-label="Basic example">
                    <div
                      v-if="encuesta.Agenda_tomademuestras?.cita_tomamuestras === false"
                    >
                      <button
                        type="button"
                        class="btn btn-success btn-sm rounded-circle agendar-btn"
                        @click="Agendar(encuesta.id, 'tomamuestras')"
                      >
                        <i class="bi bi-droplet-half"></i>
                        <span class="agendar-label">Lab</span>
                      </button>
                    </div>
                    <div
                      v-else-if="
                        encuesta.Agenda_tomademuestras?.cita_tomamuestras === undefined
                      "
                    >
                      <button
                        type="button"
                        class="btn btn-success btn-sm rounded-circle agendar-btn"
                        @click="Agendar(encuesta.id, 'tomamuestras')"
                      >
                        <i class="bi bi-droplet-half"></i>
                        <span class="agendar-label">Lab</span>
                      </button>
                    </div>

                    <div v-else>
                      <button
                        type="button"
                        class="btn btn-secondary btn-sm rounded-circle agendar-btn"
                        disabled
                      >
                        <i class="bi bi-check2-circle"></i>
                        <span class="agendar-label">Lab</span>
                      </button>
                    </div>

                    <div v-if="encuesta.Agenda_Visitamedica?.cita_visitamedica === false">
                      <button
                        type="button"
                        class="btn btn-info btn-sm rounded-circle agendar-btn"
                        @click="Agendar(encuesta.id, 'visitamedica')"
                      >
                        <i class="bi bi-houses"></i>
                        <span class="agendar-label">Visita</span>
                      </button>
                    </div>
                    <div
                      v-else-if="
                        encuesta.Agenda_Visitamedica?.cita_visitamedica === undefined
                      "
                    >
                      <button
                        type="button"
                        class="btn btn-info btn-sm rounded-circle agendar-btn"
                        @click="Agendar(encuesta.id, 'visitamedica')"
                      >
                        <i class="bi bi-houses"></i>
                        <span class="agendar-label">Visita</span>
                      </button>
                    </div>
                    <div v-else>
                      <button
                        type="button"
                        class="btn btn-secondary btn-sm rounded-circle agendar-btn"
                        disabled
                      >
                        <i class="bi bi-check2-circle"></i>
                        <span class="agendar-label">Visita</span>
                      </button>
                    </div>

                    <div v-if="encuesta.status_caracterizacion === false">
                      <button
                        type="button"
                        class="btn btn-warning btn-sm rounded-circle agendar-btn"
                        @click="Caracterizar(encuesta.id)"
                      >
                        <i class="bi bi-calendar2-check"></i>
                        <span class="agendar-label">Caract</span>
                      </button>
                    </div>
                    <div v-else>
                      <button
                        type="button"
                        class="btn btn-secondary btn-sm rounded-circle agendar-btn"
                        disabled
                      >
                        <i class="bi bi-check2-circle"></i>
                        <span class="agendar-label">Caract</span>
                      </button>
                    </div>

                    <div>
                      <button
                        type="button"
                        class="btn btn-danger btn-sm rounded-circle agendar-btn"
                        @click="cupsGestion(encuesta.id)"
                      >
                        <i class="bi bi-calendar2-heart-fill"></i>
                        <span class="agendar-label">Cups</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <hr />
            </div>
          </div>
        </div>
      </div>
      <div
        class="tab-pane fade"
        id="today-tab-pane"
        role="tabpanel"
        aria-labelledby="today-tab"
        tabindex="0"
      >
        <h5>Encuestas Diarias</h5>

        <table class="table table-striped table-sm">
          <thead>
            <tr>
              <th scope="col">Detalle</th>

              <th scope="col">Opciones</th>
            </tr>
          </thead>
          <tbody class="table-group-divider">
            <tr v-for="(encuesta, index) in this.encuestasToday" :key="index">
              <td>
                Paciente: {{ encuesta.nombre1 }} {{ encuesta.apellido1 }}
                <hr />
                Actividades:{{ this.nombresActividades(encuesta.tipoActividad) }}
                <hr />
                P Riesgo: {{ encuesta.poblacionRiesgo }}
              </td>

              <td>
                <div class="col-4">
                  <button
                    type="button"
                    class="btn btn-danger btn-sm"
                    @click="removeRegEncuesta(encuesta.id)"
                    v-if="encuesta.status_tomamuestras == ''"
                  >
                    <i class="bi bi-x-circle"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
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
      this.$router.push({
        name: "sop_cups",
        params: {
          idEncuesta: id,
        },
      });
    },

    nombresActividades(act) {
      // Devuelve un array solo con los nombres
      return Object.values(act).map((a) => a.nombre);
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
      await this.getAllRegistersByFecha({
        idUsuario: this.userData.numDocumento,
        fecha: this.fechaActual,
      });
      //encuestas abiertas
      await this.getAllRegistersByFechaStatus({
        idUsuario: this.userData.numDocumento,
      });
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

.btn-group {
  display: flex !important;
  justify-content: center;
  gap: 8px;
  width: auto;
  /* Hace que el grupo ocupe todo el ancho del contenedor padre */
}

.acciones-col {
  display: flex;
  align-items: center;
  justify-content: center;
}

.agendar-btn {
  width: 44px;
  height: 44px;
  padding: 0;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  line-height: 1;
}

.agendar-btn i {
  font-size: 14px;
}

.agendar-label {
  font-size: 9px;
}
</style>
