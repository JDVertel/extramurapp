<template>
<div class="container-fluid">
    <h3>Admin Parametros</h3>
    <br />
    <nav>
        <div class="nav nav-tabs" id="nav-tab" role="tablist">
            <button class="nav-link active" id="nav-home-tab" data-bs-toggle="tab" data-bs-target="#nav-home" type="button" role="tab" aria-controls="nav-home" aria-selected="true">
                Comunas - Barrios
            </button>
            <button class="nav-link" id="nav-profile-tab" data-bs-toggle="tab" data-bs-target="#nav-profile" type="button" role="tab" aria-controls="nav-profile" aria-selected="false">
                EPS
            </button>
            <button class="nav-link" id="nav-contact-tab" data-bs-toggle="tab" data-bs-target="#nav-contact" type="button" role="tab" aria-controls="nav-contact" aria-selected="false">
                CUPS
            </button>
            <button class="nav-link" id="nav-pacientes-tab" data-bs-toggle="tab" data-bs-target="#nav-pacientes" type="button" role="tab" aria-controls="nav-pacientes" aria-selected="false">
                PACIENTES
            </button>
        </div>
    </nav>
    <div class="tab-content" id="nav-tabContent">
        <!-- Comunas/Barrios -->
        <div class="tab-pane fade show active" id="nav-home" role="tabpanel" aria-labelledby="nav-home-tab" tabindex="0">
            <br />
            <div class="container">

                <h6>Opciones disponibles para las encuestas Comunas/Barrios </h6>
                <br />

                <div class="row">
                    <div class="col-4">
                        <input type="number" id="comuna" name="comuna" class="form-control form-control-sm" placeholder="Comuna" v-model="comuna" />
                    </div>
                    <div class="col-4">
                        <input type="text" id="barrio" name="barrio" class="form-control form-control-sm" placeholder="Barrio" v-model="barrio" />
                    </div>
                    <div class="col-4">
                        <button type="button" class="btn btn-warning btn-sm" @click="saveComunaBarrio">
                            + Guardar
                        </button>
                    </div>
                </div>
            </div>
            <br />
            <div class="container">
                <div style="max-height: 600px; overflow-y: auto;">
                    <table class="table table-bordered table-sm mb-4">
                        <thead>
                            <tr>
                                <th scope="col">Comuna</th>
                                <th scope="col">Barrio</th>
                                <th scope="col">Eliminar</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(comuna, index) in comunasBarrios" :key="comuna.id || index">
                                <td>{{ comuna.comuna }}</td>
                                <td>{{ comuna.barrio }}</td>
                                <td>
                                    <button class="btn btn-danger btn-sm" @click="deleteBarrio(comuna.id)" aria-label="Eliminar barrio" type="button">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <!-- EPS -->
        <div class="tab-pane fade" id="nav-profile" role="tabpanel" aria-labelledby="nav-profile-tab" tabindex="0">
            <br />
            <div class="container">

                <div class="accordion" id="accordionExample">
                    <div class="accordion-item">
                        <h2 class="accordion-header" id="headingOne">
                            <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                                Eps disponibles en Demanda Inducida
                            </button>
                        </h2>
                        <div id="collapseOne" class="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                            <div class="accordion-body">

                                <div class="row">
                                    <div class="col-6">
                                        <div class="mb-3">
                                            <input type="text" id="epsname-di" name="epsname-di" class="form-control form-control-sm" placeholder="Nombre de la Eps" v-model="epsname" />
                                        </div>
                                    </div>
                                    <div class="col-6">
                                        <button type="button" class="btn btn-warning btn-sm" @click="saveEps">Guardar</button>
                                    </div>
                                </div>
                                <hr />
                                <div style="max-height: 300px; overflow-y: auto;">
                                    <table class="table table-bordered">
                                        <thead>
                                            <tr>
                                                <th>Nombre de EPS</th>
                                                <th>Opciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="(ot, index) in epss" :key="ot.id || index">
                                                <td>{{ ot.eps }}</td>
                                                <td>
                                                    <button class="btn btn-danger btn-sm" @click="EpsDelete(ot.id)" aria-label="Eliminar EPS" type="button">
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
                    <div class="accordion-item">
                        <h2 class="accordion-header" id="headingTwo">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                                Eps disponibles en Caracterizacion
                            </button>
                        </h2>
                        <div id="collapseTwo" class="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#accordionExample">
                            <div class="accordion-body">

                                <div class="row">
                                    <div class="col-6">
                                        <div class="mb-3">
                                            <input type="text" id="epsname-car" name="epsname-car" class="form-control form-control-sm" placeholder="Nombre de la Eps" v-model="epsname" />
                                        </div>
                                    </div>
                                    <div class="col-6">
                                        <button type="button" class="btn btn-warning btn-sm" @click="saveEps">Guardar</button>
                                    </div>
                                </div>
                                <hr />
                                <div style="max-height: 300px; overflow-y: auto;">
                                    <table class="table table-bordered">
                                        <thead>
                                            <tr>
                                                <th>Nombre de EPS</th>
                                                <th>Opciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="(ot, index) in epss" :key="ot.id || index">
                                                <td>{{ ot.eps }}</td>
                                                <td>
                                                    <button class="btn btn-danger btn-sm" @click="EpsDelete(ot.id)" aria-label="Eliminar EPS" type="button">
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
        <!-- Tipo Actividades -->
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
            <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h1 class="modal-title fs-5" id="staticBackdropLabel">Crear y Editar cups </h1>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">

                            <div class="row">
                                <div class="col-6">
                                    <div class="mb-3">
                                        <label f class="form-label">Nombre Procedimiento</label>
                                        <input type="text" id="cupsNombre" name="cupsNombre" class="form-control" placeholder="CUP">
                                    </div>
                                </div>
                                <div class="col-6">
                                    <div class="mb-3">
                                        <label f class="form-label">Codigo CUPS</label>
                                        <input type="text" id="cupsCodigo" name="cupsCodigo" class="form-control" placeholder="CUP">
                                    </div>
                                </div>
                                <div class="col-6">

                                    <label f class="form-label">Grupo</label>
                                    <select id="cupsGrupo" name="cupsGrupo" class="form-select" aria-label="Default select example">

                                        <option selected>--Seleccione--</option>
                                        <option value="1">One</option>
                                        <option value="2">Two</option>
                                        <option value="3">Three</option>
                                    </select></div>
                                <div class="col-6">
                                    <label f class="form-label">Rol(es) Habilitados</label>
                                    <select id="cupsRoles" name="cupsRoles" class="form-select" aria-label="Default select example">
                                        <option selected>--Seleccione--</option>
                                        <option value="1">One</option>
                                        <option value="2">Two</option>
                                        <option value="3">Three</option>
                                    </select></div>
                                <div class="col-6"> <label f class="form-label">EPS(s) Habilitadas</label>
                                    <select id="cupsEps" name="cupsEps" class="form-select" aria-label="Default select example">
                                        <option selected>--Seleccione--</option>
                                        <option value="1">One</option>
                                        <option value="2">Two</option>
                                        <option value="3">Three</option>
                                    </select></div>

                                <div class="col-6"></div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary btn-sm">Guardar</button>
                        </div>
                    </div>
                </div>
            </div>
            <br>
            <!--  fin modal crear editar cups -->
            <div v-if="cups && cups.length > 0" style="overflow-x: auto; width: 100%;">
                <table class="table table-bordered table-sm" style="min-width: 900px;">
                    <thead>
                        <tr>
                            <th>Editar</th>
                            <th>ID</th>
                            <th>Descripción CUP</th>
                            <th>Grupo</th>
                            <th>Homolog</th>
                            <th>Profesional</th>
                            <th>EPS</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="cup in cups" :key="cup.id">
                            <td>
                            <th><button type="button" class="btn btn-warning btn-sm" data-bs-toggle="modal" data-bs-target="#staticBackdrop">
                                    <i class="bi bi-pencil"></i>
                                </button></th>
                            </td>
                            <td>{{ cup.id }}</td>
                            <td>{{ cup.DescripcionCUP }}</td>
                            <td>{{ cup.Grupo }}</td>
                            <td>{{ cup.Homolog }}</td>
                            <td>{{ cup.Profesional }}</td>
                            <td>
                                <span v-for="(eps, eidx) in cup.Eps" :key="eps">
                                    {{ eps }}<span v-if="eidx < cup.Eps.length - 1">, </span>
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

