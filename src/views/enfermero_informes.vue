<template>
<div class="container-fluid">

    <h1>Informes Enfermero</h1>

    <hr>

    <h5>Seleccione el rango de fechas a mostrar</h5>
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
            <button type="button" class="btn btn-warning btn-sm mt-4" @click="generarInforme()">
                Generar Informe
            </button>
        </div>
    </div>

    <button class="btn btn-primary btn-sm mb-2" v-if="activacion" @click="copiarTabla">
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
                        <span v-if="usuario.actividadesRealizadas && usuario.actividadesRealizadas.some(act => act.nombre === col)">X</span>
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
export default {
    data() {
        return {
            fechaInicio: "",
            fechaFin: "",
            activacion: false,
            columnasTipoActividad: [
                "Consulta PYMS",
                "Consulta Morbilidad",
                "VPS",
                "Toma lab  PYMS",
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
        ...mapActions(["GetAllRegistersbyRangeEnf"]),

        /* metodo para cargar los datos del profesional, y los datos de la ips */
        generarInforme() {
            let rango = {
                fechaInicio: this.fechaInicio,
                fechaFin: this.fechaFin,
                idempleado: this.userData.numDocumento,
                cargo: this.userData.cargo,
            };
            this.GetAllRegistersbyRangeEnf(rango);
            this.activacion = true;
        },
        obtenerNombresTipoActividad(encuesta) {
            if (!encuesta.tipoActividad) return [];
            return Object.values(encuesta.tipoActividad).map(item => item.nombre);
        }

    },
    computed: {
        ...mapState(["encuestasFiltradas", "dataips", "userData"]),

    },

};
</script>
