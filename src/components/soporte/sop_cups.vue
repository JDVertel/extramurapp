<template>
<!-- {{ InfoEncuestasById }} -->
<!-- {{ dataencuesta.eps }} -->
<div v-if="guardando" class="overlay-guardando">
    <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Guardando...</span>
    </div>
    <div class="texto-guardando">Guardando listado, por favor espere...</div>
</div>
<div v-for="itemE in InfoEncuestasById" :key="itemE.id" class="mb-4" :aria-busy="guardando">
    <div class="container-fluid  rounded shadow-sm py-3 mb-3 paciente p-1">

        <div class="row align-items-stretch fila-con-columnas p-1">
            <div class="col-12 col-md-4  mb-2 mb-md-0 p-1">
                <strong>Paciente:</strong> {{ itemE.nombre1 }} {{ itemE.nombre2 }} {{ itemE.apellido1 }} {{ itemE.apellido2 }}
            </div>
            <div class="col-6 col-md-4  mb-2 mb-md-0 p-1">
                <strong>EPS:</strong> {{ itemE.eps }}<br>
                <strong>Régimen:</strong> {{ itemE.regimen }}
            </div>
            <div class="col-6 col-md-4 p-1">
                <strong>Sexo:</strong> {{ itemE.sexo }}<br>
                <strong>Edad:</strong> {{ edadActual(itemE.fechaNac) }}
            </div>
        </div>
    </div>
    <div style="max-height: 600px; overflow-y: auto;">
        <div class="container-fluid bg-light rounded shadow-sm p-3 ">
            <h5 class="fw-bold text-success mb-3">
                <i class="bi bi-person-check-fill"></i> Actividades del paciente
            </h5>
            <hr>
            <div v-for="actividad in actividadesConMedico(itemE.tipoActividad)" :key="actividad.id" class="mb-4 pb-3 border-bottom">
                <div class="row align-items-stretch fila-con-columnas">
                    <div class="col-12 col-md-2  mb-2 mb-md-0 profesionales horizontal">
                        <h6 class="fw-semibold">Profesionales:</h6>
                        <small>{{ actividad.Profesional }}</small>
                    </div>
                    <div class="col-12 col-md-2  mb-2 mb-md-0 Actividades horizontal">
                        <h6 class="fw-semibold">Actividad:</h6>
                        <small>{{ actividad.nombre }}</small><br>
                        <button class="btn btn-warning btn-sm mt-1" data-bs-toggle="modal" data-bs-target="#staticBackdrop" @click="integrarCup({ id: actividad.id, nombre: actividad.nombre })" :disabled="!userData || !userData.cargo || (cupsEPS && cupsEPS.length === 0)">
                            <i class="bi bi-bookmark-heart"></i>
                        </button>
                    </div>
                    <div class="col-12 col-md-8 cupsAsignados">
                        <h6 class="fw-semibold">Cups Asignados:</h6>
                        <span v-for="cup in actividad.cups" :key="cup.id">
                            <span v-for="itex in (cup.cups || [])" :key="itex?.id">
                                <div v-if="itex">
                                    <div class="row align-items-center mb-1">
                                        <div class="col-2">
                                            <button class="btn btn-danger btn-sm m-1" v-if="itex.Profesional === userData.cargo" @click="eliminarCUP(itemE.id, actividad.id, itex.id)">
                                                <i class="bi bi-trash"></i>
                                            </button>
                                        </div>
                                        <div class="col-10">
                                            <small class="fw-medium">{{ itex.DescripcionCUP }}</small>
                                            <span class="badge bg-danger ms-1">Cant: {{ itex.cantidad }}</span>
                                            <span class="badge bg-info ms-1 text-dark">Detalle: {{ itex.detalle }}</span>
                                        </div>
                                    </div>
                                </div>
                            </span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="footer my-3 text-end">
        <button class="btn btn-success btn-sm" @click="cerrarVisita()" v-if="InfoEncuestasById !== ''">
            <i class="bi bi-clipboard2-check"></i> Cerrar Visita
        </button>
    </div>
    <!-- El modal queda igual, puedes mejorar clase 'modal-content' por 'shadow-lg' si gustas -->
    <div class="modal fade" id="staticBackdrop" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content shadow-lg">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="staticBackdropLabel">
                        <i class="bi bi-file-earmark-plus"></i> Añadir CUPS a procedimientos
                    </h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    Seleccione el CUP que desea asignar a <strong>{{ actividadSeleccionadaNombre }}</strong>
                    <div class="row">
                        <div class="mb-3">
                            <br />
                            <select v-model="CupsSeleccionado" class="form-select" id="cupSelect" :disabled="cupsEPS.length === 0">
                                <option value="">Listado de CUPS disponible</option>
                                <option v-for="cup in cupsEPS" :key="cup.id" :value="cup">
                                    {{ cup.DescripcionCUP }}
                                </option>
                            </select>
                            <span v-if="cupsEPS.length === 0" class="text-muted">Cargando CUPS...</span>
                            <div class="row mt-2">
                                <div class="col-2">Cantidad <input type="number" class="form-control" aria-label="Cantidad" v-model="cantidad"></div>
                                <div class="col-10">
                                    <div class="input-group">
                                        <span class="input-group-text">Detalle</span>
                                        <textarea class="form-control" aria-label="With textarea" v-model="detalle"></textarea>
                                    </div>
                                </div>
                            </div>
                            <button class="btn btn-warning btn-sm mt-2" @click="addCups(this.CupsSeleccionado, this.cantidad, this.detalle)">
                                <i class="bi bi-plus-circle-dotted"></i> Agregar al listado
                            </button>
                        </div>
                    </div>
                </div>
                <div class="modal-body">
                    <h6>Listado de CUPS:</h6>
                    <hr />
                    <table class="table" v-if="cupsArray.length > 0">
                        <thead>
                            <tr>
                                <th scope="col">CUPS</th>
                                <th scope="col">Detalle</th>
                                <th scope="col">Grupo</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(cup, index) in cupsArray" :key="index">
                                <th>{{ cup.Homolog }}</th>
                                <td>{{ cup.DescripcionCUP }}</td>
                                <td>{{ cup.Grupo }}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div v-if="cupsArray.length === 0">No hay CUPS seleccionados.</div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-danger btn-sm" data-bs-dismiss="modal">
                            <i class="bi bi-x-square"></i> Cancelar
                        </button>
                        <button type="button" class="btn btn-primary btn-sm" @click="confirmarSeleccion()" data-bs-dismiss="modal" v-if="cupsArray.length !== 0">
                            <i class="bi bi-floppy"></i> Guardar Listado
                        </button>
                    </div>
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
import moment from "moment";

