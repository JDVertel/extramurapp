<template>
    <div class="container-fluid">
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

        <h1>Informes Enfermero</h1>

        <hr>

        <h5>Seleccione el rango de fechas a mostrar</h5>
        <div class="alert mb-2 py-2" :class="limiteDiarioAlcanzado ? 'alert-danger' : 'alert-info'" role="alert">
            <strong>Informes disponibles hoy:</strong> {{ informesRestantes }}/{{ maxInformesDiarios }}
            <div v-if="limiteDiarioAlcanzado" class="mt-1">Ya no puede sacar informes en el dia.</div>
        </div>
        <div class="row">
            <div class="col-6 col-md-4">
                <label for="fechaInicio" class="form-label">Fecha de Inicio</label>
                <input type="date" id="fechaInicio" class="form-control" v-model="fechaInicio" required />
            </div>
            <div class="col-6 col-md-4">
                <label for="fechaFin" class="form-label">Fecha de Fin</label>
                <input type="date" id="fechaFin" class="form-control" v-model="fechaFin" required />
            </div>
            <div class="col-12 col-md-4">
                <button type="button" class="btn btn-warning mt-4" @click="generarInforme()" :disabled="generando || limiteDiarioAlcanzado">
                    <span v-if="!generando">Generar Informe</span>
                    <span v-else><i class="bi bi-hourglass-split"></i> Generando...</span>
                </button>
            </div>
        </div>

        <button class="btn btn-primary mb-2" v-if="activacion" @click="copiarTabla">
            <i class="bi bi-clipboard"></i> Copiar tabla
        </button>
        <br />
        <div class="table-responsive" v-if="activacion" style="max-height: 70vh; overflow-y: auto;">
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
                        <!--  -->
                        <th>NOMBRE DEL USUARIO</th>
                        <th>TIPO ID</th>
                        <th>NUMERO ID</th>
                        <th>DIRECCION DEL USUARIO</th>
                        <th>TELEFONO DE USUARIO</th>
                        <th>BARRIO/VEREDA</th>
                        <th>DESPLAZAMIENTO EFECTIVO (Si/No)</th>
                        <!-- TIPO ACTIVIDAD -->
                        <th v-for="col in columnasTipoActividad" :key="col" style="writing-mode: vertical-lr">
                            {{ col }}
                        </th>
                        <!-- POBLACIÓN DE RIESGO -->
                        <th v-for="col in columnasPoblacionRiesgo" :key="col" style="writing-mode: vertical-lr">
                            {{ col }}
                        </th>
                        <!-- REMISION -->
                        <th style="writing-mode: vertical-lr">
                            REQUIERE REMISION A PROCEDIMIENTOS (Si/No)
                        </th>
                        <th style="writing-mode: vertical-lr">NOMBRE</th>
                        <th style="writing-mode: vertical-lr">CARGO</th>
                        <th style="writing-mode: vertical-lr">DOCUMENTO</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="usuario in encuestasFiltradas" :key="usuario.id">
                        <td>{{ dataips.dpto }}</td>
                        <td>{{ dataips.municipio }}</td>
                        <td>{{ dataips.nombre }}</td>
                        <td>{{ dataips.codHab }}</td>
                        <td>{{ usuario.fecha }}</td>
                        <!-- DATOS DEL USUARIO -->
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
                        <!-- TIPO ACTIVIDAD REALIZADA -->
                        <td v-for="col in columnasTipoActividad" :key="col" style="text-align: center">
                            <span v-if="actividadRealizada(usuario, col)">X</span>
                        </td>
                        <!-- POBLACIÓN DE RIESGO -->
                        <td v-for="col in columnasPoblacionRiesgo" :key="col" style="text-align: center">
                            <span v-if="usuario.poblacionRiesgo && usuario.poblacionRiesgo.includes(col)">X</span>
                        </td>
                        <!-- REMISION -->
                        <td style="text-align: center">{{ usuario.requiereRemision }}</td>
                        <!-- ENCUESTADOR -->
                        <td>{{ userData.nombre }}</td>
                        <td>{{ userData.cargo }}</td>
                        <td>{{ userData.numDocumento }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
import {
    mapState,
    mapActions
} from "vuex";
import firebase_api from "@/api/ApiFirebase";
import { getAssignmentBranch, extractActividadIdsFromAssignmentBranch } from "@/utils/facturadosArchive";
export default {
    data() {
        return {
            fechaInicio: "",
            fechaFin: "",
            idips: 1,
            activacion: false,
            generando: false,
            informesHoy: 0,
            maxInformesDiarios: 1,
            actividadesPorEncuesta: {},
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
        ...mapActions(["GetAllRegistersbyRangeEnf", "getAllActividadesExtra", "getdataips"]),

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

        copiarTabla() {
            // Selecciona la tabla por referencia
            const tabla = this.$el.querySelector("table");
            if (!tabla) return;
            let texto = '';
            // Encabezados
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

        async cargarDatosIps() {
            try {
                await this.getdataips(this.idips);
            } catch (error) {
                console.error("Error cargando datos IPS en informe enfermero:", error);
            }
        },

        /* metodo para cargar los datos del profesional, y los datos de la ips */
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
                await this.cargarDatosIps();
                await this.GetAllRegistersbyRangeEnf(rango);
                await this.getAllActividadesExtra();
                await this.cargarActividadesPorEncuesta();
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
        async cargarActividadesPorEncuesta() {
            const mapa = {};
            const encuestas = this.encuestasFiltradas || [];
            const { data: asignacionesData } = await firebase_api.get('/Asignaciones.json');
            const asignaciones = asignacionesData && typeof asignacionesData === 'object' ? asignacionesData : {};

            encuestas.forEach((encuesta) => {
                const data = getAssignmentBranch(encuesta, asignaciones[encuesta.id]);
                const actividadIds = extractActividadIdsFromAssignmentBranch(data);

                const nombresActividades = Array.from(new Set(actividadIds))
                    .map((idActividad) => this.obtenerNombreActividadExtra(idActividad))
                    .filter(Boolean);

                mapa[encuesta.id] = nombresActividades;
            });

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
        ...mapState(["encuestasFiltradas", "dataips", "userData", "actividadesExtra"]),
        informesRestantes() {
            return Math.max(0, this.maxInformesDiarios - this.informesHoy);
        },
        limiteDiarioAlcanzado() {
            return this.informesRestantes === 0;
        },

    },

    async mounted() {
        await this.cargarDatosIps();
        this.refrescarContadorInformes();
    },

};
</script>