<!-- ----------------------------------------------------PACIENTES--------------------------------------------------------------------------- -->

        <div class="tab-pane fade" id="nav-pacientes" role="tabpanel" aria-labelledby="nav-pacientes-tab" tabindex="0">
        <h5>Gestion de Pacientes</h5>
        <hr>
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
                    <button class="btn btn-primary mt-4" :disabled="cargandoPacientes" @click="consultarP"><i class="bi bi-search"></i>
                        Consultar</button>
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
                <div v-if="!cargandoPacientes && searchPerformed && (!datosPaciente || datosPaciente.length === 0)" class="alert alert-warning">No hay registros para esa consulta.</div>
                <div v-if="datosPaciente && datosPaciente.length > 0" style="overflow-x: auto; width: 100%;">
                    <table class="table table-bordered table-sm" style="min-width: 900px;">
                        <thead>
                            <tr>
                                <th>Campo</th>
                                <th v-for="paciente in datosPaciente" :key="paciente.id" class="text-center">
                                    <div>{{ paciente.nombre1 }} {{ paciente.apellido1 }} {{ paciente.apellido2 }}</div>
                                    <div><small>{{ paciente.tipodoc }}-{{ paciente.numdoc }}</small></div>
                                    <div class="btn-group mt-2" role="group">
                                        <!-- <button class="btn btn-warning btn-sm" type="button" @click.stop="editarP(paciente.id)"><i class="bi bi-pencil-square"></i></button> -->
                                        <button class="btn btn-danger btn-sm" type="button" @click.stop="eliminarPaciente(paciente.id)"><i class="bi bi-trash"></i></button>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <th>EPS</th>
                                <td v-for="paciente in datosPaciente" :key="'eps-' + paciente.id"><div class="cell-content">{{ paciente.eps }}</div></td>
                            </tr>
                            <tr>
                                <th>Fecha Nac.</th>
                                <td v-for="paciente in datosPaciente" :key="'fnac-' + paciente.id"><div class="cell-content">{{ paciente.fechaNac }}</div></td>
                            </tr>
                            <tr>
                                <th>Sexo</th>
                                <td v-for="paciente in datosPaciente" :key="'sexo-' + paciente.id"><div class="cell-content">{{ paciente.sexo }}</div></td>
                            </tr>
                            <tr>
                                <th>Dirección</th>
                                <td v-for="paciente in datosPaciente" :key="'dir-' + paciente.id"><div class="cell-content">{{ paciente.direccion }}</div></td>
                            </tr>
                            <tr>
                                <th>Comuna</th>
                                <td v-for="paciente in datosPaciente" :key="'comuna-' + paciente.id"><div class="cell-content">{{ paciente.barrioVeredacomuna?.comuna }}</div></td>
                            </tr>
                            <tr>
                                <th>Barrio</th>
                                <td v-for="paciente in datosPaciente" :key="'barrio-' + paciente.id"><div class="cell-content">{{ paciente.barrioVeredacomuna?.barrio }}</div></td>
                            </tr>
                            <tr v-for="item in activityKeys" :key="'act-' + item.key">
                                <th>{{ item.actividad.nombre }}</th>
                                <td v-for="paciente in datosPaciente" :key="'actcell-' + paciente.id + '-' + item.key">
                                    <div class="cell-content">
                                        <div v-if="paciente.tipoActividad && paciente.tipoActividad[item.key]">
                                            <div>
                                                <strong>Profesionales:</strong>
                                                <span v-for="(prof, pidx) in paciente.tipoActividad[item.key].Profesional || []" :key="prof">
                                                    {{ prof }}<span v-if="pidx < (paciente.tipoActividad[item.key].Profesional || []).length - 1">, </span>
                                                </span>
                                            </div>
                                            <div v-if="paciente.tipoActividad[item.key].cups">
                                                <div v-for="(cupsObj, profKey) in paciente.tipoActividad[item.key].cups" :key="profKey">
                                                    <strong>{{ profKey }}:</strong>
                                                    <ul class="mb-0">
                                                        <li v-for="cup in Object.values(cupsObj.cups || {})" :key="cup.id">
                                                            <span><strong>{{ cup.DescripcionCUP }}</strong></span><br>
                                                            EPS: <span v-for="(eps, eidx) in cup.Eps || []" :key="eps">{{ eps }}<span v-if="eidx < (cup.Eps || []).length - 1">, </span></span><br>
                                                            Grupo: {{ cup.Grupo }}<br>
                                                            Homolog: {{ cup.Homolog }}<br>
                                                            Cantidad: {{ cup.cantidad }}<br>
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
    </div>