/* ----------------------------------------------------------------------------------------------- */
export default {
    data() {
        return {
            idEncuesta: null,
            actividades: [],
            CupsFiltradosByEPs: [],
            CupsSeleccionado: {},
            cupsArray: [], // Esta propiedad se usará para almacenar los cups seleccionados
            keyActividad: "",
            idItem: "",
            actividadesProcesadas: [],
            datoslistos: [],
            datoscups: [],
            datosfinal: [],
            cantidad: 1, // Valor por defecto para la cantidad
            detalle: "", // Detalle del cup seleccionado
            guardando: false, // Para mostrar el overlay/spinner
            actividadSeleccionadaNombre: '',
        };
    },

    /* ----------------------------------------------------------------------------------------------- */
    computed: {
        ...mapState([
            "InfoEncuestasById",
            "userData",
            "cups",
            "encuestas",
            "cupsbyActividad",
            "deleteCUPS",
            "dataips"

        ]),

        //logica para obtener los cups filtrados por EPS y profesional
        dataencuesta() {
            return this.InfoEncuestasById.length > 0 ? this.InfoEncuestasById[0] : null;
        },

        cupsEPS() {
            if (
                !this.cups ||
                !this.dataencuesta ||
                !this.dataencuesta.eps ||
                !this.userData ||
                !this.userData.cargo
            ) return [];
            return this.cups.filter(
                (cup) =>
                Array.isArray(cup.Eps) &&
                cup.Eps.includes(this.dataencuesta.eps) &&
                cup.Profesional === this.userData.cargo
            );
        },
        cargoUsuario: function () {
            return this.userData && this.userData.cargo ? this.userData.cargo : "";
        },

    },

    /* ----------------------------------------------------------------------------------------------- */
    methods: {
        ...mapActions([
            "getEncuestaById",
            "getAllCups",
            "adicionarCups",
            "selectCupsByActividad",
            "cerrarEncuesta"
        ]),

        edadActual(x) {
            if (!x) return null; // valida que haya fecha

            let nacimiento;

            // Manejar diferentes tipos de entrada
            if (typeof x === 'string' || x instanceof String) {
                nacimiento = new Date(x);
            } else if (x instanceof Date) {
                nacimiento = x;
            } else if (typeof x === 'object' && x !== null) {
                // Si es un objeto, intenta extraer una propiedad con la fecha (ajusta según tu estructura)
                if (x.date) {
                    nacimiento = new Date(x.date);
                } else {
                    console.warn('Formato de fecha no soportado:', x);
                    return null;
                }
            } else {
                console.warn('Formato de fecha no soportado:', x);
                return null;
            }

            // Validar que la fecha sea válida
            if (isNaN(nacimiento.getTime())) {
                console.warn('Fecha inválida:', x);
                return null;
            }

            const hoy = new Date();

            let edad = hoy.getFullYear() - nacimiento.getFullYear();
            const mesDiff = hoy.getMonth() - nacimiento.getMonth();
            const diaDiff = hoy.getDate() - nacimiento.getDate();

            // Si aún no ha pasado el cumpleaños este año, resta 1
            if (mesDiff < 0 || (mesDiff === 0 && diaDiff < 0)) {
                edad--;
            }

            return edad;
        },

        clear() {
            this.idItem = "";
            this.keyActividad = "";
            this.CupsSeleccionado = {};
            this.cantidad = 1; // Reiniciar cantidad
            this.detalle = ""; // Reiniciar detalle
            this.cupsArray = []; // Limpiar el array de cups seleccionados al abrir el modal
        },
        //adiciona los cups al listado que se va guardando
        addCups(cups, cant, detalle) {
            if (cups && Object.keys(cups).length > 0) {
                if (!this.cupsArray.some((cup) => cup.id === cups.id)) {
                    this.cupsArray.push({
                        ...cups,
                        cantidad: cant,
                        detalle: detalle
                    });
                } else {
                    alert("Este elemento ya fue agregado.");
                }
                this.CupsSeleccionado = {};
                this.cantidad = 1; // Reiniciar cantidad
            } else {
                alert("Seleccione una opción válida.");
            }
            this.cantidad = 1; // Reiniciar cantidad
            this.detalle = ""; // Reiniciar detalle 
        },
        //gestiona los parametros de la ruta de almacenamiento
        integrarCup(obj) {
            this.clear();
            this.actividadSeleccionadaNombre = obj.nombre;
            if (this.userData && this.userData.cargo) {
                this.keyActividad = this.userData.cargo;
            } else {
                this.keyActividad = this.userData.cargo;
            }
            this.idItem = obj.id;
        },
        //confirma la seleccion de cups arma paquete para entregar al storage
        async confirmarSeleccion() {
            this.guardando = true;
            let data = {
                key: this.keyActividad,
                cups: this.cupsArray,
                idEncuesta: this.idEncuesta,
                idActividad: this.idItem,
                cargo: this.userData.cargo,
                nombre: this.userData.nombre,
                cantidad: this.cantidad,
                detalle: this.detalle
            };
            try {
                await this.adicionarCups(data);
                this.clear();
                await this.recargar();

            } finally {
                this.guardando = false;
            }
        },

        actividadesConMedico(tipoActividad) {
            if (!tipoActividad || !this.userData || !this.userData.cargo) return [];
            return Object.values(tipoActividad).filter(actividad =>
                actividad.Profesional && actividad.Profesional.includes(this.userData.cargo)
            );
        },
        /* ---------------------------------------------------------------------------- */

        /* --------------------------------------------------------------------- */
        async cupsAsignados(idAct) {
            try {
                const response = await this.selectCupsByActividad({
                    enc: this.idEncuesta,
                    act: idAct,
                });
                console.log(response);
                if (response && response.length > 0) {
                    return response.map((cup) => cup.DescripcionCUP).join(", ");
                } else {
                    return "No hay CUPS asignados";
                }
            } catch (error) {
                console.error("Error al obtener los CUPS asignados:", error);
                return "Error al cargar CUPS";
            }
        },

        eliminarCUP(idEncuesta, idActividad, idCup) {
            if (confirm("¿Estás seguro de que deseas eliminar este CUP?")) {
                /*    console.log("Eliminar cup con id:", idx); */
                this.$store.dispatch("deleteCUPS", {
                    idEncuesta: this.idEncuesta,
                    idActividad: idActividad,
                    idCup: idCup,
                    rol: this.userData.cargo
                }).then(() => {
                    this.recargar();
                }).catch(error => {
                    console.error("Error al eliminar el CUP:", error);
                });
            }
        },

        async recargar() {
            /* this.idEncuesta = this.$route.params.idEncuesta; */
            await this.getEncuestaById(this.idEncuesta);
        },
        cerrarVisita() {

            // Confirmar que el usuario quiere cerrar la visita
            if (confirm("¿Estás seguro de que deseas cerrar las actividades de la visita?")) {
                const cargo = this.userData.cargo;
                // Buscar el registro renderizado

                // Si el usuario es Auxiliar de enfermería o Médico, cerrar directamente
                if (cargo === 'Auxiliar de enfermeria' || cargo === 'Medico') {
                    this.cerrarEncuesta({
                        id: this.idEncuesta,
                        cargo: cargo
                    });
                }
                // Si el usuario es Enfermero, verificar que las actividades de Auxiliar y Médico ya estén cerradas
                else if (cargo === 'Enfermero') {
                    if (this.InfoEncuestasById[0].status_gest_aux === true && this.InfoEncuestasById[0].status_gest_medica === true) {
                        this.cerrarEncuesta({
                            id: this.idEncuesta,
                            cargo: cargo
                        });

                    } else {
                        alert("Deben estar cerradas las actividades por Auxiliar y Médico antes de cerrar la visita...");

                    }
                }
                if (this.userData.cargo === 'Auxiliar de enfermeria') {
                    this.$router.push('/sop_aux');
                } else if (this.userData.cargo === 'Enfermero') {
                    this.$router.push('/sop_enfermero');
                } else if (this.userData.cargo === 'Medico') {
                    this.$router.push('/sop_profesional');
                }
            }
        }
    },
    /*    console.log(this.idEncuesta, this.userData.cargo); */

    watch: {
        '$route.params.idEncuesta'(newId) {
            this.idEncuesta = newId;
            this.recargar();
        }
    },

    /* ----------------------------------------------------------------------------------------------- */
    async mounted() {

        await this.getAllCups();

    },

    /* ----------------------------------------------------------------------------------------------- */
    async created() {
        this.idEncuesta = this.$route.params.idEncuesta;
        await this.getEncuestaById(this.idEncuesta);
    },
};
</script>

<style>
.texto-guardando {
    margin-top: 1rem;
    font-size: 1.2rem;
    color: #333;
}

select {
    width: 200px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.cabecera {
    background-color: #e9e9e9;
    padding: 10px;
    border-radius: 5px;
    margin-bottom: 20px;
    border-radius: 15px;
}

.overlay-guardando {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(255, 255, 255, 0.7);
    z-index: 2000;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.texto-guardando {
    margin-top: 1rem;
    font-size: 1.2rem;
    color: #333;
}
</style>
