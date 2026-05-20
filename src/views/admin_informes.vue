<template>

    <div class="mt-2 datos">
        <div v-if="cargandoInforme" class="overlay-spinner">
            <div class="progress-card shadow">
                <div class="h5 mb-3">Generando informe</div>
                <div class="progress mb-2" role="progressbar" aria-label="Progreso de generación"
                    :aria-valuenow="progresoInforme" aria-valuemin="0" aria-valuemax="100"
                    style="height: 22px;">
                    <div class="progress-bar progress-bar-striped progress-bar-animated"
                        :style="{ width: `${progresoInforme}%` }">
                        {{ progresoInforme }}%
                    </div>
                </div>
                <div class="text-muted small">{{ mensajeProgreso }}</div>
            </div>
        </div>
        <div class="container-fluid px-3 px-xl-4">


            <h1><i class="bi bi-clipboard2-data h1"></i>Informes Administrativos</h1>
            <div class="mb-3 d-flex flex-wrap gap-2">
                <button type="button" class="btn btn-outline-primary" @click="$router.push('/admin_facturados')">
                    <i class="bi bi-database-fill-gear"></i> Ir a Archivo de facturación
                </button>
            </div>
            <div v-if="tieneDatosTablaOInforme6" class="mb-3">
                <button type="button" class="btn btn-primary" @click="parametrizarNuevoInforme">
                    <i class="bi bi-sliders"></i> Parametrizar nuevo informe
                </button>
            </div>
            <div v-if="mostrarFormulario && !tieneDatosTabla" class="row">
                <h5>Seleccione:</h5>
                <div class="col-12 col-md-2">

                    <label class="form-label">Tipo de informe</label>
                    <select id="tipoinforme" name="tipoinforme" class="form-select" aria-label="Default select example"
                        v-model="tipoinforme" @change="clearFormInformes()">
                        <option selected value="">Seleccione</option>
                        <option value="1">Seguimiento</option>
                        <option value="2">Actividades</option>
                        <option value="3">Pendientes enfermería</option>
                        <option value="4">Sin datos de facturación</option>
                        <option value="5">Sin cierre de facturación (facturación)</option>
                        <option value="6">Facturación CUPS (por facturado en asignaciones)</option>
                    </select>
                    <br>

                </div>

                <div class="col-6 col-md-2" v-if="tipoinforme == '1' || tipoinforme == '2' || tipoinforme == '3' || tipoinforme == '4' || tipoinforme == '5' || tipoinforme == '6'">
                    <label for="fechaInicio" class="form-label">Fecha de Inicio</label>
                    <input type="date" id="fechaInicio" class="form-control" v-model="fechaInicio" required />
                </div>
                <div class="col-6 col-md-2" v-if="tipoinforme == '1' || tipoinforme == '2' || tipoinforme == '3' || tipoinforme == '4' || tipoinforme == '5' || tipoinforme == '6'">
                    <label for="fechaFin" class="form-label">Fecha de Fin</label>
                    <input type="date" id="fechaFin" class="form-control" v-model="fechaFin" required />
                </div>
                <div class="col-12 col-md-3" v-if="tipoinforme == '1' || tipoinforme == '2' || tipoinforme == '3' || tipoinforme == '4' || tipoinforme == '5' || tipoinforme == '6'">
                    <label for="convenioInforme" class="form-label">Convenio</label>
                    <select id="convenioInforme" class="form-select" v-model="convenioInforme">
                        <option value="">Todos</option>
                        <option v-for="conv in conveniosDisponibles" :key="conv" :value="conv">{{ conv }}</option>
                    </select>
                </div>
                <div class="col-12 col-md-2 mt-3" v-if="tipoinforme == '1' || tipoinforme == '2' || tipoinforme == '3' || tipoinforme == '4' || tipoinforme == '5' || tipoinforme == '6'">
                    <button type="button" class="btn btn-warning  mt-3" @click="generarInforme()" :disabled="cargandoInforme">
                        <i class="bi bi-clipboard2-data h6"></i> Generar Informe
                    </button>
                </div>
                <div class="col-12" v-if="columnasTipoSeleccionado.length">
                    <div class="alert alert-light border mt-2 mb-0">
                        <div class="fw-semibold mb-2">
                            Columnas del informe {{ nombreTipoInformeSeleccionado }}: {{ columnasTipoSeleccionado.length }}
                        </div>
                        <div class="d-flex flex-wrap gap-2">
                            <span
                                v-for="columna in columnasTipoSeleccionado"
                                :key="`preview-col-${columna.key}`"
                                class="badge rounded-pill text-bg-secondary"
                            >
                                {{ columna.label }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <p v-if="mostrarFormulario && !tieneDatosTabla && tipoinforme == '1'">*Todas las encuestas cerradas por la
                enfermera entre las
                fechas seleccionadas</p>
            <p v-if="mostrarFormulario && !tieneDatosTabla && tipoinforme == '2'">*Todas las encuestas registradas entre las fechas seleccionadas, con sus actividades y datos del paciente</p>
            <p v-if="mostrarFormulario && !tieneDatosTabla && tipoinforme == '3'">*Pacientes registrados en el rango seleccionado que siguen pendientes de cierre por enfermería, con resumen por enfermero asignado</p>
            <p v-if="mostrarFormulario && !tieneDatosTabla && tipoinforme == '4'">*Pacientes registrados en Encuesta que no tienen datos de facturación. Si no selecciona fechas, consulta todas las encuestas.</p>
            <p v-if="mostrarFormulario && !tieneDatosTabla && tipoinforme == '5'">*Pacientes registrados en el rango (fecha de registro) que aún no tienen cierre de facturación por el área de facturación. Una fila por CUPS. «Fact. parcial» es Sí si ya hay al menos un CUPS con número de factura asignado.</p>
            <p v-if="mostrarFormulario && !tieneDatosTablaOInforme6 && tipoinforme == '6'">*Pacientes registrados en el rango (fecha de registro) con CUPS en asignaciones. Facturado: todos los CUPS con <code>facturado = true</code>. No facturado: al menos un CUPS con <code>facturado = false</code> o sin marcar. Dos listados y contadores de pacientes en cada grupo.</p>

        </div>
        <br>
        <div class="container-fluid px-2 px-xl-3 informe-panel">
            <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
                <h5 class="mb-0">{{ tituloListado }}</h5>
                <span v-for="(parametro, idx) in parametrosConsultaEtiquetas" :key="`parametro-consulta-${idx}`"
                    class="badge bg-secondary">
                    {{ parametro }}
                </span>
                <template v-if="mostrarResumenPendientesFacturaInforme6">
                    <span class="badge bg-info text-dark">
                        Facturados: {{ filasMuestraTabla.length }} / {{ filasFiltradasOrdenadas.length }} filas
                    </span>
                    <span class="badge bg-info text-dark">
                        No facturados: {{ filasMuestraTablaNoFact.length }} / {{ filasFiltradasOrdenadasNoFact.length }} filas
                    </span>
                </template>
                <span v-else-if="tieneDatosTabla" class="badge bg-info text-dark">
                    Mostrando {{ filasMuestraTabla.length }} de {{ filasFiltradasOrdenadas.length }} filas
                </span>
            </div>

            <div v-if="tipoinforme == '3' && tieneDatosTabla" class="mb-3">
                <div class="row g-2 mb-3">
                    <div class="col-12 col-md-4">
                        <div class="alert alert-warning mb-0">
                            <div class="fw-semibold">Pacientes pendientes</div>
                            <div class="fs-4">{{ totalPacientesPendientesEnfermeria }}</div>
                        </div>
                    </div>
                    <div class="col-12 col-md-4">
                        <div class="alert alert-info mb-0">
                            <div class="fw-semibold">Enfermeros con pendientes</div>
                            <div class="fs-4">{{ totalEnfermerosConPendientes }}</div>
                        </div>
                    </div>
                    <div class="col-12 col-md-4">
                        <div class="alert alert-secondary mb-0">
                            <div class="fw-semibold">Pacientes sin enfermero asignado</div>
                            <div class="fs-4">{{ totalPacientesSinEnfermero }}</div>
                        </div>
                    </div>
                </div>

                <div class="table-responsive mb-3">
                    <table class="table table-sm table-bordered table-striped align-middle mb-0">
                        <thead class="table-light">
                            <tr>
                                <th>Enfermero</th>
                                <th>Documento</th>
                                <th>Convenio</th>
                                <th>Estado</th>
                                <th>Pacientes sin cerrar</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="fila in resumenEnfermerosPendientes" :key="fila.rowKey">
                                <td>{{ fila.enfermero }}</td>
                                <td>{{ fila.documento }}</td>
                                <td>{{ fila.convenio }}</td>
                                <td>{{ fila.estado }}</td>
                                <td>{{ fila.pendientes }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <template v-if="mostrarResumenPendientesFacturaInforme6">
                <div class="row g-2 mb-3">
                    <div class="col-12 col-md-6">
                        <div class="alert alert-success mb-0">
                            <div class="fw-semibold">Pacientes facturados (todos los CUPS con facturado = true)</div>
                            <div class="fs-4">{{ conteoPacientesFacturadosInforme6 }}</div>
                        </div>
                    </div>
                    <div class="col-12 col-md-6">
                        <div class="alert alert-warning mb-0">
                            <div class="fw-semibold">Pacientes no facturados (con CUPS pendientes)</div>
                            <div class="fs-4">{{ conteoPacientesNoFacturadosInforme6 }}</div>
                        </div>
                    </div>
                </div>

                <h6 class="mb-2">Listado — pacientes facturados</h6>
                <button type="button" class="btn btn-outline-success mb-2 me-2" @click="exportarExcelFiltrado">
                    <i class="bi bi-file-earmark-excel"></i> Exportar facturados
                </button>
                <div class="table-responsive tabla-wrapper mb-4" ref="tablaHtml" @scroll="onTableScroll">
                    <table class="table table-bordered table-striped table-sm align-middle mb-0">
                        <thead class="table-light">
                            <tr>
                                <th v-for="col in columnasTabla" :key="`fac-head-${col.key}`" class="sticky-head sort-head"
                                    @click="ordenarPor(col.key)">
                                    {{ col.label }}
                                    <span v-if="sortKey === col.key">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
                                </th>
                            </tr>
                            <tr>
                                <th v-for="col in columnasTabla" :key="`fac-filter-${col.key}`" class="sticky-filter">
                                    <select v-model="filtros[col.key]" class="form-select form-select-sm" @click.stop>
                                        <option value="">Todos</option>
                                        <option v-for="opcion in opcionesFiltroPorColumna[col.key] || []"
                                            :key="`fac-${col.key}-${opcion}`" :value="opcion">
                                            {{ opcion }}
                                        </option>
                                    </select>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(fila, idx) in filasMuestraTabla" :key="fila.rowKey || `fac-${idx}`">
                                <td v-for="col in columnasTabla" :key="`fac-${fila.rowKey || idx}-${col.key}`">{{
                                    fila[col.key] }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <h6 class="mb-2 mt-4">Listado — pacientes no facturados</h6>
                <button type="button" class="btn btn-outline-success mb-2" @click="exportarExcelNoFacturados">
                    <i class="bi bi-file-earmark-excel"></i> Exportar no facturados
                </button>
                <div class="table-responsive tabla-wrapper mb-4" ref="tablaHtmlNoFact">
                    <table class="table table-bordered table-striped table-sm align-middle mb-0">
                        <thead class="table-light">
                            <tr>
                                <th v-for="col in columnasTablaNoFacturados" :key="`nf-head-${col.key}`"
                                    class="sticky-head sort-head" @click="ordenarPorNoFact(col.key)">
                                    {{ col.label }}
                                    <span v-if="sortKeyNoFact === col.key">{{ sortDirectionNoFact === 'asc' ? '▲' : '▼' }}</span>
                                </th>
                            </tr>
                            <tr>
                                <th v-for="col in columnasTablaNoFacturados" :key="`nf-filter-${col.key}`" class="sticky-filter">
                                    <select v-model="filtrosNoFact[col.key]" class="form-select form-select-sm" @click.stop>
                                        <option value="">Todos</option>
                                        <option v-for="opcion in opcionesFiltroPorColumnaNoFact[col.key] || []"
                                            :key="`nf-${col.key}-${opcion}`" :value="opcion">
                                            {{ opcion }}
                                        </option>
                                    </select>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(fila, idx) in filasMuestraTablaNoFact" :key="fila.rowKey || `nf-${idx}`">
                                <td v-for="col in columnasTablaNoFacturados" :key="`nf-${fila.rowKey || idx}-${col.key}`">{{
                                    fila[col.key] }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </template>

            <template v-else>
                <button v-if="tieneDatosTabla" class="btn btn-outline-success mb-2" @click="exportarExcelFiltrado">
                    <i class="bi bi-file-earmark-excel"></i> Exportar Excel
                </button>
                <div v-if="tieneDatosTabla">
                    <div class="top-scrollbar" ref="topScrollbar" @scroll="onTopScroll">
                        <div class="top-scrollbar-content" :style="{ width: `${anchoTabla}px` }"></div>
                    </div>
                    <div class="table-responsive tabla-wrapper mb-4" ref="tablaHtml" @scroll="onTableScroll">

                        <table class="table table-bordered table-striped table-sm align-middle mb-4">
                            <thead class="table-light">
                                <tr>
                                    <th v-for="col in columnasTabla" :key="`head-${col.key}`" class="sticky-head sort-head"
                                        @click="ordenarPor(col.key)">
                                        {{ col.label }}
                                        <span v-if="sortKey === col.key">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
                                    </th>
                                </tr>
                                <tr>
                                    <th v-for="col in columnasTabla" :key="`filter-${col.key}`" class="sticky-filter">
                                        <select v-model="filtros[col.key]" class="form-select form-select-sm" @click.stop>
                                            <option value="">Todos</option>
                                            <option v-for="opcion in opcionesFiltroPorColumna[col.key] || []"
                                                :key="`${col.key}-${opcion}`" :value="opcion">
                                                {{ opcion }}
                                            </option>
                                        </select>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(fila, idx) in filasMuestraTabla" :key="fila.rowKey || idx">
                                    <td v-for="col in columnasTabla" :key="`${fila.rowKey || idx}-${col.key}`">{{
                                        fila[col.key] }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div v-else class="alert alert-secondary">
                    No hay datos cargados para el informe.
                </div>
            </template>
        </div>

    </div>
</template>

<style>
.datos {
    width: 100%;
    max-width: 100vw;
    margin-left: 0;
    padding: 0 6px;
    overflow-x: hidden;
}

.table-responsive {
    overflow: scroll;
    width: 100%;
    min-width: 100%;
    max-width: 100%;
    scrollbar-gutter: stable both-edges;
}

.tabla-wrapper {
    height: calc(100vh - 230px);
    max-height: calc(100vh - 230px);
    overflow: scroll;
    width: 100%;
    max-width: 100%;
    scrollbar-gutter: stable both-edges;
    padding-bottom: 28px;
    box-sizing: border-box;
}

.top-scrollbar {
    width: 100%;
    max-width: 100%;
    overflow-x: scroll;
    overflow-y: hidden;
    height: 18px;
    margin-bottom: 4px;
    scrollbar-gutter: stable both-edges;
    border: 1px solid #dee2e6;
    border-bottom: 0;
    background: #fff;
}

.top-scrollbar-content {
    height: 1px;
}

.tabla-wrapper table {
    width: max-content;
    min-width: 100%;
}

.tabla-wrapper th,
.tabla-wrapper td {
    white-space: nowrap;
}

.sort-head {
    cursor: pointer;
    user-select: none;
    white-space: nowrap;
}

.sticky-head {
    position: sticky;
    top: 0;
    z-index: 3;
    background: #f8f9fa;
}

.sticky-filter {
    position: sticky;
    top: 38px;
    z-index: 2;
    background: #f8f9fa;
    min-width: 120px;
}

.overlay-spinner {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(255, 255, 255, 0.7);
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.progress-card {
    width: min(560px, calc(100vw - 32px));
    background: #fff;
    border-radius: 16px;
    padding: 24px;
    border: 1px solid #dee2e6;
}

.informe-panel {
    width: 100%;
    max-width: 100%;
}
</style>

<script>
import firebase_api from "@/api/ApiFirebase.js";
import { cacheManager } from "@/utils/cacheManager";
import { getAssignmentBranch, extractActividadIdsFromAssignmentBranch } from "@/utils/facturadosArchive";
import {
    mapState,
    mapActions
} from "vuex";

const COLUMNAS_INFORME = [
    { key: "convenio", label: "Convenio" },
    { key: "origenDatos", label: "Origen BD" },
    { key: "grupo", label: "Grupo" },
    { key: "paciente", label: "Paciente" },
    { key: "sexo", label: "Sexo" },
    { key: "documento", label: "Documento" },
    { key: "telefono", label: "Teléfono" },
    { key: "fechaNac", label: "Fecha Nac." },
    { key: "eps", label: "EPS" },
    { key: "regimen", label: "Régimen" },
    { key: "direccion", label: "Dirección" },
    { key: "barrio", label: "Barrio" },
    { key: "comuna", label: "Comuna" },
    { key: "labVisit", label: "lab/visit" },
    { key: "gestAux", label: "Gest. Aux" },
    { key: "gestEnfermera", label: "Gest. Enfermera" },
    { key: "gestMedica", label: "Gest. Médica" },
    { key: "fechaFacturacion", label: "Fecha Facturación" },
    { key: "remision", label: "Remisión" },
    { key: "actividad", label: "Actividad" },
    { key: "procedimiento", label: "Procedimiento" },
    { key: "cupsNombre", label: "CUPS Nombre" },
    { key: "codigo", label: "Código" },
    { key: "descripcionCUP", label: "Descripción CUP" },
    { key: "cantidad", label: "Cantidad" },
    { key: "detalle", label: "Detalle" },
    { key: "grupoCUP", label: "Grupo CUP" },
    { key: "factura", label: "Factura" },
    { key: "homolog", label: "Homolog" },
    { key: "profesional", label: "Profesional" },
    { key: "rol", label: "Rol" },
    { key: "fechaFactCUP", label: "Fecha Fact. CUP" },
    { key: "facturado", label: "Facturado" },
];

const COLUMNAS_ACTIVIDADES = [
    { key: "convenio", label: "Convenio" },
    { key: "origenDatos", label: "Origen BD" },
    { key: "grupo", label: "Grupo" },
    { key: "fecha", label: "Fecha" },
    { key: "paciente", label: "Paciente" },
    { key: "sexo", label: "Sexo" },
    { key: "documento", label: "Documento" },
    { key: "telefono", label: "Teléfono" },
    { key: "fechaNac", label: "Fecha Nac." },
    { key: "eps", label: "EPS" },
    { key: "regimen", label: "Régimen" },
    { key: "direccion", label: "Dirección" },
    { key: "barrio", label: "Barrio" },
    { key: "comuna", label: "Comuna" },
    { key: "labVisit", label: "lab/visit" },
    { key: "gestAux", label: "Gest. Aux" },
    { key: "gestEnfermera", label: "Gest. Enfermera" },
    { key: "gestMedica", label: "Gest. Médica" },
    { key: "fechaFacturacion", label: "Fecha Facturación" },
    { key: "riesgo", label: "Población Riesgo" },
    { key: "remision", label: "Remisión" },
    { key: "actividad", label: "Actividad" },
    { key: "profesional", label: "Profesional" },
    { key: "rol", label: "Rol" },
    { key: "cupsNombre", label: "CUPS Nombre" },
    { key: "codigo", label: "Código" },
    { key: "descripcionCUP", label: "Descripción CUP" },
    { key: "cantidad", label: "Cantidad" },
    { key: "detalle", label: "Detalle" },
    { key: "grupoCUP", label: "Grupo CUP" },
    { key: "factura", label: "Factura" },
    { key: "homolog", label: "Homolog" },
    { key: "fechaFactCUP", label: "Fecha Fact. CUP" },
    { key: "facturado", label: "Facturado" },
];

const COLUMNAS_PENDIENTES_ENFERMERIA = [
    { key: "convenio", label: "Convenio" },
    { key: "origenDatos", label: "Origen BD" },
    { key: "grupo", label: "Grupo" },
    { key: "fecha", label: "Fecha" },
    { key: "paciente", label: "Paciente" },
    { key: "sexo", label: "Sexo" },
    { key: "documento", label: "Documento" },
    { key: "telefono", label: "Teléfono" },
    { key: "eps", label: "EPS" },
    { key: "riesgo", label: "Población Riesgo" },
    { key: "direccion", label: "Dirección" },
    { key: "enfermero", label: "Enfermero asignado" },
    { key: "documentoEnfermero", label: "Documento enfermero" },
    { key: "estadoEnfermeria", label: "Estado enfermería" },
    { key: "pendientesEnfermero", label: "Pendientes del enfermero" },
    { key: "gestAux", label: "Gest. Aux" },
    { key: "gestEnfermera", label: "Gest. Enfermera" },
    { key: "gestMedica", label: "Gest. Médica" },
    { key: "remision", label: "Remisión" },
];

const COLUMNAS_SIN_FACTURACION = [
    { key: "convenio", label: "Convenio" },
    { key: "origenDatos", label: "Origen BD" },
    { key: "grupo", label: "Grupo" },
    { key: "fecha", label: "Fecha registro" },
    { key: "nombre1", label: "Nombre 1" },
    { key: "nombre2", label: "Nombre 2" },
    { key: "apellido1", label: "Apellido 1" },
    { key: "apellido2", label: "Apellido 2" },
    { key: "sexo", label: "Sexo" },
    { key: "tipodoc", label: "Tipo documento" },
    { key: "numdoc", label: "Documento" },
    { key: "telefono", label: "Teléfono" },
    { key: "fechaNac", label: "Fecha Nac." },
    { key: "eps", label: "EPS" },
    { key: "regimen", label: "Régimen" },
    { key: "direccion", label: "Dirección" },
    { key: "barrio", label: "Barrio" },
    { key: "comuna", label: "Comuna" },
    { key: "labVisit", label: "lab/visit" },
    { key: "gestAux", label: "Gest. Aux" },
    { key: "gestEnfermera", label: "Gest. Enfermera" },
    { key: "gestMedica", label: "Gest. Médica" },
    { key: "gestFacturacion", label: "Gest. Facturación" },
    { key: "fechaFacturacion", label: "Fecha Facturación" },
    { key: "remision", label: "Remisión" },
];

const COLUMNAS_SIN_CIERRE_FACTURACION = [
    { key: "convenio", label: "Convenio" },
    { key: "origenDatos", label: "Origen BD" },
    { key: "grupo", label: "Grupo" },
    { key: "fecha", label: "Fecha" },
    { key: "paciente", label: "Paciente" },
    { key: "sexo", label: "Sexo" },
    { key: "documento", label: "Documento" },
    { key: "telefono", label: "Teléfono" },
    { key: "fechaNac", label: "Fecha Nac." },
    { key: "eps", label: "EPS" },
    { key: "regimen", label: "Régimen" },
    { key: "direccion", label: "Dirección" },
    { key: "barrio", label: "Barrio" },
    { key: "comuna", label: "Comuna" },
    { key: "labVisit", label: "lab/visit" },
    { key: "gestAux", label: "Gest. Aux" },
    { key: "gestEnfermera", label: "Gest. Enfermera" },
    { key: "gestMedica", label: "Gest. Médica" },
    { key: "fechaFacturacion", label: "Fecha cierre fact." },
    { key: "incompleta", label: "Incompleta" },
    { key: "riesgo", label: "Población Riesgo" },
    { key: "remision", label: "Remisión" },
    { key: "actividad", label: "Actividad" },
    { key: "profesional", label: "Profesional CUPS" },
    { key: "facturador", label: "Facturador" },
    { key: "rol", label: "Rol" },
    { key: "cupsNombre", label: "CUPS Nombre" },
    { key: "codigo", label: "Código" },
    { key: "descripcionCUP", label: "Descripción CUP" },
    { key: "cantidad", label: "Cantidad" },
    { key: "detalle", label: "Detalle" },
    { key: "grupoCUP", label: "Grupo CUP" },
    { key: "factura", label: "Factura" },
    { key: "homolog", label: "Homolog" },
    { key: "fechaFactCUP", label: "Fecha Fact. CUP" },
    { key: "facturado", label: "Facturado" },
];

const COLUMNAS_FACTURACION_COMPLETA = [
    { key: "convenio", label: "Convenio" },
    { key: "origenDatos", label: "Origen BD" },
    { key: "grupo", label: "Grupo" },
    { key: "fecha", label: "Fecha registro" },
    { key: "paciente", label: "Paciente" },
    { key: "sexo", label: "Sexo" },
    { key: "documento", label: "Documento" },
    { key: "telefono", label: "Teléfono" },
    { key: "fechaNac", label: "Fecha Nac." },
    { key: "eps", label: "EPS" },
    { key: "regimen", label: "Régimen" },
    { key: "direccion", label: "Dirección" },
    { key: "barrio", label: "Barrio" },
    { key: "comuna", label: "Comuna" },
    { key: "labVisit", label: "lab/visit" },
    { key: "gestAux", label: "Gest. Aux" },
    { key: "gestEnfermera", label: "Gest. Enfermera" },
    { key: "gestMedica", label: "Gest. Médica" },
    { key: "fechaFacturacion", label: "Fecha cierre fact." },
    { key: "remision", label: "Remisión" },
    { key: "sumaCantidadCupsFacturados", label: "Σ Cant. CUPS facturados" },
];

const COLUMNAS_PACIENTES_NO_FACTURADOS_INFORME6 = [
    { key: "convenio", label: "Convenio" },
    { key: "origenDatos", label: "Origen BD" },
    { key: "grupo", label: "Grupo" },
    { key: "fecha", label: "Fecha registro" },
    { key: "paciente", label: "Paciente" },
    { key: "sexo", label: "Sexo" },
    { key: "documento", label: "Documento" },
    { key: "telefono", label: "Teléfono" },
    { key: "fechaNac", label: "Fecha Nac." },
    { key: "eps", label: "EPS" },
    { key: "regimen", label: "Régimen" },
    { key: "direccion", label: "Dirección" },
    { key: "barrio", label: "Barrio" },
    { key: "comuna", label: "Comuna" },
    { key: "labVisit", label: "lab/visit" },
    { key: "gestAux", label: "Gest. Aux" },
    { key: "gestEnfermera", label: "Gest. Enfermera" },
    { key: "gestMedica", label: "Gest. Médica" },
    { key: "fechaFacturacion", label: "Fecha cierre fact." },
    { key: "remision", label: "Remisión" },
    { key: "cupsPendientesPorFacturar", label: "CUPS por facturar (pendientes)" },
];

const crearFiltrosIniciales = (columnas) => columnas.reduce((acc, col) => {
    acc[col.key] = "";
    return acc;
}, {});

function buildFallbackRowDate(tipo, row = {}) {
    const fechaBase = tipo === "2" || tipo === "5" || tipo === "6"
        ? row?.fecha || row?.fechaFacturacion || row?.fechaFactCUP || ""
        : row?.fechaFacturacion || row?.gestEnfermera || row?.fechaFactCUP || row?.fecha || "";

    return String(fechaBase || "").split(" ")[0].trim();
}

function getFuenteInformeLabel(fuente) {
    return fuente === "archivo" ? "Archivo" : "BD principal";
}

const TIPO_CONSULTA_INFORME_FACTURACION_COMPLETA = "Facturación completa (CUPS)";

export default {
    data() {
        return {
            fechaInicio: "",
            fechaFin: "",
            tipoinforme: "",
            convenioInforme: "",
            fuenteInforme: "bd",
            conveniosDisponibles: ["Extramural", "E Basicos"],
            progresoInforme: 0,
            mensajeProgreso: "Preparando consulta...",
            detallesVisibles: [], // Para controlar la visibilidad de detalles por fila
            mostrarFormulario: true,
            cargandoInforme: false,
            encuestasInforme: [],
            filasArchivadasSeguimiento: [],
            filasArchivadasActividades: [],
            enfermerosMap: {},
            actividadesExtraMap: {},
            cupsMap: {},
            cupsCatalogo: {},
            cupsCatalogoPorCodigo: {},
            columnasTabla: COLUMNAS_INFORME,
            columnasTablaNoFacturados: [],
            filtros: { ...crearFiltrosIniciales(COLUMNAS_INFORME) },
            filtrosNoFact: {},
            sortKey: "",
            sortDirection: "asc",
            sortKeyNoFact: "",
            sortDirectionNoFact: "asc",
            anchoTabla: 0,
            sincronizandoScroll: false,
            consultaActual: {
                tipo: "",
                finicial: "",
                ffinal: "",
                profesional: "",
                convenio: "",
                fuente: "",
            },
        };
    },
    methods: {
        actualizarProgreso(valor, mensaje) {
            this.progresoInforme = Math.max(0, Math.min(100, Math.round(valor)));
            if (mensaje) {
                this.mensajeProgreso = mensaje;
            }
        },

        esperarRender() {
            return new Promise((resolve) => {
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => resolve());
                });
            });
        },

        onTopScroll() {
            if (this.sincronizandoScroll) return;
            const top = this.$refs.topScrollbar;
            const tabla = this.$refs.tablaHtml;
            if (!top || !tabla) return;

            this.sincronizandoScroll = true;
            tabla.scrollLeft = top.scrollLeft;
            requestAnimationFrame(() => {
                this.sincronizandoScroll = false;
            });
        },

        onTableScroll() {
            if (this.sincronizandoScroll) return;
            const top = this.$refs.topScrollbar;
            const tabla = this.$refs.tablaHtml;
            if (!top || !tabla) return;

            this.sincronizandoScroll = true;
            top.scrollLeft = tabla.scrollLeft;
            requestAnimationFrame(() => {
                this.sincronizandoScroll = false;
            });
        },

        actualizarAnchoTabla() {
            this.$nextTick(() => {
                const tabla = this.$refs.tablaHtml;
                if (!tabla) {
                    this.anchoTabla = 0;
                    return;
                }

                const tableEl = tabla.querySelector('table');
                this.anchoTabla = tableEl ? tableEl.scrollWidth : 0;

                const top = this.$refs.topScrollbar;
                if (top) {
                    top.scrollLeft = tabla.scrollLeft || 0;
                }
            });
        },

        escaparHtml(valor) {
            return String(valor ?? "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/\"/g, "&quot;")
                .replace(/'/g, "&#039;");
        },

        obtenerColumnasPorTipo(tipo) {
            if (tipo === "2") return COLUMNAS_ACTIVIDADES;
            if (tipo === "3") return COLUMNAS_PENDIENTES_ENFERMERIA;
            if (tipo === "4") return COLUMNAS_SIN_FACTURACION;
            if (tipo === "5") return COLUMNAS_SIN_CIERRE_FACTURACION;
            if (tipo === "6") return COLUMNAS_FACTURACION_COMPLETA;
            return COLUMNAS_INFORME;
        },

        esCierreFacturacionEncuesta(paciente = {}) {
            if (paciente.status_facturacion === true) return true;
            return String(paciente.status_facturacion ?? "").trim().toLowerCase() === "true";
        },

        obtenerNombrePorDocumento(documento) {
            const doc = String(documento || "").trim();
            if (!doc) return "";
            const registro = this.enfermerosMap[doc];
            return registro?.nombre || doc;
        },

        pacienteTieneAlgunCupConFactura(paciente = {}) {
            const actividades = Array.isArray(paciente.seguimientoActividades) ? paciente.seguimientoActividades : [];
            for (const actividad of actividades) {
                const asignaciones = Array.isArray(actividad.asignaciones) ? actividad.asignaciones : [];
                for (const asig of asignaciones) {
                    const n = this.normalizarAsignacionInforme(asig, actividad);
                    if (String(n.factura || "").trim()) {
                        return true;
                    }
                }
            }
            return false;
        },

        estaCupFacturadoTrue(asigRaw = {}) {
            if (asigRaw?.facturado === true) return true;
            const f = String(asigRaw?.facturado ?? "").trim().toLowerCase();
            return ["true", "si", "sí", "1"].includes(f);
        },

        cupFaltaPorFacturar(asigRaw = {}) {
            return !this.estaCupFacturadoTrue(asigRaw);
        },

        obtenerAsignacionesPlanasPaciente(paciente = {}) {
            const asignacionesRaw = [];
            const actividades = Array.isArray(paciente.seguimientoActividades) ? paciente.seguimientoActividades : [];
            for (const actividad of actividades) {
                const asignaciones = Array.isArray(actividad.asignaciones) ? actividad.asignaciones : [];
                for (const asig of asignaciones) {
                    asignacionesRaw.push(asig);
                }
            }
            return asignacionesRaw;
        },

        parseCantidadCupsInforme(valor) {
            const s = String(valor ?? "").trim().replace(",", ".");
            if (!s) return 0;
            const n = Number(s);
            return Number.isFinite(n) ? n : 0;
        },

        construirFilasFacturacionCompleta() {
            const filas = [];
            const encuestas = Array.isArray(this.encuestasInforme) ? this.encuestasInforme : [];

            for (const paciente of encuestas) {
                const asignacionesRaw = this.obtenerAsignacionesPlanasPaciente(paciente);

                if (!asignacionesRaw.length) {
                    continue;
                }

                let sumaCantidad = 0;
                let hayPendiente = false;

                for (const asig of asignacionesRaw) {
                    if (this.cupFaltaPorFacturar(asig)) {
                        hayPendiente = true;
                        break;
                    }
                    sumaCantidad += this.parseCantidadCupsInforme(asig?.cantidad);
                }

                if (hayPendiente) {
                    continue;
                }

                filas.push({
                    rowKey: `${paciente.id || paciente.numdoc || "sin-id"}-fact-completa`,
                    convenio: paciente.convenio || "",
                    origenDatos: paciente?.__archived ? "BD respaldo" : "BD principal",
                    grupo: paciente.grupo || "",
                    fecha: paciente.fecha || "",
                    paciente: `${paciente.nombre1 || ""} ${paciente.apellido1 || ""} ${paciente.apellido2 || ""}`.trim(),
                    sexo: paciente.sexo || "",
                    documento: `${paciente.tipodoc || ""}-${paciente.numdoc || ""}`,
                    telefono: paciente.telefono || "",
                    fechaNac: paciente.fechaNac || "",
                    eps: paciente.eps || "",
                    regimen: paciente.regimen || "",
                    direccion: paciente.direccion || "",
                    barrio: paciente.barrioVeredacomuna?.barrio || "",
                    comuna: paciente.barrioVeredacomuna?.comuna || "",
                    labVisit: `${paciente.Agenda_tomademuestras?.cita_tomamuestras ? 'Sí' : 'No'}/${paciente.Agenda_Visitamedica?.cita_visitamedica ? 'Sí' : 'No'}`,
                    gestAux: paciente.status_gest_aux ? paciente.fechagestAuxiliar : "No",
                    gestEnfermera: paciente.status_gest_enfermera ? paciente.fechagestEnfermera : "No",
                    gestMedica: paciente.status_gest_medica ? paciente.fechagestMedica : "No",
                    fechaFacturacion: this.formatearFechaLatina(paciente.FechaFacturacion) || String(paciente.FechaFacturacion || "").trim() || "",
                    remision: paciente.requiereRemision || "",
                    sumaCantidadCupsFacturados: sumaCantidad,
                });
            }

            return filas;
        },

        construirFilasInforme6NoFacturados() {
            const filas = [];
            const encuestas = Array.isArray(this.encuestasInforme) ? this.encuestasInforme : [];

            for (const paciente of encuestas) {
                const asignacionesRaw = this.obtenerAsignacionesPlanasPaciente(paciente);

                if (!asignacionesRaw.length) {
                    continue;
                }

                const cupsPendientesPorFacturar = asignacionesRaw.filter((asig) => this.cupFaltaPorFacturar(asig)).length;
                if (!cupsPendientesPorFacturar) {
                    continue;
                }

                filas.push({
                    rowKey: `${paciente.id || paciente.numdoc || "sin-id"}-no-fact-cups`,
                    convenio: paciente.convenio || "",
                    origenDatos: paciente?.__archived ? "BD respaldo" : "BD principal",
                    grupo: paciente.grupo || "",
                    fecha: paciente.fecha || "",
                    paciente: `${paciente.nombre1 || ""} ${paciente.apellido1 || ""} ${paciente.apellido2 || ""}`.trim(),
                    sexo: paciente.sexo || "",
                    documento: `${paciente.tipodoc || ""}-${paciente.numdoc || ""}`,
                    telefono: paciente.telefono || "",
                    fechaNac: paciente.fechaNac || "",
                    eps: paciente.eps || "",
                    regimen: paciente.regimen || "",
                    direccion: paciente.direccion || "",
                    barrio: paciente.barrioVeredacomuna?.barrio || "",
                    comuna: paciente.barrioVeredacomuna?.comuna || "",
                    labVisit: `${paciente.Agenda_tomademuestras?.cita_tomamuestras ? 'Sí' : 'No'}/${paciente.Agenda_Visitamedica?.cita_visitamedica ? 'Sí' : 'No'}`,
                    gestAux: paciente.status_gest_aux ? paciente.fechagestAuxiliar : "No",
                    gestEnfermera: paciente.status_gest_enfermera ? paciente.fechagestEnfermera : "No",
                    gestMedica: paciente.status_gest_medica ? paciente.fechagestMedica : "No",
                    fechaFacturacion: this.formatearFechaLatina(paciente.FechaFacturacion) || String(paciente.FechaFacturacion || "").trim() || "",
                    remision: paciente.requiereRemision || "",
                    cupsPendientesPorFacturar,
                });
            }

            return filas;
        },

        esGestionEnfermeriaCerrada(valor) {
            if (valor === true) return true;
            return String(valor ?? "").trim().toLowerCase() === "true";
        },

        async cargarMapaEnfermeros() {
            const usuarios = await this.consultarUsuariosFirestore();
            this.enfermerosMap = (usuarios || []).reduce((acc, usuario) => {
                const documento = String(usuario?.numDocumento || "").trim();
                if (!documento) return acc;

                acc[documento] = {
                    nombre: usuario?.nombre || usuario?.userName || documento,
                    documento,
                    convenio: usuario?.convenio || "",
                    cargo: usuario?.cargo || "",
                };
                return acc;
            }, {});
        },

        normalizarConvenio(valor) {
            return String(valor || "").trim().toLowerCase();
        },

        usaFuenteArchivo() {
            return false;
        },

        filtrarEncuestasPorConvenio(encuestas = []) {
            const convenioSeleccionado = this.normalizarConvenio(this.convenioInforme);
            if (!convenioSeleccionado) return encuestas;

            return encuestas.filter((encuesta) => this.normalizarConvenio(encuesta?.convenio) === convenioSeleccionado);
        },

        obtenerInfoEnfermero(idEnfermero) {
            const documento = String(idEnfermero || "").trim();
            if (!documento) {
                return {
                    nombre: "Sin enfermero asignado",
                    documento: "",
                    convenio: "",
                };
            }

            const encontrado = this.enfermerosMap[documento];
            if (encontrado) return encontrado;

            return {
                nombre: `Enfermero ${documento}`,
                documento,
                convenio: "",
            };
        },

        construirFilasExportacion() {
            const filas = [];
            const encuestas = Array.isArray(this.encuestasInforme) ? this.encuestasInforme : [];

            for (const paciente of encuestas) {
                const base = {
                    origenDatos: "BD principal",
                    grupo: paciente.grupo || "",
                    paciente: `${paciente.nombre1 || ""} ${paciente.apellido1 || ""} ${paciente.apellido2 || ""}`.trim(),
                    sexo: paciente.sexo || "",
                    documento: `${paciente.tipodoc || ""}-${paciente.numdoc || ""}`,
                    telefono: paciente.telefono || "",
                    fechaNac: paciente.fechaNac || "",
                    eps: paciente.eps || "",
                    regimen: paciente.regimen || "",
                    direccion: paciente.direccion || "",
                    barrio: paciente.barrioVeredacomuna?.barrio || "",
                    comuna: paciente.barrioVeredacomuna?.comuna || "",
                    labVisit: `${paciente.Agenda_tomademuestras?.cita_tomamuestras ? 'Sí' : 'No'}/${paciente.Agenda_Visitamedica?.cita_visitamedica ? 'Sí' : 'No'}`,
                    gestAux: paciente.status_gest_aux ? paciente.fechagestAuxiliar : "No",
                    gestEnfermera: paciente.status_gest_enfermera ? paciente.fechagestEnfermera : "No",
                    gestMedica: paciente.status_gest_medica ? paciente.fechagestMedica : "No",
                    fechaFacturacion: this.formatearFechaLatina(paciente.FechaFacturacion) || "No",
                    remision: paciente.requiereRemision || "",
                    convenio: paciente.convenio || "",
                };

                const actividades = Array.isArray(paciente.seguimientoActividades) ? paciente.seguimientoActividades : [];

                if (!actividades.length) {
                    filas.push({
                        ...base,
                        rowKey: `${paciente.id}-sin-actividad`,
                        actividad: "Sin actividades",
                        procedimiento: "",
                        cupsNombre: "",
                        codigo: "",
                        descripcionCUP: "",
                        cantidad: "",
                        detalle: "",
                        grupoCUP: "",
                        factura: "",
                        homolog: "",
                        profesional: "",
                        rol: "",
                        convenio: base.convenio,
                        fechaFactCUP: "",
                        facturado: "",
                        origenDatos: base.origenDatos,
                    });
                    continue;
                }

                for (const actividad of actividades) {
                    const asignaciones = Array.isArray(actividad.asignaciones) ? actividad.asignaciones : [];
                    if (!asignaciones.length) {
                        filas.push({
                            ...base,
                            rowKey: `${paciente.id}-${actividad.key}-sin-asignacion`,
                            actividad: actividad.nombre || "Actividad",
                            procedimiento: "Sin asignaciones",
                            cupsNombre: "",
                            codigo: "",
                            descripcionCUP: "",
                            cantidad: "",
                            detalle: "",
                            grupoCUP: "",
                            factura: "",
                            homolog: "",
                            profesional: "",
                            rol: "",
                            convenio: base.convenio,
                            fechaFactCUP: "",
                            facturado: "",
                            origenDatos: base.origenDatos,
                        });
                        continue;
                    }

                    for (let i = 0; i < asignaciones.length; i++) {
                        const asig = asignaciones[i];
                        const idActividad = String(asig?.actividadId ?? asig?.idActividad ?? actividad?.key ?? "");
                        const asignacion = this.normalizarAsignacionInforme(asig, actividad);
                        filas.push({
                            ...base,
                            rowKey: `${paciente.id}-${actividad.key}-${i}`,
                            actividad: actividad.nombre || "Actividad",
                            procedimiento: asignacion.cupsNombre,
                            cupsNombre: asignacion.cupsNombre,
                            codigo: asignacion.codigo,
                            descripcionCUP: asignacion.descripcionCUP,
                            cantidad: asignacion.cantidad,
                            detalle: asignacion.detalle,
                            grupoCUP: asignacion.grupoCUP,
                            factura: asignacion.factura,
                            homolog: asignacion.homolog,
                            profesional: asignacion.profesional,
                            rol: asignacion.rol,
                            convenio: base.convenio,
                            fechaFactCUP: asignacion.fechaFactCUP,
                            facturado: asignacion.facturado,
                            origenDatos: base.origenDatos,
                        });
                    }
                }
            }

            return filas;
        },

        construirFilasActividades() {
            const filas = [];
            const encuestas = Array.isArray(this.encuestasInforme) ? this.encuestasInforme : [];

            for (const paciente of encuestas) {
                const base = {
                    convenio: paciente.convenio || "",
                    origenDatos: "BD principal",
                    grupo: paciente.grupo || "",
                    fecha: paciente.fecha || "",
                    paciente: `${paciente.nombre1 || ""} ${paciente.apellido1 || ""} ${paciente.apellido2 || ""}`.trim(),
                    sexo: paciente.sexo || "",
                    documento: `${paciente.tipodoc || ""}-${paciente.numdoc || ""}`,
                    telefono: paciente.telefono || "",
                    fechaNac: paciente.fechaNac || "",
                    eps: paciente.eps || "",
                    regimen: paciente.regimen || "",
                    direccion: paciente.direccion || "",
                    barrio: paciente.barrioVeredacomuna?.barrio || "",
                    comuna: paciente.barrioVeredacomuna?.comuna || "",
                    labVisit: `${paciente.Agenda_tomademuestras?.cita_tomamuestras ? 'Sí' : 'No'}/${paciente.Agenda_Visitamedica?.cita_visitamedica ? 'Sí' : 'No'}`,
                    gestAux: paciente.status_gest_aux ? paciente.fechagestAuxiliar : "No",
                    gestEnfermera: paciente.status_gest_enfermera ? paciente.fechagestEnfermera : "No",
                    gestMedica: paciente.status_gest_medica ? paciente.fechagestMedica : "No",
                    fechaFacturacion: this.formatearFechaLatina(paciente.FechaFacturacion) || "No",
                    riesgo: paciente.poblacionRiesgo || "",
                    remision: paciente.requiereRemision || "",
                };

                const actividades = Array.isArray(paciente.seguimientoActividades) ? paciente.seguimientoActividades : [];

                if (!actividades.length) {
                    filas.push({
                        ...base,
                        rowKey: `${paciente.id}-sin-actividad`,
                        actividad: "Sin actividades",
                        profesional: "",
                        rol: "",
                        cupsNombre: "",
                        codigo: "",
                        descripcionCUP: "",
                        cantidad: "",
                        detalle: "",
                        grupoCUP: "",
                        factura: "",
                        homolog: "",
                        fechaFactCUP: "",
                        facturado: "",
                        origenDatos: base.origenDatos,
                    });
                    continue;
                }

                for (const actividad of actividades) {
                    const asignaciones = Array.isArray(actividad.asignaciones) ? actividad.asignaciones : [];

                    if (!asignaciones.length) {
                        filas.push({
                            ...base,
                            rowKey: `${paciente.id}-${actividad.key}-sin-asignacion`,
                            actividad: actividad.nombre || "Actividad",
                            profesional: "",
                            rol: "",
                            cupsNombre: "",
                            codigo: "",
                            descripcionCUP: "",
                            cantidad: "",
                            detalle: "",
                            grupoCUP: "",
                            factura: "",
                            homolog: "",
                            fechaFactCUP: "",
                            facturado: "",
                            origenDatos: base.origenDatos,
                        });
                        continue;
                    }

                    for (let i = 0; i < asignaciones.length; i++) {
                        const asig = asignaciones[i];
                        const asignacion = this.normalizarAsignacionInforme(asig, actividad);

                        filas.push({
                            ...base,
                            rowKey: `${paciente.id}-${actividad.key}-${i}`,
                            actividad: actividad.nombre || "Actividad",
                            profesional: asignacion.profesional,
                            rol: asignacion.rol,
                            cupsNombre: asignacion.cupsNombre,
                            codigo: asignacion.codigo,
                            descripcionCUP: asignacion.descripcionCUP,
                            cantidad: asignacion.cantidad,
                            detalle: asignacion.detalle,
                            grupoCUP: asignacion.grupoCUP,
                            factura: asignacion.factura,
                            homolog: asignacion.homolog,
                            fechaFactCUP: asignacion.fechaFactCUP,
                            facturado: asignacion.facturado,
                            origenDatos: base.origenDatos,
                        });
                    }
                }
            }

            return filas;
        },

        construirFilasSinCierreFacturacion() {
            const filas = [];
            const encuestas = Array.isArray(this.encuestasInforme) ? this.encuestasInforme : [];

            for (const paciente of encuestas) {
                if (this.esCierreFacturacionEncuesta(paciente)) {
                    continue;
                }

                const incompleta = this.pacienteTieneAlgunCupConFactura(paciente) ? "Sí" : "No";

                const base = {
                    convenio: paciente.convenio || "",
                    origenDatos: "BD principal",
                    grupo: paciente.grupo || "",
                    fecha: paciente.fecha || "",
                    paciente: `${paciente.nombre1 || ""} ${paciente.apellido1 || ""} ${paciente.apellido2 || ""}`.trim(),
                    sexo: paciente.sexo || "",
                    documento: `${paciente.tipodoc || ""}-${paciente.numdoc || ""}`,
                    telefono: paciente.telefono || "",
                    fechaNac: paciente.fechaNac || "",
                    eps: paciente.eps || "",
                    regimen: paciente.regimen || "",
                    direccion: paciente.direccion || "",
                    barrio: paciente.barrioVeredacomuna?.barrio || "",
                    comuna: paciente.barrioVeredacomuna?.comuna || "",
                    labVisit: `${paciente.Agenda_tomademuestras?.cita_tomamuestras ? 'Sí' : 'No'}/${paciente.Agenda_Visitamedica?.cita_visitamedica ? 'Sí' : 'No'}`,
                    gestAux: paciente.status_gest_aux ? paciente.fechagestAuxiliar : "No",
                    gestEnfermera: paciente.status_gest_enfermera ? paciente.fechagestEnfermera : "No",
                    gestMedica: paciente.status_gest_medica ? paciente.fechagestMedica : "No",
                    fechaFacturacion: this.formatearFechaLatina(paciente.FechaFacturacion) || "No",
                    incompleta,
                    riesgo: paciente.poblacionRiesgo || "",
                    remision: paciente.requiereRemision || "",
                };

                const actividades = Array.isArray(paciente.seguimientoActividades) ? paciente.seguimientoActividades : [];

                if (!actividades.length) {
                    filas.push({
                        ...base,
                        rowKey: `${paciente.id}-sin-actividad`,
                        actividad: "Sin actividades",
                        profesional: "",
                        facturador: "",
                        rol: "",
                        cupsNombre: "",
                        codigo: "",
                        descripcionCUP: "",
                        cantidad: "",
                        detalle: "",
                        grupoCUP: "",
                        factura: "",
                        homolog: "",
                        fechaFactCUP: "",
                        facturado: "",
                        origenDatos: base.origenDatos,
                    });
                    continue;
                }

                for (const actividad of actividades) {
                    const asignaciones = Array.isArray(actividad.asignaciones) ? actividad.asignaciones : [];

                    if (!asignaciones.length) {
                        filas.push({
                            ...base,
                            rowKey: `${paciente.id}-${actividad.key}-sin-asignacion`,
                            actividad: actividad.nombre || "Actividad",
                            profesional: "",
                            facturador: "",
                            rol: "",
                            cupsNombre: "",
                            codigo: "",
                            descripcionCUP: "",
                            cantidad: "",
                            detalle: "",
                            grupoCUP: "",
                            factura: "",
                            homolog: "",
                            fechaFactCUP: "",
                            facturado: "",
                            origenDatos: base.origenDatos,
                        });
                        continue;
                    }

                    for (let i = 0; i < asignaciones.length; i++) {
                        const asig = asignaciones[i];
                        const asignacion = this.normalizarAsignacionInforme(asig, actividad);

                        filas.push({
                            ...base,
                            rowKey: `${paciente.id}-${actividad.key}-${i}`,
                            actividad: actividad.nombre || "Actividad",
                            profesional: asignacion.profesional,
                            facturador: this.obtenerNombrePorDocumento(asignacion.factProfDoc),
                            rol: asignacion.rol,
                            cupsNombre: asignacion.cupsNombre,
                            codigo: asignacion.codigo,
                            descripcionCUP: asignacion.descripcionCUP,
                            cantidad: asignacion.cantidad,
                            detalle: asignacion.detalle,
                            grupoCUP: asignacion.grupoCUP,
                            factura: asignacion.factura,
                            homolog: asignacion.homolog,
                            fechaFactCUP: asignacion.fechaFactCUP,
                            facturado: asignacion.facturado,
                            origenDatos: base.origenDatos,
                        });
                    }
                }
            }

            return filas;
        },

        construirFilasPendientesEnfermeria() {
            const resumenPorEnfermero = this.resumenPendientesPorDocumento;

            return (Array.isArray(this.encuestasInforme) ? this.encuestasInforme : []).map((paciente) => {
                const infoEnfermero = this.obtenerInfoEnfermero(paciente?.idEnfermeroAtiende);
                const documentoEnfermero = String(infoEnfermero.documento || "").trim();
                const pendientesEnfermero = documentoEnfermero
                    ? (resumenPorEnfermero[documentoEnfermero]?.pendientes || 0)
                    : 0;

                return {
                    rowKey: `${paciente.id || paciente.numdoc || "sin-id"}-pendiente-enfermeria`,
                    convenio: paciente.convenio || "",
                    origenDatos: paciente?.__archived ? "BD respaldo" : "BD principal",
                    grupo: paciente.grupo || "",
                    fecha: paciente.fecha || "",
                    paciente: `${paciente.nombre1 || ""} ${paciente.apellido1 || ""} ${paciente.apellido2 || ""}`.trim(),
                    sexo: paciente.sexo || "",
                    documento: `${paciente.tipodoc || ""}-${paciente.numdoc || ""}`,
                    telefono: paciente.telefono || "",
                    eps: paciente.eps || "",
                    riesgo: paciente.poblacionRiesgo || "",
                    direccion: paciente.direccion || "",
                    enfermero: infoEnfermero.nombre,
                    documentoEnfermero: infoEnfermero.documento,
                    estadoEnfermeria: "Pendiente",
                    pendientesEnfermero,
                    gestAux: paciente.status_gest_aux ? paciente.fechagestAuxiliar : "No",
                    gestEnfermera: this.esGestionEnfermeriaCerrada(paciente.status_gest_enfermera)
                        ? paciente.fechagestEnfermera || "Sí"
                        : "No",
                    gestMedica: paciente.status_gest_medica ? paciente.fechagestMedica : "No",
                    remision: paciente.requiereRemision || "",
                };
            });
        },

        valorIndicaDatoFacturacion(valor) {
            if (valor === true) return true;
            if (valor === false || valor === null || valor === undefined) return false;
            if (typeof valor === "number") return !Number.isNaN(valor) && valor !== 0;
            if (Array.isArray(valor)) return valor.some((item) => this.valorIndicaDatoFacturacion(item));
            if (valor && typeof valor === "object") return Object.values(valor).some((item) => this.valorIndicaDatoFacturacion(item));

            const normalizado = String(valor).trim().toLowerCase();
            return normalizado !== "" &&
                !["false", "no", "n/a", "na", "null", "undefined", "0"].includes(normalizado);
        },

        normalizarClaveFacturacion(clave) {
            return String(clave || "")
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase()
                .replace(/[\s_-]+/g, "");
        },

        esClaveFacturacionEncuesta(clave) {
            const normalizada = this.normalizarClaveFacturacion(clave);
            return normalizada.includes("fact");
        },

        tieneDatosFacturacionEnEncuesta(nodo, visitados = new Set()) {
            if (!nodo || typeof nodo !== "object" || visitados.has(nodo)) {
                return false;
            }

            visitados.add(nodo);

            return Object.entries(nodo).some(([clave, valor]) => {
                if (this.esClaveFacturacionEncuesta(clave) && this.valorIndicaDatoFacturacion(valor)) {
                    return true;
                }

                return valor && typeof valor === "object"
                    ? this.tieneDatosFacturacionEnEncuesta(valor, visitados)
                    : false;
            });
        },

        tieneDatosFacturacionPaciente(paciente = {}) {
            return this.tieneDatosFacturacionEnEncuesta(paciente);
        },

        obtenerClavePacienteEncuesta(paciente = {}) {
            const documento = String(paciente.numdoc || "")
                .trim()
                .replace(/[^\dA-Za-z]/g, "")
                .toLowerCase();
            if (documento) {
                return documento;
            }

            const nombreCompleto = [
                paciente.nombre1,
                paciente.nombre2,
                paciente.apellido1,
                paciente.apellido2,
                paciente.fechaNac,
            ].map((valor) => String(valor || "").trim().toLowerCase()).filter(Boolean).join("|");

            return nombreCompleto || String(paciente.idEncuesta || paciente.id || "").trim();
        },

        obtenerPacientesEncuestaSinFacturacion(encuestas = []) {
            const pacientesPorClave = new Map();

            for (const paciente of Array.isArray(encuestas) ? encuestas : []) {
                const clavePaciente = this.obtenerClavePacienteEncuesta(paciente);
                const claveUnica = clavePaciente || `sin-documento-${pacientesPorClave.size}`;
                const grupo = pacientesPorClave.get(claveUnica) || {
                    paciente,
                    tieneFacturacion: false,
                };

                if (this.tieneDatosFacturacionPaciente(paciente)) {
                    grupo.tieneFacturacion = true;
                }

                pacientesPorClave.set(claveUnica, grupo);
            }

            return Array.from(pacientesPorClave.values())
                .filter((grupo) => !grupo.tieneFacturacion)
                .map((grupo) => grupo.paciente);
        },

        construirFilasSinFacturacion() {
            return (Array.isArray(this.encuestasInforme) ? this.encuestasInforme : []).map((paciente) => {
                return {
                    rowKey: `${paciente.id || paciente.numdoc || "sin-id"}-sin-facturacion`,
                    convenio: paciente.convenio || "",
                    origenDatos: "BD principal",
                    grupo: paciente.grupo || "",
                    fecha: paciente.fecha || "",
                    nombre1: paciente.nombre1 || "",
                    nombre2: paciente.nombre2 || "",
                    apellido1: paciente.apellido1 || "",
                    apellido2: paciente.apellido2 || "",
                    sexo: paciente.sexo || "",
                    tipodoc: paciente.tipodoc || "",
                    numdoc: paciente.numdoc || "",
                    telefono: paciente.telefono || "",
                    fechaNac: paciente.fechaNac || "",
                    eps: paciente.eps || "",
                    regimen: paciente.regimen || "",
                    direccion: paciente.direccion || "",
                    barrio: paciente.barrioVeredacomuna?.barrio || "",
                    comuna: paciente.barrioVeredacomuna?.comuna || "",
                    labVisit: `${paciente.Agenda_tomademuestras?.cita_tomamuestras ? 'Sí' : 'No'}/${paciente.Agenda_Visitamedica?.cita_visitamedica ? 'Sí' : 'No'}`,
                    gestAux: paciente.status_gest_aux ? paciente.fechagestAuxiliar : "No",
                    gestEnfermera: paciente.status_gest_enfermera ? paciente.fechagestEnfermera : "No",
                    gestMedica: paciente.status_gest_medica ? paciente.fechagestMedica : "No",
                    gestFacturacion: "No",
                    fechaFacturacion: "No",
                    remision: paciente.requiereRemision || "",
                };
            });
        },

        obtenerNombreActividadDesdeKey(keyActividad) {
            const key = String(keyActividad || "");
            if (!key) return "";
            return this.actividadesExtraMap[key] || key;
        },

        obtenerNombreCupDesdeId(cupId, fallback = "") {
            const key = String(cupId || "");
            if (!key) return fallback;
            return this.cupsMap[key] || fallback || key;
        },

        tieneValorInforme(valor) {
            if (valor === true || valor === false) return true;
            if (typeof valor === "number") return !Number.isNaN(valor);
            if (Array.isArray(valor)) return valor.length > 0;
            if (valor && typeof valor === "object") return Object.keys(valor).length > 0;
            return String(valor ?? "").trim() !== "";
        },

        seleccionarPrimerValor(...valores) {
            for (const valor of valores) {
                if (this.tieneValorInforme(valor)) {
                    return valor;
                }
            }
            return "";
        },

        construirClaveFilaInforme(row = {}) {
            return [
                String(this.tipoinforme || "").trim(),
                String(row?.rowKey || "").trim(),
                String(row?.idEncuesta || row?.id || "").trim(),
                String(row?.documento || "").trim(),
                String(row?.actividad || "").trim(),
                String(row?.cupsNombre || row?.procedimiento || "").trim(),
                buildFallbackRowDate(this.tipoinforme, row),
            ].join("|");
        },

        fusionarFilasInforme(principal = {}, respaldo = {}) {
            const keys = new Set([
                ...Object.keys(respaldo || {}),
                ...Object.keys(principal || {}),
            ]);

            return Array.from(keys).reduce((acc, key) => {
                acc[key] = this.seleccionarPrimerValor(principal[key], respaldo[key]);
                return acc;
            }, {});
        },

        consolidarFilasInforme(filas = []) {
            const consolidadas = new Map();

            (Array.isArray(filas) ? filas : []).forEach((fila, index) => {
                const key = this.construirClaveFilaInforme(fila) || `${this.tipoinforme || "fila"}-${index}`;
                const existente = consolidadas.get(key);

                if (!existente) {
                    consolidadas.set(key, fila);
                    return;
                }

                consolidadas.set(key, this.fusionarFilasInforme(existente, fila));
            });

            return Array.from(consolidadas.values());
        },

        obtenerRegistroCup(cupId, codigo = "") {
            const id = String(cupId || "").trim();
            const codigoNormalizado = String(codigo || "").trim();

            return this.cupsCatalogo[id]
                || this.cupsCatalogoPorCodigo[codigoNormalizado]
                || {};
        },

        formatearFacturadoInforme(valor) {
            if (valor === true) return "Sí";
            if (valor === false) return "No";

            const normalizado = String(valor ?? "").trim().toLowerCase();
            if (["true", "si", "sí"].includes(normalizado)) return "Sí";
            if (["false", "no"].includes(normalizado)) return "No";
            return "";
        },

        normalizarAsignacionInforme(asig = {}, actividad = {}) {
            const cupId = this.seleccionarPrimerValor(asig?.cupsId, asig?.id, asig?.Homolog, asig?.homolog);
            const cupCatalogo = this.obtenerRegistroCup(cupId, asig?.codigo);
            const cupsNombre = this.seleccionarPrimerValor(
                asig?.cupsNombre,
                asig?.DescripcionCUP,
                cupCatalogo?.DescripcionCUP,
                asig?.codigo,
                cupId
            );

            return {
                cupId,
                actividadId: this.seleccionarPrimerValor(asig?.actividadId, asig?.idActividad, actividad?.key),
                profesional: this.seleccionarPrimerValor(asig?.nombreProf, asig?.nombrePtof, asig?.nombre, cupCatalogo?.profesional),
                rol: this.seleccionarPrimerValor(asig?.key, asig?.rol, actividad?.key),
                cupsNombre,
                codigo: this.seleccionarPrimerValor(asig?.codigo, cupCatalogo?.codigo, cupId),
                descripcionCUP: this.seleccionarPrimerValor(asig?.DescripcionCUP, asig?.cupsNombre, cupCatalogo?.DescripcionCUP, cupsNombre),
                cantidad: this.seleccionarPrimerValor(asig?.cantidad, ""),
                detalle: this.seleccionarPrimerValor(asig?.detalle, ""),
                grupoCUP: this.seleccionarPrimerValor(asig?.Grupo, asig?.grupo, asig?.cupsGrupo, cupCatalogo?.Grupo),
                factura: this.seleccionarPrimerValor(asig?.FactNum, asig?.factura),
                homolog: this.seleccionarPrimerValor(asig?.Homolog, asig?.homolog),
                fechaFactCUP: this.seleccionarPrimerValor(asig?.fechaFacturacion, asig?.fechaFactCUP),
                facturado: this.formatearFacturadoInforme(asig?.facturado),
                factProfDoc: this.seleccionarPrimerValor(asig?.FactProf, asig?.factProf),
            };
        },

        construirHtmlExportacion(filas = this.filasFiltradasOrdenadas, columnas = null) {
            const cols = Array.isArray(columnas) && columnas.length ? columnas : this.columnasTabla;
            const headers = cols.map((col) => col.label);
            const thead = `<thead><tr>${headers.map((h) => `<th>${this.escaparHtml(h)}</th>`).join("")}</tr></thead>`;
            const tbody = `<tbody>${filas.map((f) => `
                <tr>
                    ${cols.map((col) => `<td>${this.escaparHtml(f[col.key])}</td>`).join("")}
                </tr>`).join("")}</tbody>`;

            return `<table border="1">${thead}${tbody}</table>`;
        },

        construirTextoExportacion(filas = this.filasFiltradasOrdenadas, columnas = null) {
            const cols = Array.isArray(columnas) && columnas.length ? columnas : this.columnasTabla;
            const headers = cols.map((col) => col.label);
            const lineas = [headers.join("\t")];

            for (const f of filas) {
                lineas.push(cols
                    .map((col) => String(f[col.key] ?? "").replace(/\t/g, " ").replace(/\n/g, " "))
                    .join("\t"));
            }

            return lineas.join("\n");
        },

        ordenarPor(key) {
            if (this.sortKey === key) {
                this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
                return;
            }
            this.sortKey = key;
            this.sortDirection = "asc";
        },

        ordenarPorNoFact(key) {
            if (this.sortKeyNoFact === key) {
                this.sortDirectionNoFact = this.sortDirectionNoFact === "asc" ? "desc" : "asc";
                return;
            }
            this.sortKeyNoFact = key;
            this.sortDirectionNoFact = "asc";
        },

        construirNombreArchivoInforme() {
            const tipo = this.tipoinforme === "2"
                ? "actividades"
                : (this.tipoinforme === "3"
                    ? "pendientes_enfermeria"
                    : (this.tipoinforme === "4"
                        ? "sin_datos_facturacion"
                        : (this.tipoinforme === "5"
                            ? "sin_cierre_facturacion"
                            : (this.tipoinforme === "6" ? "facturacion_completa" : "seguimiento"))));
            const fechaInicio = this.fechaInicio || "sin_fecha_inicio";
            const fechaFin = this.fechaFin || "sin_fecha_fin";
            return `informe_${tipo}_${fechaInicio}_a_${fechaFin}.xls`;
        },

        construirNombreArchivoInformeNoFacturados() {
            const fechaInicio = this.fechaInicio || "sin_fecha_inicio";
            const fechaFin = this.fechaFin || "sin_fecha_fin";
            return `informe_no_facturados_${fechaInicio}_a_${fechaFin}.xls`;
        },

        exportarExcelFiltrado() {
            const filas = this.filasFiltradasOrdenadas;
            const html = this.construirHtmlExportacion(filas, this.columnasTabla);
            const blob = new Blob([`<html><head><meta charset="UTF-8"></head><body>${html}</body></html>`], {
                type: "application/vnd.ms-excel;charset=utf-8;"
            });

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = this.construirNombreArchivoInforme();
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        },

        exportarExcelNoFacturados() {
            const filas = this.filasFiltradasOrdenadasNoFact;
            const columnas = this.columnasTablaNoFacturados;
            const html = this.construirHtmlExportacion(filas, columnas);
            const blob = new Blob([`<html><head><meta charset="UTF-8"></head><body>${html}</body></html>`], {
                type: "application/vnd.ms-excel;charset=utf-8;"
            });

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = this.construirNombreArchivoInformeNoFacturados();
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        },

        copiarHtmlTabla() {
            const html = this.construirHtmlExportacion();
            const texto = this.construirTextoExportacion();

            if (navigator.clipboard && window.ClipboardItem) {
                const item = new window.ClipboardItem({
                    'text/html': new Blob([html], { type: 'text/html' }),
                    'text/plain': new Blob([texto], { type: 'text/plain' }),
                });

                navigator.clipboard.write([item]).then(() => {
                    this.$toast && this.$toast.success
                        ? this.$toast.success('Tabla copiada en formato Excel (columnas separadas)')
                        : alert('Tabla copiada en formato Excel (columnas separadas)');
                }).catch(() => {
                    navigator.clipboard.writeText(texto).then(() => {
                        this.$toast && this.$toast.success
                            ? this.$toast.success('Tabla copiada como texto tabulado')
                            : alert('Tabla copiada como texto tabulado');
                    }).catch(() => {
                        this.$toast && this.$toast.error
                            ? this.$toast.error('No se pudo copiar la tabla')
                            : alert('No se pudo copiar la tabla');
                    });
                });
                return;
            }

            navigator.clipboard.writeText(texto).then(() => {
                this.$toast && this.$toast.success
                    ? this.$toast.success('Tabla copiada como texto tabulado')
                    : alert('Tabla copiada como texto tabulado');
            }).catch(() => {
                this.$toast && this.$toast.error
                    ? this.$toast.error('No se pudo copiar la tabla')
                    : alert('No se pudo copiar la tabla');
            });
        },

        formatearFechaLatina(fechaISO) {
            if (!fechaISO) return ''; // En caso de fecha vacía o nula
            const fecha = new Date(fechaISO);
            const opciones = {
                year: 'numeric',
                month: 'short',
                day: '2-digit'
            };
            // Formatea con locales español y ajusta separadores
            return fecha.toLocaleDateString('es-ES', opciones).replace(/\s/g, '/');
        },

        /*  */

        getActividadesPlanas(paciente) {
            // Devuelve un array plano de objetos para la tabla de actividades
            if (!paciente.tipoActividad || !Array.isArray(paciente.tipoActividad) || paciente.tipoActividad.length === 0) return [];
            const rows = [];
            for (const actividad of paciente.tipoActividad) {
                if (actividad.Profesional && Array.isArray(actividad.Profesional) && actividad.Profesional.length) {
                    for (const profesional of actividad.Profesional) {
                        if (
                            actividad.cups &&
                            actividad.cups[profesional] &&
                            Array.isArray(actividad.cups[profesional].cups) &&
                            actividad.cups[profesional].cups.length
                        ) {
                            for (const cup of actividad.cups[profesional].cups) {
                                rows.push({
                                    actividad: actividad.nombre,
                                    profesional,
                                    cup: cup.DescripcionCUP,
                                    cantidad: cup.cantidad,
                                    detalle: cup.detalle
                                });
                            }
                        } else {
                            rows.push({
                                actividad: actividad.nombre,
                                profesional,
                                cup: 'Sin CUPS registrados',
                                cantidad: '',
                                detalle: ''
                            });
                        }
                    }
                } else {
                    rows.push({
                        actividad: actividad.nombre,
                        profesional: 'Sin profesionales registrados',
                        cup: '',
                        cantidad: '',
                        detalle: ''
                    });
                }
            }
            return rows;
        },

        normalizarActividadesEncuesta(actividadesEncuesta) {
            const tipoActividad = actividadesEncuesta?.tipoActividad || actividadesEncuesta;
            if (!tipoActividad || typeof tipoActividad !== "object") return [];

            return Object.values(tipoActividad)
                .filter((actividad) => actividad && typeof actividad === "object")
                .map((actividad) => ({
                    ...actividad,
                    key: actividad.key !== undefined && actividad.key !== null ? String(actividad.key) : "",
                    nombre: this.obtenerNombreActividadDesdeKey(actividad.key) || actividad.nombre || actividad.descripcion || actividad.key || "Actividad",
                }));
        },

        esCupHojaInforme(value) {
            return !!(
                value &&
                typeof value === "object" &&
                ("actividadId" in value ||
                    "idActividad" in value ||
                    "DescripcionCUP" in value ||
                    "cupsNombre" in value ||
                    "codigo" in value ||
                    "FactNum" in value ||
                    "FactProf" in value)
            );
        },

        flattenCupsInforme(cupsNode, parentContext = {}) {
            return Object.entries(cupsNode && typeof cupsNode === "object" ? cupsNode : {}).flatMap(([storageKey, value]) => {
                if (!value || typeof value !== "object") {
                    return [];
                }

                if (this.esCupHojaInforme(value)) {
                    return [{
                        ...value,
                        _storageKey: storageKey,
                        key: value?.key || value?.rol || parentContext?.key || "",
                        nombreProf: value?.nombreProf || value?.nombrePtof || value?.nombre || parentContext?.nombreProf || "",
                    }];
                }

                const nextContext = {
                    key: value?.key || value?.rol || parentContext?.key || storageKey || "",
                    nombreProf: value?.nombreProf || value?.nombrePtof || value?.nombre || parentContext?.nombreProf || "",
                };

                return this.flattenCupsInforme(value, nextContext);
            });
        },

        normalizarCupsAsignaciones(asignacionEncuesta) {
            if (!asignacionEncuesta || !asignacionEncuesta.cups) return [];

            if (Array.isArray(asignacionEncuesta.cups)) {
                return asignacionEncuesta.cups.filter(Boolean).map((cup) => ({
                    ...cup,
                    key: cup?.key || cup?.rol || asignacionEncuesta?.key || asignacionEncuesta?.rol || "",
                    nombreProf: cup?.nombreProf || cup?.nombrePtof || cup?.nombre || asignacionEncuesta?.nombreProf || asignacionEncuesta?.nombrePtof || asignacionEncuesta?.nombre || "",
                }));
            }

            if (typeof asignacionEncuesta.cups === "object") {
                return this.flattenCupsInforme(asignacionEncuesta.cups, {
                    key: asignacionEncuesta?.key || asignacionEncuesta?.rol || "",
                    nombreProf: asignacionEncuesta?.nombreProf || asignacionEncuesta?.nombrePtof || asignacionEncuesta?.nombre || "",
                });
            }

            return [];
        },

        formatearAsignacion(assignment) {
            const descripcion = assignment?.DescripcionCUP || assignment?.cupsNombre || assignment?.codigo || "Asignación";
            const cantidad = assignment?.cantidad !== undefined && assignment?.cantidad !== null ? ` x${assignment.cantidad}` : "";
            const factura = assignment?.FactNum ? ` (Fact: ${assignment.FactNum})` : "";
            return `${descripcion}${cantidad}${factura}`;
        },

        construirSeguimientoActividadesPaciente(paciente, actividadesGlobal, asignacionesGlobal) {
            const idEncuesta = String(paciente.id || paciente.idEncuesta || "");
            const assignmentBranch = getAssignmentBranch(paciente, asignacionesGlobal[idEncuesta]);
            const cupsAsignados = this.normalizarCupsAsignaciones(assignmentBranch);
            const actividadesDesdeNodo = this.normalizarActividadesEncuesta(actividadesGlobal[idEncuesta]);
            const actividadesMap = new Map();

            actividadesDesdeNodo.forEach((actividad) => {
                const key = String(actividad?.key || "").trim();
                if (!key) return;
                actividadesMap.set(key, actividad);
            });

            extractActividadIdsFromAssignmentBranch(assignmentBranch).forEach((idActividad) => {
                const key = String(idActividad || "").trim();
                if (!key || actividadesMap.has(key)) return;

                actividadesMap.set(key, {
                    key,
                    nombre: this.obtenerNombreActividadDesdeKey(key) || key || "Actividad",
                });
            });

            return Array.from(actividadesMap.values()).map((actividad) => {
                const idActividad = String(actividad.key || "");

                const asignaciones = cupsAsignados.filter((cup) => {
                    const cupActividadId = String(cup?.actividadId ?? cup?.idActividad ?? "");
                    return cupActividadId && idActividad && cupActividadId === idActividad;
                });

                return {
                    ...actividad,
                    asignaciones,
                };
            });
        },

        async cargarDatasetsSeguimiento() {
            const keys = {
                actividades: "admin_report_actividades_raw",
                asignaciones: "admin_report_asignaciones_raw",
                actividadesExtra: "admin_report_actividades_extra_raw",
                cups: "admin_report_cups_raw",
            };

            const cachedActividades = cacheManager.get(keys.actividades);
            const cachedAsignaciones = cacheManager.get(keys.asignaciones);
            const cachedActividadesExtra = cacheManager.get(keys.actividadesExtra);
            const cachedCups = cacheManager.get(keys.cups);

            if (cachedActividades && cachedAsignaciones && cachedActividadesExtra && cachedCups) {
                return {
                    actividadesGlobal: cachedActividades,
                    asignacionesGlobal: cachedAsignaciones,
                    actividadesExtraGlobal: cachedActividadesExtra,
                    cupsGlobal: cachedCups,
                };
            }

            const [respActividades, respAsignaciones, respActividadesExtra, respCups] = await Promise.all([
                firebase_api.get("/Actividades.json"),
                firebase_api.get("/Asignaciones.json"),
                firebase_api.get("/actividadesExtra.json"),
                firebase_api.get("/cups.json"),
            ]);

            const actividadesGlobal = respActividades.data || {};
            const asignacionesGlobal = respAsignaciones.data || {};
            const actividadesExtraGlobal = respActividadesExtra.data || {};
            const cupsGlobal = respCups.data || {};

            cacheManager.set(keys.actividades, actividadesGlobal);
            cacheManager.set(keys.asignaciones, asignacionesGlobal);
            cacheManager.set(keys.actividadesExtra, actividadesExtraGlobal);
            cacheManager.set(keys.cups, cupsGlobal);

            return {
                actividadesGlobal,
                asignacionesGlobal,
                actividadesExtraGlobal,
                cupsGlobal,
            };
        },

        async actualizarDatosSeguimientoInforme() {
            const encuestasBase = Array.isArray(this.EncuestasAdmin) ? this.EncuestasAdmin : [];
            const encuestas = this.filtrarEncuestasPorConvenio(encuestasBase);

            if (!encuestas.length) {
                this.encuestasInforme = [];
                return;
            }

            if (this.tipoinforme === "3") {
                this.encuestasInforme = encuestas;
                return;
            }

            if (this.tipoinforme === "4") {
                this.encuestasInforme = this.obtenerPacientesEncuestaSinFacturacion(encuestas);
                return;
            }

            if (this.usaFuenteArchivo()) {
                this.encuestasInforme = [];
                return;
            }

            try {
                const {
                    actividadesGlobal,
                    asignacionesGlobal,
                    actividadesExtraGlobal,
                    cupsGlobal,
                } = await this.cargarDatasetsSeguimiento();

                this.actividadesExtraMap = Object.values(actividadesExtraGlobal).reduce((acc, item) => {
                    if (item && item.key !== undefined && item.key !== null) {
                        acc[String(item.key)] = item.nombre || item.descripcion || String(item.key);
                    }
                    return acc;
                }, {});

                this.cupsMap = Object.entries(cupsGlobal).reduce((acc, [id, item]) => {
                    if (item && typeof item === "object") {
                        acc[String(id)] = item.DescripcionCUP || item.nombre || item.codigo || String(id);
                    }
                    return acc;
                }, {});

                this.cupsCatalogo = Object.entries(cupsGlobal).reduce((acc, [id, item]) => {
                    if (item && typeof item === "object") {
                        acc[String(id)] = {
                            id: String(id),
                            codigo: item.codigo || "",
                            DescripcionCUP: item.DescripcionCUP || item.nombre || "",
                            Grupo: item.Grupo || item.grupo || item.group || "",
                            Homolog: item.Homolog || item.homolog || "",
                            profesional: item.profesional || "",
                        };
                    }
                    return acc;
                }, {});

                this.cupsCatalogoPorCodigo = Object.values(this.cupsCatalogo).reduce((acc, item) => {
                    const codigo = String(item?.codigo || "").trim();
                    if (codigo) {
                        acc[codigo] = item;
                    }
                    return acc;
                }, {});

                this.encuestasInforme = encuestas.map((paciente) => {
                    const pacienteConActividades = {
                        ...paciente,
                        seguimientoActividades: this.construirSeguimientoActividadesPaciente(
                            paciente,
                            actividadesGlobal,
                            asignacionesGlobal
                        ),
                    };

                    return pacienteConActividades;
                });
            } catch (error) {
                console.error("Error cargando actividades/asignaciones para informe:", error);
                this.encuestasInforme = encuestas.map((paciente) => ({
                    ...paciente,
                    seguimientoActividades: [],
                }));
            }
        },
        async cargarFilasArchivadas() {
            this.filasArchivadasSeguimiento = [];
            this.filasArchivadasActividades = [];
        },

        async cargarTodasEncuestasAdmin() {
            const cached = cacheManager.get("encuestas");
            if (Array.isArray(cached)) {
                this.$store.commit('setEncuestasAdmin', cached);
                return cached;
            }

            const { data } = await firebase_api.get("/Encuesta.json");
            const encuestas = Object.entries(data || {}).map(([id, value]) => ({
                id,
                ...(value || {}),
            }));

            cacheManager.set("encuestas", encuestas);
            this.$store.commit('setEncuestasAdmin', encuestas);
            return encuestas;
        },

        /*  */
        ...mapActions(["GetRegistersbyRangeCerrados", "GetRegistersbyRangeGeneral", "GetRegistersbyRangePendientesEnfermeria", "consultarUsuariosFirestore"]),

        async generarInforme() {
            this.cargandoInforme = true;
            this.actualizarProgreso(5, "Preparando parámetros del informe...");
            this.$store.commit('setEncuestasAdmin', []);
            let consultaUsada = null;
            try {
                this.columnasTabla = this.obtenerColumnasPorTipo(this.tipoinforme);
                this.filtros = { ...crearFiltrosIniciales(this.columnasTabla) };
                if (this.tipoinforme === "6") {
                    this.columnasTablaNoFacturados = [...COLUMNAS_PACIENTES_NO_FACTURADOS_INFORME6];
                    this.filtrosNoFact = { ...crearFiltrosIniciales(this.columnasTablaNoFacturados) };
                    this.sortKeyNoFact = "";
                    this.sortDirectionNoFact = "asc";
                } else {
                    this.columnasTablaNoFacturados = [];
                    this.filtrosNoFact = {};
                    this.sortKeyNoFact = "";
                    this.sortDirectionNoFact = "asc";
                }
                this.actualizarProgreso(15, "Consultando registros...");

                if (this.fechaInicio && this.fechaFin && this.tipoinforme == "1") {
                    let parametros = {
                        finicial: this.fechaInicio,
                        ffinal: this.fechaFin,
                        fuente: "bd",
                    };
                    await this.GetRegistersbyRangeCerrados(parametros);
                    consultaUsada = {
                        tipo: "Seguimiento",
                        finicial: parametros.finicial,
                        ffinal: parametros.ffinal,
                        profesional: "",
                        convenio: this.convenioInforme || "Todos",
                        fuente: getFuenteInformeLabel("bd"),
                    };
                } else if (this.fechaInicio && this.fechaFin && this.tipoinforme == "2") {
                    let parametros = {
                        finicial: this.fechaInicio,
                        ffinal: this.fechaFin,
                        fuente: "bd",
                    };
                    await this.GetRegistersbyRangeGeneral(parametros);
                    consultaUsada = {
                        tipo: "Actividades",
                        finicial: parametros.finicial,
                        ffinal: parametros.ffinal,
                        profesional: "",
                        convenio: this.convenioInforme || "Todos",
                        fuente: getFuenteInformeLabel("bd"),
                    };
                } else if (this.fechaInicio && this.fechaFin && this.tipoinforme == "3") {
                    let parametros = {
                        finicial: this.fechaInicio,
                        ffinal: this.fechaFin,
                        fuente: "bd",
                    };
                    await this.GetRegistersbyRangePendientesEnfermeria(parametros);
                    consultaUsada = {
                        tipo: "Pendientes enfermería",
                        finicial: parametros.finicial,
                        ffinal: parametros.ffinal,
                        profesional: "",
                        convenio: this.convenioInforme || "Todos",
                        fuente: getFuenteInformeLabel("bd"),
                    };
                } else if (this.fechaInicio && this.fechaFin && this.tipoinforme == "5") {
                    let parametros = {
                        finicial: this.fechaInicio,
                        ffinal: this.fechaFin,
                        fuente: "bd",
                    };
                    await this.GetRegistersbyRangeGeneral(parametros);
                    consultaUsada = {
                        tipo: "Sin cierre de facturación",
                        finicial: parametros.finicial,
                        ffinal: parametros.ffinal,
                        profesional: "",
                        convenio: this.convenioInforme || "Todos",
                        fuente: getFuenteInformeLabel("bd"),
                    };
                } else if (this.fechaInicio && this.fechaFin && this.tipoinforme == "6") {
                    let parametros = {
                        finicial: this.fechaInicio,
                        ffinal: this.fechaFin,
                        fuente: "bd",
                    };
                    await this.GetRegistersbyRangeGeneral(parametros);
                    consultaUsada = {
                        tipo: TIPO_CONSULTA_INFORME_FACTURACION_COMPLETA,
                        finicial: parametros.finicial,
                        ffinal: parametros.ffinal,
                        profesional: "",
                        convenio: this.convenioInforme || "Todos",
                        fuente: getFuenteInformeLabel("bd"),
                    };
                } else if (this.tipoinforme == "4") {
                    if ((this.fechaInicio && !this.fechaFin) || (!this.fechaInicio && this.fechaFin)) {
                        this.$toast.error("Debe seleccionar ambas fechas o dejarlas vacías para consultar todas las encuestas");
                        this.actualizarProgreso(0, "Preparando consulta...");
                        this.cargandoInforme = false;
                        return;
                    }

                    const tieneRango = this.fechaInicio && this.fechaFin;
                    let parametros = {
                        finicial: this.fechaInicio,
                        ffinal: this.fechaFin,
                        fuente: "bd",
                    };

                    if (tieneRango) {
                        await this.GetRegistersbyRangeGeneral(parametros);
                    } else {
                        await this.cargarTodasEncuestasAdmin();
                    }

                    consultaUsada = {
                        tipo: "Sin datos de facturación",
                        finicial: tieneRango ? parametros.finicial : "",
                        ffinal: tieneRango ? parametros.ffinal : "",
                        profesional: "",
                        convenio: this.convenioInforme || "Todos",
                        fuente: getFuenteInformeLabel("bd"),
                    };
                } else {
                    this.$toast.error("Debe seleccionar tipo de informe y rango de fechas");
                    this.actualizarProgreso(0, "Preparando consulta...");
                    this.cargandoInforme = false;
                    return;
                }

                this.actualizarProgreso(55, "Procesando actividades y asignaciones...");
                if (this.tipoinforme === "3" || this.tipoinforme === "5") {
                    await this.cargarMapaEnfermeros();
                }
                await this.actualizarDatosSeguimientoInforme();
                await this.cargarFilasArchivadas();
                if (consultaUsada) {
                    this.consultaActual = consultaUsada;
                }
                this.$toast && this.$toast.success ? this.$toast.success('✅ Informe generado exitosamente') : alert('✅ Informe generado exitosamente');
                if (this.tipoinforme === "6") {
                    this.mostrarFormulario = !this.tieneDatosTabla;
                } else {
                    this.mostrarFormulario = this.filasInformeTabla.length === 0;
                }
                this.actualizarProgreso(80, "Renderizando tabla...");
                await this.$nextTick();
                this.actualizarAnchoTabla();
                await this.$nextTick();
                await this.esperarRender();
                this.actualizarProgreso(100, "Informe generado correctamente");
                await new Promise((resolve) => setTimeout(resolve, 250));
            } catch (error) {
                console.error("Error al generar el informe:", error);
            } finally {
                this.cargandoInforme = false;
            }
        },

        parametrizarNuevoInforme() {
            this.mostrarFormulario = true;
            this.tipoinforme = "";
            this.clearFormInformes();
        },

        clearFormInformes() {
            this.$store.commit('setEncuestasAdmin', [])
            this.mostrarFormulario = true;
            this.fechaInicio = "";
            this.fechaFin = "";
            this.convenioInforme = "";
            this.fuenteInforme = "bd";
            this.progresoInforme = 0;
            this.mensajeProgreso = "Preparando consulta...";
            this.encuestasInforme = [];
            this.filasArchivadasSeguimiento = [];
            this.filasArchivadasActividades = [];
            this.columnasTabla = this.obtenerColumnasPorTipo(this.tipoinforme);
            this.filtros = { ...crearFiltrosIniciales(this.columnasTabla) };
            this.columnasTablaNoFacturados = [];
            this.filtrosNoFact = {};
            this.sortKeyNoFact = "";
            this.sortDirectionNoFact = "asc";
            this.sortKey = "";
            this.sortDirection = "asc";
            this.anchoTabla = 0;
            this.consultaActual = {
                tipo: "",
                finicial: "",
                ffinal: "",
                profesional: "",
                convenio: "",
                fuente: "",
            };
        },

        toggleDetalles(idx) {
            this.$set(this.detallesVisibles, idx, !this.detallesVisibles[idx]);

        },
    },

    computed: {
        ...mapState(["userData", "EncuestasAdmin"]),
        columnasTipoSeleccionado() {
            if (!["1", "2", "3", "4", "5", "6"].includes(this.tipoinforme)) {
                return [];
            }
            return this.obtenerColumnasPorTipo(this.tipoinforme);
        },
        nombreTipoInformeSeleccionado() {
            if (this.tipoinforme === "2") return "de Actividades";
            if (this.tipoinforme === "3") return "de Pendientes de Enfermería";
            if (this.tipoinforme === "4") return "sin Datos de Facturación";
            if (this.tipoinforme === "5") return "sin Cierre de Facturación";
            if (this.tipoinforme === "6") return "Facturación completa (CUPS)";
            if (this.tipoinforme === "1") return "de Seguimiento";
            return "";
        },
        tituloListado() {
            if (this.tipoinforme === "2") return "Listado de actividades";
            if (this.tipoinforme === "3") return "Listado de pacientes pendientes por enfermería";
            if (this.tipoinforme === "4") return "Listado de pacientes sin datos de facturación";
            if (this.tipoinforme === "5") return "Listado de pacientes sin cierre de facturación (con detalle por CUPS)";
            if (this.tipoinforme === "6") {
                return "Facturación por CUPS (facturado en asignaciones)";
            }
            return "Listado de Pacientes finalizados";
        },
        filasFiltradasOrdenadas() {
            let filas = [...this.filasInformeTabla];

            filas = filas.filter((fila) => this.columnasTabla.every((col) => {
                const filtro = String(this.filtros[col.key] || "").trim();
                if (!filtro) return true;
                const valor = String(fila[col.key] ?? "").trim();
                return valor === filtro;
            }));

            if (this.sortKey) {
                const direction = this.sortDirection === "asc" ? 1 : -1;
                const key = this.sortKey;
                filas.sort((a, b) => {
                    const va = String(a[key] ?? "").toLowerCase();
                    const vb = String(b[key] ?? "").toLowerCase();

                    const na = Number(va);
                    const nb = Number(vb);
                    const ambosNumericos = !Number.isNaN(na) && !Number.isNaN(nb) && va !== "" && vb !== "";

                    if (ambosNumericos) {
                        return (na - nb) * direction;
                    }

                    if (va < vb) return -1 * direction;
                    if (va > vb) return 1 * direction;
                    return 0;
                });
            }

            return filas;
        },
        filasFiltradasOrdenadasNoFact() {
            const cols = this.columnasTablaNoFacturados;
            if (!Array.isArray(cols) || !cols.length) {
                return [];
            }

            let filas = [...this.filasInformeTablaNoFacturados];

            filas = filas.filter((fila) => cols.every((col) => {
                const filtro = String(this.filtrosNoFact[col.key] || "").trim();
                if (!filtro) return true;
                const valor = String(fila[col.key] ?? "").trim();
                return valor === filtro;
            }));

            if (this.sortKeyNoFact) {
                const direction = this.sortDirectionNoFact === "asc" ? 1 : -1;
                const key = this.sortKeyNoFact;
                filas.sort((a, b) => {
                    const va = String(a[key] ?? "").toLowerCase();
                    const vb = String(b[key] ?? "").toLowerCase();

                    const na = Number(va);
                    const nb = Number(vb);
                    const ambosNumericos = !Number.isNaN(na) && !Number.isNaN(nb) && va !== "" && vb !== "";

                    if (ambosNumericos) {
                        return (na - nb) * direction;
                    }

                    if (va < vb) return -1 * direction;
                    if (va > vb) return 1 * direction;
                    return 0;
                });
            }

            return filas;
        },
        opcionesFiltroPorColumna() {
            const opciones = {};
            for (const col of this.columnasTabla) {
                const unicos = new Set(
                    this.filasInformeTabla
                        .map((fila) => String(fila[col.key] ?? "").trim())
                        .filter((valor) => valor !== "")
                );
                opciones[col.key] = Array.from(unicos).sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
            }
            return opciones;
        },
        opcionesFiltroPorColumnaNoFact() {
            const cols = this.columnasTablaNoFacturados;
            if (!Array.isArray(cols) || !cols.length) {
                return {};
            }

            const opciones = {};
            for (const col of cols) {
                const unicos = new Set(
                    this.filasInformeTablaNoFacturados
                        .map((fila) => String(fila[col.key] ?? "").trim())
                        .filter((valor) => valor !== "")
                );
                opciones[col.key] = Array.from(unicos).sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
            }
            return opciones;
        },
        filasInformeTabla() {
            const filasVivas = this.tipoinforme === "2"
                ? this.construirFilasActividades()
                : (this.tipoinforme === "5"
                    ? this.construirFilasSinCierreFacturacion()
                    : (this.tipoinforme === "6"
                        ? this.construirFilasFacturacionCompleta()
                        : (this.tipoinforme === "3"
                            ? this.construirFilasPendientesEnfermeria()
                            : (this.tipoinforme === "4" ? this.construirFilasSinFacturacion() : this.construirFilasExportacion()))));
            const filasArchivadas = this.tipoinforme === "2" || this.tipoinforme === "5" || this.tipoinforme === "6"
                ? this.filasArchivadasActividades
                : this.filasArchivadasSeguimiento;
            const filasFuente = this.usaFuenteArchivo()
                ? (this.tipoinforme === "3" ? filasVivas : (Array.isArray(filasArchivadas) ? filasArchivadas : []))
                : filasVivas;
            return this.consolidarFilasInforme(filasFuente);
        },
        filasInformeTablaNoFacturados() {
            if (this.tipoinforme !== "6") {
                return [];
            }

            const filasVivas = this.construirFilasInforme6NoFacturados();
            const filasArchivadas = this.filasArchivadasActividades;
            const filasFuente = this.usaFuenteArchivo()
                ? (Array.isArray(filasArchivadas) ? filasArchivadas : [])
                : filasVivas;
            return this.consolidarFilasInforme(filasFuente);
        },
        tieneDatosTabla() {
            if (this.mostrarResumenPendientesFacturaInforme6) {
                const hayCohort = (Array.isArray(this.encuestasInforme) ? this.encuestasInforme.length : 0) > 0;
                return hayCohort
                    || this.filasInformeTabla.length > 0
                    || this.filasInformeTablaNoFacturados.length > 0;
            }
            return this.filasInformeTabla.length > 0;
        },
        tieneDatosTablaOInforme6() {
            return this.tieneDatosTabla || this.mostrarResumenPendientesFacturaInforme6;
        },
        filasMuestraTabla() {
            return this.filasFiltradasOrdenadas.slice(0, 10);
        },
        filasMuestraTablaNoFact() {
            return this.filasFiltradasOrdenadasNoFact.slice(0, 10);
        },
        parametrosConsultaEtiquetas() {
            const etiquetas = [];
            if (this.consultaActual.tipo) etiquetas.push(`Tipo: ${this.consultaActual.tipo}`);
            if (this.consultaActual.finicial && this.consultaActual.ffinal) {
                etiquetas.push(`Rango: ${this.consultaActual.finicial} a ${this.consultaActual.ffinal}`);
            }
            if (this.consultaActual.convenio) etiquetas.push(`Convenio: ${this.consultaActual.convenio}`);
            if (this.consultaActual.fuente) etiquetas.push(`Fuente: ${this.consultaActual.fuente}`);
            if (this.consultaActual.profesional) etiquetas.push(`Profesional: ${this.consultaActual.profesional}`);
            return etiquetas;
        },
        resumenPendientesPorDocumento() {
            return (Array.isArray(this.encuestasInforme) ? this.encuestasInforme : []).reduce((acc, encuesta) => {
                const documento = String(encuesta?.idEnfermeroAtiende || "").trim();
                if (!documento) return acc;

                const infoEnfermero = this.obtenerInfoEnfermero(documento);
                if (!acc[documento]) {
                    acc[documento] = {
                        rowKey: `resumen-enfermero-${documento}`,
                        enfermero: infoEnfermero.nombre,
                        documento: infoEnfermero.documento,
                        convenio: infoEnfermero.convenio || encuesta?.convenio || "",
                        estado: "Pendiente",
                        pendientes: 0,
                    };
                }

                acc[documento].pendientes += 1;
                return acc;
            }, {});
        },
        resumenEnfermerosPendientes() {
            return Object.values(this.resumenPendientesPorDocumento)
                .sort((a, b) => {
                    if (b.pendientes !== a.pendientes) return b.pendientes - a.pendientes;
                    return String(a.enfermero || "").localeCompare(String(b.enfermero || ""), 'es', { sensitivity: 'base' });
                });
        },
        totalPacientesPendientesEnfermeria() {
            return Array.isArray(this.encuestasInforme) ? this.encuestasInforme.length : 0;
        },
        totalEnfermerosConPendientes() {
            return this.resumenEnfermerosPendientes.length;
        },
        totalPacientesSinEnfermero() {
            return (Array.isArray(this.encuestasInforme) ? this.encuestasInforme : [])
                .filter((encuesta) => !String(encuesta?.idEnfermeroAtiende || "").trim())
                .length;
        },

        mostrarResumenPendientesFacturaInforme6() {
            return this.tipoinforme === "6"
                && this.consultaActual.tipo === TIPO_CONSULTA_INFORME_FACTURACION_COMPLETA;
        },

        conteoPacientesFacturadosInforme6() {
            if (!this.mostrarResumenPendientesFacturaInforme6) {
                return 0;
            }
            return this.filasInformeTabla.length;
        },

        conteoPacientesNoFacturadosInforme6() {
            if (!this.mostrarResumenPendientesFacturaInforme6) {
                return 0;
            }
            return this.filasInformeTablaNoFacturados.length;
        },

    },
    watch: {
        tieneDatosTablaOInforme6(nuevoValor) {
            if (nuevoValor) {
                this.mostrarFormulario = false;
            }
        }
    },
    onload() {
        this.$store.commit('setEncuestasAdmin', []);
        this.detallesVisibles = [];
        this.clearFormInformes();
    },

    mounted() {
        window.addEventListener('resize', this.actualizarAnchoTabla);
        // Inicializar detallesVisibles según la cantidad de pacientes
        this.$watch(
            () => this.EncuestasAdmin,
            (nuevo) => {
                this.detallesVisibles = Array.isArray(nuevo) ? Array(nuevo.length).fill(false) : [];
                this.actualizarDatosSeguimientoInforme();
                this.actualizarAnchoTabla();
            }, {
            immediate: true,
            deep: false
        }
        );
    },
    beforeUnmount() {
        window.removeEventListener('resize', this.actualizarAnchoTabla);
    },
};
</script>
