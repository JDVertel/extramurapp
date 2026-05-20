<template>
  <div class="container-fluid py-3 admin-facturados">
    <div class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
      <div>
        <h1 class="mb-1"><i class="bi bi-database-fill-gear"></i> Archivo de facturación</h1>
        <p class="text-muted mb-0">
          Traslada pacientes con facturación cerrada a Facturados y libera Encuesta, Actividades y Asignaciones.
        </p>
      </div>
      <button type="button" class="btn btn-outline-secondary" @click="consultarResumenPacientes" :disabled="iniciandoProceso || reparandoRespaldos || restaurandoOriginales || consultandoResumen">
        <span v-if="consultandoResumen" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
        <i v-else class="bi bi-search"></i> {{ consultandoResumen ? 'Consultando...' : 'Consultar datos' }}
      </button>
    </div>

    <div class="row g-4">
      <div class="col-12 col-xl-4">
        <div class="card shadow-sm h-100">
          <div class="card-body">
            <h5 class="card-title">Nuevo procesamiento por lote</h5>
            <p class="text-muted small">
              Defina el rango de fechas y la cantidad máxima de pacientes que desea mover en esta ejecución.
            </p>

            <div class="row g-3 mb-3">
              <div class="col-12 col-md-6 col-xl-12">
                <label for="fechaInicio" class="form-label">Fecha inicial</label>
                <input id="fechaInicio" v-model="fechaInicio" type="date" class="form-control" />
              </div>
              <div class="col-12 col-md-6 col-xl-12">
                <label for="fechaFin" class="form-label">Fecha final</label>
                <input id="fechaFin" v-model="fechaFin" type="date" class="form-control" />
              </div>
            </div>

            <label for="tamano-lote" class="form-label">Pacientes a procesar</label>
            <input
              id="tamano-lote"
              v-model.number="lotePacientes"
              type="number"
              min="1"
              step="1"
              class="form-control"
              placeholder="Ej: 50"
            />

            <div class="form-text mb-3">
              Se archivarán primero los más antiguos dentro del rango indicado.
            </div>

            <div class="alert alert-light border small mb-3">
              <div><strong>Disponibles en el rango:</strong> {{ totalCandidatosRango }}</div>
              <div><strong>Se moverán en este lote:</strong> {{ totalSeleccionadosLote }}</div>
            </div>

            <button
              type="button"
              class="btn btn-outline-primary w-100 mb-2"
              :disabled="consultandoResumen || iniciandoProceso || reparandoRespaldos || restaurandoOriginales || !rangoValido"
              @click="consultarResumenPacientes"
            >
              <span v-if="consultandoResumen" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
              <i v-else class="bi bi-search"></i>
              {{ consultandoResumen ? 'Consultando pacientes...' : 'Consultar pacientes' }}
            </button>

            <div class="form-text mb-3" :class="consultandoResumen ? 'text-primary' : 'text-muted'">
              {{ mensajeEstadoConsulta }}
            </div>

            <div v-if="consultandoResumen" class="border rounded p-2 mb-3 bg-light-subtle">
              <div class="d-flex justify-content-between align-items-center small mb-1">
                <strong>Estado de consulta</strong>
                <span>Consultando...</span>
              </div>
              <div class="progress" role="progressbar" aria-label="Estado de consulta" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="height: 10px;">
                <div class="progress-bar progress-bar-striped progress-bar-animated" style="width: 100%"></div>
              </div>
            </div>

            <button
              type="button"
              class="btn btn-primary w-100"
              :disabled="iniciandoProceso || reparandoRespaldos || consultandoResumen || !puedeIniciarProceso"
              @click="iniciarProceso"
            >
              <i class="bi bi-play-circle"></i>
              {{ iniciandoProceso ? 'Procesando lote...' : 'Iniciar vaciado' }}
            </button>

            <button
              type="button"
              class="btn btn-outline-warning w-100 mt-2"
              :disabled="iniciandoProceso || reparandoRespaldos || restaurandoOriginales || totalArchivados === 0"
              @click="reconstruirRespaldosArchivados"
            >
              <i class="bi bi-wrench-adjustable-circle"></i>
              {{ reparandoRespaldos ? 'Reconstruyendo respaldos...' : 'Reconstruir respaldos archivados' }}
            </button>

            <button
              type="button"
              class="btn btn-outline-success w-100 mt-2"
              :disabled="!puedeRestaurarArchivados"
              @click="restaurarArchivadosATablasOriginales"
            >
              <span v-if="restaurandoOriginales" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
              <i v-else class="bi bi-arrow-counterclockwise"></i>
              {{ restaurandoOriginales ? 'Restaurando tablas originales...' : 'Restaurar archivados a tablas originales' }}
            </button>

            <div class="form-text mt-2" :class="puedeRestaurarArchivados ? 'text-muted' : 'text-warning'">
              {{ mensajeEstadoRestauracion }}
            </div>

            <div class="alert alert-light border small mt-3 mb-0">
              <div><strong>ArchivoPacientesRespaldo:</strong> {{ totalArchivados }} registros completos por paciente.</div>
              <div><strong>Facturados:</strong> {{ totalFilasFacturados }} filas planas para consulta e informes.</div>
              <div class="text-muted mt-1">La restauración a tablas originales usa ArchivoPacientesRespaldo, no el total de filas de Facturados.</div>
            </div>

            <div v-if="restaurandoOriginales && trabajoActual" class="border rounded p-2 mt-3 bg-light-subtle">
              <div class="d-flex justify-content-between align-items-center small mb-1">
                <strong>Progreso de restauración</strong>
                <span>{{ porcentajeTrabajo }}%</span>
              </div>
              <div class="progress" role="progressbar" aria-label="Progreso de restauración" :aria-valuenow="porcentajeTrabajo" aria-valuemin="0" aria-valuemax="100" style="height: 10px;">
                <div class="progress-bar progress-bar-striped progress-bar-animated" :style="{ width: `${porcentajeTrabajo}%` }"></div>
              </div>
              <div class="small text-muted mt-2">{{ trabajoActual.message || 'Preparando restauración...' }}</div>
            </div>

            <div v-if="mensajeFormulario" class="alert alert-info mt-3 mb-0 py-2">
              {{ mensajeFormulario }}
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-xl-8">
        <div class="card shadow-sm h-100">
          <div class="card-body">
            <div class="row g-3 mb-3">
              <div class="col-12 col-md-4">
                <div class="metric-card metric-card-highlight">
                  <div class="metric-label">Pendientes en base</div>
                  <div class="metric-value">{{ pendientesEnBase }}</div>
                  <div class="small text-muted mt-1">Facturados que siguen en Encuesta</div>
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="metric-card">
                  <div class="metric-label">Respaldos completos restaurables</div>
                  <div class="metric-value">{{ totalArchivados }}</div>
                  <div class="small text-muted mt-1">Entradas top-level en ArchivoPacientesRespaldo</div>
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="metric-card">
                  <div class="metric-label">Total cerrado detectado</div>
                  <div class="metric-value">{{ totalFacturadosDetectados }}</div>
                  <div class="small text-muted mt-1">Pendientes en base + archivados</div>
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="metric-card">
                  <div class="metric-label">Elegibles en rango</div>
                  <div class="metric-value">{{ totalCandidatosRango }}</div>
                  <div class="small text-muted mt-1">Filtrados por fecha y ordenados del más antiguo al más reciente</div>
                </div>
              </div>
            </div>

            <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
              <h5 class="card-title mb-0">Proceso actual</h5>
              <span class="badge text-bg-secondary" v-if="trabajoActual">
                {{ trabajoActual.status || 'Sin estado' }}
              </span>
            </div>

            <div v-if="trabajoActual">
              <div class="progress mb-3" role="progressbar" aria-label="Progreso del archivo" :aria-valuenow="porcentajeTrabajo" aria-valuemin="0" aria-valuemax="100" style="height: 24px;">
                <div class="progress-bar progress-bar-striped" :class="barraProgresoClase" :style="{ width: `${porcentajeTrabajo}%` }">
                  {{ porcentajeTrabajo }}%
                </div>
              </div>

              <div class="row g-3 mb-3">
                <div class="col-6 col-md-3">
                  <div class="metric-card">
                    <div class="metric-label">Procesados</div>
                    <div class="metric-value">{{ trabajoActual.processedCount || 0 }}</div>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="metric-card">
                    <div class="metric-label">Pendientes</div>
                    <div class="metric-value">{{ trabajoActual.remainingCount || 0 }}</div>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="metric-card">
                    <div class="metric-label">Seleccionados</div>
                    <div class="metric-value">{{ trabajoActual.totalSelected || 0 }}</div>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="metric-card">
                    <div class="metric-label">Errores</div>
                    <div class="metric-value">{{ trabajoActual.errorCount || 0 }}</div>
                  </div>
                </div>
                <div class="col-6 col-md-3" v-if="trabajoActual.conflictCount !== undefined">
                  <div class="metric-card">
                    <div class="metric-label">Conflictos</div>
                    <div class="metric-value">{{ trabajoActual.conflictCount || 0 }}</div>
                  </div>
                </div>
              </div>

              <div class="alert" :class="estadoClaseTrabajo" role="alert">
                <strong>Estado:</strong> {{ trabajoActual.message || 'Sin novedades.' }}
              </div>

              <div class="small text-muted d-flex flex-wrap gap-3">
                <span><strong>Trabajo:</strong> {{ trabajoActualId }}</span>
                <span><strong>Solicitado:</strong> {{ formatearFecha(trabajoActual.requestedAt) }}</span>
                <span v-if="trabajoActual.startedAt"><strong>Inicio:</strong> {{ formatearFecha(trabajoActual.startedAt) }}</span>
                <span v-if="trabajoActual.finishedAt"><strong>Fin:</strong> {{ formatearFecha(trabajoActual.finishedAt) }}</span>
                <span v-if="trabajoActual.currentEncuestaId"><strong>Paciente actual:</strong> {{ trabajoActual.currentEncuestaId }}</span>
              </div>

              <div v-if="Array.isArray(trabajoActual.errors) && trabajoActual.errors.length" class="mt-3">
                <h6>Errores registrados</h6>
                <ul class="list-group list-group-flush border rounded small">
                  <li v-for="error in trabajoActual.errors" :key="`${error.encuestaId}-${error.message}`" class="list-group-item">
                    <strong>{{ error.encuestaId }}:</strong> {{ error.message }}
                  </li>
                </ul>
              </div>

              <div v-if="Array.isArray(trabajoActual.conflicts) && trabajoActual.conflicts.length" class="mt-3">
                <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                  <h6 class="mb-0">Conflictos detectados</h6>
                  <button type="button" class="btn btn-sm btn-outline-success" @click="exportarConflictosCsv">
                    <i class="bi bi-filetype-csv"></i> Exportar conflictos
                  </button>
                </div>
                <ul class="list-group list-group-flush border rounded small">
                  <li v-for="conflict in trabajoActual.conflicts" :key="`${conflict.encuestaId}-${conflict.type}-${conflict.path}`" class="list-group-item">
                    <strong>{{ conflict.encuestaId }}:</strong>
                    {{ conflict.message }}
                    <span v-if="conflict.path" class="text-muted">({{ conflict.path }})</span>
                  </li>
                </ul>
              </div>
            </div>

            <div v-else class="alert alert-secondary mb-0">
              No hay un proceso en ejecución. Ajuste el rango, revise los pacientes listos y lance el vaciado.
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card shadow-sm mt-4">
      <div class="card-body">
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <div>
            <h5 class="card-title mb-0">Pacientes listos para vaciar</h5>
            <div class="small text-muted">Listado según Fecha Facturación o la última fecha de gestión disponible.</div>
          </div>
          <span class="badge text-bg-dark">{{ totalCandidatosRango }} candidatos</span>
        </div>

        <div v-if="!rangoValido" class="alert alert-warning mb-0">
          Defina una fecha inicial y una fecha final válidas para listar pacientes.
        </div>

        <div v-else-if="!resumenCargado" class="alert alert-secondary mb-0">
          La lista de pacientes no se consulta automáticamente. Pulse "Consultar pacientes" para cargarla.
        </div>

        <div v-else-if="filtrosConsultaPendientes" class="alert alert-warning mb-0">
          El rango cambió después de la última consulta. Pulse "Consultar pacientes" para actualizar la lista.
        </div>

        <div v-else-if="!candidatosPreview.length" class="alert alert-light mb-0">
          No hay pacientes facturados listos para mover en el rango seleccionado.
        </div>

        <div v-else class="table-responsive">
          <table class="table table-sm table-striped align-middle mb-0">
            <thead>
              <tr>
                <th>Id encuesta</th>
                <th>Paciente</th>
                <th>Documento</th>
                <th>Convenio</th>
                <th>Fecha base</th>
                <th>Factura</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="paciente in candidatosPreview" :key="paciente.id">
                <td>{{ paciente.id }}</td>
                <td>{{ nombrePaciente(paciente) }}</td>
                <td>{{ documentoPaciente(paciente) }}</td>
                <td>{{ paciente.convenio || '' }}</td>
                <td>{{ paciente.FechaFacturacion || paciente.fechagestEnfermera || paciente.fechagestMedica || paciente.fecha || '' }}</td>
                <td>{{ paciente.FactNum || paciente.factura || '' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="card shadow-sm mt-4">
      <div class="card-body">
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <div>
            <h5 class="card-title mb-0">Datos guardados en Facturados</h5>
            <div class="small text-muted">Aquí se ven las filas reales almacenadas del informe general.</div>
          </div>
          <span class="badge text-bg-primary">{{ totalFilasFacturados }} filas</span>
        </div>

        <div v-if="!filasFacturadosPreview.length" class="alert alert-light mb-0">
          Aún no hay filas visibles en Facturados para mostrar en la tabla.
        </div>

        <div v-else class="table-responsive">
          <table class="table table-sm table-striped align-middle mb-0">
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Documento</th>
                <th>Convenio</th>
                <th>Actividad</th>
                <th>CUPS</th>
                <th>Factura</th>
                <th>Fecha Facturación</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="fila in filasFacturadosPreview" :key="fila.id">
                <td>{{ fila.paciente || '' }}</td>
                <td>{{ fila.documento || '' }}</td>
                <td>{{ fila.convenio || '' }}</td>
                <td>{{ fila.actividad || '' }}</td>
                <td>{{ fila.cupsNombre || fila.procedimiento || '' }}</td>
                <td>{{ fila.factura || '' }}</td>
                <td>{{ fila.fechaFacturacion || fila.fechaFactCUP || '' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import firebase_api from "@/api/ApiFirebase";
import { cacheManager } from "@/utils/cacheManager";
import { buildArchivePayload, getEligibleFacturadosByDate, normalizeFacturados } from "@/utils/facturadosArchive";
import { mapState } from "vuex";

const ARCHIVE_BACKUP_PATH = "/ArchivoPacientesRespaldo";

function formatDateInput(date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function buildDefaultRange() {
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - 30);
  return {
    fechaInicio: formatDateInput(start),
    fechaFin: formatDateInput(today),
  };
}

export default {
  data() {
    const defaultRange = buildDefaultRange();
    return {
      lotePacientes: 50,
      fechaInicio: defaultRange.fechaInicio,
      fechaFin: defaultRange.fechaFin,
      fechaInicioConsulta: "",
      fechaFinConsulta: "",
      iniciandoProceso: false,
      reparandoRespaldos: false,
      restaurandoOriginales: false,
      consultandoResumen: false,
      resumenCargado: false,
      mensajeFormulario: "",
      encuestasRaw: {},
      trabajoActual: null,
      trabajoActualId: "",
      pendientesEnBase: 0,
      totalArchivados: 0,
      totalFilasFacturados: 0,
      filasFacturadosPreview: [],
    };
  },
  computed: {
    ...mapState(["userData", "uid"]),
    rangoValido() {
      return !!this.fechaInicio && !!this.fechaFin && this.fechaInicio <= this.fechaFin;
    },
    filtrosConsultaPendientes() {
      return this.resumenCargado && (
        this.fechaInicio !== this.fechaInicioConsulta ||
        this.fechaFin !== this.fechaFinConsulta
      );
    },
    candidatosDisponibles() {
      if (!this.resumenCargado || !this.fechaInicioConsulta || !this.fechaFinConsulta) return [];
      return getEligibleFacturadosByDate(this.encuestasRaw, {
        fechaInicio: this.fechaInicioConsulta,
        fechaFin: this.fechaFinConsulta,
      });
    },
    totalCandidatosRango() {
      return this.candidatosDisponibles.length;
    },
    totalSeleccionadosLote() {
      return Math.min(Number(this.lotePacientes || 0), this.totalCandidatosRango);
    },
    candidatosPreview() {
      return this.candidatosDisponibles.slice(0, 20);
    },
    puedeIniciarProceso() {
      return this.resumenCargado && !this.filtrosConsultaPendientes && this.rangoValido && Number.isFinite(this.lotePacientes) && Number(this.lotePacientes) > 0 && this.totalCandidatosRango > 0;
    },
    puedeRestaurarArchivados() {
      return !this.iniciandoProceso && !this.reparandoRespaldos && !this.restaurandoOriginales && Number(this.totalArchivados || 0) > 0;
    },
    mensajeEstadoRestauracion() {
      if (this.restaurandoOriginales) {
        return "La restauración está en curso. Puede seguir el avance en la barra de progreso.";
      }

      if (this.iniciandoProceso) {
        return "La restauración está bloqueada mientras hay un vaciado en ejecución.";
      }

      if (this.reparandoRespaldos) {
        return "La restauración está bloqueada mientras se reconstruyen respaldos.";
      }

      if (Number(this.totalArchivados || 0) <= 0) {
        return "No hay registros en ArchivoPacientesRespaldo disponibles para restaurar.";
      }

      return `Listo para restaurar ${this.totalArchivados} registro(s) completos desde ArchivoPacientesRespaldo a las tablas originales.`;
    },
    mensajeEstadoConsulta() {
      if (this.consultandoResumen) {
        return "Consultando pacientes y resumen del archivo. Espere a que termine el proceso.";
      }

      if (!this.rangoValido) {
        return "Defina una fecha inicial y final válidas antes de consultar pacientes.";
      }

      if (this.filtrosConsultaPendientes) {
        return "Cambió el rango de fechas. Pulse 'Consultar pacientes' para actualizar la lista y los conteos.";
      }

      if (!this.resumenCargado) {
        return "La consulta inicial no se ejecuta automáticamente. Use el botón 'Consultar pacientes'.";
      }

      return `Consulta cargada para el rango ${this.fechaInicioConsulta} a ${this.fechaFinConsulta}. Se detectaron ${this.totalCandidatosRango} paciente(s) elegibles.`;
    },
    porcentajeTrabajo() {
      if (!this.trabajoActual) return 0;
      const total = Number(this.trabajoActual.totalSelected || 0);
      const processed = Number(this.trabajoActual.processedCount || 0);
      if (!total) {
        return ["completed", "completed_with_errors", "error"].includes(this.trabajoActual.status) ? 100 : 0;
      }
      return Math.max(0, Math.min(100, Math.round((processed / total) * 100)));
    },
    barraProgresoClase() {
      if (!this.trabajoActual) return "bg-secondary";
      if (this.trabajoActual.status === "completed") return "bg-success";
      if (this.trabajoActual.status === "completed_with_errors") return "bg-warning";
      if (this.trabajoActual.status === "error") return "bg-danger";
      return "bg-primary progress-bar-animated progress-bar-striped";
    },
    estadoClaseTrabajo() {
      if (!this.trabajoActual) return "alert-secondary";
      if (this.trabajoActual.status === "completed") return "alert-success";
      if (this.trabajoActual.status === "completed_with_errors") return "alert-warning";
      if (this.trabajoActual.status === "error") return "alert-danger";
      return "alert-info";
    },
    totalFacturadosDetectados() {
      return Number(this.pendientesEnBase || 0) + Number(this.totalArchivados || 0);
    },
  },
  methods: {
    async migrarNodosLegados() {
      try {
        const [legacyBackupResp, currentBackupResp] = await Promise.all([
          firebase_api.get("/FacturadosRespaldo.json"),
          firebase_api.get(`${ARCHIVE_BACKUP_PATH}.json`),
        ]);

        const legacyBackup = legacyBackupResp.data || null;
        const currentBackup = currentBackupResp.data || null;

        if (legacyBackup && !currentBackup) {
          await firebase_api.put(`${ARCHIVE_BACKUP_PATH}.json`, legacyBackup);
        }

        if (legacyBackup) {
          await firebase_api.delete("/FacturadosRespaldo.json");
        }
      } catch (error) {
        console.error("Error migrando nodos legados de archivo:", error);
      }
    },
    async asegurarNodosArchivo() {
      const timestamp = new Date().toISOString();
      const payloadBase = {
        visible: true,
        createdAt: timestamp,
        updatedAt: timestamp,
        createdBy: this.userData?.numDocumento || this.uid || "system",
      };

      try {
        const [{ data: facturadosMeta }] = await Promise.all([
          firebase_api.get("/Facturados/__meta.json"),
        ]);

        const requests = [];

        if (!facturadosMeta) {
          requests.push(firebase_api.put("/Facturados/__meta.json", {
            ...payloadBase,
            tipo: "tabla_plana_informe_general",
          }));
        }

        if (requests.length) {
          await Promise.all(requests);
        }
      } catch (error) {
        console.error("Error asegurando nodo Facturados:", error);
      }
    },
    formatearFecha(value) {
      if (!value) return "";
      const fecha = new Date(value);
      if (Number.isNaN(fecha.getTime())) return value;
      return fecha.toLocaleString("es-CO");
    },
    escaparCsv(value) {
      const text = String(value ?? "").replace(/"/g, '""');
      return `"${text}"`;
    },
    exportarConflictosCsv() {
      const conflicts = Array.isArray(this.trabajoActual?.conflicts) ? this.trabajoActual.conflicts : [];
      if (!conflicts.length) {
        this.mensajeFormulario = "No hay conflictos para exportar.";
        return;
      }

      const headers = ["encuestaId", "tipo", "ruta", "mensaje"];
      const rows = conflicts.map((conflict) => ([
        conflict.encuestaId || "",
        conflict.type || "",
        conflict.path || "",
        conflict.message || "",
      ].map((value) => this.escaparCsv(value)).join(",")));

      const csv = [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `conflictos_restauracion_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    tieneValorReconstruccion(value) {
      if (value === true || value === false) return true;
      if (typeof value === "number") return !Number.isNaN(value);
      if (Array.isArray(value)) return value.length > 0;
      if (value && typeof value === "object") return Object.keys(value).length > 0;
      return String(value ?? "").trim() !== "";
    },
    mergeEstructuraIncompleta(actual, respaldo) {
      const actualEsObjeto = actual && typeof actual === "object" && !Array.isArray(actual);
      const respaldoEsObjeto = respaldo && typeof respaldo === "object" && !Array.isArray(respaldo);

      if (Array.isArray(actual) || Array.isArray(respaldo)) {
        return this.tieneValorReconstruccion(actual) ? actual : (Array.isArray(respaldo) ? respaldo : actual);
      }

      if (actualEsObjeto || respaldoEsObjeto) {
        const actualObj = actualEsObjeto ? actual : {};
        const respaldoObj = respaldoEsObjeto ? respaldo : {};
        const keys = new Set([...Object.keys(respaldoObj), ...Object.keys(actualObj)]);

        return Array.from(keys).reduce((acc, key) => {
          acc[key] = this.mergeEstructuraIncompleta(actualObj[key], respaldoObj[key]);
          return acc;
        }, {});
      }

      return this.tieneValorReconstruccion(actual) ? actual : respaldo;
    },
    normalizarClaveReconstruccion(value, fallback = "item") {
      const normalized = String(value || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");

      return normalized || fallback;
    },
    normalizarFacturadoReconstruccion(value) {
      if (value === true || value === false) return value;
      const normalized = String(value ?? "").trim().toLowerCase();
      if (["si", "sí", "true", "1"].includes(normalized)) return true;
      if (["no", "false", "0"].includes(normalized)) return false;
      return "";
    },
    esCupHojaReconstruccion(value) {
      return !!(
        value &&
        typeof value === "object" &&
        ("actividadId" in value ||
          "idActividad" in value ||
          "cupsNombre" in value ||
          "DescripcionCUP" in value ||
          "codigo" in value ||
          "FactNum" in value)
      );
    },
    flattenCupsReconstruccion(cupsNode, parentContext = {}) {
      return Object.entries(cupsNode && typeof cupsNode === "object" ? cupsNode : {}).flatMap(([storageKey, value]) => {
        if (!value || typeof value !== "object") {
          return [];
        }

        if (this.esCupHojaReconstruccion(value)) {
          return [{
            storageKey,
            value: {
              ...value,
              key: value?.key || parentContext?.key || "",
              nombreProf: value?.nombreProf || value?.nombrePtof || value?.nombre || parentContext?.nombreProf || "",
            },
          }];
        }

        const nextContext = {
          key: parentContext?.key || storageKey || "",
          nombreProf: parentContext?.nombreProf || value?.nombreProf || value?.nombrePtof || value?.nombre || "",
        };

        return this.flattenCupsReconstruccion(value, nextContext);
      });
    },
    crearClaveLogicaActividad(actividad = {}) {
      return [
        this.normalizarClaveReconstruccion(actividad?.key || ""),
        this.normalizarClaveReconstruccion(actividad?.nombre || actividad?.descripcion || ""),
      ].join("|");
    },
    crearClaveLogicaCup(cup = {}) {
      return [
        this.normalizarClaveReconstruccion(cup?.actividadId || cup?.idActividad || "", "actividad"),
        this.normalizarClaveReconstruccion(cup?.codigo || cup?.cupsId || cup?.id || cup?.Homolog || cup?.homolog || "", "codigo"),
        this.normalizarClaveReconstruccion(cup?.cupsNombre || cup?.DescripcionCUP || "", "cups"),
        this.normalizarClaveReconstruccion(cup?.key || cup?.rol || "", "rol"),
        this.normalizarClaveReconstruccion(cup?.nombreProf || cup?.nombrePtof || cup?.nombre || "", "profesional"),
        this.normalizarClaveReconstruccion(cup?.FactNum || cup?.factura || "", "factura"),
      ].join("|");
    },
    fusionarActividadesReconstruidas(actual = {}, reconstruidas = {}) {
      const actualBase = actual && typeof actual === "object" ? actual : {};
      const reconstruidasBase = reconstruidas && typeof reconstruidas === "object" ? reconstruidas : {};
      const actividadesActuales = actualBase?.tipoActividad && typeof actualBase.tipoActividad === "object" ? actualBase.tipoActividad : {};
      const actividadesReconstruidas = reconstruidasBase?.tipoActividad && typeof reconstruidasBase.tipoActividad === "object" ? reconstruidasBase.tipoActividad : {};
      const mergedTipoActividad = {};
      const activityKeyMap = new Map();

      Object.entries(actividadesActuales).forEach(([key, value]) => {
        const logicalKey = this.crearClaveLogicaActividad({ key, ...(value || {}) });
        const existingKey = activityKeyMap.get(logicalKey) || key;
        mergedTipoActividad[existingKey] = this.mergeEstructuraIncompleta(mergedTipoActividad[existingKey], {
          ...(value || {}),
          key: existingKey,
        });
        activityKeyMap.set(logicalKey, existingKey);
      });

      Object.entries(actividadesReconstruidas).forEach(([key, value]) => {
        const logicalKey = this.crearClaveLogicaActividad({ key, ...(value || {}) });
        const existingKey = activityKeyMap.get(logicalKey) || key;
        mergedTipoActividad[existingKey] = this.mergeEstructuraIncompleta(mergedTipoActividad[existingKey], {
          ...(value || {}),
          key: existingKey,
        });
        activityKeyMap.set(logicalKey, existingKey);
      });

      return this.mergeEstructuraIncompleta(actualBase, {
        ...reconstruidasBase,
        tipoActividad: mergedTipoActividad,
      });
    },
    fusionarAsignacionesReconstruidas(actual = {}, reconstruidas = {}) {
      const actualBase = actual && typeof actual === "object" ? actual : {};
      const reconstruidasBase = reconstruidas && typeof reconstruidas === "object" ? reconstruidas : {};
      const actualFlattened = this.flattenCupsReconstruccion(actualBase.cups || {});
      const reconstruidasFlattened = this.flattenCupsReconstruccion(reconstruidasBase.cups || {});
      const mergedCups = {};
      const cupKeyMap = new Map();

      actualFlattened.forEach(({ storageKey, value }) => {
        const logicalKey = this.crearClaveLogicaCup(value || {});
        const targetKey = cupKeyMap.get(logicalKey) || storageKey;
        mergedCups[targetKey] = this.mergeEstructuraIncompleta(mergedCups[targetKey], value);
        cupKeyMap.set(logicalKey, targetKey);
      });

      reconstruidasFlattened.forEach(({ storageKey, value }) => {
        const logicalKey = this.crearClaveLogicaCup(value || {});
        const targetKey = cupKeyMap.get(logicalKey) || storageKey;
        mergedCups[targetKey] = this.mergeEstructuraIncompleta(mergedCups[targetKey], value);
        cupKeyMap.set(logicalKey, targetKey);
      });

      return this.mergeEstructuraIncompleta(actualBase, {
        ...reconstruidasBase,
        cups: mergedCups,
      });
    },
    obtenerIdActividadReconstruccion(row, encuestaId, index) {
      const explicitId = String(row?.actividadId || row?.idActividad || "").trim();
      if (explicitId) return explicitId;

      const rowKey = String(row?.rowKey || "").trim();
      if (rowKey && rowKey.startsWith(`${encuestaId}-`)) {
        const parts = rowKey.split("-");
        if (parts[1] && !["sin", "fallback", "stored"].includes(parts[1])) {
          return parts[1];
        }
      }

      return this.normalizarClaveReconstruccion(row?.actividad || "", `actividad_${index + 1}`);
    },
    construirFilasReconstruccion(entry, facturadosPorEncuesta = []) {
      const reportes = entry?.reportes && typeof entry.reportes === "object" ? entry.reportes : {};
      const seguimiento = Array.isArray(reportes.seguimiento) ? reportes.seguimiento : [];
      const actividades = Array.isArray(reportes.actividades) ? reportes.actividades : [];

      return [...seguimiento, ...actividades, ...(Array.isArray(facturadosPorEncuesta) ? facturadosPorEncuesta : [])]
        .filter((row) => row && typeof row === "object");
    },
    obtenerEncuestaArchivada(entry) {
      const encuesta = entry?.encuesta ?? entry?.encuestas ?? entry?.Encuesta ?? entry?.Encuestas;
      return encuesta && typeof encuesta === "object" ? encuesta : {};
    },
    obtenerActividadesArchivadas(entry) {
      const actividades = entry?.actividades ?? entry?.actividad ?? entry?.Actividades ?? entry?.Actividad;
      return actividades && typeof actividades === "object" ? actividades : {};
    },
    obtenerAsignacionesArchivadas(entry) {
      const asignaciones = entry?.asignaciones ?? entry?.asignacion ?? entry?.Asignaciones ?? entry?.Asignacion;
      return asignaciones && typeof asignaciones === "object" ? asignaciones : {};
    },
    construirEncuestaReconstruida(entry, filas = []) {
      const encuesta = this.obtenerEncuestaArchivada(entry);
      const encuestaId = String(entry?.idEncuesta || encuesta?.id || entry?.id || "").trim();
      const firstRow = filas[0] || {};
      const documento = String(firstRow.documento || "");
      const [tipodoc, ...numdocParts] = documento.split("-");
      const riesgo = String(firstRow.riesgo || "").trim();

      return this.mergeEstructuraIncompleta(encuesta, {
        id: encuestaId,
        idEncuesta: encuestaId,
        tipodoc: tipodoc || "",
        numdoc: numdocParts.join("-") || "",
        nombre1: encuesta?.nombre1 || String(firstRow.paciente || "").trim(),
        convenio: firstRow.convenio || "",
        grupo: firstRow.grupo || "",
        sexo: firstRow.sexo || "",
        fechaNac: firstRow.fechaNac || "",
        eps: firstRow.eps || "",
        regimen: firstRow.regimen || "",
        direccion: firstRow.direccion || "",
        barrioVeredacomuna: {
          barrio: firstRow.barrio || "",
          comuna: firstRow.comuna || "",
        },
        fecha: firstRow.fecha || "",
        FechaFacturacion: firstRow.fechaFacturacion || "",
        requiereRemision: firstRow.remision || "",
        poblacionRiesgo: riesgo ? riesgo.split(",").map((item) => item.trim()).filter(Boolean) : [],
      });
    },
    construirActividadesReconstruidas(entry, filas = []) {
      const actividadesActuales = this.obtenerActividadesArchivadas(entry);
      const encuesta = this.obtenerEncuestaArchivada(entry);
      const encuestaId = String(entry?.idEncuesta || encuesta?.id || entry?.id || "").trim();
      const tipoActividad = {};

      filas.forEach((row, index) => {
        const nombreActividad = String(row?.actividad || "").trim();
        if (!nombreActividad || nombreActividad === "Sin actividades") return;

        const actividadId = this.obtenerIdActividadReconstruccion(row, encuestaId, index);
        tipoActividad[actividadId] = this.mergeEstructuraIncompleta(tipoActividad[actividadId], {
          key: actividadId,
          nombre: nombreActividad,
          descripcion: nombreActividad,
        });
      });

      return this.mergeEstructuraIncompleta(actividadesActuales, { tipoActividad });
    },
    construirAsignacionesReconstruidas(entry, filas = []) {
      const asignacionesActuales = this.obtenerAsignacionesArchivadas(entry);
      const encuesta = this.obtenerEncuestaArchivada(entry);
      const encuestaId = String(entry?.idEncuesta || encuesta?.id || entry?.id || "").trim();
      const convenio = encuesta?.convenio || "";
      const cups = {};

      filas.forEach((row, index) => {
        const cupsNombre = String(row?.cupsNombre || row?.procedimiento || row?.descripcionCUP || "").trim();
        const actividad = String(row?.actividad || "").trim();
        if (!actividad || actividad === "Sin actividades" || !cupsNombre || cupsNombre === "Sin asignaciones") {
          return;
        }

        const actividadId = this.obtenerIdActividadReconstruccion(row, encuestaId, index);
        const cupKey = `rebuild_${String(index).padStart(4, "0")}`;
        const cupId = String(row?.codigo || row?.homolog || this.normalizarClaveReconstruccion(cupsNombre, `cup_${index + 1}`));

        cups[cupKey] = {
          id: cupId,
          cupsId: cupId,
          actividadId,
          key: row?.rol || "",
          nombreProf: row?.profesional || "",
          codigo: row?.codigo || cupId,
          cupsNombre,
          DescripcionCUP: row?.descripcionCUP || cupsNombre,
          cantidad: row?.cantidad ?? "",
          detalle: row?.detalle || "",
          Grupo: row?.grupoCUP || "",
          FactNum: row?.factura || "",
          Homolog: row?.homolog || "",
          fechaFacturacion: row?.fechaFactCUP || row?.fechaFacturacion || "",
          facturado: this.normalizarFacturadoReconstruccion(row?.facturado),
          convenio: row?.convenio || convenio,
        };
      });

      return this.mergeEstructuraIncompleta(asignacionesActuales, {
        idEncuesta: encuestaId,
        convenio,
        cups,
      });
    },
    nombrePaciente(encuesta) {
      return `${encuesta?.nombre1 || ""} ${encuesta?.nombre2 || ""} ${encuesta?.apellido1 || ""} ${encuesta?.apellido2 || ""}`
        .replace(/\s+/g, " ")
        .trim();
    },
    documentoPaciente(encuesta) {
      return `${encuesta?.tipodoc || ""}-${encuesta?.numdoc || ""}`.replace(/^-$/, "");
    },
    limpiarCachesOperativas() {
      [
        "encuestas",
        "encuestasRaw",
        "actividadesRaw",
        "asignacionesRaw",
        "actividadesPorEncuesta",
        "admin_report_actividades_raw",
        "admin_report_asignaciones_raw",
        "facturadosRaw",
      ].forEach((key) => cacheManager.remove(key));
    },
    async limpiarHistorialProcesos() {
      try {
        await Promise.all([
          firebase_api.delete("/ArchivoProcesos.json"),
          firebase_api.delete("/FacturacionJobs.json"),
        ]);
      } catch (error) {
        console.error("Error limpiando historial de procesos:", error);
      }

      this.trabajoActual = null;
      this.trabajoActualId = "";
    },
    async actualizarPanel() {
      await this.consultarResumenPacientes();
    },
    async consultarResumenPacientes() {
      if (!this.rangoValido || this.consultandoResumen) {
        return;
      }

      this.consultandoResumen = true;
      this.mensajeFormulario = "";

      try {
        await this.cargarResumenBase();
        this.fechaInicioConsulta = this.fechaInicio;
        this.fechaFinConsulta = this.fechaFin;
        this.resumenCargado = true;
      } catch (error) {
        this.resumenCargado = false;
        this.mensajeFormulario = error?.message || "No fue posible consultar los pacientes.";
      } finally {
        this.consultandoResumen = false;
      }
    },
    async reconstruirRespaldosArchivados() {
      this.reparandoRespaldos = true;
      this.mensajeFormulario = "";

      try {
        const requestedBy = {
          uid: this.uid || "",
          nombre: this.userData?.nombre || "",
          documento: this.userData?.numDocumento || "",
          cargo: this.userData?.cargo || "",
        };

        const [archiveResp, facturadosResp, actividadesExtraResp, cupsResp] = await Promise.all([
          firebase_api.get(`${ARCHIVE_BACKUP_PATH}.json`),
          firebase_api.get("/Facturados.json"),
          firebase_api.get("/actividadesExtra.json"),
          firebase_api.get("/cups.json"),
        ]);

        const archiveEntries = normalizeFacturados(archiveResp.data || {});
        const facturadosActuales = facturadosResp.data || {};
        const actividadesExtraRaw = actividadesExtraResp.data || {};
        const cupsRaw = cupsResp.data || {};

        if (!archiveEntries.length) {
          this.mensajeFormulario = "No hay respaldos archivados para reconstruir.";
          return;
        }

        const backupPatch = {};
        const facturadosPatch = {};
        const errores = [];

        this.trabajoActualId = `repair_${new Date().toISOString().replace(/[:.]/g, "-")}`;
        this.trabajoActual = {
          status: "running",
          requestedAt: new Date().toISOString(),
          startedAt: new Date().toISOString(),
          finishedAt: "",
          processedCount: 0,
          remainingCount: archiveEntries.length,
          totalSelected: archiveEntries.length,
          errorCount: 0,
          errors: [],
          currentEncuestaId: "",
          message: `Reconstruyendo ${archiveEntries.length} respaldo(s) archivado(s).`,
        };

        for (let index = 0; index < archiveEntries.length; index += 1) {
          const entry = archiveEntries[index];
          const encuestaId = String(entry?.idEncuesta || entry?.encuesta?.id || entry?.id || "").trim();

          this.actualizarTrabajoActual({
            currentEncuestaId: encuestaId,
            message: `Reconstruyendo ${index + 1} de ${archiveEntries.length}: ${encuestaId || "sin-id"}`,
          });

          try {
            if (!encuestaId) {
              throw new Error("Respaldo sin idEncuesta válido.");
            }

            const encuesta = {
              ...((entry && typeof entry.encuesta === "object" && entry.encuesta) || {}),
              id: encuestaId,
            };

            const archivedAt = entry?.metadata?.archivedAt || entry?.archivedAt || new Date().toISOString();
            const { facturadosRows, backupRecord } = buildArchivePayload({
              encuesta,
              actividadesRaw: entry?.actividades || {},
              asignacionesRaw: entry?.asignaciones || {},
              actividadesExtraRaw,
              cupsRaw,
              requestedBy,
              archivedAt,
            });

            backupRecord.metadata = {
              ...(backupRecord.metadata || {}),
              archivedAt,
              reconstructedAt: new Date().toISOString(),
              reconstructedBy: requestedBy,
            };

            Object.values(facturadosRows).forEach((row) => {
              row.archivedAt = archivedAt;
            });

            backupPatch[encuestaId] = backupRecord;

            Object.entries(facturadosActuales)
              .filter(([key, value]) => !String(key).startsWith("__") && String(value?.idEncuesta || "").trim() === encuestaId)
              .forEach(([key]) => {
                facturadosPatch[key] = null;
              });

            Object.assign(facturadosPatch, facturadosRows);

            this.actualizarTrabajoActual({
              processedCount: index + 1,
              remainingCount: archiveEntries.length - (index + 1),
            });
          } catch (error) {
            errores.push({
              encuestaId: encuestaId || `sin-id-${index + 1}`,
              message: error?.message || "Error desconocido",
            });

            this.actualizarTrabajoActual({
              errorCount: errores.length,
              errors: [...errores],
              processedCount: index + 1,
              remainingCount: archiveEntries.length - (index + 1),
            });
          }
        }

        if (Object.keys(backupPatch).length) {
          await firebase_api.patch(`${ARCHIVE_BACKUP_PATH}.json`, backupPatch);
        }

        if (Object.keys(facturadosPatch).length) {
          await firebase_api.patch("/Facturados.json", facturadosPatch);
        }

        this.limpiarCachesOperativas();
        await this.consultarResumenPacientes();

        this.actualizarTrabajoActual({
          status: errores.length ? "completed_with_errors" : "completed",
          finishedAt: new Date().toISOString(),
          currentEncuestaId: "",
          errorCount: errores.length,
          errors: [...errores],
          message: errores.length
            ? `Reconstrucción finalizada con ${errores.length} error(es).`
            : `Se reconstruyeron ${Object.keys(backupPatch).length} respaldo(s) correctamente.`,
        });

        this.mensajeFormulario = errores.length
          ? `La reconstrucción terminó con ${errores.length} error(es). Revise el detalle del proceso.`
          : `Respaldos reconstruidos correctamente: ${Object.keys(backupPatch).length}.`;
      } catch (error) {
        console.error("Error reconstruyendo respaldos archivados:", error);
        this.actualizarTrabajoActual({
          status: "error",
          finishedAt: new Date().toISOString(),
          currentEncuestaId: "",
          message: error?.message || "No fue posible reconstruir los respaldos archivados.",
        });
        this.mensajeFormulario = error?.message || "No fue posible reconstruir los respaldos archivados.";
      } finally {
        this.reparandoRespaldos = false;
      }
    },
    async restaurarArchivadosATablasOriginales() {
      this.restaurandoOriginales = true;
      this.mensajeFormulario = "";

      try {
        const [{ data: archiveData }, { data: facturadosData }] = await Promise.all([
          firebase_api.get(`${ARCHIVE_BACKUP_PATH}.json`),
          firebase_api.get("/Facturados.json"),
        ]);
        const archiveEntries = normalizeFacturados(archiveData || {});
        const facturadosPorEncuesta = Object.entries(facturadosData || {})
          .filter(([key]) => !String(key).startsWith("__"))
          .reduce((acc, [, value]) => {
            const encuestaId = String(value?.idEncuesta || "").trim();
            if (!encuestaId) return acc;
            if (!acc[encuestaId]) {
              acc[encuestaId] = [];
            }
            acc[encuestaId].push(value || {});
            return acc;
          }, {});

        if (!archiveEntries.length) {
          this.mensajeFormulario = "No hay respaldos archivados para restaurar.";
          return;
        }

        this.trabajoActualId = `restore_${new Date().toISOString().replace(/[:.]/g, "-")}`;
        this.trabajoActual = {
          status: "running",
          requestedAt: new Date().toISOString(),
          startedAt: new Date().toISOString(),
          finishedAt: "",
          processedCount: 0,
          remainingCount: archiveEntries.length,
          totalSelected: archiveEntries.length,
          errorCount: 0,
          conflictCount: 0,
          conflicts: [],
          errors: [],
          currentEncuestaId: "",
          message: `Restaurando ${archiveEntries.length} respaldo(s) a tablas originales.`,
        };

        const errores = [];
        const conflictos = [];
        const restaurados = [];

        for (let index = 0; index < archiveEntries.length; index += 1) {
          const entry = archiveEntries[index];
          const encuestaId = String(entry?.idEncuesta || entry?.encuesta?.id || entry?.id || "").trim();

          this.actualizarTrabajoActual({
            currentEncuestaId: encuestaId,
            message: `Restaurando ${index + 1} de ${archiveEntries.length}: ${encuestaId || "sin-id"}`,
          });

          try {
            if (!encuestaId) {
              throw new Error("Respaldo sin idEncuesta válido.");
            }

            const filasReconstruccion = this.construirFilasReconstruccion(entry, facturadosPorEncuesta[encuestaId] || []);
            const encuestaReconstruida = this.construirEncuestaReconstruida(entry, filasReconstruccion);
            const actividadesReconstruidas = this.construirActividadesReconstruidas(entry, filasReconstruccion);
            const asignacionesReconstruidas = this.construirAsignacionesReconstruidas(entry, filasReconstruccion);

            if (!encuestaReconstruida || !this.tieneValorReconstruccion(encuestaReconstruida)) {
              throw new Error("El respaldo no contiene datos de encuesta.");
            }

            const [encuestaActualResp, actividadesActualResp, asignacionesActualResp] = await Promise.all([
              firebase_api.get(`/Encuesta/${encuestaId}.json`),
              firebase_api.get(`/Actividades/${encuestaId}.json`),
              firebase_api.get(`/Asignaciones/${encuestaId}.json`),
            ]);

            const conflictosActuales = [];

            if (encuestaActualResp.data && typeof encuestaActualResp.data === "object") {
              conflictosActuales.push({
                encuestaId,
                type: "encuesta-existente",
                path: `/Encuesta/${encuestaId}`,
                message: "Ya existía un registro en Encuesta; se completó la información faltante desde el archivo.",
              });
            }

            if (actividadesActualResp.data && typeof actividadesActualResp.data === "object") {
              conflictosActuales.push({
                encuestaId,
                type: "actividades-existentes",
                path: `/Actividades/${encuestaId}`,
                message: "Ya existían actividades en la tabla original; se completó la información faltante desde el archivo.",
              });
            }

            if (asignacionesActualResp.data && typeof asignacionesActualResp.data === "object") {
              conflictosActuales.push({
                encuestaId,
                type: "asignaciones-existentes",
                path: `/Asignaciones/${encuestaId}`,
                message: "Ya existían asignaciones en la tabla original; se completó la información faltante desde el archivo.",
              });
            }

            if (conflictosActuales.length) {
              conflictos.push(...conflictosActuales);
            }

            const encuesta = this.mergeEstructuraIncompleta(encuestaActualResp.data || {}, encuestaReconstruida);
            const actividades = this.fusionarActividadesReconstruidas(actividadesActualResp.data || {}, actividadesReconstruidas);
            const asignaciones = this.fusionarAsignacionesReconstruidas(asignacionesActualResp.data || {}, asignacionesReconstruidas);

            const requests = [
              firebase_api.put(`/Encuesta/${encuestaId}.json`, encuesta),
            ];

            if (this.tieneValorReconstruccion(actividades)) {
              requests.push(firebase_api.put(`/Actividades/${encuestaId}.json`, actividades));
            }

            if (this.tieneValorReconstruccion(asignaciones)) {
              requests.push(firebase_api.put(`/Asignaciones/${encuestaId}.json`, asignaciones));
            }

            await Promise.all(requests);
            restaurados.push(encuestaId);

            this.actualizarTrabajoActual({
              processedCount: index + 1,
              remainingCount: archiveEntries.length - (index + 1),
              conflictCount: conflictos.length,
              conflicts: [...conflictos],
            });
          } catch (error) {
            errores.push({
              encuestaId: encuestaId || `sin-id-${index + 1}`,
              message: error?.message || "Error desconocido",
            });

            this.actualizarTrabajoActual({
              errorCount: errores.length,
              errors: [...errores],
              processedCount: index + 1,
              remainingCount: archiveEntries.length - (index + 1),
              conflictCount: conflictos.length,
              conflicts: [...conflictos],
            });
          }
        }

        this.limpiarCachesOperativas();
        await this.consultarResumenPacientes();

        this.actualizarTrabajoActual({
          status: errores.length || conflictos.length ? "completed_with_errors" : "completed",
          finishedAt: new Date().toISOString(),
          currentEncuestaId: "",
          errorCount: errores.length,
          conflictCount: conflictos.length,
          conflicts: [...conflictos],
          errors: [...errores],
          message: errores.length || conflictos.length
            ? `Restauración finalizada con ${errores.length} error(es) y ${conflictos.length} conflicto(s).`
            : `Se restauraron ${restaurados.length} respaldo(s) a tablas originales.`,
        });

        this.mensajeFormulario = errores.length || conflictos.length
          ? `La restauración terminó con ${errores.length} error(es) y ${conflictos.length} conflicto(s). Revise el panel de proceso.`
          : `Restauración completada. Registros restaurados: ${restaurados.length}. El archivo se conserva intacto.`;
      } catch (error) {
        console.error("Error restaurando archivados a tablas originales:", error);
        this.actualizarTrabajoActual({
          status: "error",
          finishedAt: new Date().toISOString(),
          currentEncuestaId: "",
          message: error?.message || "No fue posible restaurar los archivados a tablas originales.",
        });
        this.mensajeFormulario = error?.message || "No fue posible restaurar los archivados a tablas originales.";
      } finally {
        this.restaurandoOriginales = false;
      }
    },
    async cargarResumenBase() {
      try {
        const [{ data: encuestasData }, { data: facturadosRespaldoData }, { data: facturadosData }] = await Promise.all([
          firebase_api.get("/Encuesta.json"),
          firebase_api.get(`${ARCHIVE_BACKUP_PATH}.json`),
          firebase_api.get("/Facturados.json"),
        ]);

        this.encuestasRaw = encuestasData || {};

        const encuestas = Object.values(encuestasData || {}).filter(
          (item) => item && item.status_facturacion === true
        );
        const filasFacturados = Object.entries(facturadosData || {})
          .filter(([key]) => !String(key).startsWith("__"))
          .map(([id, value]) => ({ id, ...(value || {}) }));

        this.pendientesEnBase = encuestas.length;
        this.totalArchivados = Object.keys(facturadosRespaldoData || {}).filter(
          (key) => !String(key).startsWith("__")
        ).length;
        this.totalFilasFacturados = filasFacturados.length;
        this.filasFacturadosPreview = filasFacturados
          .sort((a, b) => String(b.archivedAt || b.fechaFacturacion || '').localeCompare(String(a.archivedAt || a.fechaFacturacion || '')))
          .slice(0, 20);
      } catch (error) {
        console.error("Error consultando resumen de base para archivo:", error);
      }
    },
    actualizarTrabajoActual(patch) {
      this.trabajoActual = {
        ...(this.trabajoActual || {}),
        ...patch,
      };
    },
    async iniciarProceso() {
      if (!this.puedeIniciarProceso) {
        this.mensajeFormulario = this.rangoValido
          ? "No hay pacientes disponibles para procesar en el rango indicado."
          : "Defina un rango de fechas válido y un tamaño de lote mayor a cero.";
        return;
      }

      this.iniciandoProceso = true;
      this.mensajeFormulario = "";

      try {
        await this.consultarResumenPacientes();

        const seleccionados = this.candidatosDisponibles.slice(0, Number(this.lotePacientes));
        if (!seleccionados.length) {
          this.mensajeFormulario = "No hay pacientes disponibles para procesar en el rango indicado.";
          return;
        }

        const requestedAt = new Date().toISOString();
        this.trabajoActualId = `manual_${requestedAt.replace(/[:.]/g, "-")}`;
        this.trabajoActual = {
          status: "running",
          requestedAt,
          startedAt: requestedAt,
          finishedAt: "",
          processedCount: 0,
          remainingCount: seleccionados.length,
          totalSelected: seleccionados.length,
          errorCount: 0,
          errors: [],
          currentEncuestaId: "",
          message: `Preparando ${seleccionados.length} pacientes para archivo.`,
        };

        const requestedBy = {
          uid: this.uid || "",
          nombre: this.userData?.nombre || "",
          documento: this.userData?.numDocumento || "",
          cargo: this.userData?.cargo || "",
        };

        const [actividadesExtraResp, cupsResp] = await Promise.all([
          firebase_api.get("/actividadesExtra.json"),
          firebase_api.get("/cups.json"),
        ]);

        const actividadesExtraRaw = actividadesExtraResp.data || {};
        const cupsRaw = cupsResp.data || {};
        const errores = [];

        for (let index = 0; index < seleccionados.length; index += 1) {
          const encuesta = seleccionados[index];
          this.actualizarTrabajoActual({
            currentEncuestaId: encuesta.id,
            message: `Procesando ${index + 1} de ${seleccionados.length}: ${this.nombrePaciente(encuesta) || encuesta.id}`,
          });

          try {
            const [actividadesResp, asignacionesResp] = await Promise.all([
              firebase_api.get(`/Actividades/${encuesta.id}.json`),
              firebase_api.get(`/Asignaciones/${encuesta.id}.json`),
            ]);

            const { facturadosRows, backupRecord } = buildArchivePayload({
              encuesta,
              actividadesRaw: actividadesResp.data || {},
              asignacionesRaw: asignacionesResp.data || {},
              actividadesExtraRaw,
              cupsRaw,
              requestedBy,
            });

            const writeRequests = [
              firebase_api.put(`${ARCHIVE_BACKUP_PATH}/${encuesta.id}.json`, backupRecord),
            ];

            if (Object.keys(facturadosRows).length) {
              writeRequests.push(firebase_api.patch("/Facturados.json", facturadosRows));
            }

            await Promise.all(writeRequests);

            await firebase_api.delete(`/Actividades/${encuesta.id}.json`);
            await firebase_api.delete(`/Asignaciones/${encuesta.id}.json`);
            await firebase_api.delete(`/Encuesta/${encuesta.id}.json`);

            this.actualizarTrabajoActual({
              processedCount: index + 1,
              remainingCount: seleccionados.length - (index + 1),
              message: `Paciente ${encuesta.id} archivado correctamente.`,
            });
          } catch (error) {
            const detalle = error?.response?.data?.error || error?.message || "Error desconocido";
            errores.push({
              encuestaId: encuesta.id,
              message: detalle,
            });

            this.actualizarTrabajoActual({
              errorCount: errores.length,
              errors: [...errores],
              remainingCount: seleccionados.length - (index + 1),
              message: `Error archivando ${encuesta.id}. El proceso continúa con el siguiente paciente.`,
            });
          }
        }

        const finalStatus = errores.length ? "completed_with_errors" : "completed";
        const finishedAt = new Date().toISOString();

        this.actualizarTrabajoActual({
          status: finalStatus,
          finishedAt,
          currentEncuestaId: "",
          processedCount: seleccionados.length,
          remainingCount: 0,
          errorCount: errores.length,
          errors: [...errores],
          message: errores.length
            ? `Proceso finalizado con ${errores.length} error(es).`
            : "Proceso finalizado correctamente.",
        });

        this.mensajeFormulario = errores.length
          ? `El lote terminó con ${errores.length} error(es). Revise el detalle en el panel.`
          : `Se archivaron ${seleccionados.length} pacientes correctamente.`;

        this.limpiarCachesOperativas();
        await this.cargarResumenBase();
      } catch (error) {
        console.error("Error iniciando el vaciado:", error);
        this.actualizarTrabajoActual({
          status: "error",
          finishedAt: new Date().toISOString(),
          currentEncuestaId: "",
          message: error?.message || "No fue posible ejecutar el proceso.",
        });
        this.mensajeFormulario = error?.message || "No fue posible iniciar el proceso.";
      } finally {
        this.iniciandoProceso = false;
      }
    },
  },
  async mounted() {
    await this.migrarNodosLegados();
    await this.limpiarHistorialProcesos();
    await this.asegurarNodosArchivo();
  },
};
</script>

<style scoped>
.admin-facturados {
  max-width: 1440px;
}

.metric-card {
  border: 1px solid #dfe5ec;
  border-radius: 14px;
  padding: 14px;
  background: linear-gradient(180deg, #ffffff 0%, #f7f9fc 100%);
  height: 100%;
}

.metric-card-highlight {
  border-color: #f2c46d;
  background: linear-gradient(180deg, #fff9ec 0%, #fff3d8 100%);
}

.metric-label {
  font-size: 0.8rem;
  color: #667085;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.metric-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #16324f;
  line-height: 1.1;
}
</style>