<template>
  <!-- {{ InfoEncuestasById }} -->
  <!-- {{ dataencuesta.eps }} -->
  <div v-if="guardando" class="overlay-guardando">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Guardando...</span>
    </div>
    <div class="texto-guardando">Guardando listado, por favor espere...</div>
  </div>

  <div class="container-fluid rounded shadow-sm py-3 mb-3 paciente p-1" v-if="userEncuesta">
    <div class="row align-items-stretch  p-1">
      <div class="col-12 mb-md-0 p-1 text-center">
        <strong>{{ userEncuesta.nombre1 }} {{ userEncuesta.nombre2 }}
          {{ userEncuesta.apellido1 }} {{ userEncuesta.apellido2 }} , {{ this.idEncuesta }}</strong>
      </div>
      <div class="col-6 ">
        <strong>EPS:</strong> {{ userEncuesta.eps }}<br />
        <strong>Régimen:</strong> {{ userEncuesta.regimen }}
      </div>
      <div class="col-6 ">
        <strong>Sexo:</strong> {{ userEncuesta.sexo }}<br />
        <strong>Edad:</strong> {{ edadActual(userEncuesta.fechaNac) }}
      </div>
    </div>
  </div>
  <div v-if="InfoEncuestasById && InfoEncuestasById[0]" class="mb-4" :aria-busy="guardando">
    <div style="max-height: 600px; overflow-y: auto">
      <div class="container-fluid bg-light rounded shadow-sm p-3">
        <h5 class="fw-bold text-success mb-3">
          <i class="bi bi-person-check-fill"></i> Actividades del paciente
        </h5>
        <table class="table">
          <thead>
            <tr>
              <th scope="col">Opc</th>
              <th scope="col">Actividad</th>
              <th scope="col">Cups</th>

            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, key) in InfoEncuestasById[0].tipoActividad" :key="key">
              <td> <button class="btn btn-sm btn-primary btn-sm" v-if="item && puedeMostrarActividad(item.key)"
                  type="button" data-bs-toggle="modal" data-bs-target="#staticBackdrop" @click="integrarCup(item)">
                  <i class="bi bi-plus-circle"></i>
                </button>
              </td>
              <td>{{ obtenerNombreActividadDelContrato(item.key) }}</td>
              <td>
                <div v-if="obtenerCupsArrayPorActividad(item.key).length > 0">
                  <div v-for="(cup, idx) in obtenerCupsArrayPorActividad(item.key)" :key="idx"
                    class="d-flex align-items-center justify-content-between mb-1 p-1 border-bottom">
                    <small>{{ cup.cupsNombre || cup.DescripcionCUP }}</small>
                    <button v-if="puedeEliminarCups(cup)" class="btn btn-danger btn-sm ms-2"
                      @click="eliminarCupsAsignado(cup, item.key)" title="Eliminar CUPS">
                      <i class="bi bi-trash"></i>
                    </button>
                    <span v-else class="badge bg-secondary ms-2" title="Solo el creador puede eliminar">
                      <i class="bi bi-lock"></i>
                    </span>
                  </div>
                </div>
                <span v-else class="text-muted">Sin CUPS</span>
              </td>

            </tr>

          </tbody>
        </table>

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
              Añadir Cup a la actividad
            </h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            Seleccione el CUP que desea asignar a
            <strong>{{ actividadSeleccionadaNombre }}</strong>
            <div class="row">
              <div class="mb-3">
                <br />
                <select v-model="CupsSeleccionadoId" class="form-select" id="cupSelect">
                  <option value="">Seleccione un CUPS</option>
                  <option v-for="cup in cupsDisponibles" :key="cup.id" :value="cup.id">
                    {{ cup.DescripcionCUP }}
                  </option>
                </select>
                <div class="row mt-2">
                  <div class="col-2">
                    Cantidad
                    <input type="number" id="cupCantidad" name="cupCantidad" class="form-control" aria-label="Cantidad"
                      v-model="cantidad" />
                  </div>
                  <div class="col-10">
                    <div class="input-group">
                      <span class="input-group-text">Detalle</span>
                      <textarea id="cupDetalle" name="cupDetalle" class="form-control" aria-label="With textarea"
                        v-model="detalle"></textarea>
                    </div>
                  </div>
                </div>
                <button class="btn btn-warning btn-sm mt-2"
                  @click="addCups(this.CupsSeleccionadoId, this.cantidad, this.detalle)"
                  :disabled="!CupsSeleccionadoId || cantidad < 1 || !detalle.trim()">
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
                  <th scope="col">Detalle Ingresado</th>
                  <th scope="col">Cantidad</th>
                  <th scope="col">Grupo</th>
                  <th scope="col">Opción</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(cup, index) in cupsArray" :key="index">
                  <td>{{ cup.cupsNombre }}</td>
                  <td>{{ cup.detalle }}</td>
                  <td>{{ cup.cantidad }}</td>
                  <td>{{ cup.Grupo }}</td>
                  <td>
                    <button class="btn btn-sm btn-danger" @click="eliminarDelListado(index)">
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-if="cupsArray.length === 0">No hay CUPS seleccionados.</div>
            <div class="modal-footer">
              <button type="button" class="btn btn-danger btn-sm" data-bs-dismiss="modal">
                <i class="bi bi-x-square"></i> Cancelar
              </button>
              <button type="button" class="btn btn-primary btn-sm" @click="confirmarSeleccion(userEncuesta?.id)"
                data-bs-dismiss="modal" v-if="cupsArray.length !== 0">
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
import { mapActions, mapState } from "vuex";
import moment from "moment";

