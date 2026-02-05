<template>
<div class="container-fluid mt-2 datos">
    <div v-if="cargandoInforme" class="overlay-spinner">
        <div class="spinner-border text-primary" role="status" style="width: 4rem; height: 4rem;">
            <span class="visually-hidden">Cargando...</span>
        </div>
        <div class="mt-3 h4">Generando informe, por favor espere...</div>
    </div>

    <h1><i class="bi bi-clipboard2-data h1"></i>Informes Administrativos</h1>
    <div v-if="mostrarFormulario" class="row">
        <div class="col-12 col-md-2">
            <label class="form-label">Seleccione el tipo de informe</label>
            <select class="form-select" aria-label="Default select example" v-model="tipoinforme" @change="clearFormInformes()">
                <option selected>Seleccione</option>
                <option value="1">Seguimiento</option>
                <option value="2">General</option>
            </select>
            <br>
            <p v-if="tipoinforme == '2'">*Todas las encuestas registradas entre las fechas seleccionadas independiente del estado</p>

            <p v-if="tipoinforme == '1'">*Todas las encuestas cerradas por la enfermera entre las fechas seleccionadas</p>
        </div>

        <div class="col-6 col-md-2" v-if="tipoinforme == '3'">
            <label class="form-label">Profesional</label>
            <select class="form-select" aria-label="Default select example" v-model="profesionalselect">
                <option selected>Seleccione</option>
                <option :value="profesional.numDocumento" v-for="profesional in profesionales" :key="profesional.id">({{profesional.cargo}}){{ profesional.nombre }}</option>
            </select>
        </div>
        <div class="col-6 col-md-2">
            <label for="fechaInicio" class="form-label">Fecha de Inicio</label>
            <input type="date" id="fechaInicio" class="form-control" v-model="fechaInicio" required />
        </div>
        <div class="col-6 col-md-2">
            <label for="fechaFin" class="form-label">Fecha de Fin</label>
            <input type="date" id="fechaFin" class="form-control" v-model="fechaFin" required />
        </div>
        <div class="col-12 col-md-2 mt-3">
            <button type="button" class="btn btn-warning  mt-3" @click="generarInforme()">
                <i class="bi bi-clipboard2-data h6"></i> Generar Informe
            </button>
        </div>
    </div>

    <br>
    <div>
        <h5>Listado de Pacientes finalizados</h5>

        <button class="btn btn-outline-primary mb-2" @click="copiarHtmlTabla">
            <i class="bi bi-clipboard"></i> Copiar tabla
        </button>
        <div class="container-fluid">
            <div class="table-responsive" ref="tablaHtml">

                <table class="table table-bordered table-striped table-sm align-middle">
                    <thead class="table-light">
                        <tr>
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
                            <th>lab/visit</th>
                            <th>Gest. Aux</th>
                            <th>Gest. Enfermera</th>
                            <th>Gest. Médica</th>
                            <th>Fecha Facturación</th>
                            <th>Remisión</th>
                            <th>Procedimientos y Actividades</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(paciente, idx) in EncuestasAdmin" :key="paciente.id">
                            <!-- Campos principales del paciente -->
                            <td>{{ paciente.grupo }}</td>
                            <td>{{ paciente.nombre1 }} {{ paciente.apellido1 }} {{ paciente.apellido2 }}</td>
                            <td>{{ paciente.sexo }}</td>
                            <td>{{ paciente.tipodoc }}-{{ paciente.numdoc }}</td>
                            <td>{{ paciente.fechaNac }}</td>
                            <td>{{ paciente.eps }}</td>
                            <td>{{ paciente.regimen }}</td>
                            <td>{{ paciente.direccion }}</td>
                            <td>{{ paciente.barrioVeredacomuna?.barrio }}</td>
                            <td>{{ paciente.barrioVeredacomuna?.comuna }}</td>
                            <td>{{ paciente.Agenda_tomademuestras?.cita_tomamuestras ? 'Sí' : 'No' }}/{{ paciente.Agenda_Visitamedica?.cita_visitamedica ? 'Sí' : 'No' }}</td>
                            <td>{{ paciente.status_gest_aux ? paciente.fechagestAuxiliar : 'No' }}</td>
                            <td>{{ paciente.status_gest_enfermera ? paciente.fechagestEnfermera : 'No' }}</td>
                            <td>{{ paciente.status_gest_medica ? paciente.fechagestMedica : 'No' }}</td>
                            <td>{{ formatearFechaLatina(paciente.FechaFacturacion) ? formatearFechaLatina(paciente.FechaFacturacion) : 'No' }}</td>
                            <td>{{ paciente.requiereRemision }}</td>
                            <!-- Renderiza cada resultado de procedimiento como una fila individual -->
                            <template v-for="(actividad, actividadKey) in paciente.tipoActividad" :key="'act-'+actividadKey">
                                <template v-if="actividad.Profesional && Array.isArray(actividad.Profesional) && actividad.Profesional.length">
                                    <template v-for="profesional in actividad.Profesional" :key="'prof-'+profesional">
                                        <template v-if="actividad.cups && actividad.cups[profesional]">
                        <tr v-for="(cup, cupId) in actividad.cups[profesional]?.cups || []" :key="'cup-'+cupId">
                            <!-- Replicar los campos principales del paciente -->
                            <td>{{ paciente.grupo }}</td>
                            <td>{{ paciente.nombre1 }} {{ paciente.apellido1 }} {{ paciente.apellido2 }}</td>
                            <td>{{ paciente.sexo }}</td>
                            <td>{{ paciente.tipodoc }}-{{ paciente.numdoc }}</td>
                            <td>{{ paciente.fechaNac }}</td>
                            <td>{{ paciente.eps }}</td>
                            <td>{{ paciente.regimen }}</td>
                            <td>{{ paciente.direccion }}</td>
                            <td>{{ paciente.barrioVeredacomuna?.barrio }}</td>
                            <td>{{ paciente.barrioVeredacomuna?.comuna }}</td>
                            <td>{{ paciente.Agenda_tomademuestras?.cita_tomamuestras ? 'Sí' : 'No' }}/{{ paciente.Agenda_Visitamedica?.cita_visitamedica ? 'Sí' : 'No' }}</td>
                            <td>{{ paciente.status_gest_aux ? paciente.fechagestAuxiliar : 'No' }}</td>
                            <td>{{ paciente.status_gest_enfermera ? paciente.fechagestEnfermera : 'No' }}</td>
                            <td>{{ paciente.status_gest_medica ? paciente.fechagestMedica : 'No' }}</td>
                            <td>{{ formatearFechaLatina(paciente.FechaFacturacion) ? formatearFechaLatina(paciente.FechaFacturacion) : 'No' }}</td>
                            <td>{{ paciente.requiereRemision }}</td>
                            <!-- Campos de la segunda tabla -->
                            <td>{{ actividad.nombre }}</td>
                            <td>{{ profesional }}</td>
                            <td>{{ actividad.cups[profesional]?.nombre || '-' }}</td>
                            <td>{{ cup && cup.cantidad !== undefined ? cup.cantidad : '-' }}</td>
                            <td>Fact:{{ cup && cup.FactNum !== undefined ? cup.FactNum : '-' }}</td>
                            <td>{{ cup && cup.Homolog !== undefined ? cup.Homolog : '-' }}</td>
                            <td>{{ cup && cup.DescripcionCUP !== undefined ? cup.DescripcionCUP : '-' }}</td>
                            <td>{{ cup && cup.detalle !== undefined ? cup.detalle : '-' }}</td>
                            <td>{{ cup && cup.Grupo !== undefined ? cup.Grupo : '-' }}</td>
                        </tr>
                        </template>
                        <template v-else>
                            <tr>
                                <!-- Replicar los campos principales del paciente -->
                                <td>{{ paciente.grupo }}</td>
                                <td>{{ paciente.nombre1 }} {{ paciente.apellido1 }} {{ paciente.apellido2 }}</td>
                                <td>{{ paciente.sexo }}</td>
                                <td>{{ paciente.tipodoc }}-{{ paciente.numdoc }}</td>
                                <td>{{ paciente.fechaNac }}</td>
                                <td>{{ paciente.eps }}</td>
                                <td>{{ paciente.regimen }}</td>
                                <td>{{ paciente.direccion }}</td>
                                <td>{{ paciente.barrioVeredacomuna?.barrio }}</td>
                                <td>{{ paciente.barrioVeredacomuna?.comuna }}</td>
                                <td>{{ paciente.Agenda_tomademuestras?.cita_tomamuestras ? 'Sí' : 'No' }}/{{ paciente.Agenda_Visitamedica?.cita_visitamedica ? 'Sí' : 'No' }}</td>
                                <td>{{ paciente.status_gest_aux ? paciente.fechagestAuxiliar : 'No' }}</td>
                                <td>{{ paciente.status_gest_enfermera ? paciente.fechagestEnfermera : 'No' }}</td>
                                <td>{{ paciente.status_gest_medica ? paciente.fechagestMedica : 'No' }}</td>
                                <td>{{ formatearFechaLatina(paciente.FechaFacturacion) ? formatearFechaLatina(paciente.FechaFacturacion) : 'No' }}</td>
                                <td>{{ paciente.requiereRemision }}</td>
                                <!-- Campos de la segunda tabla -->
                                <td>{{ actividad.nombre }}</td>
                                <td>{{ profesional }}</td>
                                <td colspan="6">No hay procedimientos asignados.</td>
                            </tr>
                        </template>
                        </template>
                        </template>
                        <template v-else>
                            <tr>
                                <!-- Replicar los campos principales del paciente -->
                                <td>{{ paciente.grupo }}</td>
                                <td>{{ paciente.nombre1 }} {{ paciente.apellido1 }} {{ paciente.apellido2 }}</td>
                                <td>{{ paciente.sexo }}</td>
                                <td>{{ paciente.tipodoc }}-{{ paciente.numdoc }}</td>
                                <td>{{ paciente.fechaNac }}</td>
                                <td>{{ paciente.eps }}</td>
                                <td>{{ paciente.regimen }}</td>
                                <td>{{ paciente.direccion }}</td>
                                <td>{{ paciente.barrioVeredacomuna?.barrio }}</td>
                                <td>{{ paciente.barrioVeredacomuna?.comuna }}</td>
                                <td>{{ paciente.Agenda_tomademuestras?.cita_tomamuestras ? 'Sí' : 'No' }}/{{ paciente.Agenda_Visitamedica?.cita_visitamedica ? 'Sí' : 'No' }}</td>
                                <td>{{ paciente.status_gest_aux ? paciente.fechagestAuxiliar : 'No' }}</td>
                                <td>{{ paciente.status_gest_enfermera ? paciente.fechagestEnfermera : 'No' }}</td>
                                <td>{{ paciente.status_gest_medica ? paciente.fechagestMedica : 'No' }}</td>
                                <td>{{ formatearFechaLatina(paciente.FechaFacturacion) ? formatearFechaLatina(paciente.FechaFacturacion) : 'No' }}</td>
                                <td>{{ paciente.requiereRemision }}</td>
                                <!-- Campos de la segunda tabla -->
                                <td>{{ actividad.nombre }}</td>
                                <td>Sin profesionales registrados</td>
                                <td colspan="6">No hay procedimientos asignados.</td>
                            </tr>
                        </template>
                        </template>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

