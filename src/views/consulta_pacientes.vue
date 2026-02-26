<template>
  <div class="container-fluid mt-5 pt-3">
    <h3 class="mb-4"><i class="bi bi-search"></i> Consulta de Pacientes</h3>
    <hr />
    
    <!-- FORMULARIO DE BÚSQUEDA -->
    <div class="row">
      <div class="col-6 col-md-3 mb-3">
        <label for="tipodoc" class="form-label">Tipo de Documento</label>
        <select id="tipodoc" v-model="tipodoc" class="form-select" required>
          <option value="">Seleccione</option>
          <option value="RC">Registro Civil</option>
          <option value="TI">Tarjeta de Identidad</option>
          <option value="CC">Cédula de Ciudadanía</option>
          <option value="CE">Cédula de Extranjería</option>
          <option value="NV">Certificado nacido vivo</option>
          <option value="PA">Pasaporte</option>
          <option value="PE">Permiso Especial de Permanencia</option>
          <option value="MS">Menos sin identificacion</option>
          <option value="AS">Adulto sin identificacion</option>
          <option value="PT">Permiso por proteccion temporal</option>
        </select>
      </div>
      <div class="col-6 col-md-3 mb-3">
        <label for="numdoc" class="form-label">Número de Documento</label>
        <input type="text" id="numdoc" v-model="numdoc" class="form-control" required />
      </div>
      <div class="col-6 col-md-2">
        <button class="btn btn-sm btn-primary mt-4" :disabled="cargandoPacientes" @click="consultarP">
          <i class="bi bi-search"></i> Consultar
        </button>
      </div>
    </div>

    <!-- Spinner de consulta -->
    <div class="mt-2">
      <div v-if="cargandoPacientes" class="d-flex align-items-center">
        <div class="spinner-border text-primary me-2" role="status">
          <span class="visually-hidden">Consultando...</span>
        </div>
        <div>Consultando...</div>
      </div>
    </div>

    <div class="container-fluid">
      <div v-if="
        !cargandoPacientes &&
        searchPerformed &&
        (!datosPaciente || datosPaciente.length === 0)
      " class="alert alert-warning">
        No hay registros para esa consulta.
      </div>

      <!-- VISTA DETALLADA DE PACIENTES -->
      <div v-if="datosPaciente && datosPaciente.length > 0">
        <div v-for="(paciente, index) in datosPaciente" :key="paciente.id" class="card mb-4">
          <div class="card-header bg-primary text-white">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <strong>{{ paciente.nombre1 }} {{ paciente.nombre2 }} {{ paciente.apellido1 }} {{ paciente.apellido2 }}</strong>
                <span class="badge bg-light text-dark ms-2">{{ paciente.tipodoc }}-{{ paciente.numdoc }}</span>
                <span class="badge bg-light text-dark ms-2">{{ paciente.eps }}</span>
              </div>
              <!-- Botón de eliminar solo visible para administradores -->
              <button v-if="esAdministrador" class="btn btn-sm btn-danger" type="button" @click="eliminarPaciente(paciente.id)">
                <i class="bi bi-trash"></i> Eliminar
              </button>
            </div>
          </div>
          <div class="card-body">
            <!-- PESTAÑAS -->
            <ul class="nav nav-tabs mb-3" :id="'tabs-' + index" role="tablist">
              <li class="nav-item" role="presentation">
                <button 
                  class="nav-link active" 
                  :id="'tab-encuesta-' + index" 
                  data-bs-toggle="tab"
                  :data-bs-target="'#content-encuesta-' + index"
                  type="button" 
                  role="tab"
                  :aria-controls="'content-encuesta-' + index"
                  aria-selected="true">
                  <i class="bi bi-file-earmark-text"></i> Encuesta
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button 
                  class="nav-link" 
                  :id="'tab-caracteres-' + index" 
                  data-bs-toggle="tab"
                  :data-bs-target="'#content-caracteres-' + index"
                  type="button" 
                  role="tab"
                  :aria-controls="'content-caracteres-' + index"
                  aria-selected="false">
                  <i class="bi bi-card-checklist"></i> Caracterización
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button 
                  class="nav-link" 
                  :id="'tab-asignaciones-' + index" 
                  data-bs-toggle="tab"
                  :data-bs-target="'#content-asignaciones-' + index"
                  type="button" 
                  role="tab"
                  :aria-controls="'content-asignaciones-' + index"
                  aria-selected="false">
                  <i class="bi bi-clipboard-check"></i> Asignaciones (CUPS)
                </button>
              </li>
            </ul>

            <!-- CONTENIDO DE PESTAÑAS -->
            <div class="tab-content" :id="'tabContent-' + index">
              <!-- TAB: ENCUESTA -->
              <div 
                :id="'content-encuesta-' + index" 
                class="tab-pane fade show active" 
                role="tabpanel"
                :aria-labelledby="'tab-encuesta-' + index">
                <div class="table-responsive">
                  <table class="table table-sm table-striped">
                    <tbody>
                      <tr>
                        <th style="width: 30%;">ID Encuesta</th>
                        <td><code>{{ paciente.id }}</code></td>
                      </tr>
                      <tr>
                        <th>Nombre</th>
                        <td>{{ paciente.nombre1 }} {{ paciente.nombre2 }} {{ paciente.apellido1 }} {{ paciente.apellido2 }}</td>
                      </tr>
                      <tr>
                        <th>Documento</th>
                        <td>{{ paciente.tipodoc }} - {{ paciente.numdoc }}</td>
                      </tr>
                      <tr>
                        <th>Fecha Nacimiento</th>
                        <td>{{ paciente.fechaNac }}</td>
                      </tr>
                      <tr>
                        <th>Sexo</th>
                        <td>{{ paciente.sexo }}</td>
                      </tr>
                      <tr>
                        <th>Dirección</th>
                        <td>{{ paciente.direccion }}</td>
                      </tr>
                      <tr>
                        <th>Comuna</th>
                        <td>{{ paciente.barrioVeredacomuna?.comuna || 'N/A' }}</td>
                      </tr>
                      <tr>
                        <th>Barrio</th>
                        <td>{{ paciente.barrioVeredacomuna?.barrio || 'N/A' }}</td>
                      </tr>
                      <tr>
                        <th>EPS</th>
                        <td><strong>{{ paciente.eps }}</strong></td>
                      </tr>
                      <tr>
                        <th>Régimen</th>
                        <td>{{ paciente.regimen || 'N/A' }}</td>
                      </tr>
                      <tr>
                        <th>Población de Riesgo</th>
                        <td>{{ paciente.poblacionRiesgo || 'N/A' }}</td>
                      </tr>
                      <tr>
                        <th>Convenio</th>
                        <td>{{ paciente.convenio || 'N/A' }}</td>
                      </tr>
                      <tr>
                        <th>Fecha Encuesta</th>
                        <td>{{ paciente.fecha || 'N/A' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- TAB: CARACTERIZACIÓN -->
              <div 
                :id="'content-caracteres-' + index" 
                class="tab-pane fade" 
                role="tabpanel"
                :aria-labelledby="'tab-caracteres-' + index">
                <div v-if="paciente.caracterizacion && Object.keys(paciente.caracterizacion).length > 0" class="table-responsive">
                  <table class="table table-sm table-striped">
                    <tbody>
                      <tr v-for="(valor, clave) in paciente.caracterizacion" :key="clave">
                        <th style="width: 30%;">{{ formatearClave(clave) }}</th>
                        <td>{{ formatearValor(valor) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div v-else class="alert alert-info">
                  <i class="bi bi-info-circle"></i> No hay datos de caracterización registrados para esta encuesta.
                  <br>
                  <small class="text-muted">ID Encuesta: {{ paciente.id }}</small>
                </div>
              </div>

              <!-- TAB: ASIGNACIONES (CUPS) -->
              <div 
                :id="'content-asignaciones-' + index" 
                class="tab-pane fade" 
                role="tabpanel"
                :aria-labelledby="'tab-asignaciones-' + index">
                
                <div v-if="paciente.asignaciones && paciente.asignaciones.cups && Object.keys(paciente.asignaciones.cups).length > 0">
                  <table class="table table-sm table-striped table-bordered">
                    <thead class="table-light">
                      <tr>
                        <th>Código</th>
                        <th>Descripción CUPS</th>
                        <th>Actividad</th>
                        <th>Profesional</th>
                        <th>Cantidad</th>
                        <th>Detalle</th>
                        <th>Grupo</th>
                        <th>Convenio</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(cup, cupId) in paciente.asignaciones.cups" :key="cupId">
                        <td>{{ cup.codigo || cup.cupsId || '-' }}</td>
                        <td><strong>{{ cup.DescripcionCUP || cup.cupsNombre || 'Sin descripción' }}</strong></td>
                        <td>{{ getNombreActividad(cup.actividadId) }}</td>
                        <td><span class="badge bg-info">{{ cup.nombreProf || cup.key || 'N/A' }}</span></td>
                        <td class="text-center">{{ cup.cantidad || 1 }}</td>
                        <td>{{ cup.detalle || '-' }}</td>
                        <td>{{ cup.Grupo || '-' }}</td>
                        <td>{{ cup.convenio || '-' }}</td>
                      </tr>
                    </tbody>
                  </table>
                  <div class="alert alert-success mt-2">
                    <i class="bi bi-check-circle"></i> Total de CUPS: <strong>{{ Object.keys(paciente.asignaciones.cups).length }}</strong>
                  </div>
                </div>
                <div v-else class="alert alert-info">
                  <i class="bi bi-info-circle"></i> No hay CUPS asignados para esta encuesta.
                  <br>
                  <small class="text-muted">ID Encuesta: {{ paciente.id }}</small>
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
import { mapState, mapActions } from "vuex";

export default {
  name: "ConsultaPacientes",
  data() {
    return {
      cargandoPacientes: false,
      searchPerformed: false,
      tipodoc: "",
      numdoc: "",
    };
  },
  computed: {
    ...mapState(["datosPaciente", "userData", "actividadesExtra"]),
    esAdministrador() {
      return this.userData && (this.userData.cargo === "Administrador" || this.userData.cargo === "admin");
    }
  },
  methods: {
    ...mapActions([
      "getAllByPacientesID",
      "deletePaciente",
      "deleteActividadesByPacienteId",
      "deleteAsignacionesByPacienteId",
      "getAllActividadesExtra",
    ]),

    async consultarP() {
      if (this.tipodoc === "" || this.numdoc === "") {
        alert("Por favor, complete todos los campos.");
        return;
      }
      this.cargandoPacientes = true;
      this.searchPerformed = true;
      try {
        await this.getAllByPacientesID({
          tipodoc: this.tipodoc,
          numdoc: this.numdoc,
        });
      } catch (error) {
        console.error("[consultarP] Error:", error);
        alert("Error al consultar pacientes: " + error?.message || error);
      } finally {
        this.cargandoPacientes = false;
      }
    },

    getNombreActividad(actividadKey) {
      // Buscar el nombre de la actividad en actividadesExtra por su key
      const actividad = this.actividadesExtra?.find(act => act.key === actividadKey);
      return actividad?.nombre || actividadKey || 'Actividad sin nombre';
    },

    formatearClave(clave) {
      return clave
        .replace(/([A-Z])/g, ' $1')
        .replace(/(_)/g, ' ')
        .trim()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    },

    formatearValor(valor) {
      if (typeof valor === 'boolean') {
        return valor ? '✓ Sí' : '✗ No';
      }
      if (Array.isArray(valor)) {
        return valor.join(', ');
      }
      if (typeof valor === 'object' && valor !== null) {
        return JSON.stringify(valor);
      }
      return valor || 'N/A';
    },

    async eliminarPaciente(idEncuesta) {
      if (!idEncuesta) return;

      // Validar que sea administrador
      if (!this.esAdministrador) {
        alert("⚠️ Solo los administradores pueden eliminar pacientes.");
        return;
      }

      const mensaje = `⚠️ ACCIÓN ADMINISTRATIVA: Esta acción eliminará PERMANENTEMENTE:
      
✓ La encuesta del paciente
✓ Todos los registros de Actividades
✓ Todos los CUPS asignados (Asignaciones)
✓ Toda la Caracterización asociada

¿Está seguro de que desea continuar? 
Esta acción NO se puede deshacer.`;

      const confirmed = confirm(mensaje);
      if (!confirmed) return;

      // Confirmación adicional para mayor seguridad
      const confirmacionFinal = confirm(`⚠️ ÚLTIMA OPORTUNIDAD: ¿Desea eliminar este paciente?\n\nEsta acción NO se puede deshacer.`);
      if (!confirmacionFinal) return;

      try {
        console.log(`[eliminarPaciente] Iniciando eliminación para: ${idEncuesta}`);

        // Eliminar en cascada sin validaciones (modo administrador)
        console.log(`[eliminarPaciente] Modo ADMINISTRADOR - Eliminación cascada sin validación`);

        // 1. Eliminar Asignaciones
        try {
          console.log(`[eliminarPaciente] Paso 1: Eliminando asignaciones...`);
          await this.deleteAsignacionesByPacienteId(idEncuesta);
          console.log(`[eliminarPaciente] Asignaciones eliminadas con éxito`);
        } catch (err) {
          console.warn(`[eliminarPaciente] Advertencia al eliminar asignaciones:`, err?.message || err);
        }

        // 2. Eliminar Actividades
        try {
          console.log(`[eliminarPaciente] Paso 2: Eliminando actividades...`);
          await this.deleteActividadesByPacienteId(idEncuesta);
          console.log(`[eliminarPaciente] Actividades eliminadas con éxito`);
        } catch (err) {
          console.warn(`[eliminarPaciente] Advertencia al eliminar actividades:`, err?.message || err);
        }

        // 3. Eliminar Encuesta
        try {
          console.log(`[eliminarPaciente] Paso 3: Eliminando encuesta...`);
          await this.deletePaciente(idEncuesta);
          console.log(`[eliminarPaciente] Encuesta eliminada con éxito`);
        } catch (err) {
          console.warn(`[eliminarPaciente] Advertencia al eliminar encuesta:`, err?.message || err);
        }

        alert("✅ Registro eliminado exitosamente\n\nSe ha eliminado la encuesta y todos sus datos asociados.");
        
        // Limpiar los datos del paciente
        this.tipodoc = "";
        this.numdoc = "";
        this.searchPerformed = false;

      } catch (error) {
        console.error(`[eliminarPaciente] Error general:`, error);
        alert("❌ Error al eliminar el registro: " + (error?.message || error));
      }
    },
  },
  async mounted() {
    try {
      await this.getAllActividadesExtra();
    } catch (error) {
      console.error("[ConsultaPacientes] Error al cargar actividades extra:", error);
    }
  }
};
</script>

<style scoped>
.card {
  border-radius: 0.5rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.table-responsive {
  border-radius: 0.25rem;
}

code {
  background-color: #f0f0f0;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.85rem;
}
</style>