/* ----------------------------------------------------------------------------------------------- */
export default {
  data() {
    return {
      idEncuesta: null,
      CupsSeleccionadoId: "",
      cupsArray: [], // Esta propiedad se usará para almacenar los cups seleccionados
      asignaciones: {}, // Para almacenar las asignaciones cargadas
      keyActividad: "",
      idItem: "",
      cantidad: 1, // Valor por defecto para la cantidad
      detalle: "", // Detalle del cup seleccionado
      guardando: false, // Para mostrar el overlay/spinner
      actividadSeleccionadaNombre: "",

      /*  */
      tipoActividadExtramural: [
        {
          nombre: "Consulta PYMS",
          Profesional: ["Auxiliar de enfermeria", "Enfermero", "Medico"],
          key: "Proc1",
        },
        {
          nombre: "Consulta Morbilidad",
          Profesional: ["Medico"],
          key: "Proc2",
        },
        {
          nombre: "VPS",
          Profesional: ["Enfermero", "Medico"],
          key: "Proc3",
        },
        {
          nombre: "Toma lab PYMS",
          Profesional: ["Enfermero", "Auxiliar de enfermeria"],
          key: "Proc4",
        },
        {
          nombre: "Toma lab Morbilidad",
          Profesional: ["Enfermero", "Auxiliar de enfermeria"],
          key: "Proc5",
        },
        {
          nombre: "Vacunacion",
          Profesional: ["Enfermero", "Auxiliar de enfermeria"],
          key: "Proc6",
        },
        {
          nombre: "Realizacion de tamizajes",
          Profesional: ["Auxiliar de enfermeria", "Enfermero", "Medico"],
          key: "Proc7",
        },
        {
          nombre: "Realizacion Test",
          Profesional: ["Enfermero", "Medico"],
          key: "Proc8",
        },
        {
          nombre: "IEC",
          Profesional: ["Auxiliar de enfermeria", "Enfermero", "Medico"],
          key: "Proc9",
        },
        {
          nombre: "Remision IPS",
          Profesional: ["Auxiliar de enfermeria", "Enfermero", "Medico"],
          key: "Proc10",
        },
        {
          nombre: "Otro",
          Profesional: ["Auxiliar de enfermeria", "Enfermero", "Medico"],
          key: "Proc11",
        },
      ],
    };
  },

  /* ----------------------------------------------------------------------------------------------- */
  computed: {
    ...mapState([
      "InfoEncuestasById",
      "userData",
      "cups",
      "encuestas",
      "contratos",
      "epss",
    ]),

    //logica para obtener los cups filtrados por EPS y profesional
    dataencuesta() {
      return this.InfoEncuestasById.length > 0 ? this.InfoEncuestasById[0] : null;
    },

    userEncuesta() {
      const encuestas = this.encuestas || [];
      return encuestas.find((enc) => String(enc.id) === String(this.idEncuesta)) || null;
    },

    cupsDisponibles() {
      if (!this.cups || !this.userEncuesta || !this.userData || !this.contratos || !this.epss) {
        return [];
      }

      if (!this.idItem) {
        return [];
      }

      const epsDelPaciente = this.userEncuesta.eps;
      const cargoDUsuario = this.userData.cargo;
      const actividadSeleccionada = this.idItem;

      // Buscar la EPS por nombre
      const epsEncontrada = this.epss.find((eps) => eps.eps === epsDelPaciente);
      if (!epsEncontrada) {
        return [];
      }

      // Buscar el contrato por epsId
      const contratoDelPaciente = this.contratos.find(
        (contrato) => contrato.epsId === epsEncontrada.id
      );
      if (!contratoDelPaciente || !contratoDelPaciente.cups) {
        return [];
      }

      // Obtener IDs de CUPS del contrato filtrados por actividad seleccionada
      let cupIdsDelContrato = [];
      if (typeof contratoDelPaciente.cups === 'object') {
        Object.values(contratoDelPaciente.cups).forEach((cupContrato) => {
          // Si actividadId es '0', significa que el CUPS está disponible para todas las actividades
          // Si actividadId coincide con la actividad seleccionada, también incluirlo
          if (cupContrato && (cupContrato.actividadId === '0' || cupContrato.actividadId === actividadSeleccionada)) {
            const cupId = cupContrato.cupsId || cupContrato.id;
            if (cupId) {
              cupIdsDelContrato.push(cupId);
            }
          }
        });
      }

      // Filtrar CUPS por contrato, actividad y profesional
      return this.cups.filter((cup) => {
        if (!cupIdsDelContrato.includes(cup.id)) return false;

        const cupProfesional = (cup.profesional || cup.Profesional || "").toLowerCase().trim();
        const cargoUsuario = (cargoDUsuario || "").toLowerCase().trim();

        return cupProfesional === cargoUsuario;
      });
    },
  },
  /* ----------------------------------------------------------------------------------------------- */
  methods: {
    ...mapActions([
      "getEncuestaById",
      "getAllCups",
      "getAllContratos",
      "getAllEpss",
      "adicionarCups",
      "selectCupsByActividad",
      "cerrarEncuesta",
      "getAsignacionesByEncuesta",
    ]),

    edadActual(x) {
      if (!x) return null; // valida que haya fecha

      let nacimiento;

      // Manejar diferentes tipos de entrada
      if (typeof x === "string" || x instanceof String) {
        nacimiento = new Date(x);
      } else if (x instanceof Date) {
        nacimiento = x;
      } else if (typeof x === "object" && x !== null) {
        // Si es un objeto, intenta extraer una propiedad con la fecha (ajusta según tu estructura)
        if (x.date) {
          nacimiento = new Date(x.date);
        } else {
          console.warn("Formato de fecha no soportado:", x);
          return null;
        }
      } else {
        console.warn("Formato de fecha no soportado:", x);
        return null;
      }

      // Validar que la fecha sea válida
      if (isNaN(nacimiento.getTime())) {
        console.warn("Fecha inválida:", x);
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
      this.keyActividad = "";
      this.CupsSeleccionadoId = "";
      this.cantidad = 1;
      this.detalle = "";
      this.cupsArray = [];
    },
    //elimina un cup del listado por indice
    eliminarDelListado(index) {
      this.cupsArray.splice(index, 1);
    },
    //adiciona los cups al listado que se va guardando
    obtenerIdCup(cup) {
      return cup?.id || cup?.Homolog || cup?.cupsId || "";
    },
    addCups(cupsId, cant, detalle) {
      const cupSeleccionado = this.cupsDisponibles.find(
        (cup) => String(cup.id) === String(cupsId)
      );

      if (cupSeleccionado) {
        const cupId = cupSeleccionado.id;

        const existeEnListado = this.cupsArray.some(
          (cup) => cup.id === cupId
        );

        let existeEnAsignaciones = false;
        if (this.asignaciones && this.asignaciones.cups) {
          const cupsGuardados = Array.isArray(this.asignaciones.cups)
            ? this.asignaciones.cups
            : Object.values(this.asignaciones.cups);

          existeEnAsignaciones = cupsGuardados.some(
            (cup) => cup.id === cupId && cup.actividadId === this.idItem
          );
        }

        if (existeEnListado || existeEnAsignaciones) {
          alert("Este CUPS ya fue agregado a esta actividad.");
        } else {
          this.cupsArray.push({
            ...cupSeleccionado,
            id: cupId,
            cupsId: cupId,
            cupsNombre: cupSeleccionado.DescripcionCUP,
            cantidad: cant,
            detalle: detalle,
          });
        }
        this.CupsSeleccionadoId = "";
        this.cantidad = 1;
      } else {
        alert("Seleccione una opción válida.");
      }
      this.cantidad = 1;
      this.detalle = "";
    },
    //gestiona los parametros de la ruta de almacenamiento
    async integrarCup(obj) {
      // Establecer idItem PRIMERO
      this.idItem = obj.key;
      this.actividadSeleccionadaNombre = this.obtenerNombreActividad(obj.key);

      // Luego limpiar el resto
      this.clear();

      if (this.userData && this.userData.cargo) {
        this.keyActividad = this.userData.cargo;
      } else {
        this.keyActividad = this.userData.cargo;
      }

      await this.cargarCupsGuardados(this.idItem);
    },
    async cargarCupsGuardados(idActividad) {
      try {
        const response = await this.selectCupsByActividad({
          enc: this.idEncuesta,
          act: idActividad,
        });
        this.cupsArray = Array.isArray(response) ? response : [];
      } catch (error) {
        console.error("Error al cargar CUPS guardados:", error);
        this.cupsArray = [];
      }
    },
    async cargarAsignaciones() {
      try {
        const asignacionesData = await this.getAsignacionesByEncuesta(this.idEncuesta);
        this.asignaciones = asignacionesData || {};
      } catch (error) {
        console.error("Error al cargar asignaciones:", error);
        this.asignaciones = {};
      }
    },
    obtenerCupsPorActividad(actividadId) {
      if (!this.asignaciones || !this.asignaciones.cups) {
        return "Sin CUPS";
      }

      const cupsArray = Array.isArray(this.asignaciones.cups)
        ? this.asignaciones.cups
        : Object.values(this.asignaciones.cups);

      const cupsFiltrados = cupsArray.filter(cup => {
        return cup && cup.actividadId === actividadId;
      });

      if (cupsFiltrados.length === 0) {
        return "Sin CUPS";
      }

      return cupsFiltrados
        .map(cup => cup.cupsNombre || cup.DescripcionCUP || "")
        .filter(Boolean)
        .join(", ");
    },
    obtenerCupsArrayPorActividad(actividadId) {
      if (!this.asignaciones || !this.asignaciones.cups) {
        return [];
      }

      const cupsArray = Array.isArray(this.asignaciones.cups)
        ? this.asignaciones.cups
        : Object.values(this.asignaciones.cups);

      return cupsArray.filter(cup => cup && cup.actividadId === actividadId);
    },
    async eliminarCupsAsignado(cup, actividadId) {
      if (!confirm(`¿Estás seguro de eliminar "${cup.cupsNombre || cup.DescripcionCUP}" de esta actividad?`)) {
        return;
      }

      try {
        this.guardando = true;

        const { default: firebase_api } = await import('../api/ApiFirebase.js');

        const cupsActuales = Array.isArray(this.asignaciones.cups)
          ? [...this.asignaciones.cups]
          : Object.values(this.asignaciones.cups);

        const cupId = this.obtenerIdCup(cup);

        const cupsActualizados = cupsActuales.filter(
          c => !(this.obtenerIdCup(c) === cupId && c.actividadId === actividadId)
        );

        const datosActualizados = {
          ...this.asignaciones,
          cups: cupsActualizados,
          key: this.userData.cargo,
          nombreProf: this.userData.nombre,
        };

        await firebase_api.put(`/Asignaciones/${this.idEncuesta}.json`, datosActualizados);

        await this.cargarAsignaciones();
        alert('CUPS eliminado correctamente');
      } catch (error) {
        console.error('Error al eliminar CUPS:', error);
        alert('Error al eliminar el CUPS. Intente nuevamente.');
      } finally {
        this.guardando = false;
      }
    },
    //confirma la seleccion de cups arma paquete para entregar al storage
    async confirmarSeleccion(encuestasId) {
      this.guardando = true;
      const idEncuesta = encuestasId || this.idEncuesta;

      const cupsConActividad = this.cupsArray.map(cup => {
        const cupId = this.obtenerIdCup(cup);
        return {
          ...cup,
          id: cupId,
          cupsId: cupId,
          actividadId: this.idItem,
          key: this.keyActividad,
          nombreProf: this.userData.nombre,
        };
      });

      let data = {
        key: this.keyActividad,
        cups: cupsConActividad,
        idEncuesta: this.idEncuesta,
        nombreProf: this.userData.nombre,
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
      return Object.values(tipoActividad).filter(
        (actividad) =>
          actividad.Profesional && actividad.Profesional.includes(this.userData.cargo)
      );
    },

    actividadExisteEnContrato(actividadId) {
      // Verifica si la actividad existe en el contrato de la EPS del paciente
      if (!this.userEncuesta || !this.contratos || !this.epss) {
        return false;
      }

      const epsDelPaciente = this.userEncuesta.eps;
      const epsEncontrada = this.epss.find((eps) => eps.eps === epsDelPaciente);

      if (!epsEncontrada) {
        return false;
      }

      const contratoDelPaciente = this.contratos.find(
        (contrato) => contrato.epsId === epsEncontrada.id
      );

      if (!contratoDelPaciente || !contratoDelPaciente.cups) {
        return false;
      }

      // Verificar si existe al menos un CUPS con este actividadId en el contrato
      // Si el actividadId es '0', el contrato tiene CUPS disponibles para todas las actividades
      return Object.values(contratoDelPaciente.cups).some(
        (cupContrato) => cupContrato && (cupContrato.actividadId === '0' || cupContrato.actividadId === actividadId)
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
        this.$store
          .dispatch("deleteCUPS", {
            idEncuesta: this.idEncuesta,
            idActividad: idActividad,
            idCup: idCup,
            rol: this.userData.cargo,
          })
          .then(() => {
            this.recargar();
          })
          .catch((error) => {
            console.error("Error al eliminar el CUP:", error);
          });
      }
    },

    obtenerNombreActividad(key) {
      const actividad = this.tipoActividadExtramural.find((act) => act.key === key);
      return actividad ? actividad.nombre : key;
    },

    obtenerNombreActividadDelContrato(actividadId) {
      // Obtiene el nombre de la actividad basado en el actividadId del contrato
      const actividad = this.tipoActividadExtramural.find((act) => act.key === actividadId);
      return actividad ? actividad.nombre : actividadId;
    },

    obtenerProfesionalesActividad(key) {
      const actividad = this.tipoActividadExtramural.find((act) => act.key === key);
      return actividad ? actividad.Profesional : [];
    },

    puedeMostrarActividad(key) {
      const profesionales = this.obtenerProfesionalesActividad(key);
      const cargo = this.userData && this.userData.cargo ? this.userData.cargo : "";
      return Array.isArray(profesionales) && profesionales.includes(cargo);
    },

    puedeEliminarCups(cup) {
      // Verificar si el usuario actual es el creador del CUPS
      if (!this.userData || !cup) return false;

      // Si el CUPS tiene información del creador, verificar que coincida
      // Verificar por cargo (key) del profesional que lo agregó
      if (cup.key && cup.key !== this.userData.cargo) {
        return false;
      }

      // Verificar por nombre del profesional si está disponible
      if (cup.nombreProf && cup.nombreProf !== this.userData.nombre) {
        return false;
      }

      // Si no hay información del creador, permitir eliminar (retrocompatibilidad)
      // O si coincide el cargo y nombre, permitir eliminar
      return true;
    },

    async recargar() {
      /* this.idEncuesta = this.$route.params.idEncuesta; */
      await this.getEncuestaById(this.idEncuesta);
      await this.cargarAsignaciones();
    },
    async cerrarVisita() {
      // Confirmar que el usuario quiere cerrar la visita
      if (confirm("¿Estás seguro de que deseas cerrar las actividades de la visita?")) {
        const cargo = this.userData.cargo;
        // Obtener la ruta anterior del sessionStorage, con valores por defecto según el cargo
        let rutaDestino = sessionStorage.getItem("rutaAnterior");

        if (!rutaDestino) {
          // Si no hay ruta guardada, determinar según el cargo
          if (cargo === "Auxiliar de enfermeria") {
            rutaDestino = "/sop_aux";
          } else if (cargo === "Enfermero") {
            rutaDestino = "/sop_enfermero";
          } else if (cargo === "Medico") {
            rutaDestino = "/sop_profesional";
          }
        }

        try {

          // Si el usuario es Auxiliar de enfermería o Médico, cerrar directamente
          if (cargo === "Auxiliar de enfermeria" || cargo === "Medico") {
            await this.cerrarEncuesta({
              id: this.idEncuesta,
              cargo: cargo,
            });
            // Navegar solo después de que se complete el cierre
            sessionStorage.removeItem("rutaAnterior");
            this.$router.push(rutaDestino);
          }
          // Si el usuario es Enfermero, verificar que las actividades de Auxiliar y Médico ya estén cerradas
          else if (cargo === "Enfermero") {
            if (
              this.InfoEncuestasById[0].status_gest_aux === true &&
              this.InfoEncuestasById[0].status_gest_medica === true
            ) {
              await this.cerrarEncuesta({
                id: this.idEncuesta,
                cargo: cargo,
              });
              // Navegar solo después de que se complete el cierre
              sessionStorage.removeItem("rutaAnterior");
              this.$router.push(rutaDestino);
            } else {
              alert(
                "Deben estar cerradas las actividades por Auxiliar y Médico antes de cerrar la visita..."
              );
            }
          }
        } catch (error) {
          console.error("Error al cerrar la visita:", error);
          alert("Hubo un error al cerrar la visita. Intente nuevamente.");
        }
      }
    },
  },
  /*    console.log(this.idEncuesta, this.userData.cargo); */

  watch: {
    "$route.params.idEncuesta"(newId) {
      this.idEncuesta = newId;
      this.recargar();
    },
    // Watcher para redirigir si no hay datos después de intentar cargar
    userEncuesta(newVal) {
      if (newVal === null && this.idEncuesta && this.InfoEncuestasById.length === 0) {
        // Solo redirigir si pasaron más de 2 segundos y no hay datos cargados
        setTimeout(() => {
          if (this.userEncuesta === null && this.InfoEncuestasById.length === 0) {
            const rutaAnterior = sessionStorage.getItem("rutaAnterior");
            const cargo = this.userData?.cargo;
            let ruta = rutaAnterior;

            if (!ruta) {
              ruta = cargo === "Medico" ? "/sop_profesional" : "/sop_aux";
            }

            sessionStorage.removeItem("rutaAnterior");
            this.$router.push(ruta);
          }
        }, 2000);
      }
    }
  },

  /* ----------------------------------------------------------------------------------------------- */
  async mounted() {
    await Promise.all([
      this.getAllCups(),
      this.getAllContratos(),
      this.getAllEpss()
    ]);
  },

  /* ----------------------------------------------------------------------------------------------- */
  async created() {
    this.idEncuesta = this.$route.params.idEncuesta;

    try {
      const firebase_api = (await import('../api/ApiFirebase.js')).default;
      const { data: allEncuestas } = await firebase_api.get('/Encuesta.json');

      if (allEncuestas) {
        const encuestasArray = Object.keys(allEncuestas).map(key => ({
          ...allEncuestas[key],
          id: key
        }));

        this.$store.commit('setEncuestas', encuestasArray);
      }
    } catch (error) {
      console.error("Error al cargar encuestas:", error);
    }

    await this.getEncuestaById(this.idEncuesta);
    await this.cargarAsignaciones();
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
