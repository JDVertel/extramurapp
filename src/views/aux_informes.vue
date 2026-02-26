<template>
<div class="w-100 px-4 py-3">

    <div class="w-100">
        <h2>Auxiliar Informes</h2>

        <div class="row">
            <div class="col-2" v-if="!activacion">
                <div class="container">
                    <h5>Seleccione el rango de fechas a mostrar</h5>
                    <label for="fechaInicio" class="form-label">Fecha de Inicio</label>
                    <input type="date" id="fechaInicio" class="form-control" v-model="fechaInicio" required />
                    <label for="fechaFin" class="form-label">Fecha de Fin</label>
                    <input type="date" id="fechaFin" class="form-control" v-model="fechaFin" required />
                    <button type="button" class="btn btn-warning mt-4" @click="generarInforme()">
                        Generar Informe
                    </button>
                </div>

            </div>
            <div :class="activacion ? 'col-12' : 'col-10'">
                <div v-if="activacion" class="d-flex justify-content-between align-items-center mb-2">
                    <div>
                        <button class="btn btn-primary" @click="copiarTabla">
                            <i class="bi bi-clipboard"></i> Copiar tabla
                        </button>
                        <button class="btn btn-secondary ms-2" @click="resetInforme">
                            Nuevo informe
                        </button>
                        <span class="ms-3 text-muted">
                            Mostrando {{ registroInicio }} - {{ registroFin }} de {{ totalRegistros }} registros
                        </span>
                    </div>
                    <div class="d-flex align-items-center">
                        <label class="me-2 mb-0">Registros por página:</label>
                        <select v-model.number="itemsPorPagina" class="form-select form-select-sm" style="width: auto;">
                            <option :value="10">10</option>
                            <option :value="25">25</option>
                            <option :value="50">50</option>
                            <option :value="100">100</option>
                            <option :value="totalRegistros">Todos</option>
                        </select>
                    </div>
                </div>

                <div class="table-responsive" v-if="activacion" style="max-height: 60vh; overflow-y: auto;">
                    <table class="table table-bordered table-striped table-sm" style="border-collapse: collapse; width: 100%">
                        <thead>
                            <tr>
                                <th colspan="5" style="background: #d0e6f7">DATOS DE IPS</th>
                                <th colspan="7" style="background: #d0e6f7">DATOS DEL USUARIO</th>
                                <th colspan="11" style="background: #4aed31ff">TIPO ACTIVIDAD REALIZADA</th>
                                <th colspan="6" style="background: #d0e6f7">POBLACIÓN DE RIESGO</th>
                                <th colspan="1" style="background: #d0e6f7">REQUIERE REMISION</th>
                                <th colspan="3" style="background: #d0e6f7">ENCUESTADOR</th>
                            </tr>
                            <tr>
                                <th>DPTO</th>
                                <th>MUNICIPIO</th>
                                <th>NOMBRE</th>
                                <th>CODIGO</th>
                                <th>FECHA</th>
                                <th>NOMBRE DEL USUARIO</th>
                                <th>TIPO ID</th>
                                <th>NUMERO ID</th>
                                <th>DIRECCION DEL USUARIO</th>
                                <th>TELEFONO DE USUARIO</th>
                                <th>BARRIO/VEREDA</th>
                                <th>DESPLAZAMIENTO EFECTIVO (Si/No)</th>
                                <th v-for="col in columnasTipoActividad" :key="col" style="writing-mode: vertical-lr">
                                    {{ col }}
                                </th>
                                <th v-for="col in columnasPoblacionRiesgo" :key="col" style="writing-mode: vertical-lr">
                                    {{ col }}
                                </th>
                                <th style="writing-mode: vertical-lr">
                                    A PROCEDIMIENTOS (Si/No) <br> REQUIERE REMISION
                                </th>
                                <th style="writing-mode: vertical-lr">NOMBRE</th>
                                <th style="writing-mode: vertical-lr">CARGO</th>
                                <th style="writing-mode: vertical-lr">DOCUMENTO</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="usuario in encuestasPaginadas" :key="usuario.id">
                                <td>{{ dataips.dpto }}</td>
                                <td>{{ dataips.municipio }}</td>
                                <td>{{ dataips.nombre }}</td>
                                <td>{{ dataips.codHab }}</td>
                                <td>{{ usuario.fecha }}</td>
                                <td>
                                    {{ usuario.nombre1 }} {{ usuario.nombre2 }} {{ usuario.apellido1 }}
                                    {{ usuario.apellido2 }}
                                </td>
                                <td>{{ usuario.tipodoc }}</td>
                                <td>{{ usuario.numdoc }}</td>
                                <td>{{ usuario.direccion }}</td>
                                <td>{{ usuario.telefono }}</td>
                                <td>{{ usuario.barrioVeredacomuna?.barrio }}</td>
                                <td>{{ usuario.desplazamiento }}</td>
                                <td style="text-align: center">x</td>
                                <td v-for="col in columnasPoblacionRiesgo" :key="col" style="text-align: center">
                                    <span v-if="usuario.poblacionRiesgo && usuario.poblacionRiesgo.includes(col)">X</span>
                                </td>
                                <td style="text-align: center">{{ usuario.requiereRemision }}</td>
                                <td>{{ userData.nombre }}</td>
                                <td>{{ userData.cargo }}</td>
                                <td>{{ userData.numDocumento }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Paginación -->
                <nav v-if="activacion && totalPaginas > 1" aria-label="Paginación" class="mt-3">
                    <ul class="pagination justify-content-center">
                        <li class="page-item" :class="{ disabled: paginaActual === 1 }">
                            <a class="page-link" href="#" @click.prevent="cambiarPagina(1)">
                                <i class="bi bi-chevron-double-left"></i>
                            </a>
                        </li>
                        <li class="page-item" :class="{ disabled: paginaActual === 1 }">
                            <a class="page-link" href="#" @click.prevent="cambiarPagina(paginaActual - 1)">
                                <i class="bi bi-chevron-left"></i>
                            </a>
                        </li>
                        <li v-for="pagina in paginasVisibles" :key="pagina" class="page-item" :class="{ active: pagina === paginaActual }">
                            <a class="page-link" href="#" @click.prevent="cambiarPagina(pagina)">{{ pagina }}</a>
                        </li>
                        <li class="page-item" :class="{ disabled: paginaActual === totalPaginas }">
                            <a class="page-link" href="#" @click.prevent="cambiarPagina(paginaActual + 1)">
                                <i class="bi bi-chevron-right"></i>
                            </a>
                        </li>
                        <li class="page-item" :class="{ disabled: paginaActual === totalPaginas }">
                            <a class="page-link" href="#" @click.prevent="cambiarPagina(totalPaginas)">
                                <i class="bi bi-chevron-double-right"></i>
                            </a>
                        </li>
                    </ul>
                </nav>
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
import firebase_api from "@/api/ApiFirebase";
export default {
    data() {
        return {
            fechaInicio: "",
            fechaFin: "",
            activacion: false,
            actividadesPorEncuesta: {},
            paginaActual: 1,
            itemsPorPagina: 25,
            columnasTipoActividad: [
                "Consulta PYMS",
                "Consulta Morbilidad",
                "VPS",
                "Toma lab PYMS",
                "Toma lab Morbilidad",
                "Vacunacion",
                "Realizacion de tamizajes",
                "Realizacion Test",
                "IEC",
                "Remision IPS",
                "Otro",
            ],
            columnasPoblacionRiesgo: [
                "Gestante",
                "Menor a 5 años",
                "Discapacidad",
                "Adulto mayor",
                "Orientacion sexual diversa",
                "Grupo etnico",
            ],
        };
    },
    methods: {
        ...mapActions(["GetAllRegistersbyRangeAux", "getAllActividadesExtra"]),

        /* metodo para cargar los datos del profesional, y los datos de la ips */
        async generarInforme() {
            let rango = {
                fechaInicio: this.fechaInicio,
                fechaFin: this.fechaFin,
                idempleado: this.userData.numDocumento,
                cargo: this.userData.cargo,
            };
            await this.GetAllRegistersbyRangeAux(rango);
            await this.getAllActividadesExtra();
            await this.cargarActividadesPorEncuesta();
            this.paginaActual = 1;
            this.activacion = true;
        },
        resetInforme() {
            this.fechaInicio = "";
            this.fechaFin = "";
            this.paginaActual = 1;
            this.itemsPorPagina = 25;
            this.actividadesPorEncuesta = {};
            this.activacion = false;
            this.$store.commit("setEncuestasfiltradas", []);
        },
        cambiarPagina(pagina) {
            if (pagina >= 1 && pagina <= this.totalPaginas) {
                this.paginaActual = pagina;
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        },
        copiarTabla() {
            // Selecciona la tabla por referencia
            const tabla = this.$el.querySelector("table");
            if (!tabla) return;
            let texto = '';
            // Encabezados y filas
            const filas = tabla.querySelectorAll('tr');
            filas.forEach(fila => {
                let celdas = Array.from(fila.querySelectorAll('th,td'));
                texto += celdas.map(celda => celda.innerText.replace(/\n/g, ' ')).join('\t') + '\n';
            });
            // Copiar al portapapeles
            if (navigator.clipboard) {
                navigator.clipboard.writeText(texto).then(() => {
                    alert('Tabla copiada al portapapeles');
                });
            } else {
                // Fallback para navegadores antiguos
                const textarea = document.createElement('textarea');
                textarea.value = texto;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                alert('Tabla copiada al portapapeles');
            }
        },
        async cargarActividadesPorEncuesta() {
            const mapa = {};
            const encuestas = this.encuestasFiltradas || [];

            await Promise.all(
                encuestas.map(async (encuesta) => {
                    try {
                        const {
                            data
                        } = await firebase_api.get(`/Actividades/${encuesta.id}/tipoActividad.json`);
                        const actividades = data ? Object.values(data) : [];
                        mapa[encuesta.id] = actividades;
                    } catch (error) {
                        mapa[encuesta.id] = [];
                    }
                })
            );

            this.actividadesPorEncuesta = mapa;
        },
        obtenerNombresTipoActividad(encuesta) {
            const actividades = this.actividadesPorEncuesta[encuesta.id] || [];
            const claves = actividades
                .map((item) => item?.key)
                .filter(Boolean);

            return claves
                .map((key) => this.obtenerNombreActividadExtra(key))
                .filter(Boolean);
        },
        obtenerNombreActividadExtra(key) {
            if (!key || !this.actividadesExtra) return "";
            const encontrada = this.actividadesExtra.find((act) => String(act.id) === String(key));
            return encontrada ? encontrada.nombre : "";
        },
        actividadRealizada(encuesta, nombreColumna) {
            return this.obtenerNombresTipoActividad(encuesta).includes(nombreColumna);
        }

    },
    computed: {
        ...mapState(["encuestasFiltradas", "dataips", "userData", "actividadesExtra"]),

        totalRegistros() {
            return this.encuestasFiltradas?.length || 0;
        },
        totalPaginas() {
            return Math.ceil(this.totalRegistros / this.itemsPorPagina);
        },
        encuestasPaginadas() {
            const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
            const fin = inicio + this.itemsPorPagina;
            return this.encuestasFiltradas?.slice(inicio, fin) || [];
        },
        registroInicio() {
            if (this.totalRegistros === 0) return 0;
            return (this.paginaActual - 1) * this.itemsPorPagina + 1;
        },
        registroFin() {
            const fin = this.paginaActual * this.itemsPorPagina;
            return fin > this.totalRegistros ? this.totalRegistros : fin;
        },
        paginasVisibles() {
            const paginas = [];
            const rango = 2; // Mostrar 2 páginas antes y después de la actual
            let inicio = Math.max(1, this.paginaActual - rango);
            let fin = Math.min(this.totalPaginas, this.paginaActual + rango);

            // Ajustar si estamos cerca del inicio o fin
            if (this.paginaActual <= rango) {
                fin = Math.min(this.totalPaginas, rango * 2 + 1);
            }
            if (this.paginaActual >= this.totalPaginas - rango) {
                inicio = Math.max(1, this.totalPaginas - rango * 2);
            }

            for (let i = inicio; i <= fin; i++) {
                paginas.push(i);
            }
            return paginas;
        }
    },
    watch: {
        itemsPorPagina() {
            this.paginaActual = 1;
        }
    },

};
</script>
