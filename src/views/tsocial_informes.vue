<template>
    <div class="w-100 px-4 py-3">
        <div v-if="generando" class="spinner-overlay">
            <div class="progress-card shadow">
                <div class="h5 mb-3">Generando informe</div>
                <div class="progress mb-2" role="progressbar" aria-label="Generando informe" aria-valuemin="0" aria-valuemax="100" style="height: 22px;">
                    <div class="progress-bar progress-bar-striped progress-bar-animated progreso-indeterminado">
                        Por favor espere...
                    </div>
                </div>
                <div class="text-muted small">Cargando datos y generando informe. No cierre la página.</div>
            </div>
        </div>

        <h1>Trabajador Social Informes</h1>

        <hr>

        <div class="row">
            <div class="col-2" v-if="!activacion && !generando">
                <div class="container">
                    <h5>Seleccione el rango de fechas a mostrar</h5>
                    <div class="alert mb-2 py-2" :class="limiteDiarioAlcanzado ? 'alert-danger' : 'alert-info'" role="alert">
                        <strong>Informes disponibles hoy:</strong> {{ informesRestantes }}/{{ maxInformesDiarios }}
                        <div v-if="limiteDiarioAlcanzado" class="mt-1">Ya no puede sacar informes en el dia.</div>
                    </div>
                    <label for="fechaInicio" class="form-label">Fecha de Inicio</label>
                    <input type="date" id="fechaInicio" class="form-control" v-model="fechaInicio" required />
                    <label for="fechaFin" class="form-label">Fecha de Fin</label>
                    <input type="date" id="fechaFin" class="form-control" v-model="fechaFin" required />
                    <button type="button" class="btn btn-warning mt-4" @click="generarInforme()" :disabled="generando || limiteDiarioAlcanzado">
                        <span v-if="!generando">Generar Informe</span>
                        <span v-else><i class="bi bi-hourglass-split"></i> Generando...</span>
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
                        <label class="me-2 mb-0">Registros por pagina:</label>
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
                    <table class="table table-bordered table-striped table-sm"
                        style="border-collapse: collapse; width: 100%">
                        <thead>
                            <tr>
                                <th colspan="5" style="background: #d0e6f7">DATOS DE IPS</th>
                                <th colspan="7" style="background: #d0e6f7">DATOS DEL USUARIO</th>
                                <th colspan="11" style="background: #4aed31ff">TIPO ACTIVIDAD REALIZADA</th>
                                <th colspan="6" style="background: #d0e6f7">POBLACION DE RIESGO</th>
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
                                    REQUIERE REMISION A PROCEDIMIENTOS (Si/No)
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
                                <td v-for="col in columnasTipoActividad" :key="col" style="text-align: center">
                                    <span v-if="actividadRealizada(usuario, col)">X</span>
                                </td>
                                <td v-for="col in columnasPoblacionRiesgo" :key="col" style="text-align: center">
                                    <span
                                        v-if="usuario.poblacionRiesgo && usuario.poblacionRiesgo.includes(col)">X</span>
                                </td>
                                <td style="text-align: center">{{ usuario.requiereRemision }}</td>
                                <td>{{ userData.nombre }}</td>
                                <td>{{ userData.cargo }}</td>
                                <td>{{ userData.numDocumento }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <nav v-if="activacion && totalPaginas > 1" aria-label="Paginacion" class="mt-3">
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
                        <li v-for="pagina in paginasVisibles" :key="pagina" class="page-item"
                            :class="{ active: pagina === paginaActual }">
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
            generando: false,
            informesHoy: 0,
            maxInformesDiarios: 1,
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
                "Menor a 5 anos",
                "Discapacidad",
                "Adulto mayor",
                "Orientacion sexual diversa",
                "Grupo etnico",
            ],
        };
    },
    methods: {
        copiarTabla() {
            const tabla = this.$el.querySelector("table");
            if (!tabla) return;
            let texto = '';
            const filas = tabla.querySelectorAll('tr');
            filas.forEach(fila => {
                let celdas = Array.from(fila.querySelectorAll('th,td'));
                texto += celdas.map(celda => celda.innerText.replace(/\n/g, ' ')).join('\t') + '\n';
            });
            if (navigator.clipboard) {
                navigator.clipboard.writeText(texto).then(() => {
                    alert('Tabla copiada al portapapeles');
                });
            } else {
                const textarea = document.createElement('textarea');
                textarea.value = texto;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                alert('Tabla copiada al portapapeles');
            }
        },
        ...mapActions(["GetAllRegistersbyRangeTsoc", "getAllActividadesExtra"]),

        refrescarContadorInformes() {
            const { generaHoy } = this.verificarLimiteInformes();
            this.informesHoy = generaHoy;
        },

        obtenerClaveGenerador() {
            return `informes_generados_${this.userData.numDocumento}`;
        },

        obtenerDiaActual() {
            return new Date().toISOString().split('T')[0];
        },

        verificarLimiteInformes() {
            const clave = this.obtenerClaveGenerador();
            const diaActual = this.obtenerDiaActual();
            
            const datos = localStorage.getItem(clave);
            let genera = { fecha: diaActual, contador: 0 };

            if (datos) {
                genera = JSON.parse(datos);
                // Si es otro día, reiniciar contador
                if (genera.fecha !== diaActual) {
                    genera = { fecha: diaActual, contador: 0 };
                }
            }

            return { generaHoy: genera.contador, limiteAlcanzado: genera.contador >= this.maxInformesDiarios };
        },

        guardarGeneracionInforme() {
            const clave = this.obtenerClaveGenerador();
            const diaActual = this.obtenerDiaActual();
            
            const datos = localStorage.getItem(clave);
            let genera = { fecha: diaActual, contador: 1 };

            if (datos) {
                genera = JSON.parse(datos);
                if (genera.fecha === diaActual) {
                    genera.contador += 1;
                } else {
                    genera = { fecha: diaActual, contador: 1 };
                }
            }

            localStorage.setItem(clave, JSON.stringify(genera));
        },

        async generarInforme() {
            this.refrescarContadorInformes();
            const { limiteAlcanzado } = this.verificarLimiteInformes();
            if (limiteAlcanzado) {
                alert(`⚠️ Límite de informes alcanzado\n\nSolo puede generar ${this.maxInformesDiarios} informe por día. Ya ha generado ${this.maxInformesDiarios} informe hoy.`);
                return;
            }

            try {
                this.generando = true;
                let rango = {
                    fechaInicio: this.fechaInicio,
                    fechaFin: this.fechaFin,
                    idempleado: this.userData.numDocumento,
                    cargo: this.userData.cargo,
                };
                await this.GetAllRegistersbyRangeTsoc(rango);
                await this.getAllActividadesExtra();
                await this.cargarActividadesPorEncuesta();
                this.paginaActual = 1;
                this.activacion = true;
                // Guardar generación del informe
                this.guardarGeneracionInforme();
                this.refrescarContadorInformes();
                const { generaHoy: nuevoContador } = this.verificarLimiteInformes();
                alert(`✅ Informe generado exitosamente\n\nInformes generados hoy: ${nuevoContador}/${this.maxInformesDiarios}`);
            } catch (error) {
                console.error('Error generando informe:', error);
                alert('Error al generar el informe: ' + (error.message || 'Error desconocido'));
            } finally {
                this.generando = false;
            }
        },
        resetInforme() {
            this.fechaInicio = "";
            this.fechaFin = "";
            this.paginaActual = 1;
            this.itemsPorPagina = 25;
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
        async cargarActividadesPorEncuesta() {
            const mapa = {};
            const encuestas = this.encuestasFiltradas || [];

            await Promise.all(
                encuestas.map(async (encuesta) => {
                    try {
                        const { data } = await firebase_api.get(`/Asignaciones/${encuesta.id}.json`);
                        const cups = data?.cups && typeof data.cups === "object"
                            ? Object.values(data.cups).filter(Boolean)
                            : [];

                        const actividadIds = cups
                            .map((cup) => cup?.actividadId ?? cup?.idActividad)
                            .filter(Boolean);

                        const nombresActividades = Array.from(new Set(actividadIds))
                            .map((idActividad) => this.obtenerNombreActividadExtra(idActividad))
                            .filter(Boolean);

                        mapa[encuesta.id] = nombresActividades;
                    } catch (error) {
                        mapa[encuesta.id] = [];
                    }
                })
            );

            this.actividadesPorEncuesta = mapa;
        },
        obtenerNombresTipoActividad(encuesta) {
            return this.actividadesPorEncuesta[encuesta.id] || [];
        },
        obtenerNombreActividadExtra(key) {
            if (!key || !this.actividadesExtra) return "";
            const encontrada = this.actividadesExtra.find(
                (act) => String(act.key) === String(key) || String(act.id) === String(key)
            );
            return encontrada ? encontrada.nombre : "";
        },
        normalizarTexto(texto) {
            return String(texto || "")
                .trim()
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "");
        },
        actividadRealizada(encuesta, nombreColumna) {
            const objetivo = this.normalizarTexto(nombreColumna);
            return this.obtenerNombresTipoActividad(encuesta)
                .map((nombre) => this.normalizarTexto(nombre))
                .includes(objetivo);
        }
    },
    computed: {
        ...mapState(["encuestasFiltradas", "dataips", "userData", "uid", "actividadesExtra"]),
        informesRestantes() {
            return Math.max(0, this.maxInformesDiarios - this.informesHoy);
        },
        limiteDiarioAlcanzado() {
            return this.informesRestantes === 0;
        },
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
            const rango = 2;
            let inicio = Math.max(1, this.paginaActual - rango);
            let fin = Math.min(this.totalPaginas, this.paginaActual + rango);

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
    mounted() {
        this.refrescarContadorInformes();
    }
};
</script>
