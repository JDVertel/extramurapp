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
        <button class="nav-link" id="nav-pacientes-tab" data-bs-toggle="tab" data-bs-target="#nav-pacientes"
          type="button" role="tab" aria-controls="nav-pacientes" aria-selected="false">
          PACIENTES
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
              <button type="button" class="btn btn-warning btn-sm" @click="saveComunaBarrio">
                {{ comunaBarrioEditId ? 'Actualizar' : '+ Guardar' }}
              </button>
              <button v-if="comunaBarrioEditId" type="button" class="btn btn-secondary btn-sm ms-2"
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
                  <td><button class="btn btn-warning btn-sm" @click="editBarrio(comuna.id)" aria-label="Editar barrio"
                      type="button">
                      <i class="bi bi-pencil"></i>
                    </button></td>
                  <td>{{ comuna.comuna }}</td>
                  <td>{{ comuna.barrio }}</td>
                  <td>
                    <button class="btn btn-danger btn-sm" @click="deleteBarrio(comuna.id)" aria-label="Eliminar barrio"
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
                      <button type="button" class="btn btn-warning btn-sm" @click="saveEps">
                        {{ epsEditId ? 'Actualizar' : 'Guardar' }}
                      </button>
                      <button v-if="epsEditId" type="button" class="btn btn-secondary btn-sm ms-2"
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
                          <td><button class="btn btn-warning btn-sm" @click="editEps(ot.id)" aria-label="Editar EPS"
                              type="button">
                              <i class="bi bi-pencil"></i>
                            </button></td>
                          <td>{{ ot.eps }}</td>
                          <td>
                            <button class="btn btn-danger btn-sm" @click="EpsDelete(ot.id)" aria-label="Eliminar EPS"
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
          <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#staticBackdrop">
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
                <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal" @click="clearFormCups">
                  Cerrar
                </button>
                <button type="button" class="btn btn-primary btn-sm" @click="saveCups">
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
                  <button type="button" class="btn btn-warning btn-sm" data-bs-toggle="modal"
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
                  <button type="button" class="btn btn-danger btn-sm" @click="deleteCups(cup.id)">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>

              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ========== TAB: PACIENTES ========== -->
      <div class="tab-pane fade" id="nav-pacientes" role="tabpanel" aria-labelledby="nav-pacientes-tab" tabindex="0">
        <h5>Gestion de Pacientes</h5>
        <hr />
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
            <button class="btn btn-primary mt-4" :disabled="cargandoPacientes" @click="consultarP">
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
          <div v-if="datosPaciente && datosPaciente.length > 0" style="overflow-x: auto; width: 100%">
            <table class="table table-bordered table-sm" style="min-width: 900px">
              <thead>
                <tr>
                  <th>Campo</th>
                  <th v-for="paciente in datosPaciente" :key="paciente.id" class="text-center">
                    <div>
                      {{ paciente.nombre1 }} {{ paciente.apellido1 }}
                      {{ paciente.apellido2 }}
                    </div>
                    <div>
                      <small>{{ paciente.tipodoc }}-{{ paciente.numdoc }}</small>
                    </div>
                    <div class="btn-group mt-2" role="group">
                      <!-- <button class="btn btn-warning btn-sm" type="button" @click.stop="editarP(paciente.id)"><i class="bi bi-pencil-square"></i></button> -->
                      <button class="btn btn-danger btn-sm" type="button" @click.stop="eliminarPaciente(paciente.id)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>EPS</th>
                  <td v-for="paciente in datosPaciente" :key="'eps-' + paciente.id">
                    <div class="cell-content">{{ paciente.eps }}</div>
                  </td>
                </tr>
                <tr>
                  <th>Fecha Nac.</th>
                  <td v-for="paciente in datosPaciente" :key="'fnac-' + paciente.id">
                    <div class="cell-content">{{ paciente.fechaNac }}</div>
                  </td>
                </tr>
                <tr>
                  <th>Sexo</th>
                  <td v-for="paciente in datosPaciente" :key="'sexo-' + paciente.id">
                    <div class="cell-content">{{ paciente.sexo }}</div>
                  </td>
                </tr>
                <tr>
                  <th>Dirección</th>
                  <td v-for="paciente in datosPaciente" :key="'dir-' + paciente.id">
                    <div class="cell-content">{{ paciente.direccion }}</div>
                  </td>
                </tr>
                <tr>
                  <th>Comuna</th>
                  <td v-for="paciente in datosPaciente" :key="'comuna-' + paciente.id">
                    <div class="cell-content">
                      {{ paciente.barrioVeredacomuna?.comuna }}
                    </div>
                  </td>
                </tr>
                <tr>
                  <th>Barrio</th>
                  <td v-for="paciente in datosPaciente" :key="'barrio-' + paciente.id">
                    <div class="cell-content">
                      {{ paciente.barrioVeredacomuna?.barrio }}
                    </div>
                  </td>
                </tr>
                <tr v-for="item in activityKeys" :key="'act-' + item.key">
                  <th>{{ item.actividad.nombre }}</th>
                  <td v-for="paciente in datosPaciente" :key="'actcell-' + paciente.id + '-' + item.key">
                    <div class="cell-content">
                      <div v-if="
                        paciente.tipoActividad &&
                        paciente.tipoActividad[item.key]
                      ">
                        <div>
                          <strong>Profesionales:</strong>
                          <span v-for="(prof, pidx) in paciente.tipoActividad[
                            item.key
                          ].Profesional || []" :key="prof">
                            {{ prof
                            }}<span v-if="
                              pidx <
                              (
                                paciente.tipoActividad[item.key]
                                  .Profesional || []
                              ).length -
                              1
                            ">,
                            </span>
                          </span>
                        </div>
                        <div v-if="paciente.tipoActividad[item.key].cups">
                          <div v-for="(cupsObj, profKey) in paciente.tipoActividad[
                            item.key
                          ].cups" :key="profKey">
                            <strong>{{ profKey }}:</strong>
                            <ul class="mb-0">
                              <li v-for="cup in Object.values(cupsObj.cups || {})" :key="cup.id">
                                <span><strong>{{
                                  cup.DescripcionCUP
                                }}</strong></span><br />
                                EPS:
                                <span v-for="(eps, eidx) in cup.Eps || []" :key="eps">{{ eps
                                }}<span v-if="eidx < (cup.Eps || []).length - 1">,
                                  </span></span><br />
                                Grupo: {{ cup.Grupo }}<br />
                                Homolog: {{ cup.Homolog }}<br />
                                Cantidad: {{ cup.cantidad }}<br />
                                Detalle: {{ cup.detalle }}
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ========== TAB: CONTRATOS ========== -->
      <div class="tab-pane fade" id="nav-contratos" role="tabpanel" aria-labelledby="nav-contratos-tab" tabindex="0">
        <h5>Gestion CONTRATOS</h5>
        
        <div class="alert alert-warning" role="alert">
          <div class="row">
            <div class="col-8">Crear un nuevo contrato</div>
            <div class="col-2">
              <button class="btn btn-warning btn-sm" data-bs-toggle="modal" data-bs-target="#crearcontratos">
                +
              </button>
            </div>
          </div>
        </div>

        <!-- Modal crear contratos -->
        <div class="modal fade modal-lg" id="crearcontratos" data-bs-backdrop="static" data-bs-keyboard="false"
          tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
          <div class="modal-dialog">
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
              <div class="modal-body">
                <div class="row">
                  <div class="col-3">
                    <div class="mb-3">
                      <label class="form-label">Seleccione EPS</label>
                      <select class="form-select form-select-sm" aria-label="Small select example" v-model="Seps">
                        <option value="">Seleccione...</option>
                        <option :value="eps.id" v-for="(eps, index) in epss" :key="index">
                          {{ eps.eps }}
                        </option>
                      </select>
                    </div>

                  </div>



                  <div class="col-6">
                    <label class="form-label">Actividad Extra</label>
                    <select class="form-select form-select-sm" aria-label="Small select example" v-model="Sactividad">
                      <option value="">Seleccione...</option>
                      <option :value="actividad.id" v-for="(actividad, index) in actividadesExtra" :key="index">
                        {{ actividad.nombre }}
                      </option>
                    </select>
                  </div>
                  <div class="col-8">
                    <label class="form-label">CUPS Habilitados</label>
                    <select class="form-select form-select-sm" aria-label="Small select example" v-model="Scups">
                      <option value="">Seleccione...</option>
                      <option :value="cup.id" v-for="(cup, index) in cupsDisponibles" :key="index">
                        [{{ cup.profesional }}]-[{{ cup.Grupo }}] {{ cup.DescripcionCUP }}
                      </option>
                    </select>

                  </div>
                  <div class="col-1">
                    <button class="btn btn-warning btn-sm mt-4" @click="addCupsContrato"
                      :disabled="!Seps || !Scups"> + Agregar</button>
                  </div>
                </div>

                <!-- Tabla de CUPS para la EPS seleccionada -->
                <h6>CUPS agregados a {{Seps ? (epss.find(e => e.id === Seps)?.eps || 'EPS') : 'la EPS seleccionada'}}
                </h6>
                <div v-if="!Seps" class="alert alert-warning">
                  Por favor, seleccione una EPS primero
                </div>
                <div v-else-if="contratosFiltrados.length === 0" class="alert alert-info">
                  No hay CUPS agregados a esta EPS. Seleccione CUPS y presione el botón +
                </div>
                <div v-else>
                  <table class="table table-sm table-bordered mb-3">
                    <thead>
                      <tr>
                        <th>Profesional</th>
                        <th>Grupo</th>
                        <th>Actividad Extra</th>
                        <th>CUPS</th>
                        <th style="width: 80px;">Eliminar</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(contrato, index) in contratosFiltrados" :key="index">
                        <td>{{ obtenerProfesionalCups(contrato.cupsId, contrato.cupsProfesional) }}</td>
                        <td>{{ obtenerGrupoCups(contrato.cupsId, contrato.cupsGrupo) || '-' }}</td>
                        <td>{{ obtenerNombreActividadPorId(contrato.actividadId, contrato.actividadNombre) || sinEspecificar }}</td>
                        <td>{{ obtenerNombreCups(contrato.cupsId, contrato.cupsNombre) }}</td>
                        <td>
                          <button class="btn btn-danger btn-sm" @click="removeContrato(contrato)">
                            <i class="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Resumen de todos los contratos que se guardarán -->
                <div v-if="contratosTemporalesAgrupados.length > 0" class="mt-4 p-3 bg-light border rounded">
                  <strong>📋 Resumen de contratos a guardar:</strong>
                  <div v-for="grupo in contratosTemporalesAgrupados" :key="grupo.epsId" class="mt-2">
                    <strong>{{ grupo.epsNombre }} ({{ grupo.cups.length }} CUPS)</strong>
                    <ul>
                      <li v-for="(cup, idx) in grupo.cups" :key="idx" class="small">
                        {{ obtenerNombreActividadPorId(cup.actividadId, cup.actividadNombre) || sinEspecificar }}: 
                        {{ obtenerNombreCups(cup.cupsId, cup.cupsNombre) }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal"
                  @click="clearFormContratos">
                  Cerrar
                </button>
                <button type="button" class="btn btn-primary btn-sm" @click="saveContrato">
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
            <div v-for="(grupo, index) in contratosAgrupadosPorEps" :key="grupo.epsId" 
                 class="card mb-3" 
                 :class="getColorClassByEps(index)">
              <div class="card-header d-flex justify-content-between align-items-center">
                <div>
                  <strong>EPS:</strong> {{ obtenerNombreEps(grupo.epsId, grupo.epsNombre) }}
                  <span class="badge bg-white text-dark ms-2">{{ grupo.cups.length }} CUPS</span>
                  <span class="badge bg-white text-dark ms-1">{{ grupo.contratoIds.length }} registro(s)</span>
                </div>
                <button class="btn btn-outline-light btn-sm" @click="eliminarContratosPorEps(grupo.contratoIds)">
                  <i class="bi bi-trash"></i> Eliminar Todos
                </button>
              </div>
              <div class="card-body">
                <!-- Agrupar por Profesional -->
                <div v-for="(profesionalGrupo, profesional) in agruparPorProfesional(grupo.cups)" :key="profesional"
                  class="mb-2">
                  <div class="bg-white text-dark p-1 rounded small fw-bold border">
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
                        <td>{{ obtenerNombreActividadPorId(cup.actividadId, cup.actividadNombre) || sinEspecificar }}
                        </td>
                        <td>{{ obtenerNombreCups(cup.cupsId, cup.cupsNombre) }}</td>
                        <td>{{ obtenerGrupoCups(cup.cupsId, cup.cupsGrupo) || '-' }}</td>
                        <td class="text-center">
                          <button class="btn btn-danger btn-sm"
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
      Scups: "",
      Sactividad: "", // Nueva variable para actividad seleccionada
      contratosTemp: [], // Array temporal para CUPS antes de guardar

      // ===== PACIENTES =====
      cargandoPacientes: false,
      searchPerformed: false,
      tipodoc: "",
      numdoc: "",
      sinEspecificar: "Sin especificar",
    };
  },
  computed: {
    ...mapState(["comunasBarrios", "epss", "cups", "datosPaciente", "contratos", "actividadesExtra"]),
    activityKeys() {
      if (!this.datosPaciente || !this.datosPaciente.length) return [];
      const first = this.datosPaciente[0];
      if (!first.tipoActividad || typeof first.tipoActividad !== "object")
        return [];
      return Object.entries(first.tipoActividad).map(([key, actividad]) => ({
        key,
        actividad,
      }));
    },
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
      "getAllByPacientesID",
      "deletePaciente",
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
      this.Scups = "";
      this.Sactividad = "";
      this.contratosTemp = [];
    },

    // ===== CONTRATOS =====


    addCupsContrato() {
      if (!this.Seps || !this.Scups) {
        alert("Por favor, seleccione EPS y CUPS.");
        return;
      }

      // Buscar los datos completos de EPS y CUPS
      const epsSeleccionada = this.epss.find(eps => eps.id === this.Seps);
      const cupSeleccionado = this.cups.find(cup => cup.id === this.Scups);
      const actividadSeleccionada = this.actividadesExtra?.find(act => act.id === this.Sactividad);

      if (!epsSeleccionada || !cupSeleccionado) {
        alert("Error: No se encontraron los datos seleccionados.");
        return;
      }

      // Verificar si ya existe en temporales PARA ESTA EPS específicamente
      const existeEnTemp = this.contratosTemp.some(
        contrato => contrato.epsNombre === epsSeleccionada.eps && contrato.cupsNombre === cupSeleccionado.DescripcionCUP
      );

      if (existeEnTemp) {
        alert("Este CUPS ya fue agregado a este contrato de esta EPS.");
        return;
      }

      // Agregar al array temporal con valores de texto en lugar de IDs
      const nuevoContrato = {
        epsId: this.Seps,  // Mantener ID para compatibilidad interna
        epsNombre: epsSeleccionada.eps,
        cupsId: this.Scups,  // Mantener ID para compatibilidad interna
        cupsNombre: cupSeleccionado.DescripcionCUP,
        actividadId: this.Sactividad || null,
        actividadNombre: actividadSeleccionada ? actividadSeleccionada.nombre : null,
        cupsProfesional: cupSeleccionado.profesional,
        cupsGrupo: cupSeleccionado.Grupo
      };

      this.contratosTemp.push(nuevoContrato);

      console.log("CUPS agregado a temporal. Temporales actuales:", this.contratosTemp);

      // Limpiar campos
      this.Scups = "";
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

    // ===== PACIENTES =====
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
        alert("Error al consultar pacientes: " + (error?.message || error));
      } finally {
        this.cargandoPacientes = false;
      }
    },

    async editarP(pacienteId) {
      try {
        if (!pacienteId) return;
        this.$router.push({
          name: "registrousuarios",
          query: { editPacienteId: pacienteId },
        });
      } catch (error) {
        console.error("[editarP] Error al navegar:", error);
      }
    },

    async eliminarPaciente(pacienteId) {
      if (!pacienteId) return;
      const confirmed = confirm(
        "¿Confirma que desea eliminar este paciente? Esta acción no se puede deshacer."
      );
      if (!confirmed) return;
      try {
        await this.deletePaciente(pacienteId);
        alert("Paciente eliminado correctamente.");
        if (this.tipodoc && this.numdoc) {
          await this.consultarP();
        } else {
          this.$store.commit("setDatosPaciente", []);
        }
      } catch (error) {
        console.error("[eliminarPaciente] Error:", error);
        alert("Error al eliminar paciente: " + (error?.message || error));
      }
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
