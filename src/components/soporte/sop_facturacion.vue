<template>
<div class="container-fluid">
    <h1> Facturación</h1>
    <div v-if="cargando" class="spinner-overlay">
        <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
        </div>
        <div class="spinner-message">
            Por favor espere, cargando información...
        </div>
    </div>
    <div v-if="!cargando">

        <nav>
            <div class="nav nav-tabs" id="nav-tab" role="tablist">
                <button class="nav-link" :class="{ active: activeTab === 'pendientes' }" @click="activeTab = 'pendientes'" type="button">
                    Pendientes
                </button>
                <button class="nav-link" :class="{ active: activeTab === 'aprovisionar' }" @click="activeTab = 'aprovisionar'" type="button">
                    Aprovisionar
                </button>
            </div>
        </nav>
        <div class="tab-content" id="nav-tabContent">
            <div v-show="activeTab === 'pendientes'" class="tab-pane fade show active" id="nav-home" role="tabpanel" tabindex="0">

                <div class="table-responsive tabla-scroll" ref="tablaHtml">
                    <table class="table table-bordered table-striped table-sm align-middle">
                        <thead class="table-light">
                            <tr>
                                <th>id</th>
                                <th>Grupo</th>
                                <th>Paciente</th>
                                <th>Sexo</th>
                                <th>Documento</th>
                                <th>Fecha Nac.</th>
                                <th>Edad</th>
                                <th>EPS</th>
                                <th>Régimen</th>
                                <th>Dirección</th>
                                <th>Barrio</th>
                                <th>Comuna</th>
                                <th>Fecha Demanda</th>
                                <th>Fecha cierre</th>
                                <th>Facturar</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(paciente, idx) in EncuestasFactAprov" :key="paciente.id">
                                <td>{{ paciente.id }}</td>
                                <td>{{ paciente.grupo }}</td>
                                <td>
                                    {{ paciente.nombre1 }} {{ paciente.apellido1 }}
                                    {{ paciente.apellido2 }}
                                </td>
                                <td>{{ paciente.sexo }}</td>
                                <td>{{ paciente.tipodoc }}-{{ paciente.numdoc }}</td>
                                <td>{{ paciente.fechaNac }}</td>
                                <td>{{ calcularEdad(paciente.fechaNac) }}</td>
                                <td>{{ paciente.eps }}</td>
                                <td>{{ paciente.regimen }}</td>
                                <td>{{ paciente.direccion }}</td>
                                <td>{{ paciente.barrioVeredacomuna?.barrio }}</td>
                                <td>{{ paciente.barrioVeredacomuna?.comuna }}</td>
                                <td>{{ paciente.fecha }}</td>
                                <td>{{ paciente.fechagestEnfermera }}</td>
                                <td>
                                    <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#staticBackdrop" @click="setPacienteId(paciente.id)">
                                        <i class="bi bi-bookmark-check-fill"></i>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div v-show="activeTab === 'aprovisionar'" class="tab-pane fade show active" id="nav-profile" role="tabpanel" tabindex="0">
                <div class="container mt-3">

                    <ul class="nav nav-tabs" id="myTab" role="tablist">
                        <li class="nav-item" role="presentation">
                            <button class="nav-link active" id="home-tab" data-bs-toggle="tab" data-bs-target="#home-tab-pane" type="button" role="tab" aria-controls="home-tab-pane" aria-selected="true">Consulta x Fechas</button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile-tab-pane" type="button" role="tab" aria-controls="profile-tab-pane" aria-selected="false">Consulta x Documento</button>
                        </li>

                    </ul>
                    <div class="tab-content" id="myTabContent">
                        <div class="tab-pane fade show active" id="home-tab-pane" role="tabpanel" aria-labelledby="home-tab" tabindex="0">
                            <div class="row mt-3">

                                <div class="col-8">
                                    <div class="input-group">
                                        <span class="input-group-text">Rango de fechas de la consulta</span>
                                        <input type="date" aria-label="First name" class="form-control" v-model="fechaInicio" />
                                        <input type="date" aria-label="Last name" class="form-control" v-model="fechaFin" />
                                    </div>
                                </div>
                                <div class="col-4">
                                    <button type="button" class="btn btn-warning" @click="getdataEncuestas(fechaInicio, fechaFin)">
                                        Buscar
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="tab-pane fade" id="profile-tab-pane" role="tabpanel" aria-labelledby="profile-tab" tabindex="0">
                            <div class="row mt-3">
                                <div class="col-4"> <label for="tipodoc" class="form-label">Tipo de Documento</label> <select id="tipodoc" v-model="tipodoc" class="form-select" required>
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
                                    </select></div>
                                <div class="col-4"> <label for="numdoc" class="form-label">Número de Documento</label> <input type="text" aria-label="First name" class="form-control" v-model="numdoc" /></div>
                                <div class="col-4"><button type="button" class="btn btn-warning mt-5" @click="getdataEncuestasById(tipodoc,numdoc)">
                                        Buscar
                                    </button></div>
                            </div>
                        </div>

                    </div>

                    <br>

                </div>
                <br />
                <p>Registro</p>
                <div class="table-responsive tabla-scroll" ref="tablaHtml">
                    <table class="table table-bordered table-striped table-sm align-middle table-success">
                        <thead class="table-light">
                            <tr>
                                <!--  <th>id</th> -->
                                <th>Grupo</th>
                                <th>Paciente</th>
                                <th>Sexo</th>
                                <th>Documento</th>
                                <th>Fecha Nac.</th>
                                <th>EPS</th>
                                <th>Régimen</th>
                                <th>Dirección</th>
                                <th>Barrio</th>
                                <th>Comuna</th>
                                <th>Fecha Demanda</th>
                                <th>Fecha cierre Enf</th>
                                <th>Remisión</th>
                                <th>Opciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(paciente, idx) in EncuestasFact" :key="paciente.id">
                                <!-- <td>{{paciente.id }}</td> -->
                                <td>{{ paciente.grupo }}</td>
                                <td>
                                    {{ paciente.nombre1 }} {{ paciente.nombre2 }}
                                    {{ paciente.apellido1 }} {{ paciente.apellido2 }}
                                </td>
                                <td>{{ paciente.sexo }}</td>
                                <td>{{ paciente.tipodoc }}-{{ paciente.numdoc }}</td>
                                <td>{{ paciente.fechaNac }}</td>
                                <td>{{ paciente.eps }}</td>
                                <td>{{ paciente.regimen }}</td>
                                <td>{{ paciente.direccion }}</td>
                                <td>{{ paciente.barrioVeredacomuna?.barrio }}</td>
                                <td>{{ paciente.barrioVeredacomuna?.comuna }}</td>
                                <td>{{ paciente.fecha }}</td>
                                <td>{{ paciente.fechagestEnfermera }}</td>
                                <td>{{ paciente.requiereRemision }}</td>
                                <td>
                                    <button type="button" class="btn btn-warning btn-sm" :disabled="aprovDisabled[paciente.id]" @click="
                        AprovisionarPaciente(
                          (idEncuesta = paciente.id),
                          (idProf = userData.numDocumento)
                        )
                      ">
                                        <i class="bi bi-person-plus"></i>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal -->
    <div class="modal fade modal-dialog-scrollable" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div class="modal-dialog modal-fullscreen">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="exampleModalLabel">
                        <i class="bi bi-clipboard-check"></i> Facturar CUPS
                    </h1>

                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="container-fluid">
                    <table class="table table-bordered table-striped table-sm align-middle table-success">
                        <thead class="table-light">
                            <tr>
                                <!-- <th>idEnc</th> -->
                                <th>Grupo</th>
                                <th>Paciente</th>
                                <th>Sexo</th>
                                <th>Documento</th>
                                <th>Fecha Nac.</th>
                                <th>Edad</th>
                                <th>EPS</th>
                                <th>Régimen</th>
                                <th>Dirección</th>
                                <th>Barrio</th>
                                <th>Comuna</th>
                                <th>lab/visit</th>
                                <th>Gest. Aux</th>

                                <th>Gest. Médica</th>
                                <th>Gest. Enfermera</th>
                                <th>Teléfono</th>
                            </tr>
                        </thead>
                        <tbody class="table-group-divider">
                            <tr v-for="(paciente, idx) in InfoEncuestasById" :key="paciente.id">
                                <!-- Campos principales del paciente -->
                                <!-- <td>{{ pacienteIdModal}}</td> -->
                                <td>{{ paciente.grupo }}</td>
                                <td>
                                    {{ paciente.nombre1 }} {{ paciente.apellido1 }}
                                    {{ paciente.apellido2 }}
                                </td>
                                <td>{{ paciente.sexo }}</td>
                                <td>{{ paciente.tipodoc }}-{{ paciente.numdoc }}</td>
                                <td>{{ paciente.fechaNac }}</td>
                                <td>{{ calcularEdad(paciente.fechaNac) }}</td>
                                <td>{{ paciente.eps }}</td>
                                <td>{{ paciente.regimen }}</td>
                                <td>{{ paciente.direccion }}</td>
                                <td>{{ paciente.barrioVeredacomuna?.barrio }}</td>
                                <td>{{ paciente.barrioVeredacomuna?.comuna }}</td>
                                <td>
                                    {{
                        paciente.Agenda_tomademuestras?.cita_tomamuestras
                          ? "Sí"
                          : "No"
                      }}/{{
                        paciente.Agenda_Visitamedica?.cita_visitamedica
                          ? "Sí"
                          : "No"
                      }}
                                </td>
                                <td>
                                    {{
                        paciente.status_gest_aux
                          ? paciente.fechagestAuxiliar
                          : "No"
                      }}
                                </td>

                                <td>
                                    {{
                        paciente.status_gest_medica
                          ? paciente.fechagestMedica
                          : "No"
                      }}
                                </td>
                                <td>
                                    {{
                        paciente.status_gest_enfermera
                          ? paciente.fechagestEnfermera
                          : "No"
                      }}
                                </td>
                                <td>{{ paciente.telefono }}</td>
                                <!-- Renderiza cada resultado de procedimiento como una fila individual -->
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="modal-body">

                    <!--    <div class="alert alert-info">
                        ID Paciente seleccionado: <strong>{{ pacienteIdModal }}</strong>
                    </div> -->
                    <!--  -->
                    <div class="table-responsive" ref="tablaHtml">

                        <!-- *************************************************************************************************************** -->
                        <div class="container-fluid ">
                            <table class="table table-bordered table-striped table-sm align-middle">
                                <!--  {{ conteoCupsFactNum }} -->
                                <thead class="table-light table-bordered">
                                    <tr>
                                        <th>Procedimientos y Actividades</th>

                                    </tr>

                                </thead>
                                <tbody>
                                    <tr v-for="(paciente, idx) in InfoEncuestasById" :key="paciente.id">
                                        <td>
                                            <table class="table table-bordered table-striped table-sm align-middle">
                                                <thead>
                                                    <tr>

                                                        <th>Actividad</th>
                                                        <th>Rol</th>
                                                        <th>Profesional</th>
                                                        <th>Cantidad</th>
                                                        <th>Homolog</th>
                                                        <th>Descripción CUP</th>
                                                        <th>Detalle</th>
                                                        <th>Grupo</th>
                                                        <th>Factura</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <template v-for="(actividad, actividadKey) in paciente.tipoActividad" :key="'act-' + actividadKey">
                                                        <template v-if="actividad.Profesional && Array.isArray(actividad.Profesional) && actividad.Profesional.length">
                                                            <template v-for="profesional in actividad.Profesional" :key="'prof-' + profesional">
                                                                <template v-if="actividad.cups && actividad.cups[profesional]">
                                                                    <tr v-for="([cupId, cup]) in Object.entries(actividad.cups[profesional]?.cups || {}).filter(([_, cup]) => cup && Object.keys(cup).length > 0)" :key="'cup-' + cupId">
                                                                        <td>{{ actividad.nombre }}</td>
                                                                        <td>{{ profesional }} </td>
                                                                        <td>{{ actividad.cups[profesional]?.nombre || '-' }}</td>
                                                                        <td>{{ cup && cup.cantidad !== undefined ? cup.cantidad : '-' }}</td>
                                                                        <td>{{ cup && cup.Homolog !== undefined ? cup.Homolog : '-' }}</td>
                                                                        <td>{{ cup && cup.DescripcionCUP !== undefined ? cup.DescripcionCUP : '-' }}</td>
                                                                        <td>{{ cup && cup.detalle !== undefined ? cup.detalle : '-' }}</td>
                                                                        <td>{{ cup && cup.Grupo !== undefined ? cup.Grupo : '-' }}</td>
                                                                        <td>
                                                                            <template v-if="cup && cup.FactNum !== undefined">
                                                                                {{ cup.FactNum }}
                                                                            </template>
                                                                            <template v-else>
                                                                                <div class="input-group mb-3">
                                                                                    <input type="text" class="form-control" :disabled="facturaDisabled[cupId]" v-model="facturaInputs[cupId]" :placeholder="facturaDisabled[cupId] ? facturaInputs[cupId] : '#factura'" aria-label="Recipient’s username" aria-describedby="button-addon2">
                                                                                    <button class="btn btn-outline-secondary" type="button" id="button-addon2"
                                                                                        :disabled="!facturaInputs[cupId] || facturaInputs[cupId].length < 6 || facturaDisabled[cupId]"
                                                                                        @click="regFactCup(profesional ,cup.Homolog, facturaInputs[cupId], actividad.id, cup.id)">
                                                                                        <i :class="['bi', 'bi-bookmark-check-fill', facturaDisabled[cupId] ? 'text-primary' : '']"></i>
                                                                                    </button>
                                                                                </div>
                                                                            </template>
                                                                        </td>
                                                                    </tr>
                                                                </template>
                                                            </template>
                                                        </template>
                                                        <template v-else>
                                                            <tr>
                                                                <td>{{ actividad.nombre }}</td>
                                                                <td>Sin profesionales registrados</td>
                                                                <td colspan="6">No hay procedimientos asignados.</td>
                                                            </tr>
                                                        </template>
                                                    </template>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <!--  -->

                    <hr />

                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                        Cerrar
                    </button>

                    <button v-if="allCupsWithFactura || noProfesionalesRenderizados || noCupsRenderizados" class="btn btn-danger" @click="cerrarfact(pacienteIdModal)" data-bs-dismiss="modal">
                        <i class="bi bi-check2-circle"></i> Cerrar Paciente
                    </button>

                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import {
    mapActions,
    mapState
} from "vuex";

