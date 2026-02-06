<template>
<div class="container-fluid">
    <h5><i class="bi bi-calendar2-check"></i> Agendamiento de visita</h5>
    <hr>

 
    <span v-if="encuestas && encuestas.length && encuestas[0]">
        <div class="alert alert-success" role="alert">

            Nombre: {{ encuestas[0].nombre1 }}  {{ encuestas[0].nombre2 }}, <br> Apellido: {{ encuestas[0].apellido1 }} {{ encuestas[0].apellido2 }}
            <br>   Profesional: {{ userData?.nombre }}

        </div>
    </span>
    <span v-else class="text-danger">No hay datos de paciente disponibles</span>
    <hr>
    <div class="container mb-4">
        <div class="container-fluid tomademuestras">
            <div class="row" v-if="this.tipo === 'tomamuestras'">
                <div class="col-12 col-md-6">
                    <h5 class="mt-2"><i class="bi bi-prescription2"></i> Toma de laboratorios</h5>
                    <hr />
                    <div class="row mb-4">
                        <div class="col-6">
                            <div>
                                <label for="dateconsulta" class="form-label">Fecha</label>
                                <select id="dateconsulta" name="dateconsulta" class="form-select" aria-label="Default select example" v-model="dateIDAgenda" @change="agendaActualTomaLab(dateIDAgenda)">
                                    <option value="">Disponibles</option>
                                    <option v-for="(fecha, index) in agendas" :value="{ id: fecha.id, fecha: fecha.fecha }" :key="index">
                                        {{ fecha.grupo }} - {{ fecha.fecha }}
                                    </option>
                                </select>
                            </div>
                        </div>

                        <div class="col-6">
                            <label for="horalab" class="form-label">Hora:</label>
                            <select class="form-control" id="horalab" v-model="horalab">
                                <option value="">Disponibles</option>
                                <option v-for="hora in horasValidasLab" :key="hora" :value="hora">
                                    {{ hora }}
                                </option>
                            </select>
                        </div>

                        <button class="btn btn-sm btn-warning mb-3 mt-3" @click="guardarAgendamientoTomaLab" v-if="userData.grupo && dateIDAgenda && horalab !== ''">
                            Guardar Agendamiento
                        </button>
                    </div>
                </div>
                <div class="col-12 col-md-6" v-if="dateIDAgenda !== '' && encuestasFiltradasLabById.length !== 0">
                    <h6 class="mt-2">Agenda del dia Toma de Laboratorio</h6>
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>Id</th>
                                <th>Hora Lab</th>
                                <th>Grupo</th>
                                <th>Opciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-for="(item, index) in encuestasFiltradasLabById" :key="item?.id + '-' + index">
                                <tr v-for="(muestra, i) in (item?.tomademuestras || [])" :key="i">
                                    <td>{{ i }}</td>
                                    <td>{{ muestra?.horalab || '-' }}</td>
                                    <td>{{ muestra?.grupo || '-' }}</td>
                                    <td>
                                        <button class="btn btn-danger btn-sm" @click="eliminarItemAgenda({ indice: i, encuestaID: item.id ,lista:'tomademuestras'})" v-if="
                              userData &&
                              userData.grupo &&
                              muestra?.grupo === userData.grupo
                            ">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <br />
        <div class="container-fluid visitas" v-if="this.tipo === 'visitamedica'">
            <div class="row">
                <div class="col-12 col-md-6">
                    <h5 class="mt-2"><i class="bi bi-people-fill"></i> Visita Medica y Enfermeria</h5>
                    <hr />
                    <div class="row mb-4">
                        <div class="col-6">
                            <div>
                                <label for="datevisita" class="form-label">Fecha</label>
                                <select id="datevisita" name="datevisita" class="form-select" aria-label="Default select example" v-model="dateIDvisita" @change="agendaActualVisita(dateIDvisita)">
                                    <option value="">Disponibles</option>
                                    <option v-for="(fecha, index) in FechasVisitasGrupo" :value="{ id: fecha.id, fecha: fecha.fecha }" :key="index">
                                        {{ fecha.grupo }} - {{ fecha.fecha }}
                                    </option>
                                </select>
                            </div>
                        </div>

                        <div class="col-6">
                            <label for="horaconsulta" class="form-label">Hora</label>
                            <select class="form-control" id="horavisita" v-model="horavisita">
                                <option value="">Disponibles</option>
                                <option v-for="hora in horasValidasVisita" :key="hora" :value="hora">
                                    {{ hora }}
                                </option>
                            </select>
                        </div>
                        <button class="btn btn-sm btn-warning mb-3 mt-3" @click="guardarAgendamientoVisitas" v-if="userData.grupo && dateIDvisita && horavisita !== ''">
                            Guardar Agendamiento
                        </button>
                    </div>
                </div>
                <div class="col-12 col-md-6" v-if="dateIDvisita">
                    <h6 class="mt-2">Agenda del dia Visita medica y enfermeria</h6>
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>Id</th>
                                <th>Hora Visita</th>
                                <th>Grupo</th>
                                <th>Opciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-for="(iten, index) in encuestasFiltradasVisitaById" :key="iten?.id + '-' + index">
                                <tr v-for="(muestras, i) in (iten?.visitamedica || [])" :key="i">
                                    <td>{{ i }}</td>
                                    <td>{{ muestras?.horavisita || '-' }}</td>
                                    <td>{{ muestras?.grupo || '-' }}</td>
                                    <td>
                                        <button class="btn btn-danger btn-sm" @click="eliminarItemAgenda({ indice: i, encuestaID: iten.id ,lista: 'visitamedica'})" v-if="
                              userData &&
                              userData.grupo &&
                              muestras?.grupo === userData.grupo
                            "><i class="bi bi-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    <router-link to="/sop_home">Volver</router-link>
