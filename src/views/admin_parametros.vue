<template>
  <div class="container-fluid">
    <h3>Admin Parametros</h3>
    <br />
    <nav>
      <div class="nav nav-tabs" id="nav-tab" role="tablist">
        <button class="nav-link active" id="nav-home-tab" data-bs-toggle="tab" data-bs-target="#nav-home" type="button"
          role="tab" aria-controls="nav-home" aria-selected="true">
          COMUNAS Y BARRIOS
        </button>
        <button class="nav-link" id="nav-profile-tab" data-bs-toggle="tab" data-bs-target="#nav-profile" type="button"
          role="tab" aria-controls="nav-profile" aria-selected="false">
          EPS
        </button>
        <button class="nav-link" id="nav-contact-tab" data-bs-toggle="tab" data-bs-target="#nav-contact" type="button"
          role="tab" aria-controls="nav-contact" aria-selected="false">
          CUPS
        </button>
        <button class="nav-link" id="nav-contratos-tab" data-bs-toggle="tab" data-bs-target="#nav-contratos"
          type="button" role="tab" aria-controls="nav-contratos" aria-selected="false">
          CONTRATOS
        </button>
      </div>
    </nav>
    <div class="tab-content" id="nav-tabContent">
      <!-- ========== TAB: COMUNAS Y BARRIOS ========== -->
      <div class="tab-pane fade show active" id="nav-home" role="tabpanel" aria-labelledby="nav-home-tab" tabindex="0">
        <br />
        <div class="container">
          <h6>Opciones disponibles para las encuestas Comunas/Barrios</h6>
          <br />

          <div class="row">
            <div class="col-4">
              <input type="number" id="comuna" name="comuna" class="form-control form-control-sm" placeholder="Comuna"
                v-model="comuna" />
            </div>
            <div class="col-4">
              <input type="text" id="barrio" name="barrio" class="form-control form-control-sm" placeholder="Barrio"
                v-model="barrio" />
            </div>
            <div class="col-4">
              <button type="button" class="btn btn-sm btn-warning" @click="saveComunaBarrio">
                {{ comunaBarrioEditId ? 'Actualizar' : '+ Guardar' }}
              </button>
              <button v-if="comunaBarrioEditId" type="button" class="btn btn-sm btn-secondary ms-2"
                @click="clearFormComunaBarrio">
                Cancelar
              </button>
            </div>
          </div>
        </div>
        <br />
        <div class="container">
          <div style="max-height: 600px; overflow-y: auto">
            <table class="table table-bordered table-sm mb-4">
              <thead>
                <tr>
                  <th scope="col">Editar</th>
                  <th scope="col">Comuna</th>
                  <th scope="col">Barrio</th>
                  <th scope="col">Eliminar</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(comuna, index) in comunasBarrios" :key="comuna.id || index">
                  <td><button class="btn btn-sm btn-warning" @click="editBarrio(comuna.id)" aria-label="Editar barrio"
                      type="button">
                      <i class="bi bi-pencil"></i>
                    </button></td>
                  <td>{{ comuna.comuna }}</td>
                  <td>{{ comuna.barrio }}</td>
                  <td>
                    <button class="btn btn-sm btn-danger" @click="deleteBarrio(comuna.id)" aria-label="Eliminar barrio"
                      type="button">
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ========== TAB: EPS ========== -->
      <div class="tab-pane fade" id="nav-profile" role="tabpanel" aria-labelledby="nav-profile-tab" tabindex="0">
        <br />
        <div class="container">
          <div class="accordion" id="accordionExample">
            <div class="accordion-item">
              <h2 class="accordion-header" id="headingOne">
                <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne"
                  aria-expanded="true" aria-controls="collapseOne">
                  Eps disponibles en Demanda Inducida
                </button>
              </h2>
              <div id="collapseOne" class="accordion-collapse collapse show" aria-labelledby="headingOne"
                data-bs-parent="#accordionExample">
                <div class="accordion-body">
                  <div class="row">
                    <div class="col-6">
                      <div class="mb-3">
                        <input type="text" id="epsname-di" name="epsname-di" class="form-control form-control-sm"
                          placeholder="Nombre de la Eps" v-model="epsname" />
                      </div>
                    </div>
                    <div class="col-6">
                      <button type="button" class="btn btn-sm btn-warning" @click="saveEps">
                        {{ epsEditId ? 'Actualizar' : 'Guardar' }}
                      </button>
                      <button v-if="epsEditId" type="button" class="btn btn-sm btn-secondary ms-2"
                        @click="clearFormEps">
                        Cancelar
                      </button>
                    </div>
                  </div>
                  <hr />
                  <div style="max-height: 300px; overflow-y: auto">
                    <table class="table table-bordered">
                      <thead>
                        <tr>
                          <th>Editar</th>
                          <th>Nombre de EPS</th>
                          <th>Opciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(ot, index) in epss" :key="ot.id || index">
                          <td><button class="btn btn-sm btn-warning" @click="editEps(ot.id)" aria-label="Editar EPS"
                              type="button">
                              <i class="bi bi-pencil"></i>
                            </button></td>
                          <td>{{ ot.eps }}</td>
                          <td>
                            <button class="btn btn-sm btn-danger" @click="EpsDelete(ot.id)" aria-label="Eliminar EPS"
                              type="button">
                              <i class="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <br />
        </div>
      </div>

      <!-- ========== TAB: CUPS ========== -->
      <div class="tab-pane fade" id="nav-contact" role="tabpanel" aria-labelledby="nav-contact-tab" tabindex="0">
        <br />
        <h6>CUPS del sistema</h6>
        <br />
        <div class="container-fluid">
          <!-- boton modal -->
          <button type="button" class="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#staticBackdrop">
            + Nuevo CUPS
          </button>
        </div>

        <!-- modal  crear editar CUPS-->
        <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
          aria-labelledby="staticBackdropLabel" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h1 class="modal-title fs-5" id="staticBackdropLabel">
                  {{ cupsEditId ? "Editar" : "Crear" }} CUPS
                </h1>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
                  @click="clearFormCups"></button>
              </div>
              <div class="modal-body">
                <div class="row">
                  <div class="col-6">
                    <div class="mb-3">
                      <label class="form-label">Nombre del Cup</label>
                      <input type="text" id="cupsNombre" v-model="cupNombre" class="form-control"
                        placeholder="Nombre del procedimiento" required />
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="mb-3">
                      <label class="form-label">Codigo CUPS</label>
                      <input type="text" id="cupsCodigo" v-model="cupCodigo" class="form-control"
                        placeholder="Código CUPS" required />
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="mb-3">
                      <label class="form-label">Profesional</label>
                      <input type="text" id="cupsProfesional" v-model="cupProfesional" class="form-control"
                        placeholder="Profesional" required />
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="mb-3">
                      <label class="form-label">Grupo</label>
                      <input type="text" id="cupsGrupo" v-model="cupsGrupo" class="form-control" placeholder="Grupo"
                        required />
                    </div>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-sm btn-secondary" data-bs-dismiss="modal" @click="clearFormCups">
                  Cerrar
                </button>
                <button type="button" class="btn btn-sm btn-primary" @click="saveCups">
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
        <br />
        <!-- Fin modal crear editar CUPS -->
        <div v-if="cups && cups.length > 0" style="overflow-x: auto; width: 100%">
          <table class="table table-bordered table-sm">
            <thead>
              <tr>
                <th>Editar</th>
                <th>CupHomologado</th>
                <th>CUP Nombre</th>
                <th>Profesional</th>
                <th>Grupo</th>
                <th>Eliminar</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="cup in cups" :key="cup.id" :class="getColorClassByProfesional(cup.profesional)">
                <td>
                  <button type="button" class="btn btn-sm btn-warning" data-bs-toggle="modal"
                    data-bs-target="#staticBackdrop" @click="editCups(cup.id)">
                    <i class="bi bi-pencil"></i>
                  </button>
                </td>
                <td>{{ cup.codigo }}</td>
                <td>{{ cup.DescripcionCUP }}</td>
                <td>
                  <strong>{{ cup.profesional }}</strong>
                </td>
                <td>{{ cup.Grupo }}</td>
                <td>
                  <button type="button" class="btn btn-sm btn-danger" @click="deleteCups(cup.id)">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>

              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ========== TAB: CONTRATOS ========== -->
      <div class="tab-pane fade" id="nav-contratos" role="tabpanel" aria-labelledby="nav-contratos-tab" tabindex="0">
        <h5>Gestion CONTRATOS</h5>

        <div class="alert alert-warning" role="alert">
          <div class="row">
            <div class="col-8">Crear un nuevo contrato</div>
            <div class="col-2">
              <button class="btn btn-sm btn-warning" data-bs-toggle="modal" data-bs-target="#crearcontratos">
                +
              </button>
            </div>
          </div>
        </div>

        <!-- Modal crear contratos -->
        <div class="modal fade" id="crearcontratos" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
          aria-labelledby="staticBackdropLabel" aria-hidden="true">
          <div class="modal-dialog modal-xl modal-dialog-scrollable" style="max-height: 95vh;">
            <div class="modal-content">
              <div class="modal-header">
                <h1 class="modal-title fs-5" id="staticBackdropLabel">
                  Crear contrato(s) EPS-CUPS
                  <span v-if="contratosTemporalesAgrupados.length > 0" class="badge bg-primary ms-2">
                    {{ contratosTemporalesAgrupados.length }} EPS
                  </span>
                </h1>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
                  @click="clearFormContratos"></button>
              </div>
              <div class="modal-body" style="max-height: 85vh; overflow-y: auto;">
                <!-- Sección de selección de opciones -->
                <div class="card mb-4 sticky-top" style="top: 0; z-index: 10;">
                  <div class="card-body">
                    <h6 class="card-title mb-3">Configurar Contrato</h6>
                    <div class="row g-2">
                      <div class="col-12 col-md-6">
                        <label class="form-label fw-bold">Seleccione EPS</label>
                        <select class="form-select form-select-sm" aria-label="Seleccionar EPS" v-model="Seps">
                          <option value="">Seleccione...</option>
                          <option :value="eps.id" v-for="(eps, index) in epss" :key="index">
                            {{ eps.eps }}
                          </option>
                        </select>
                      </div>
                      <div class="col-12 col-md-6">
                        <label class="form-label fw-bold">Actividad Extra</label>
                        <select class="form-select form-select-sm" aria-label="Seleccionar Actividad"
                          v-model="Sactividad">
                          <option value="">Seleccione...</option>
                          <option :value="actividad.id" v-for="(actividad, index) in actividadesExtra" :key="index">
                            {{ actividad.nombre }}
                          </option>
                        </select>
                      </div>
                      <div class="col-12 col-md-12">
                        <label class="form-label fw-bold">CUPS Habilitados</label>
                        <select class="form-select form-select-sm" aria-label="Seleccione varios CUPS" v-model="Scups"
                          multiple style="height: 280px;">
                          <option :value="cup.id" v-for="(cup, index) in cupsDisponibles" :key="index">
                            [{{ cup.profesional }}]-[{{ cup.Grupo }}] {{ cup.DescripcionCUP }}
                          </option>
                        </select>
                        <small class="text-muted d-block mt-1">CTRL+Click para múltiples</small>
                      </div>
                    </div>
                    <button class="btn btn-sm btn-warning mt-3 w-100" @click="addCupsContrato"
                      :disabled="!Seps || Scups.length === 0">
                      <i class="bi bi-plus-circle"></i> Agregar CUPS al Contrato
                    </button>
                  </div>
                </div>

                <!-- Tabla de CUPS para la EPS seleccionada -->
                <div class="card mb-4">
                  <div class="card-header bg-secondary text-white">
                    <h6 class="mb-0">CUPS Agregados a <strong>{{Seps ? (epss.find(e => e.id === Seps)?.eps || 'EPS') :
                      'la EPS seleccionada'}}</strong></h6>
                  </div>
                  <div class="card-body" style="max-height: 350px; overflow-y: auto; padding: 0.75rem;">
                    <div v-if="!Seps" class="alert alert-warning mb-0 small" style="font-size: 0.85rem;">
                      <i class="bi bi-info-circle"></i> Por favor, seleccione una EPS primero
                    </div>
                    <div v-else-if="contratosFiltrados.length === 0" class="alert alert-info mb-0 small"
                      style="font-size: 0.85rem;">
                      <i class="bi bi-inbox"></i> No hay CUPS agregados a esta EPS. Seleccione CUPS y presione el botón
                      + Agregar
                    </div>
                    <div v-else>
                      <table class="table table-sm table-hover mb-0" style="font-size: 0.85rem;">
                        <thead class="table-light sticky-top">
                          <tr style="font-size: 0.8rem;">
                            <th style="width: 18%;">Profesional</th>
                            <th style="width: 12%;">Grupo</th>
                            <th style="width: 22%;">Actividad</th>
                            <th style="width: 35%;">CUPS</th>
                            <th class="text-center" style="width: 13%;">Acción</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(contrato, index) in contratosFiltrados" :key="index">
                            <td class="fw-bold">{{ obtenerProfesionalCups(contrato.cupsId, contrato.cupsProfesional) }}
                            </td>
                            <td>{{ obtenerGrupoCups(contrato.cupsId, contrato.cupsGrupo) || '-' }}</td>
                            <td><span class="badge bg-info text-dark" style="font-size: 0.75rem;">{{
                              obtenerNombreActividadPorId(contrato.actividadId, contrato.actividadNombre) ||
                              sinEspecificar }}</span></td>
                            <td><strong>{{ obtenerNombreCups(contrato.cupsId, contrato.cupsNombre) }}</strong></td>
                            <td class="text-center">
                              <button class="btn btn-sm btn-outline-danger" @click="removeContrato(contrato)"
                                title="Eliminar este CUPS" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">
                                <i class="bi bi-trash"></i>
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <!-- Resumen de todos los contratos que se guardarán -->
                <div v-if="contratosTemporalesAgrupados.length > 0" class="card border-success">
                  <div class="card-header bg-success text-white">
                    <h6 class="mb-0"><i class="bi bi-clipboard-check"></i> Resumen de Contratos a Guardar</h6>
                  </div>
                  <div class="card-body"
                    style="max-height: 300px; overflow-y: auto; padding: 0.75rem; font-size: 0.85rem;">
                    <div v-for="grupo in contratosTemporalesAgrupados" :key="grupo.epsId" class="mb-2">
                      <div class="d-flex justify-content-between align-items-center mb-1">
                        <strong style="font-size: 0.9rem;">{{ grupo.epsNombre }}</strong>
                        <span class="badge bg-primary" style="font-size: 0.75rem;">{{ grupo.cups.length }} CUPS</span>
                      </div>
                      <ul class="mb-2" style="font-size: 0.8rem; padding-left: 1.2rem;">
                        <li v-for="(cup, idx) in grupo.cups" :key="idx">
                          <span class="badge bg-light text-dark" style="font-size: 0.7rem;">{{
                            obtenerNombreActividadPorId(cup.actividadId,
                              cup.actividadNombre) || sinEspecificar }}</span>
                          <strong>{{ obtenerNombreCups(cup.cupsId, cup.cupsNombre) }}</strong>
                        </li>
                      </ul>
                      <hr class="my-1"
                        v-if="grupo !== contratosTemporalesAgrupados[contratosTemporalesAgrupados.length - 1]" />
                    </div>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-sm btn-secondary" data-bs-dismiss="modal"
                  @click="clearFormContratos">
                  Cerrar
                </button>
                <button type="button" class="btn btn-sm btn-primary" @click="saveContrato">
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Listado de contratos guardados -->
        <div class="mt-4">
          <h6>Contratos Guardados</h6>
          <div v-if="!contratos || contratos.length === 0" class="alert alert-warning">
            No hay contratos guardados.
          </div>
          <div v-else>
            <div class="accordion" id="contratosAccordion">
              <div v-for="(grupo, index) in contratosAgrupadosPorEps" :key="grupo.epsId" class="accordion-item">
                <h2 class="accordion-header" :id="'heading' + index">
                  <button class="accordion-button" :class="{ collapsed: index !== 0 }" type="button"
                    data-bs-toggle="collapse" :data-bs-target="'#collapse' + index"
                    :aria-expanded="index === 0 ? 'true' : 'false'" :aria-controls="'collapse' + index">
                    <strong>EPS:</strong> {{ obtenerNombreEps(grupo.epsId, grupo.epsNombre) }}
                    <span class="badge bg-primary ms-2">{{ grupo.cups.length }} CUPS</span>
                    <span class="badge bg-secondary ms-1">{{ grupo.contratoIds.length }} registro(s)</span>
                  </button>
                </h2>
                <div :id="'collapse' + index" class="accordion-collapse collapse" :class="{ show: index === 0 }"
                  :aria-labelledby="'heading' + index" data-bs-parent="#contratosAccordion">
                  <div class="accordion-body p-3">
                    <div class="text-end mb-2">
                      <button class="btn btn-sm btn-outline-danger"
                        @click="confirmarEliminarContratos(grupo.contratoIds)">
                        <i class="bi bi-trash"></i> Eliminar Todos
                      </button>
                    </div>
                    <!-- Agrupar por Profesional -->
                    <div v-for="(profesionalGrupo, profesional) in agruparPorProfesional(grupo.cups)" :key="profesional"
                      class="mb-3">
                      <div class="bg-light text-dark p-2 rounded small fw-bold border">
                        <i class="bi bi-person-badge"></i> {{ profesional }}
                        <span class="badge bg-primary ms-2">{{ profesionalGrupo.length }} CUPS</span>
                      </div>
                      <table class="table table-sm table-bordered mb-0 small">
                        <thead>
                          <tr>
                            <th>Actividad Extramural</th>
                            <th>CUPS</th>
                            <th>Grupo</th>
                            <th style="width: 80px;">Eliminar</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(cup, idx) in profesionalGrupo" :key="idx">
                            <td>{{ obtenerNombreActividadPorId(cup.actividadId, cup.actividadNombre) || sinEspecificar
                            }}
                            </td>
                            <td>{{ obtenerNombreCups(cup.cupsId, cup.cupsNombre) }}</td>
                            <td>{{ obtenerGrupoCups(cup.cupsId, cup.cupsGrupo) || '-' }}</td>
                            <td class="text-center">
                              <button class="btn btn-sm btn-danger"
                                @click="eliminarCupsDeContrato(cup.contratoId, cup.cupsId)" title="Eliminar este CUPS">
                                <i class="bi bi-trash"></i>
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
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
import { mapState, mapActions } from "vuex";
export default {
  data() {
    return {
      // ===== COMUNAS Y BARRIOS =====
      comuna: "",
      barrio: "",
      comunaBarrioEditId: null,

      // ===== EPS =====
      epsnameDemanndaInducida: "",
      epsname: "",
      epsEditId: null,

      // ===== CUPS =====
      cupNombre: "",
      cupCodigo: "",
      cupProfesional: "",
      cupsEditId: null,
      cupsGrupo: "",
      cupsRoles: [],
      cupsEps: [],

      // ===== CONTRATOS =====
      Seps: "",
      Scargo: "",
      Scups: [], // Array para selección múltiple de CUPS
      Sactividad: "", // Nueva variable para actividad seleccionada
      contratosTemp: [], // Array temporal para CUPS antes de guardar
      sinEspecificar: "Sin especificar",
    };
  },
  computed: {
    ...mapState(["comunasBarrios", "epss", "cups", "contratos", "actividadesExtra", "userData"]),
    // Filtrar contratos por EPS seleccionada
    contratosFiltrados() {
      if (!this.Seps) {
        return [];
      }
      // Mostrar solo los CUPS temporales que se están agregando
      return this.contratosTemp.filter(contrato => contrato.epsId === this.Seps);
    },

    // Agrupar contratos temporales por EPS para visualización previa antes de guardar
    contratosTemporalesAgrupados() {
      if (!this.contratosTemp || this.contratosTemp.length === 0) {
        return [];
      }

      const agrupados = {};

      this.contratosTemp.forEach(contrato => {
        if (!agrupados[contrato.epsId]) {
          agrupados[contrato.epsId] = {
            epsId: contrato.epsId,
            epsNombre: this.obtenerNombreEps(contrato.epsId, contrato.epsNombre),
            cups: []
          };
        }
        agrupados[contrato.epsId].cups.push(contrato);
      });

      return Object.values(agrupados);
    },

    // Agrupar contratos por EPS para la visualización
    contratosAgrupadosPorEps() {
      if (!this.contratos || this.contratos.length === 0) {
        return [];
      }

      const agrupados = {};

      this.contratos.forEach(contrato => {
        const epsId = contrato.epsId;

        if (!agrupados[epsId]) {
          agrupados[epsId] = {
            epsId: contrato.epsId,
            epsNombre: this.obtenerNombreEps(contrato.epsId, contrato.epsNombre),
            cups: [],
            contratoIds: [],
            fechas: []
          };
        }

        // Agregar los CUPS de este contrato
        if (contrato.cups && Array.isArray(contrato.cups)) {
          contrato.cups.forEach(cup => {
            // Agregar cada CUPS con la referencia del contrato
            agrupados[epsId].cups.push({
              ...cup,
              contratoId: contrato.id // Mantener referencia del contrato original
            });
          });
        }

        // Guardar el ID del contrato para poder eliminarlo
        agrupados[epsId].contratoIds.push(contrato.id);
        agrupados[epsId].fechas.push(contrato.fechaCreacion);
      });

      return Object.values(agrupados);
    },
    // Filtrar CUPS disponibles
    cupsDisponibles() {
      return this.cups || [];
    },
  },
  methods: {
    ...mapActions([
      "getAllComunaBarrios",
      "crearComunaBarrio",
      "actualizarComunaBarrio",
      "deleteComunaBarrio",
      "crearEps",
      "actualizarEps",
      "getAllEps",
      "deleteEps",
      "getAllCups",
      "crearCups",
      "editarCups",
      "eliminarCups",
      "crearContrato",
      "getAllContratos",
      "eliminarContrato",
      "actualizarContrato",
      "getAllActividadesExtra",
    ]),

    // ===== FUNCIÓN PARA COLORES DE EPS =====
    getColorClassByEps(index) {
      const colors = [
        'border-primary bg-primary text-white',
        'border-success bg-success text-white',
        'border-warning bg-warning text-dark',
        'border-info bg-info text-white',
        'border-danger bg-danger text-white',
        'border-secondary bg-secondary text-white',
        'border-dark bg-dark text-white'
      ];
      return colors[index % colors.length];
    },

    // ===== COMUNAS Y BARRIOS =====
    async saveComunaBarrio() {
      if (this.comuna === "" || this.barrio === "") {
        alert("Por favor, complete todos los campos.");
        return;
      }
      try {
        if (this.comunaBarrioEditId) {
          // Edición
          const data = {
            id: this.comunaBarrioEditId,
            comuna: this.comuna,
            barrio: this.barrio
          };
          await this.actualizarComunaBarrio(data);
          alert("Comuna y barrio actualizados exitosamente.");
        } else {
          // Creación
          let data = {
            comuna: this.comuna,
            barrio: this.barrio,
            bd: "comunasybarrios",
          };
          await this.crearComunaBarrio(data);
          alert("Comuna y barrio creados exitosamente.");
        }
        await this.getAllComunaBarrios();
        this.clearFormComunaBarrio();
      } catch (error) {
        console.error("Error al guardar comuna/barrio:", error);
        alert("Error al guardar: " + (error?.message || error));
      }
    },

    editBarrio(id) {
      const comunaBarrio = this.comunasBarrios.find(cb => cb.id === id);
      if (comunaBarrio) {
        this.comunaBarrioEditId = id;
        this.comuna = comunaBarrio.comuna;
        this.barrio = comunaBarrio.barrio;
      }
    },

    async deleteBarrio(index) {
      await this.deleteComunaBarrio(index);
      alert("Comuna y barrio eliminados exitosamente.");
      this.getAllComunaBarrios();
    },

    clearFormComunaBarrio() {
      this.comuna = "";
      this.barrio = "";
      this.comunaBarrioEditId = null;
    },

    // ===== EPS =====
    async saveEps() {
      if (this.epsname === "") {
        alert("Por favor, complete todos los campos.");
        return;
      }
      try {
        if (this.epsEditId) {
          // Edición
          const data = {
            id: this.epsEditId,
            eps: this.epsname
          };
          await this.actualizarEps(data);
          alert("EPS actualizada exitosamente.");
        } else {
          // Creación
          let data = {
            eps: this.epsname,
            bd: "eps",
          };
          await this.crearEps(data);
          alert("EPS creada exitosamente.");
        }
        await this.getAllEps();
        this.clearFormEps();
      } catch (error) {
        console.error("Error al guardar EPS:", error);
        alert("Error al guardar: " + (error?.message || error));
      }
    },

    editEps(id) {
      const eps = this.epss.find(e => e.id === id);
      if (eps) {
        this.epsEditId = id;
        this.epsname = eps.eps;
      }
    },

    async EpsDelete(epsId) {
      // Verificar si existen contratos con esta EPS
      const tieneContratos = this.contratos.some(contrato => contrato.epsId === epsId);

      if (tieneContratos) {
        alert("No se puede eliminar esta EPS porque tiene contratos asociados. Primero elimine los contratos de esta EPS.");
        return;
      }

      if (!confirm("¿Está seguro que desea eliminar esta EPS?")) {
        return;
      }

      await this.deleteEps(epsId);
      alert("EPS eliminado exitosamente.");
      this.getAllEps();
    },

    clearFormEps() {
      this.epsname = "";
      this.epsEditId = null;
    },

    // ===== CUPS =====
    async saveCups() {
      // Validar que los campos obligatorios tengan valores válidos
      if (!this.cupNombre || !this.cupNombre.trim()) {
        alert("El Nombre del CUPS es obligatorio.");
        return;
      }
      if (!this.cupCodigo || !this.cupCodigo.trim()) {
        alert("El Código CUPS es obligatorio.");
        return;
      }
      if (!this.cupProfesional || !this.cupProfesional.trim()) {
        alert("El Profesional es obligatorio.");
        return;
      }
      if (!this.cupsGrupo || !this.cupsGrupo.trim()) {
        alert("El Grupo es obligatorio.");
        return;
      }

      try {
        // Si es edición o creación
        if (this.cupsEditId) {
          // Implementar edición
          const data = {
            bd: "cups",
            id: this.cupsEditId,
            nombre: this.cupNombre.trim(),
            codigo: this.cupCodigo.trim(),
            profesional: this.cupProfesional.trim(),
            grupo: this.cupsGrupo,
            roles: this.cupsRoles,
            eps: this.cupsEps,
          };
          console.log("Data para editar:", data);

          await this.editarCups(data);
          console.log("CUPS editado exitosamente");

          // Pequeño delay
          await new Promise(resolve => setTimeout(resolve, 300));

          // Recargar lista desde Firebase
          await this.getAllCups();
          console.log("Lista de CUPS actualizada después de editar:", this.cups);

          alert("CUP editado exitosamente.");
          this.clearFormCups();

          // Cerrar modal de forma robusta
          this.closeModal("staticBackdrop");
        } else {
          // Implementar creación
          const data = {
            nombre: this.cupNombre.trim(),
            codigo: this.cupCodigo.trim(),
            profesional: this.cupProfesional.trim(),
            grupo: this.cupsGrupo.trim(),
            bd: "cups",
          };
          console.log("Data para crear:", data);

          await this.crearCups(data);
          console.log("CUPS creado exitosamente");

          // Pequeño delay
          await new Promise(resolve => setTimeout(resolve, 300));

          // Recargar lista desde Firebase
          await this.getAllCups();
          console.log("Lista de CUPS actualizada después de crear:", this.cups);

          alert("CUP guardado exitosamente.");
          this.clearFormCups();

          this.closeModal("staticBackdrop");
        }
      } catch (error) {
        console.error("Error al guardar CUPS:", error);
        alert("Error al guardar el CUPS: " + (error?.message || error));
      }
    },

    closeModal(modalId) {
      const modal = document.getElementById(modalId);
      if (modal) {
        // Intentar obtener la instancia existente
        const bsModal = window.bootstrap.Modal.getInstance(modal);
        if (bsModal) {
          bsModal.hide();
        } else {
          // Si no existe instancia, crear una nueva y cerrar
          const newBsModal = new window.bootstrap.Modal(modal);
          newBsModal.hide();
        }

        // Remover el backdrop manualmente por si acaso
        setTimeout(() => {
          const backdrop = document.querySelector('.modal-backdrop');
          if (backdrop) {
            backdrop.remove();
          }
          document.body.classList.remove('modal-open');
        }, 300);
      }
    },

    editCups(cupsId) {
      // Buscar el CUPS en la lista y cargar en el formulario
      const cups = this.cups.find((c) => c.id === cupsId);
      if (cups) {
        this.cupsEditId = cupsId;
        this.cupNombre = cups.DescripcionCUP || "";
        this.cupCodigo = cups.codigo || "";
        this.cupProfesional = cups.profesional || "";
        this.cupsGrupo = cups.Grupo || "";
        this.cupsRoles = Array.isArray(cups.Roles) ? cups.Roles : [];
        this.cupsEps = Array.isArray(cups.Eps) ? cups.Eps : [];

        // Abrir modal de forma robusta
        this.$nextTick(() => {
          const modal = document.getElementById("staticBackdrop");
          if (modal) {
            // Obtener instancia existente o crear una nueva
            let bsModal = window.bootstrap.Modal.getInstance(modal);
            if (!bsModal) {
              bsModal = new window.bootstrap.Modal(modal);
            }
            bsModal.show();
          }
        });
      }
    },

    async deleteCups(cupsId) {
      if (!confirm("¿Desea eliminar este CUPS?")) return;

      try {
        console.log("Iniciando eliminación del CUPS:", cupsId);

        // Primero eliminar de Firebase
        await this.eliminarCups(cupsId);
        console.log("CUPS eliminado de Firebase:", cupsId);

        // Pequeño delay para asegurar que Firebase procese
        await new Promise(resolve => setTimeout(resolve, 500));

        // Luego recargar la lista desde Firebase
        await this.getAllCups();
        console.log("Lista de CUPS actualizada después de eliminar");
        console.log("CUPS en store después de cargar:", this.cups);

        alert("CUPS eliminado exitosamente.");
      } catch (error) {
        console.error("Error al eliminar CUPS:", error);
        alert("Error al eliminar el CUPS: " + (error?.message || error));
      }
    },

    clearFormCups() {
      this.cupNombre = "";
      this.cupCodigo = "";
      this.cupProfesional = "";
      this.cupsEditId = null;
      this.cupsGrupo = "";
      this.cupsRoles = [];
      this.cupsEps = [];
    },

    clearFormContratos() {
      this.Seps = "";
      this.Scups = [];
      this.Sactividad = "";
      this.contratosTemp = [];
    },

    // ===== CONTRATOS =====


    addCupsContrato() {
      if (!this.Seps || this.Scups.length === 0) {
        alert("Por favor, seleccione EPS y al menos un CUPS.");
        return;
      }

      // Buscar los datos completos de EPS
      const epsSeleccionada = this.epss.find(eps => eps.id === this.Seps);

      if (!epsSeleccionada) {
        alert("Error: No se encontró la EPS seleccionada.");
        return;
      }

      let contadosAgregados = 0;
      let contadosDuplicados = 0;

      // Procesar cada CUPS seleccionado
      this.Scups.forEach(cupsId => {
        const cupSeleccionado = this.cups.find(cup => cup.id === cupsId);
        const actividadSeleccionada = this.actividadesExtra?.find(act => act.id === this.Sactividad);

        if (!cupSeleccionado) {
          console.warn("CUPS no encontrado:", cupsId);
          return;
        }

        // Verificar si ya existe en temporales PARA ESTA EPS específicamente
        const existeEnTemp = this.contratosTemp.some(
          contrato => contrato.epsNombre === epsSeleccionada.eps && contrato.cupsId === cupsId
        );

        if (existeEnTemp) {
          contadosDuplicados++;
          return;
        }

        // Agregar al array temporal con valores de texto en lugar de IDs
        const nuevoContrato = {
          epsId: this.Seps,  // Mantener ID para compatibilidad interna
          epsNombre: epsSeleccionada.eps,
          cupsId: cupsId,  // Mantener ID para compatibilidad interna
          cupsNombre: cupSeleccionado.DescripcionCUP,
          actividadId: this.Sactividad || null,
          actividadNombre: actividadSeleccionada ? actividadSeleccionada.nombre : null,
          cupsProfesional: cupSeleccionado.profesional,
          cupsGrupo: cupSeleccionado.Grupo
        };

        this.contratosTemp.push(nuevoContrato);
        contadosAgregados++;
      });

      // Mostrar resumen
      let mensaje = `Se agregaron ${contadosAgregados} CUPS al contrato.`;
      if (contadosDuplicados > 0) {
        mensaje += ` (${contadosDuplicados} CUPS ya existían en el contrato.)`;
      }
      alert(mensaje);

      console.log("CUPS agregados a temporal. Temporales actuales:", this.contratosTemp);

      // Limpiar campos
      this.Scups = [];
    },

    removeContrato(contrato) {
      if (confirm("\u00bfDesea eliminar este CUPS del contrato temporal?")) {
        // Buscar en temporales para esta EPS específicamente usando nombres
        const indexTemp = this.contratosTemp.findIndex(
          c => c.epsNombre === contrato.epsNombre && c.cupsNombre === contrato.cupsNombre
        );

        if (indexTemp !== -1) {
          // Eliminar de temporales
          this.contratosTemp.splice(indexTemp, 1);
          console.log("CUPS eliminado de temporal. Temporales restantes:", this.contratosTemp);
          alert("CUPS eliminado del contrato temporal.");
        } else {
          alert("Error: No se encontró el CUPS en la lista temporal.");
        }
      }
    },

    async saveContrato() {
      if (this.contratosTemp.length === 0) {
        alert("Por favor, agregue al menos un CUPS a un contrato.");
        return;
      }

      try {
        console.log("Iniciando guardado de contratos. contratosTemp:", this.contratosTemp);

        // Agrupar contratosTemp por epsId
        const contratosPorEps = {};

        this.contratosTemp.forEach(contrato => {
          if (!contratosPorEps[contrato.epsId]) {
            contratosPorEps[contrato.epsId] = {
              epsId: contrato.epsId,
              epsNombre: contrato.epsNombre,
              cups: []
            };
          }
          // Agregar el CUPS a la lista de esta EPS con toda la información requerida
          contratosPorEps[contrato.epsId].cups.push({
            epsId: contrato.epsId,                  // eps.id (para compatibilidad)
            epsNombre: contrato.epsNombre,          // eps.eps (valor de pantalla)
            cupsId: contrato.cupsId,                // cup.id (para compatibilidad)
            cupsNombre: contrato.cupsNombre,        // cup.DescripcionCUP (valor de pantalla)
            actividadId: contrato.actividadId,      // actividad.id (para compatibilidad)
            actividadNombre: contrato.actividadNombre, // actividad.nombre (valor de pantalla)
            cupsProfesional: contrato.cupsProfesional,  // cup.profesional (valor requerido)
            cupsGrupo: contrato.cupsGrupo           // cup.Grupo (valor adicional)
          });
        });

        console.log("Contratos agrupados por EPS:", contratosPorEps);

        // Guardar un contrato para cada EPS
        const epsArray = Object.keys(contratosPorEps);
        for (const epsId of epsArray) {
          const contratoData = contratosPorEps[epsId];
          console.log(`Guardando contrato para EPS ${epsId}:`, contratoData);

          await this.crearContrato(contratoData);
        }

        alert(`Se guardaron ${epsArray.length} contrato(s) exitosamente.`);

        // Recargar contratos
        await this.getAllContratos();

        // Limpiar formulario
        this.clearFormContratos();

        // Cerrar modal de forma robusta
        this.closeModal("crearcontratos");
      } catch (error) {
        console.error("Error al guardar contrato:", error);
        alert("Error al guardar el contrato: " + (error?.message || error));
      }
    },

    async eliminarCupsDeContrato(contratoId, cupsId) {
      if (!confirm("¿Desea eliminar este CUPS del contrato?")) return;

      try {
        // Buscar el contrato actual
        const contratoActual = this.contratos.find(c => c.id === contratoId);

        if (!contratoActual) {
          alert("Error: No se encontró el contrato.");
          return;
        }

        // Filtrar el CUPS a eliminar
        const cupsActualizados = contratoActual.cups.filter(cup => cup.cupsId !== cupsId);

        // Si no quedan CUPS, eliminar todo el contrato
        if (cupsActualizados.length === 0) {
          await this.eliminarContrato(contratoId);
          alert("CUPS eliminado. El contrato se eliminó porque no quedaban más CUPS.");
        } else {
          // Actualizar el contrato con los CUPS restantes
          const contratoData = {
            epsId: contratoActual.epsId,
            cups: cupsActualizados,
            fechaCreacion: contratoActual.fechaCreacion
          };

          await this.actualizarContrato({ contratoId, contratoData });
          alert("CUPS eliminado exitosamente.");
        }

        // Recargar contratos
        await this.getAllContratos();
      } catch (error) {
        console.error("Error al eliminar CUPS:", error);
        alert("Error al eliminar el CUPS: " + (error?.message || error));
      }
    },

    // Agrupar CUPS por profesional
    agruparPorProfesional(cups) {
      if (!cups || !Array.isArray(cups)) return {};

      const grouped = {};
      cups.forEach(cup => {
        const profesional = this.obtenerProfesionalCups(cup.cupsId, cup.cupsProfesional) || 'Sin especificar';
        if (!grouped[profesional]) {
          grouped[profesional] = [];
        }
        grouped[profesional].push(cup);
      });

      return grouped;
    },
    obtenerNombreEps(epsId, fallback = "") {
      const eps = this.epss?.find((item) => String(item.id) === String(epsId));
      return eps?.eps || fallback || "";
    },
    obtenerNombreActividadPorId(actividadId, fallback = "") {
      const actividad = this.actividadesExtra?.find(
        (item) => String(item.id) === String(actividadId)
      );
      return actividad?.nombre || fallback || "";
    },
    obtenerCupPorId(cupsId) {
      return this.cups?.find((cup) => String(cup.id) === String(cupsId)) || null;
    },
    obtenerNombreCups(cupsId, fallback = "") {
      const cup = this.obtenerCupPorId(cupsId);
      return cup?.DescripcionCUP || fallback || "";
    },
    obtenerProfesionalCups(cupsId, fallback = "") {
      const cup = this.obtenerCupPorId(cupsId);
      return cup?.profesional || fallback || "";
    },
    obtenerGrupoCups(cupsId, fallback = "") {
      const cup = this.obtenerCupPorId(cupsId);
      return cup?.Grupo || fallback || "";
    },

    confirmarEliminarContratos(contratoIds) {
      if (!contratoIds || contratoIds.length === 0) return;

      const cantidadContratos = contratoIds.length;
      const mensaje = cantidadContratos === 1
        ? "⚠️ ¿Está seguro de que desea eliminar este contrato con todos sus CUPS? Esta acción no se puede deshacer."
        : `⚠️ ¿Está seguro de que desea eliminar los ${cantidadContratos} contratos de esta EPS con todos sus CUPS? Esta acción no se puede deshacer.`;

      if (confirm(mensaje)) {
        this.eliminarContratosPorEps(contratoIds);
      }
    },

    async eliminarContratosPorEps(contratoIds) {
      if (!contratoIds || contratoIds.length === 0) return;

      const mensaje = contratoIds.length === 1
        ? "¿Desea eliminar este contrato con todos sus CUPS?"
        : `¿Desea eliminar los ${contratoIds.length} contratos de esta EPS con todos sus CUPS?`;

      if (!confirm(mensaje)) return;

      try {
        // Eliminar todos los contratos uno por uno
        for (const contratoId of contratoIds) {
          await this.eliminarContrato(contratoId);
        }

        alert(`${contratoIds.length} contrato(s) eliminado(s) exitosamente.`);

        // Recargar contratos
        await this.getAllContratos();
      } catch (error) {
        console.error("Error al eliminar contratos:", error);
        alert("Error al eliminar los contratos: " + (error?.message || error));
      }
    },

    getCupsInfo(cupsId) {
      // Buscar información del CUPS en el estado
      const cup = this.cups?.find(c => c.id === cupsId || c.codigo === cupsId);
      return cup || { codigo: cupsId, DescripcionCUP: 'CUPS no encontrado' };
    },

    getColorClassByProfesional(profesional) {
      if (!profesional) return "";
      const prof = profesional.toLowerCase().trim();

      if (prof.includes("medico") || prof.includes("médico")) {
        return "bg-medico";
      } else if (prof.includes("enfermero") || prof.includes("enfermera")) {
        return "bg-enfermero";
      } else if (prof.includes("auxiliar")) {
        return "bg-auxiliar";
      }
      return "bg-otro";
    },
  },
  mounted() {
    this.getAllComunaBarrios();
    this.getAllEps();
    this.getAllCups();
    this.getAllContratos();
    this.getAllActividadesExtra();
    /* traer  grupos, profesionales ,epsApp */
    /* crear epsApp autorizadas en las caracterizacion */
  },
};
</script>

<style scoped>
/* Colores de agrupación por profesional */
.bg-medico {
  background-color: #e3f2fd !important;
  /* Azul claro */
}

.bg-enfermero {
  background-color: #f3e5f5 !important;
  /* Púrpura claro */
}

.bg-auxiliar {
  background-color: #fff3e0 !important;
  /* Naranja claro */
}

.bg-otro {
  background-color: #f5f5f5 !important;
  /* Gris claro */
}

/* Hover effects para mejor UX */
.bg-medico:hover {
  background-color: #bbdefb !important;
}

.bg-enfermero:hover {
  background-color: #e1bee7 !important;
}

.bg-auxiliar:hover {
  background-color: #ffe0b2 !important;
}

.bg-otro:hover {
  background-color: #eeeeee !important;
}
</style>