export default {
    data() {
        return {
            fechaFin: "",
            fechaInicio: "",
            cargando: false,
            activeTab: "pendientes", // Control de pestaña activa
            aprovDisabled: {}, // Estado de desactivación por paciente
            pacienteIdModal: null,
            facturaDisabled: {}, // Estado de desactivación por cupId
            facturaInputs: {}, // Valores de factura por cupId
            cupl: null,
            tipodoc: "",
            numdoc: "",
        }
    },
    computed: {
        ...mapState([
            "EncuestasFact",
            "userData",
            "EncuestasFactAprov",
            "InfoEncuestasById",
        ]),

        conteoCupsFactNum() {
            let totalCups = 0;
            let totalFactNum = 0;

            if (!this.InfoEncuestasById || !Array.isArray(this.InfoEncuestasById)) {
                return {
                    totalCups,
                    totalFactNum
                };
            }

            this.InfoEncuestasById.forEach(paciente => {
                if (!paciente.tipoActividad || typeof paciente.tipoActividad !== 'object') return;

                Object.values(paciente.tipoActividad).forEach(actividad => {
                    if (!actividad.cups || typeof actividad.cups !== 'object') return;

                    // Para cada profesional en cups
                    Object.values(actividad.cups).forEach(profesionalObj => {
                        if (!profesionalObj.cups || typeof profesionalObj.cups !== 'object') return;

                        const cupsObj = profesionalObj.cups;

                        // Contar todos los cups (propiedades dentro de cupsObj)
                        const keysCups = Object.keys(cupsObj);
                        totalCups += keysCups.length;

                        keysCups.forEach(keyCup => {
                            const cup = cupsObj[keyCup];
                            if (cup && cup.FactNum != null && cup.FactNum !== '') {
                                totalFactNum++;
                            }
                        });
                    });
                });
            });

            return {
                totalCups,
                totalFactNum
            };
        },
        allCupsWithFactura() {
            // Solo considerar los cups renderizados (filtrados)
            if (!this.InfoEncuestasById || !Array.isArray(this.InfoEncuestasById)) return false;
            let allWithFactura = true;
            let anyCup = false;
            this.InfoEncuestasById.forEach(paciente => {
                if (!paciente.tipoActividad || typeof paciente.tipoActividad !== 'object') return;
                Object.values(paciente.tipoActividad).forEach(actividad => {
                    if (!actividad.cups || typeof actividad.cups !== 'object') return;
                    Object.values(actividad.cups).forEach(profesionalObj => {
                        if (!profesionalObj.cups || typeof profesionalObj.cups !== 'object') return;
                        const cupsObj = profesionalObj.cups;
                        const filteredCups = Object.values(cupsObj).filter(cup => cup && Object.keys(cup).length > 0);
                        if (filteredCups.length > 0) anyCup = true;
                        filteredCups.forEach(cup => {
                            if (!cup.FactNum) allWithFactura = false;
                        });
                    });
                });
            });
            return allWithFactura && anyCup;
        },
        noProfesionalesRenderizados() {
            // Devuelve true si no hay profesionales definidos (o están vacíos) en las actividades
            if (!this.InfoEncuestasById || !Array.isArray(this.InfoEncuestasById)) return false;
            let anyActividadWithProfesional = false;
            this.InfoEncuestasById.forEach(paciente => {
                if (!paciente.tipoActividad || typeof paciente.tipoActividad !== 'object') return;
                Object.values(paciente.tipoActividad).forEach(actividad => {
                    if (actividad.Profesional && Array.isArray(actividad.Profesional) && actividad.Profesional.length) {
                        anyActividadWithProfesional = true;
                    }
                });
            });
            // Si NO hay ninguna actividad con profesionales, devolvemos true
            return !anyActividadWithProfesional;
        }
        ,
        noCupsRenderizados() {
            // Devuelve true si no hay ningún cup renderizable en InfoEncuestasById
            if (!this.InfoEncuestasById || !Array.isArray(this.InfoEncuestasById)) return false;
            let anyCupRenderable = false;
            this.InfoEncuestasById.forEach(paciente => {
                if (!paciente.tipoActividad || typeof paciente.tipoActividad !== 'object') return;
                Object.values(paciente.tipoActividad).forEach(actividad => {
                    if (!actividad.cups || typeof actividad.cups !== 'object') return;
                    Object.values(actividad.cups).forEach(profesionalObj => {
                        if (!profesionalObj.cups || typeof profesionalObj.cups !== 'object') return;
                        const cupsObj = profesionalObj.cups;
                        const filtered = Object.values(cupsObj).filter(cup => cup && Object.keys(cup).length > 0);
                        if (filtered.length > 0) anyCupRenderable = true;
                    });
                });
            });
            return !anyCupRenderable;
        }

    },
    methods: {
        ...mapActions([
            "GetRegistersbyRangeGeneralFact",
            "GetRegistersbyRangeGeneralFactAprov",
            "GetRegistersbyRangeGeneralFactByID",
            "aprovicionarP",
            "getEncuestaById",
            "asigFacturacion",
            "cerrarFacturacion"
        ]),
        /*  */

        /*  */
        async getPendientes() {
            this.cargando = true;
            await this.GetRegistersbyRangeGeneralFactAprov(
                this.userData.numDocumento
            );
            this.cargando = false;
        },
        async getdataEncuestas(fechaInicio, fechaFin) {
            this.cargando = true;
            try {
                let parametros = {
                    finicial: fechaInicio,
                    ffinal: fechaFin,
                };
                await this.GetRegistersbyRangeGeneralFact(parametros);
            } catch (error) {
                console.error("Error al consultar encuestas:", error);
            } finally {
                this.cargando = false;
            }
        },

        async getdataEncuestasById(tipodoc, numdoc) {
            this.cargando = true;
            try {
                let parametros = {
                    tipodoc: tipodoc,
                    numdoc: numdoc,
                };
                await this.GetRegistersbyRangeGeneralFactByID(parametros);
            } catch (error) {
                console.error("Error al consultar encuestas:", error);
            } finally {
                this.cargando = false;
            }
        },
        AprovisionarPaciente(id) {
            this.aprovDisabled[id] = true;
            let data = {
                idEnc: id,
                idProf: this.userData.numDocumento,
            };
            this.aprovicionarP(data);
        },
        desactivarInput(cupId) {
            this.facturaDisabled[cupId] = true;
        },
        setPacienteId(id) {
            // Vaciar todas las variables relevantes al abrir el modal
            this.pacienteIdModal = id;
            this.facturaInputs = {};
            this.facturaDisabled = {};
            this.cargando = false;
            // Si tienes más variables que deban vaciarse, agrégalas aquí
            this.getEncuestaById(id).then(() => {
                // Inicializar los inputs y disabled para todos los cupId presentes
                if (this.InfoEncuestasById && Array.isArray(this.InfoEncuestasById)) {
                    this.InfoEncuestasById.forEach(paciente => {
                        if (paciente.tipoActividad && typeof paciente.tipoActividad === 'object') {
                            Object.values(paciente.tipoActividad).forEach(actividad => {
                                if (actividad.cups && typeof actividad.cups === 'object') {
                                    Object.values(actividad.cups).forEach(profesionalObj => {
                                        if (profesionalObj.cups && typeof profesionalObj.cups === 'object') {
                                            Object.keys(profesionalObj.cups).forEach(cupId => {
                                                if (!(cupId in this.facturaInputs)) {
                                                    this.facturaInputs[cupId] = '';
                                                }
                                                if (!(cupId in this.facturaDisabled)) {
                                                    this.facturaDisabled[cupId] = false;
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        },
        async regFactCup(rol, cup, numfact, idActividad, idcup) {
            this.cargando = true;
            let timeoutDisparado = false;
            let spinnerTimeout = setTimeout(() => {
                if (this.cargando) {
                    timeoutDisparado = true;
                    this.cargando = false;
                    this.facturaDisabled[idcup] = false;
                    alert('Error: El proceso de guardado está tardando demasiado. Intente nuevamente.');
                    console.warn('[regFactCup] Timeout: spinner forzado a false');
                }
            }, 10000); // 10 segundos de espera máxima
            console.log('[regFactCup] INICIO', {
                rol,
                cup,
                numfact,
                idActividad,
                idcup
            });
            let guardadoExitoso = false;
            try {
                // Asegurar reactividad antes de guardar
                if (!(idcup in this.facturaInputs)) {
                    this.facturaInputs[idcup] = numfact;
                }
                if (!(idcup in this.facturaDisabled)) {
                    this.facturaDisabled[idcup] = false;
                }
                const datafact = {
                    rol,
                    cup,
                    idActividad,
                    idEncuesta: this.pacienteIdModal,
                    idFacturador: this.userData.numDocumento,
                    numFactura: numfact,
                    cupId: idcup
                };
                console.log('[regFactCup] Antes de asigFacturacion', datafact);
                const res = await this.asigFacturacion(datafact);
                if (res && res.success === false) {
                    throw new Error(res.message || 'No se pudo guardar el registro.');
                }
                guardadoExitoso = true;
                console.log('[regFactCup] Guardado exitoso en asigFacturacion');
                await this.getEncuestaById(this.pacienteIdModal);
                console.log('[regFactCup] Datos recargados con getEncuestaById');
                // Solo bloquear el campo tras guardar
                this.facturaDisabled[idcup] = true;
                console.log('[regFactCup] Campo bloqueado tras guardar');
            } catch (error) {
                console.error('[regFactCup] ERROR:', error);
                this.facturaDisabled[idcup] = false;
                this.cargando = false;
                if (!timeoutDisparado) {
                    alert('Error al guardar: ' + (error?.message || error));
                }
            } finally {
                this.cargando = false;
                clearTimeout(spinnerTimeout);
                if (!guardadoExitoso && !timeoutDisparado) {
                    this.facturaDisabled[idcup] = false;
                    alert('No se pudo guardar el registro. Intente nuevamente.');
                }
                console.log('[regFactCup] FIN, cargando:', this.cargando);
            }
        },

        async cerrarfact(id) {
            try {
                this.cargando = true;
                // Esperar a que la acción de cerrar en el store termine si retorna promesa
                if (this.cerrarFacturacion) {
                    await this.cerrarFacturacion(id);
                }
                alert("Factura cerrada");
                // Recargar la lista y esperar a que termine
                if (this.GetRegistersbyRangeGeneralFactAprov) {
                    await this.GetRegistersbyRangeGeneralFactAprov(
                        this.userData.numDocumento
                    );
                }
                // Forzar reflow / re-evaluación del DOM y restaurar desplazamiento si aplica
                await this.$nextTick();
                const tabla = this.$refs.tablaHtml;
                if (tabla) {
                    // ref puede ser array si hay múltiples elementos con el mismo ref
                    const restoreScroll = el => {
                        try {
                            if (el && el.scrollTop !== undefined) el.scrollTop = 0;
                        } catch (e) {
                            // ignore
                        }
                    };
                    if (Array.isArray(tabla)) {
                        tabla.forEach(restoreScroll);
                    } else {
                        restoreScroll(tabla);
                    }
                }
                // Disparar resize para que cualquier plugin o CSS recalcule
                try { window.dispatchEvent(new Event('resize')); } catch (e) {}
            } catch (error) {
                console.error('[cerrarfact] Error:', error);
                alert('Error al cerrar factura: ' + (error?.message || error));
            } finally {
                this.cargando = false;
            }
        },

        calcularEdad(fechaNacimiento) {
            const hoy = new Date();
            const nacimiento = new Date(fechaNacimiento);
            let edad = hoy.getFullYear() - nacimiento.getFullYear();
            const mes = hoy.getMonth() - nacimiento.getMonth();
            const dia = hoy.getDate() - nacimiento.getDate();

            if (mes < 0 || (mes === 0 && dia < 0)) {
                edad--;
            }
            return edad;
        }

    },
    mounted() {
        this.cargando = true
        this.GetRegistersbyRangeGeneralFactAprov(
            this.userData.numDocumento
        ).finally(() => {
            this.cargando = false
        })
    }
}
</script>

<style>
/* Spinner overlay universal para evitar problemas en pantalla completa */
.spinner-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(255, 255, 255, 0.7);
    z-index: 20000;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    pointer-events: auto;
}

.spinner-message {
    margin-top: 20px;
    font-size: 1.2rem;
    color: #333;
}

.tabla-scroll {
    max-height: 600px;
    /* Ajusta la altura según tu necesidad */
    overflow-y: auto;
}
</style>