</div>
</template>

<style>
.table-responsive {
    overflow-x: auto;
    min-width: 100%;
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
</style>

<script>
import {
    mapState,
    mapActions
} from "vuex";
export default {
    data() {
        return {
            fechaInicio: "",
            fechaFin: "",
            tipoinforme: "",
            profesionalselect: "",
            profesionales: [],
            detallesVisibles: [], // Para controlar la visibilidad de detalles por fila
            mostrarFormulario: true,
        };
    },
    methods: {
        copiarHtmlTabla() {
            // Copia el contenido HTML del div .table-responsive al portapapeles
            const tablaDiv = this.$refs.tablaHtml;
            if (tablaDiv) {
                const html = tablaDiv.innerHTML;
                // Usar Clipboard API para copiar como texto/html
                if (navigator.clipboard && window.ClipboardItem) {
                    const blob = new Blob([html], {
                        type: 'text/html'
                    });
                    const item = new window.ClipboardItem({
                        'text/html': blob
                    });
                    navigator.clipboard.write([item]).then(() => {
                        this.$toast && this.$toast.success ? this.$toast.success('Tabla HTML copiada al portapapeles') : alert('Tabla HTML copiada al portapapeles');
                    }).catch(() => {
                        this.$toast && this.$toast.error ? this.$toast.error('No se pudo copiar la tabla HTML') : alert('No se pudo copiar la tabla HTML');
                    });
                } else {
                    // Fallback: copiar como texto plano
                    navigator.clipboard.writeText(html).then(() => {
                        this.$toast && this.$toast.success ? this.$toast.success('Tabla HTML copiada como texto al portapapeles') : alert('Tabla HTML copiada como texto al portapapeles');
                    }).catch(() => {
                        this.$toast && this.$toast.error ? this.$toast.error('No se pudo copiar la tabla') : alert('No se pudo copiar la tabla');
                    });
                }
            }
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
        /*  */
        ...mapActions(["consultarUsuariosFirestore", "GetRegistersbyRangeCerrados", "GetRegistersbyRangeGeneral", "GetAllRegistersbyRangeAndProf"]),

        async generarInforme() {
            this.cargandoInforme = true;
            this.$store.commit('setEncuestasAdmin', []);
            try {
                if (this.fechaInicio && this.fechaFin && this.tipoinforme == "1") {
                    let parametros = {
                        finicial: this.fechaInicio,
                        ffinal: this.fechaFin
                    };
                    await this.GetRegistersbyRangeCerrados(parametros);
                } else if (this.fechaInicio && this.fechaFin && this.tipoinforme == "2") {
                    let parametros = {
                        finicial: this.fechaInicio,
                        ffinal: this.fechaFin
                    };
                    await this.GetRegistersbyRangeGeneral(parametros);
                } else if (this.profesionalselect && this.fechaInicio && this.fechaFin && this.tipoinforme == "3") {
                    let parametros = {
                        idprof: this.profesionalselect,
                        finicial: this.fechaInicio,
                        ffinal: this.fechaFin
                    };
                    await this.GetAllRegistersbyRangeAndProf(parametros);
                } else {
                    this.$toast.error("Debe seleccionar un profesional y un rango de fechas");
                }
            } catch (error) {
                console.error("Error al generar el informe:", error);
            } finally {
                this.cargandoInforme = false;
            }
        },

        clearFormInformes() {
            this.$store.commit('setEncuestasAdmin', [])
            this.fechaInicio = "";
            this.fechaFin = "";
            this.profesionalselect = "";
        },

        toggleDetalles(idx) {
            this.$set(this.detallesVisibles, idx, !this.detallesVisibles[idx]);

        },
    },

    computed: {
        ...mapState(["userData", "EncuestasAdmin"]),

    },
    onload() {
        this.$store.commit('setEncuestasAdmin', []);
        this.detallesVisibles = [];
        this.clearFormInformes();
    },

    mounted() {
        this.consultarUsuariosFirestore().then(profesionales => {
            this.profesionales = profesionales;
        });
        // Inicializar detallesVisibles según la cantidad de pacientes
        this.$watch(
            () => this.EncuestasAdmin,
            (nuevo) => {
                this.detallesVisibles = Array.isArray(nuevo) ? Array(nuevo.length).fill(false) : [];
                // Cierra el spinner cuando los datos realmente se actualizan
                if (this.cargandoInforme && Array.isArray(nuevo) && nuevo.length > 0) {
                    this.cargandoInforme = false;
                }
            }, {
                immediate: true,
                deep: false
            }
        );
    },
};
</script>
