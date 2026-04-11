<template>
  <div class="consumo-page mt-2">
    <div class="container-fluid px-3 px-xl-4">
      <h1><i class="bi bi-speedometer2"></i> Consumo de Consultas</h1>

      <div class="row g-3 align-items-end mb-3">
        <div class="col-12 col-md-3 col-xl-2">
          <label class="form-label">Desde</label>
          <input type="date" class="form-control" v-model="fechaInicio" />
        </div>
        <div class="col-12 col-md-3 col-xl-2">
          <label class="form-label">Hasta</label>
          <input type="date" class="form-control" v-model="fechaFin" />
        </div>
        <div class="col-12 col-md-3 col-xl-2">
          <button class="btn btn-warning" @click="cargarConsumo">
            <i class="bi bi-arrow-repeat"></i> Actualizar
          </button>
        </div>
        <div class="col-12 col-md-3 col-xl-3">
          <button class="btn btn-outline-success" @click="exportarExcel" :disabled="!consumoUsuarios.length">
            <i class="bi bi-file-earmark-excel"></i> Exportar Excel
          </button>
        </div>
        <div class="col-12 col-md-3 col-xl-3">
          <label class="form-label">Filtrar por cargo</label>
          <select class="form-select" v-model="filtroCargo">
            <option value="">Todos</option>
            <option v-for="cargo in cargosDisponibles" :key="cargo" :value="cargo">{{ cargo }}</option>
          </select>
        </div>
        <div class="col-12 col-md-3 col-xl-3">
          <label class="form-label">Filtrar por usuario</label>
          <select class="form-select" v-model="filtroUsuario">
            <option value="">Todos</option>
            <option v-for="user in usuariosDisponibles" :key="user.uid" :value="user.uid">{{ user.userName }}</option>
          </select>
        </div>
      </div>

      <div class="row g-3 mb-3">
        <div class="col-12 col-md-3">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <div class="text-muted small">Consultas Totales</div>
              <div class="h4 mb-0">{{ resumen.totalRequests }}</div>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-3">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <div class="text-muted small">Lecturas</div>
              <div class="h4 mb-0">{{ resumen.totalReads }}</div>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-3">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <div class="text-muted small">Escrituras</div>
              <div class="h4 mb-0">{{ resumen.totalWrites }}</div>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-3">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <div class="text-muted small">Errores</div>
              <div class="h4 mb-0">{{ resumen.totalErrors }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-3 mb-3">
        <div class="col-12 col-xl-6">
          <div class="card shadow-sm h-100">
            <div class="card-header fw-semibold">Comparacion contra periodo anterior</div>
            <div class="card-body">
              <div class="small text-muted mb-2">Periodo previo: {{ periodoAnteriorLabel }}</div>
              <div class="d-flex flex-wrap gap-3 align-items-center">
                <div>
                  <div class="text-muted small">Consultas periodo actual</div>
                  <div class="h5 mb-0">{{ resumen.totalRequests }}</div>
                </div>
                <div>
                  <div class="text-muted small">Consultas periodo anterior</div>
                  <div class="h5 mb-0">{{ resumenAnterior.totalRequests }}</div>
                </div>
                <div>
                  <div class="text-muted small">Variacion</div>
                  <div class="h5 mb-0" :class="claseVariacion(variacionRequests)">
                    {{ formatoVariacion(variacionRequests) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-12 col-xl-6">
          <div class="card shadow-sm h-100">
            <div class="card-header fw-semibold">Alertas de consumo (semaforo)</div>
            <div class="card-body">
              <div class="mb-2">
                <span class="badge bg-danger me-2">Rojo</span>
                usuario > {{ umbralUsuarioAlto }} o endpoint > {{ umbralEndpointAlto }}
              </div>
              <div class="mb-2">
                <span class="badge bg-warning text-dark me-2">Amarillo</span>
                usuario > {{ umbralUsuarioMedio }} o endpoint > {{ umbralEndpointMedio }}
              </div>
              <div class="mb-2">
                <span class="badge bg-success me-2">Verde</span>
                dentro de umbrales normales
              </div>
              <div class="small mt-3" :class="alertaGeneralClass">
                Estado general: <strong>{{ alertaGeneralTexto }}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-3 mb-3">
        <div class="col-12">
          <div class="card shadow-sm">
            <div class="card-header fw-semibold">Tendencia diaria de consultas</div>
            <div class="card-body">
              <div v-if="tendenciaDiaria.length" class="trend-chart">
                <div v-for="item in tendenciaDiaria" :key="item.fecha" class="trend-item">
                  <div class="trend-bar-wrap">
                    <div class="trend-bar" :style="{ height: item.altura + '%' }"></div>
                  </div>
                  <div class="trend-label">{{ item.fecha.slice(5) }}</div>
                  <div class="trend-value">{{ item.totalRequests }}</div>
                </div>
              </div>
              <div v-else class="text-muted">Sin datos para el rango seleccionado</div>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-3">
        <div class="col-12 col-xl-6">
          <div class="card shadow-sm">
            <div class="card-header fw-semibold">Usuarios con mayor consumo</div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-sm table-striped mb-0 align-middle">
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Cargo</th>
                      <th class="text-end">Consultas</th>
                      <th class="text-end">Lecturas</th>
                      <th class="text-end">Errores</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="user in topUsuarios" :key="user.uid">
                      <td>{{ user.userName }}</td>
                      <td>{{ user.cargo }}</td>
                      <td class="text-end">{{ user.totalRequests }}</td>
                      <td class="text-end">{{ user.totalReads }}</td>
                      <td class="text-end">{{ user.totalErrors }}</td>
                    </tr>
                    <tr v-if="topUsuarios.length === 0">
                      <td colspan="5" class="text-center text-muted py-3">Sin datos para la fecha seleccionada</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-xl-6">
          <div class="card shadow-sm">
            <div class="card-header fw-semibold">Consumo por modulo</div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-sm table-striped mb-0 align-middle">
                  <thead>
                    <tr>
                      <th>Modulo</th>
                      <th class="text-end">Consultas</th>
                      <th class="text-end">Lecturas</th>
                      <th class="text-end">Errores</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="mod in topModulos" :key="mod.modulo">
                      <td>{{ mod.modulo }}</td>
                      <td class="text-end">{{ mod.count }}</td>
                      <td class="text-end">{{ mod.reads }}</td>
                      <td class="text-end">{{ mod.errors }}</td>
                    </tr>
                    <tr v-if="topModulos.length === 0">
                      <td colspan="4" class="text-center text-muted py-3">Sin datos para el rango seleccionado</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-xl-6">
          <div class="card shadow-sm">
            <div class="card-header fw-semibold">Endpoints mas consultados</div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-sm table-striped mb-0 align-middle">
                  <thead>
                    <tr>
                      <th>Endpoint</th>
                      <th class="text-end">Consultas</th>
                      <th class="text-end">Lecturas</th>
                      <th class="text-end">Errores</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="endpoint in topEndpoints" :key="endpoint.path">
                      <td class="text-truncate endpoint-col" :title="endpoint.path">{{ endpoint.path }}</td>
                      <td class="text-end">{{ endpoint.count }}</td>
                      <td class="text-end">{{ endpoint.reads }}</td>
                      <td class="text-end">{{ endpoint.errors }}</td>
                    </tr>
                    <tr v-if="topEndpoints.length === 0">
                      <td colspan="4" class="text-center text-muted py-3">Sin datos para la fecha seleccionada</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="cargando" class="alert alert-info mt-3 mb-0">Cargando datos de consumo...</div>
    </div>
  </div>
</template>

<script>
import firebase_api from "@/api/ApiFirebase";

function toDateISO(dateObj) {
  return dateObj.toISOString().slice(0, 10);
}

function addDays(dateObj, days) {
  const d = new Date(dateObj);
  d.setDate(d.getDate() + days);
  return d;
}

function getDateRange(startISO, endISO) {
  if (!startISO || !endISO) return [];
  const start = new Date(startISO + "T00:00:00");
  const end = new Date(endISO + "T00:00:00");
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return [];

  const dates = [];
  let cursor = start;
  while (cursor <= end) {
    dates.push(toDateISO(cursor));
    cursor = addDays(cursor, 1);
  }
  return dates;
}

function getModuloFromPath(path) {
  const clean = String(path || "").replace(/^\/+/, "");
  if (!clean) return "root";
  const first = clean.split("/")[0];
  return first.replace(".json", "") || "root";
}

export default {
  data() {
    const hoy = new Date().toISOString().slice(0, 10);
    const hace6dias = addDays(new Date(), -6).toISOString().slice(0, 10);

    return {
      fechaInicio: hace6dias,
      fechaFin: hoy,
      consumoUsuarios: [],
      consumoPorDia: [],
      consumoUsuariosAnterior: [],
      periodoAnteriorInicio: "",
      periodoAnteriorFin: "",
      filtroCargo: "",
      filtroUsuario: "",
      umbralUsuarioMedio: 200,
      umbralUsuarioAlto: 400,
      umbralEndpointMedio: 300,
      umbralEndpointAlto: 600,
      cargando: false,
    };
  },
  computed: {
    cargosDisponibles() {
      const unique = new Set(this.consumoUsuarios.map((u) => u.cargo || "Sin cargo"));
      return Array.from(unique).sort((a, b) => String(a).localeCompare(String(b)));
    },
    usuariosDisponibles() {
      return [...this.consumoUsuarios]
        .sort((a, b) => String(a.userName || "").localeCompare(String(b.userName || "")))
        .map((u) => ({ uid: u.uid, userName: u.userName || "Sin nombre" }));
    },
    consumoUsuariosFiltrado() {
      return this.consumoUsuarios.filter((u) => {
        const okCargo = !this.filtroCargo || String(u.cargo || "") === String(this.filtroCargo);
        const okUser = !this.filtroUsuario || String(u.uid || "") === String(this.filtroUsuario);
        return okCargo && okUser;
      });
    },
    resumen() {
      return this.consumoUsuariosFiltrado.reduce(
        (acc, item) => {
          acc.totalRequests += Number(item.totalRequests || 0);
          acc.totalReads += Number(item.totalReads || 0);
          acc.totalWrites += Number(item.totalWrites || 0);
          acc.totalErrors += Number(item.totalErrors || 0);
          return acc;
        },
        { totalRequests: 0, totalReads: 0, totalWrites: 0, totalErrors: 0 }
      );
    },
    resumenAnterior() {
      return this.consumoUsuariosAnterior.reduce(
        (acc, item) => {
          acc.totalRequests += Number(item.totalRequests || 0);
          acc.totalReads += Number(item.totalReads || 0);
          acc.totalWrites += Number(item.totalWrites || 0);
          acc.totalErrors += Number(item.totalErrors || 0);
          return acc;
        },
        { totalRequests: 0, totalReads: 0, totalWrites: 0, totalErrors: 0 }
      );
    },
    variacionRequests() {
      const prev = Number(this.resumenAnterior.totalRequests || 0);
      const curr = Number(this.resumen.totalRequests || 0);
      if (!prev && !curr) return 0;
      if (!prev) return 100;
      return ((curr - prev) / prev) * 100;
    },
    periodoAnteriorLabel() {
      if (!this.periodoAnteriorInicio || !this.periodoAnteriorFin) return "-";
      return `${this.periodoAnteriorInicio} a ${this.periodoAnteriorFin}`;
    },
    topUsuarios() {
      return [...this.consumoUsuariosFiltrado]
        .sort((a, b) => Number(b.totalRequests || 0) - Number(a.totalRequests || 0))
        .slice(0, 10);
    },
    tendenciaDiaria() {
      const maxValue = Math.max(...this.consumoPorDia.map((x) => Number(x.totalRequests || 0)), 1);
      return this.consumoPorDia.map((item) => ({
        ...item,
        altura: Math.max(6, Math.round((Number(item.totalRequests || 0) * 100) / maxValue)),
      }));
    },
    topEndpoints() {
      const aggregate = {};

      this.consumoUsuariosFiltrado.forEach((user) => {
        const endpoints = user.endpoints || {};
        Object.entries(endpoints).forEach(([path, value]) => {
          if (!aggregate[path]) {
            aggregate[path] = { path, count: 0, reads: 0, errors: 0 };
          }
          aggregate[path].count += Number(value?.count || 0);
          aggregate[path].reads += Number(value?.reads || 0);
          aggregate[path].errors += Number(value?.errors || 0);
        });
      });

      return Object.values(aggregate)
        .sort((a, b) => b.count - a.count)
        .slice(0, 12);
    },
    topModulos() {
      const aggregate = {};

      this.topEndpoints.forEach((endpoint) => {
        const modulo = getModuloFromPath(endpoint.path);
        if (!aggregate[modulo]) {
          aggregate[modulo] = { modulo, count: 0, reads: 0, errors: 0 };
        }
        aggregate[modulo].count += Number(endpoint.count || 0);
        aggregate[modulo].reads += Number(endpoint.reads || 0);
        aggregate[modulo].errors += Number(endpoint.errors || 0);
      });

      return Object.values(aggregate)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    },
    alertaGeneralTexto() {
      if (this.topUsuarios.some((u) => Number(u.totalRequests || 0) >= this.umbralUsuarioAlto)) {
        return "ROJO - Consumo alto por usuario";
      }
      if (this.topEndpoints.some((e) => Number(e.count || 0) >= this.umbralEndpointAlto)) {
        return "ROJO - Consumo alto por endpoint";
      }
      if (this.topUsuarios.some((u) => Number(u.totalRequests || 0) >= this.umbralUsuarioMedio)) {
        return "AMARILLO - Vigilar usuarios";
      }
      if (this.topEndpoints.some((e) => Number(e.count || 0) >= this.umbralEndpointMedio)) {
        return "AMARILLO - Vigilar endpoints";
      }
      return "VERDE - Consumo controlado";
    },
    alertaGeneralClass() {
      if (this.alertaGeneralTexto.startsWith("ROJO")) return "text-danger";
      if (this.alertaGeneralTexto.startsWith("AMARILLO")) return "text-warning";
      return "text-success";
    },
  },
  methods: {
    normalizarUsuariosFromDay(dayData = {}) {
      const usuariosObj = dayData?.usuarios || {};
      return Object.values(usuariosObj || {});
    },

    async cargarConsumo() {
      const rango = getDateRange(this.fechaInicio, this.fechaFin);
      if (!rango.length) {
        this.consumoUsuarios = [];
        this.consumoPorDia = [];
        this.consumoUsuariosAnterior = [];
        return;
      }

      this.cargando = true;
      try {
        const requests = rango.map((fecha) =>
          firebase_api
            .get(`/consumo/diario/${fecha}.json`)
            .then((resp) => ({ fecha, data: resp.data || {} }))
            .catch(() => ({ fecha, data: {} }))
        );

        const diasData = await Promise.all(requests);

        const daysCount = rango.length;
        const inicioDate = new Date(this.fechaInicio + "T00:00:00");
        const prevEndDate = addDays(inicioDate, -1);
        const prevStartDate = addDays(prevEndDate, -(daysCount - 1));
        this.periodoAnteriorInicio = toDateISO(prevStartDate);
        this.periodoAnteriorFin = toDateISO(prevEndDate);

        const rangoPrevio = getDateRange(this.periodoAnteriorInicio, this.periodoAnteriorFin);
        const reqPrevias = rangoPrevio.map((fecha) =>
          firebase_api
            .get(`/consumo/diario/${fecha}.json`)
            .then((resp) => ({ fecha, data: resp.data || {} }))
            .catch(() => ({ fecha, data: {} }))
        );

        const diasPreviosData = await Promise.all(reqPrevias);

        this.consumoPorDia = diasData.map((dia) => {
          const usuarios = this.normalizarUsuariosFromDay(dia.data);
          const totalRequests = usuarios.reduce((sum, u) => sum + Number(u.totalRequests || 0), 0);
          return {
            fecha: dia.fecha,
            totalRequests,
          };
        });

        const usuariosMap = {};
        diasData.forEach((dia) => {
          const usuarios = this.normalizarUsuariosFromDay(dia.data);
          usuarios.forEach((u) => {
            const uid = u.uid || "sin_uid";
            if (!usuariosMap[uid]) {
              usuariosMap[uid] = {
                uid,
                userName: u.userName || "Sin nombre",
                cargo: u.cargo || "Sin cargo",
                totalRequests: 0,
                totalReads: 0,
                totalWrites: 0,
                totalErrors: 0,
                endpoints: {},
              };
            }

            usuariosMap[uid].totalRequests += Number(u.totalRequests || 0);
            usuariosMap[uid].totalReads += Number(u.totalReads || 0);
            usuariosMap[uid].totalWrites += Number(u.totalWrites || 0);
            usuariosMap[uid].totalErrors += Number(u.totalErrors || 0);

            const endpoints = u.endpoints || {};
            Object.entries(endpoints).forEach(([path, value]) => {
              if (!usuariosMap[uid].endpoints[path]) {
                usuariosMap[uid].endpoints[path] = { count: 0, reads: 0, errors: 0 };
              }
              usuariosMap[uid].endpoints[path].count += Number(value?.count || 0);
              usuariosMap[uid].endpoints[path].reads += Number(value?.reads || 0);
              usuariosMap[uid].endpoints[path].errors += Number(value?.errors || 0);
            });
          });
        });

        this.consumoUsuarios = Object.values(usuariosMap);

        const usuariosPrevMap = {};
        diasPreviosData.forEach((dia) => {
          const usuarios = this.normalizarUsuariosFromDay(dia.data);
          usuarios.forEach((u) => {
            const uid = u.uid || "sin_uid";
            if (!usuariosPrevMap[uid]) {
              usuariosPrevMap[uid] = {
                uid,
                userName: u.userName || "Sin nombre",
                cargo: u.cargo || "Sin cargo",
                totalRequests: 0,
                totalReads: 0,
                totalWrites: 0,
                totalErrors: 0,
              };
            }

            usuariosPrevMap[uid].totalRequests += Number(u.totalRequests || 0);
            usuariosPrevMap[uid].totalReads += Number(u.totalReads || 0);
            usuariosPrevMap[uid].totalWrites += Number(u.totalWrites || 0);
            usuariosPrevMap[uid].totalErrors += Number(u.totalErrors || 0);
          });
        });

        this.consumoUsuariosAnterior = Object.values(usuariosPrevMap);
      } catch (error) {
        console.error("Error cargando consumo:", error);
        this.consumoUsuarios = [];
        this.consumoPorDia = [];
        this.consumoUsuariosAnterior = [];
      } finally {
        this.cargando = false;
      }
    },

    formatoVariacion(valor) {
      const sign = valor > 0 ? "+" : "";
      return `${sign}${Number(valor || 0).toFixed(1)}%`;
    },

    claseVariacion(valor) {
      if (valor > 10) return "text-danger";
      if (valor > 0) return "text-warning";
      return "text-success";
    },

    async exportarExcel() {
      try {
        const XLSX = await import("xlsx");

        const resumenRows = this.topUsuarios.map((u) => ({
          Usuario: u.userName,
          Cargo: u.cargo,
          Consultas: u.totalRequests,
          Lecturas: u.totalReads,
          Escrituras: u.totalWrites,
          Errores: u.totalErrors,
        }));

        const endpointRows = this.topEndpoints.map((e) => ({
          Endpoint: e.path,
          Consultas: e.count,
          Lecturas: e.reads,
          Errores: e.errors,
        }));

        const diarioRows = this.consumoPorDia.map((d) => ({
          Fecha: d.fecha,
          Consultas: d.totalRequests,
        }));

        const comparativoRows = [
          {
            Periodo: `${this.fechaInicio} a ${this.fechaFin}`,
            Consultas: this.resumen.totalRequests,
            Lecturas: this.resumen.totalReads,
            Escrituras: this.resumen.totalWrites,
            Errores: this.resumen.totalErrors,
          },
          {
            Periodo: `${this.periodoAnteriorInicio} a ${this.periodoAnteriorFin}`,
            Consultas: this.resumenAnterior.totalRequests,
            Lecturas: this.resumenAnterior.totalReads,
            Escrituras: this.resumenAnterior.totalWrites,
            Errores: this.resumenAnterior.totalErrors,
          },
          {
            Periodo: "Variacion %",
            Consultas: this.formatoVariacion(this.variacionRequests),
            Lecturas: "-",
            Escrituras: "-",
            Errores: "-",
          },
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(resumenRows), "Usuarios");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(endpointRows), "Endpoints");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(diarioRows), "Tendencia");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(comparativoRows), "Comparativo");

        const nombre = `consumo_${this.fechaInicio}_a_${this.fechaFin}.xlsx`;
        XLSX.writeFile(wb, nombre);
      } catch (error) {
        console.error("Error exportando excel de consumo:", error);
      }
    },
  },
  mounted() {
    this.cargarConsumo();
  },
};
</script>

<style scoped>
.consumo-page {
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
}

.endpoint-col {
  max-width: 280px;
}

.trend-chart {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(54px, 1fr));
  gap: 10px;
  align-items: end;
  min-height: 190px;
}

.trend-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.trend-bar-wrap {
  width: 100%;
  max-width: 36px;
  height: 130px;
  background: #f1f3f5;
  border-radius: 8px;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}

.trend-bar {
  width: 100%;
  background: linear-gradient(180deg, #198754 0%, #20c997 100%);
  border-radius: 8px;
}

.trend-label {
  font-size: 0.72rem;
  color: #6c757d;
}

.trend-value {
  font-size: 0.72rem;
  font-weight: 600;
}
</style>
