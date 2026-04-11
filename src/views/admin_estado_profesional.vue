
<template>
  <div class="container py-3">
    <h1 class="h3 mb-3">Estado Actual de Profesional</h1>

    <div class="card shadow-sm mb-3">
      <div class="card-body">
        <div class="row g-3 align-items-end">
          <div class="col-12 col-md-4">
            <label class="form-label">Cargo</label>
            <select v-model="filtroCargo" class="form-select">
              <option value="">Todos</option>
              <option v-for="cargo in cargosDisponibles" :key="cargo" :value="cargo">{{ cargo }}</option>
            </select>
          </div>
          <div class="col-12 col-md-8">
            <label class="form-label">Buscar por nombre o documento</label>
            <input
              v-model.trim="busqueda"
              type="text"
              class="form-control"
              placeholder="Ej: Maria, 10203040"
            />
          </div>
        </div>
      </div>
    </div>

    <div v-if="cargando" class="alert alert-info">Cargando profesionales...</div>
    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

    <div v-else class="card shadow-sm">
      <div class="card-header d-flex justify-content-between align-items-center">
        <strong>Listado</strong>
        <span class="text-muted small">{{ profesionalesFiltrados.length }} resultados</span>
          <button class="btn btn-success btn-sm ms-2" @click="exportarProfesionalesExcel" :disabled="profesionalesFiltrados.length === 0">
            <i class="bi bi-file-earmark-excel"></i> Exportar Excel
          </button>
      </div>
      <div class="table-responsive">
        <table class="table table-sm table-hover mb-0">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Cargo</th>
              <th>Documento</th>
              <th>Convenio</th>
                <th>Pendientes</th>
              <th class="text-end">Accion</th>
            </tr>
          </thead>
          <tbody>
              <tr v-for="prof in profesionalesFiltrados" :key="prof.id">
                <td>{{ prof.nombre || 'Sin nombre' }}</td>
                <td>{{ prof.cargo || 'Sin cargo' }}</td>
                <td>{{ prof.numDocumento || 'Sin documento' }}</td>
                <td>{{ prof.convenio || 'Sin convenio' }}</td>
                <td>{{ obtenerPendientes(prof) }}</td>
                <td class="text-end">
                  <button class="btn btn-primary btn-sm" @click="verEstadoProfesional(prof)">
                    Ver Estado
                  </button>
                </td>
              </tr>
            <tr v-if="profesionalesFiltrados.length === 0">
              <td colspan="5" class="text-center text-muted py-3">No hay resultados con ese filtro.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex";
import * as XLSX from "xlsx";

export default {
  data() {
    return {
      cargando: false,
      error: "",
      profesionales: [],
      filtroCargo: "",
      busqueda: "",
      cargosObjetivo: [
        "Auxiliar de enfermeria",
        "Medico",
        "Enfermero",
        "Psicologo",
        "Tsocial",
      ],
    };
  },
  computed: {
    ...mapState(["userData"]),
    esAdmin() {
      return String(this.userData?.cargo || "").trim().toLowerCase() === "admin";
    },
    cargosDisponibles() {
      return this.cargosObjetivo.filter((c) =>
        this.profesionales.some((p) => p.cargo === c)
      );
    },
    profesionalesFiltrados() {
      const txt = (this.busqueda || "").toLowerCase();
      return this.profesionales
        .filter((p) => (this.filtroCargo ? p.cargo === this.filtroCargo : true))
        .filter((p) => {
          if (!txt) return true;
          const nombre = String(p.nombre || "").toLowerCase();
          const doc = String(p.numDocumento || "").toLowerCase();
          return nombre.includes(txt) || doc.includes(txt);
        })
        .sort((a, b) => String(a.nombre || "").localeCompare(String(b.nombre || ""), "es"));
    },
  },
  methods: {
    ...mapActions(["consultarUsuariosFirestore"]),
    obtenerPendientes(prof) {
      // TODO: Reemplazar con la lógica real para obtener pendientes por profesional
      // Por ejemplo, si prof.pendientes existe, usarlo; si no, retornar 0
      return typeof prof.pendientes === 'number' ? prof.pendientes : (prof.pendientes || 0);
    },

    exportarProfesionalesExcel() {
      const filas = this.profesionalesFiltrados.map((prof) => ({
        Nombre: prof.nombre || '',
        Cargo: prof.cargo || '',
        Documento: prof.numDocumento || '',
        Convenio: prof.convenio || '',
        Pendientes: this.obtenerPendientes(prof)
      }));
      if (filas.length === 0) return;
      const ws = XLSX.utils.json_to_sheet(filas);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Profesionales');
      XLSX.writeFile(wb, 'profesionales_estado.xlsx');
    },
    rutaPorCargo(cargo) {
      switch (cargo) {
        case "Auxiliar de enfermeria":
          return "/sop_aux";
        case "Medico":
          return "/sop_profesional";
        case "Enfermero":
          return "/sop_enfermero";
        case "Psicologo":
          return "/sop_psicologo";
        case "Tsocial":
          return "/sop_tsocial";
        default:
          return "";
      }
    },
    async cargarProfesionales() {
      this.cargando = true;
      this.error = "";
      try {
        const lista = await this.consultarUsuariosFirestore();
        this.profesionales = (lista || []).filter(
          (u) => this.cargosObjetivo.includes(u.cargo) && u.numDocumento
        );
      } catch (err) {
        this.error = "No se pudo cargar el listado de profesionales.";
      } finally {
        this.cargando = false;
      }
    },
    verEstadoProfesional(profesional) {
      const ruta = this.rutaPorCargo(profesional.cargo);
      if (!ruta) {
        alert("Este cargo no tiene bandeja de estado configurada.");
        return;
      }

      const respaldo = sessionStorage.getItem("observerOriginalUserData");
      if (!respaldo && this.userData && this.userData.numDocumento) {
        sessionStorage.setItem("observerOriginalUserData", JSON.stringify(this.userData));
      }

      sessionStorage.setItem("observerMode", "true");
      sessionStorage.setItem("observerSelectedProfessional", JSON.stringify(profesional));

      this.$store.commit("setUserData", profesional);
      this.$router.push(ruta);
    },
  },
  async mounted() {
    if (!this.esAdmin) {
      this.$router.replace("/homeviews");
      return;
    }
    await this.cargarProfesionales();
  },
};
</script>