</div>
</template>

<script>
import {
    mapState,
    mapActions
} from "vuex";
export default {
    data() {
        return {
            comuna: "",
            barrio: "",
            epsname: "",
            cargandoPacientes: false,
            searchPerformed: false,
            tipodoc: "",
            numdoc: "",

        };
    },
    computed: {
        ...mapState(["comunasBarrios", "epss", "cups", "datosPaciente"]),
        activityKeys() {
            if (!this.datosPaciente || !this.datosPaciente.length) return [];
            const first = this.datosPaciente[0];
            if (!first.tipoActividad || typeof first.tipoActividad !== 'object') return [];
            return Object.entries(first.tipoActividad).map(([key, actividad]) => ({ key, actividad }));
        }
    },
    methods: {
        ...mapActions([
            "getAllComunaBarrios",
            "crearComunaBarrio",
            "deleteComunaBarrio",
            "crearEps",
            "getAllEps",
            "deleteEps",
            "getAllCups",
            "getAllByPacientesID",
            "deletePaciente"
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
                    numdoc: this.numdoc
                });
            } catch (error) {
                console.error('[consultarP] Error:', error);
                alert('Error al consultar pacientes: ' + (error?.message || error));
            } finally {
                this.cargandoPacientes = false;
            }
        },

        async editarP(pacienteId) {
            // Navega a la pantalla de registro/editado de usuarios/ pacientes si existe
            // Actualmente la vista 'registrousuarios' existe; pasamos query param para que la puedas usar
            try {
                if (!pacienteId) return;
                this.$router.push({ name: 'registrousuarios', query: { editPacienteId: pacienteId } });
            } catch (error) {
                console.error('[editarP] Error al navegar:', error);
            }
        },

        async eliminarPaciente(pacienteId) {
            if (!pacienteId) return;
            const confirmed = confirm('¿Confirma que desea eliminar este paciente? Esta acción no se puede deshacer.');
            if (!confirmed) return;
            try {
                await this.deletePaciente(pacienteId);
                alert('Paciente eliminado correctamente.');
                // Volver a realizar la búsqueda actual (si existe tipodoc/numdoc)
                if (this.tipodoc && this.numdoc) {
                    // re-ejecutar la búsqueda para refrescar datos
                    await this.consultarP();
                } else {
                    // si no hay búsqueda actual, limpiar el estado local
                    this.$store.commit('setDatosPaciente', []);
                }
            } catch (error) {
                console.error('[eliminarPaciente] Error:', error);
                alert('Error al eliminar paciente: ' + (error?.message || error));
            }
        },

        saveComunaBarrio() {
            if (this.comuna === "" || this.barrio === "") {
                alert("Por favor, complete todos los campos.");
                return;
            }
            let data = {
                comuna: this.comuna,
                barrio: this.barrio,
                bd: "comunasybarrios",
            };
            this.crearComunaBarrio(data).then(() => {
                alert("Comuna y barrio creados exitosamente.");
                this.getAllComunaBarrios();
                this.clearform();
            });
        },

        saveEps() {
            if (this.epsname === "") {
                alert("Por favor, complete todos los campos.");
                return;
            }
            let data = {
                eps: this.epsname,
                bd: "eps",
            };
            this.crearEps(data).then(() => {
                alert("EPS creado exitosamente.");
                this.getAllEps();
                this.clearformeps();
            });
        },
        clearform() {
            this.comuna = "";
            this.barrio = "";
        },
        clearformeps() {
            this.epsname = "";
        },

        async deleteBarrio(index) {
            await this.deleteComunaBarrio(index);
            alert("Comuna y barrio eliminados exitosamente.");
            this.getAllComunaBarrios();
        },
        async EpsDelete(index) {
            await this.deleteEps(index);
            alert("EPS eliminado exitosamente.");
            this.getAllEps();
        },
    },
    mounted() {
        this.getAllComunaBarrios();
        this.getAllEps();
        this.getAllCups();
        /* traer  grupos, profesionales ,epsApp */
        /* crear epsApp autorizadas en las caracterizacion */
    },
};
</script>

<!-- no custom styles needed for LTR layout; keep global/app CSS -->