</div>
</template>

<script>
import moment from "moment";
import {
    mapState,
    mapActions
} from "vuex";
export default {
    data: () => {
        return {
            tipo: "",
            dateIDAgenda: "",
            dateIDvisita: "",
            idEncuesta: "",
            fechaActual: "",

            dateIDlab: "",
            horalab: "",
            dateIDvisita: "",
            horavisita: "",
        };
    },
    methods: {
        ...mapActions([
            "getListAgendas",
            "getTomamuestras",
            "guardarAgendaT",
            "guardarAgendaV",
            "getAgendasTomaLabById",
            "getAgendasVisitaById",
            "eliminarAgenda",

        ]),

        generarHorasValidasLab() {
            const horas = [];
            for (let i = 6; i <= 8; i++) {
                for (let j = 0; j < 60; j += 30) {
                    // Incrementos de 30 minutos
                    const hora = `${String(i).padStart(2, "0")}:${String(j).padStart(2, "0")}`;
                    horas.push(hora);
                }
            }
            return horas;
        },

        generarHorasValidasVisita() {
            const horas = [];
            for (let i = 9; i <= 11; i++) {
                for (let j = 0; j < 60; j += 30) {
                    // Incrementos de 30 minutos
                    const hora = `${String(i).padStart(2, "0")}:${String(j).padStart(2, "0")}`;
                    horas.push(hora);
                }
            }
            return horas;
        },
        /* --------------------------------------------------------------------------------------------------------- */
        async guardarAgendamientoTomaLab() {
            if (this.dateIDAgenda === "" || this.horalab === "" || this.userData.grupo === "") {
                alert("Error en los datos, loguearse nuevamente.");
                return;
            }
            let datos = {
                idAgenda: this.dateIDAgenda.id, // id de la fecha que se selecciona
                fechaAgenda: this.dateIDAgenda.fecha, // fecha seleccionada
                idEncuesta: this.idEncuesta,
                horalab: this.horalab, // hora seleccionada
                grupo: this.userData.grupo, // grupo del usuario quien agenda
                paciente: this.encuestas[0].nombre1 + " " + this.encuestas[0].apellido1, // nombre del paciente
                encuestador: this.userData.nombre,
                barrio: this.encuestas[0].barrioVeredacomuna.barrio,
                direccion: this.encuestas[0].direccion,
            };
            await this.guardarAgendaT(datos);
            alert("Agendamiento toma de muestras guardado");
            this.clearformlab();
            await this.$router.push("/sop_aux");
            // Esperar a que el componente destino refresque los datos en mounted
        },
        clearformlab() {
            this.dateIDAgenda = "";
            this.horalab = "";
        },

        async guardarAgendamientoVisitas() {
            if (
                this.dateIDvisita === "" ||
                this.horavisita === "" ||
                this.userData.grupo === ""
            ) {
                alert("Error en los datos, loguearse nuevamente.");
                return;
            }
            let datos = {
                idAgenda: this.dateIDvisita.id, // id de la fecha que se selecciona
                fechaAgenda: this.dateIDvisita.fecha, // id pasado desde la seleccion de la encuesta para vincular los datos
                idEncuesta: this.idEncuesta,
                horavisita: this.horavisita, // hora seleccionada
                grupo: this.userData.grupo,
                paciente: this.encuestas[0].nombre1 + " " + this.encuestas[0].apellido1, // nombre del paciente
                encuestador: this.userData.nombre,
                barrio: this.encuestas[0].barrioVeredacomuna.barrio,
                direccion: this.encuestas[0].direccion,
            };
            await this.guardarAgendaV(datos);
            alert("Agendamiento visita guardado");
            this.clearformvisita();
            await this.$router.push("/sop_aux");
            // Esperar a que el componente destino refresque los datos en mounted
        },
        /* ---------------------------------------------------------------------------------------------------------- */
        clearformvisita() {
            this.dateIDvisita = "";
            this.horavisita = "";
        },
        /* ------------------------------------------------- */
        //consulta las citas  de toma de muestra del dia seleccionado
        agendaActualTomaLab(id) {
            this.getAgendasTomaLabById(id);
        },
        //consulta las citas de visita del dia seleccionado
        //se usa el id de la agenda seleccionada para consultar las citas de visita
        agendaActualVisita(id) {
            this.getAgendasVisitaById(id);
        },

        eliminarItemAgenda(indice, encuestaID, lista) {
            if (indice === "") {
                alert("Error al eliminar, intente nuevamente.");

                return;
            }
            this.eliminarAgenda(indice, encuestaID, lista);
            this.clearformVisita();
            this.clearformlab();
        },
        clearformVisita() {
            this.dateIDvisita = "";
            this.horavisita = "";
        },
    },
    computed: {
        ...mapState([
            "agendas",
            "userData",
            "encuestas",
            "encuestasFiltradasLabById",
            "encuestasFiltradasVisitaById",
        ]),

        FechasVisitasGrupo() {
            return this.agendas.filter((item) => item.grupo == this.userData.grupo);
        },

        getAllAgendasbyDate(datelab) {
            return this.agendas.filter((item) => item.fecha == this.dateConsulta);
        },
        horasValidasLab() {
            return this.generarHorasValidasLab();
        },

        horasValidasVisita() {
            return this.generarHorasValidasVisita();
        },
    },
    mounted() {
        this.idEncuesta = this.$route.params.idEncuesta;
        this.tipo = this.$route.params.tipo;
        console.log(this.tipo);
        console.log(this.idEncuesta);
        this.fechaActual = moment().format("YYYY-MM-DD");
        this.getListAgendas(this.fechaActual);
    },
};
</script>

<style>
.tomademuestras {
    background-color: #A388D2;
    border-radius: 5px;
    color: white;
}

.visitas {
    background-color: #5F24BD;
    border-radius: 5px;
    color: white;
}
</style>
