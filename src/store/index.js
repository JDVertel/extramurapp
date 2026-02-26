// ============================================================================
// STORE VUEX - EXTRAMURAPP
// ============================================================================

// ============================================================================
// IMPORTS
// ============================================================================
import firebase_api from "@/api/ApiFirebase.js";
import persistedState from "./persistedstate";
import { createStore } from "vuex";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import router from "../router/index.js";
import moment from "moment";

const db = getFirestore();
const auth = getAuth();

// ============================================================================
// UTILIDADES
// ============================================================================
function generarId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// ============================================================================
// STORE CONFIGURATION
// ============================================================================
export default createStore({
  // ========================================================================
  // STATE
  // ========================================================================
  state: {
    // Autenticación y usuario
    token: localStorage.getItem("token") || null,
    uid: localStorage.getItem("uid") || null,
    userData: (() => {
      try {
        const data = localStorage.getItem("userData");
        return data ? JSON.parse(data) : {};
      } catch (e) {
        return {};
      }
    })(),
    user: null,
    accessToken: null,

    // Encuestas
    encuestas: [],
    encuestasFiltradas: [],
    encuestasFiltradasLabById: [],
    encuestasFiltradasVisitaById: [],
    encuestasToday: [],
    InfoEncuestasById: [],
    cantEncuestas: "",
    EncuestasProf: [],
    EncuestasFact: [],
    EncuestasFactAprov: [],

    // Usuarios y personal
    usuarios: [],
    medicosByGrupo: [],
    enfermerosByGrupo: [],
    psicologosByGrupo: [],
    tsocialesByGrupo: [],

    // Parámetros
    comunasBarrios: [],
    epss: [],
    dataips: [],

    // Agendas
    agendas: [],

    // CUPS y actividades
    cups: [],
    cupsbyActividad: {},
    actividades: [],
    actividadesExtra: [],
    contratos: [],

    // Datos de paciente
    datosPaciente: [],
  },
  // plugins: [persistedState],

  // ========================================================================
  // ACTIONS
  // ========================================================================
  actions: {
    // ====================================================================
    // ENCUESTAS - CREACIÓN Y REGISTRO
    // ====================================================================

    /**
     * Crea un nuevo registro de encuesta con actividades
     */
    createNewRegister: async ({ commit }, entradasE) => {
      try {
        const {
          bd,
          tiporegistro,
          idMedicoAtiende,
          idEnfermeroAtiende,
          idPsicologoAtiende,
          idTsocialAtiende,
          fechavisita,
          status_gest_aux,
          status_gest_medica,
          status_gest_enfermera,
          status_gest_psicologo,
          status_gest_tsocial,
          status_caracterizacion,
          status_visita,
          idEncuesta,
          grupo,
          idEncuestador,
          convenio,
          eps,
          regimen,
          fecha,
          nombre1,
          nombre2,
          apellido1,
          apellido2,
          tipodoc,
          numdoc,
          sexo,
          fechaNac,
          direccion,
          telefono,
          barrioVeredacomuna,
          desplazamiento,
          poblacionRiesgo,
          requiereRemision,
          tipoActividad,
        } = entradasE;

        const DataToSaveE = {
          tiporegistro,
          idMedicoAtiende,
          idEnfermeroAtiende,
          idPsicologoAtiende,
          idTsocialAtiende,
          fechavisita,
          status_gest_aux,
          status_gest_medica,
          status_gest_enfermera,
          status_gest_psicologo,
          status_gest_tsocial,
          status_caracterizacion,
          status_visita,
          idEncuesta,
          grupo,
          idEncuestador,
          convenio,
          eps,
          regimen,
          fecha,
          nombre1,
          nombre2,
          apellido1,
          apellido2,
          tipodoc,
          numdoc,
          sexo,
          fechaNac,
          direccion,
          telefono,
          barrioVeredacomuna,
          desplazamiento,
          poblacionRiesgo,
          requiereRemision,
        };

        // 1. Guardar registro principal
        const { data } = await firebase_api.post(`/${bd}.json`, DataToSaveE);
        const mainId = data.name;

        // 2. Guardar actividades
        for (const actividad of tipoActividad) {
          await firebase_api.post(`/Actividades/${mainId}/tipoActividad.json`, {
            key: actividad.key,
          });
        }

        return { mainId };
      } catch (error) {
        console.error("Error en Action_createNewRegister:", error);
        throw error;
      }
    },

    /**
     * Elimina un paciente/encuesta por ID
     */
    deletePaciente: async ({ commit }, id) => {
      try {
        if (!id) throw new Error("ID inválido para eliminar");
        const { data } = await firebase_api.delete(`/Encuesta/${id}.json`);
        return data;
      } catch (error) {
        console.error("Error en Action deletePaciente:", error);
        throw error;
      }
    },

    /**
     * Elimina un registro de encuesta
     */
    removeRegEnc: async ({ commit }, id) => {
      try {
        const { data } = await firebase_api.delete(`/Encuesta/${id}.json`);
        return data;
      } catch (error) {
        console.error("Error en Action_removeRegEnc:", error);
        throw error;
      }
    },

    /**
     * Cierra una encuesta según el cargo del profesional
     */
    cerrarEncuesta: async ({ commit }, { id, cargo, fecha = Date.now() }) => {
      let varStatus = "";
      let dateStatus = "";
      let cargoTexto = "";

      if (cargo === "Enfermero") {
        varStatus = "status_gest_enfermera";
        dateStatus = "fechagestEnfermera";
        cargoTexto = "enfermera";
      } else if (cargo === "Medico") {
        varStatus = "status_gest_medica";
        dateStatus = "fechagestMedica";
        cargoTexto = "médico";
      } else if (cargo === "Psicologo") {
        varStatus = "status_gest_psicologo";
        dateStatus = "fechagestPsicologo";
        cargoTexto = "psicologo";
      } else if (cargo === "Tsocial") {
        varStatus = "status_gest_tsocial";
        dateStatus = "fechagestTsocial";
        cargoTexto = "trabajador social";
      } else {
        varStatus = "status_gest_aux";
        dateStatus = "fechagestAuxiliar";
        cargoTexto = "auxiliar";
      }

      alert(`La visita ha sido cerrada exitosamente por ${cargoTexto}.`);

      try {
        const { data } = await firebase_api.patch(`/Encuesta/${id}.json`, {
          [varStatus]: true,
          [dateStatus]: moment(fecha).format("YYYY-MM-DD HH:mm:ss"),
        });
        return data;
      } catch (error) {
        console.error("Error al cerrar encuesta:", error);
        throw error;
      }
    },

    // ====================================================================
    // ENCUESTAS - CONSULTAS Y FILTROS
    // ====================================================================

    /**
     * Obtiene todos los registros de un usuario específico
     */
    getAllRegisters: async ({ commit }, idUsuario) => {
      try {
        const { data } = await firebase_api.get("/Encuesta.json");
        const encuestas = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));

        const encuestasFiltradas = encuestas.filter(
          (encuesta) => encuesta.idUsuario === idUsuario
        );

        commit("setEncuestas", encuestasFiltradas);
        return encuestasFiltradas;
      } catch (error) {
        console.error("Error en Action_getAllRegisters:", error);
        throw error;
      }
    },

    /**
     * Obtiene registros por fecha y estado para auxiliar
     */
    getAllRegistersByFechaStatus: async ({ commit }, { idUsuario }) => {
      console.log("parametro de consulta abiertas aux", idUsuario);
      try {
        const { data } = await firebase_api.get("/Encuesta.json");

        if (!data) {
          commit("setEncuestas", []);
          commit("setcantEncuestas", 0);
          alert("No hay datos para mostrar.");
          return [];
        }

        const encuestas = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));

        const encuestasFiltradas = encuestas.filter(
          (encuesta) =>
            encuesta.idEncuestador === idUsuario &&
            encuesta.status_gest_aux === false &&
            encuesta.status_visita === false
        );

        const cantidad = encuestasFiltradas.length;
        commit("setEncuestas", encuestasFiltradas);
        commit("setcantEncuestas", cantidad);

        if (cantidad === 0) {
          alert("No hay datos para mostrar.");
        }

        return encuestasFiltradas;
      } catch (error) {
        console.error("Error en getAllRegistersByFechaStatus:", error);
        throw error;
      }
    },

    /**
     * Obtiene registros pendientes para psicologo
     */
    getEncuestasPendientesPsicologo: async ({ commit }, { idUsuario }) => {
      console.log("Obteniendo encuestas pendientes para psicologo:", idUsuario);
      try {
        const { data } = await firebase_api.get("/Encuesta.json");

        if (!data) {
          commit("setEncuestas", []);
          commit("setcantEncuestas", 0);
          return [];
        }

        const encuestas = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));

        const encuestasFiltradas = encuestas.filter(
          (encuesta) =>
            encuesta.idPsicologoAtiende === idUsuario &&
            encuesta.status_gest_psicologo !== true
        );

        commit("setEncuestas", encuestasFiltradas);
        commit("setcantEncuestas", encuestasFiltradas.length);

        return encuestasFiltradas;
      } catch (error) {
        console.error("Error en getEncuestasPendientesPsicologo:", error);
        throw error;
      }
    },

    /**
     * Obtiene registros pendientes para trabajador social
     */
    getEncuestasPendientesTsocial: async ({ commit }, { idUsuario }) => {
      console.log("Obteniendo encuestas pendientes para trabajador social:", idUsuario);
      try {
        const { data } = await firebase_api.get("/Encuesta.json");

        if (!data) {
          commit("setEncuestas", []);
          commit("setcantEncuestas", 0);
          return [];
        }

        const encuestas = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));

        const encuestasFiltradas = encuestas.filter(
          (encuesta) =>
            encuesta.idTsocialAtiende === idUsuario &&
            encuesta.status_gest_tsocial !== true
        );

        commit("setEncuestas", encuestasFiltradas);
        commit("setcantEncuestas", encuestasFiltradas.length);

        return encuestasFiltradas;
      } catch (error) {
        console.error("Error en getEncuestasPendientesTsocial:", error);
        throw error;
      }
    },

    /**
     * Obtiene encuestas con status_gest_aux = true y sus actividades asociadas
     */
    getEncuestasConActividadesAux: async ({ commit }, { idUsuario }) => {
      console.log("Obteniendo encuestas con actividades para auxiliar:", idUsuario);
      try {
        // Obtener todas las encuestas
        const { data: encuestasData } = await firebase_api.get("/Encuesta.json");

        if (!encuestasData) {
          return [];
        }

        // Filtrar encuestas con status_gest_aux = true para este auxiliar
        const encuestas = Object.entries(encuestasData)
          .map(([key, value]) => ({
            id: key,
            ...value,
          }))
          .filter(
            (encuesta) =>
              encuesta.idEncuestador === idUsuario &&
              encuesta.status_gest_aux === true
          );

        // Para cada encuesta, obtener sus actividades
        const encuestasConActividades = await Promise.all(
          encuestas.map(async (encuesta) => {
            try {
              const { data: actividadesData } = await firebase_api.get(
                `/Actividades/${encuesta.id}.json`
              );
              return {
                ...encuesta,
                actividades: actividadesData || {},
              };
            } catch (error) {
              console.warn(`No se encontraron actividades para encuesta ${encuesta.id}`);
              return {
                ...encuesta,
                actividades: {},
              };
            }
          })
        );

        return encuestasConActividades;
      } catch (error) {
        console.error("Error en getEncuestasConActividadesAux:", error);
        throw error;
      }
    },

    /**
     * Obtiene encuestas para medico y sus actividades asociadas
     */
    getEncuestasConActividadesMedico: async ({ commit }, { idUsuario }) => {
      console.log("Obteniendo encuestas con actividades para médico:", idUsuario);
      try {
        // Obtener todas las encuestas
        const { data: encuestasData } = await firebase_api.get("/Encuesta.json");

        if (!encuestasData) {
          return [];
        }

        // Filtrar encuestas con status_gest_medica = false para este medico
        const encuestas = Object.entries(encuestasData)
          .map(([key, value]) => ({
            id: key,
            ...value,
          }))
          .filter(
            (encuesta) =>
              encuesta.idMedicoAtiende === idUsuario &&
              encuesta.status_gest_medica === false
          );

        // Para cada encuesta, obtener sus actividades
        const encuestasConActividades = await Promise.all(
          encuestas.map(async (encuesta) => {
            try {
              const { data: actividadesData } = await firebase_api.get(
                `/Actividades/${encuesta.id}.json`
              );
              return {
                ...encuesta,
                actividades: actividadesData || {},
              };
            } catch (error) {
              console.warn(`No se encontraron actividades para encuesta ${encuesta.id}`);
              return {
                ...encuesta,
                actividades: {},
              };
            }
          })
        );

        return encuestasConActividades;
      } catch (error) {
        console.error("Error en getEncuestasConActividadesMedico:", error);
        throw error;
      }
    },

    /**
     * Obtiene registros por profesional y fecha
     */
    getAllRegistersByFechaProf: async ({ commit }, { doc, fecha }) => {
      console.log("grupo consultado", doc, fecha);
      try {
        const { data } = await firebase_api.get("/Encuesta.json");
        const encuestas = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));

        const encuestasFiltradas = encuestas.filter(
          (encuesta) =>
            encuesta.status_visita === true &&
            encuesta.idProfesionalAtiende == doc &&
            encuesta.fechavisita === fecha
        );

        commit("setEncuestasToday", encuestasFiltradas);
        return encuestasFiltradas;
      } catch (error) {
        console.error("Error en getAllRegistersByFechaProf", error);
        throw error;
      }
    },

    /**
     * Obtiene registros por ID de usuario profesional (médico)
     */
    getAllRegistersByIduserProf: async ({ commit }, { idUsuario }) => {
      console.log("datos que entran medico", idUsuario);
      try {
        const { data } = await firebase_api.get("/Encuesta.json");
        if (!data) {
          commit("setcantEncuestas", 0);
          return 0;
        }

        const encuestas = Object.entries(data)
          .filter(
            ([_, value]) =>
              value.idMedicoAtiende === idUsuario && value.status_gest_medica === false
          )
          .map(([key, value]) => ({
            id: key,
            ...value,
          }));

        const encuestasFiltradas = encuestas.filter(
          (encuesta) =>
            encuesta.idMedicoAtiende === idUsuario &&
            encuesta.status_gest_medica === false &&
            encuesta.status_gest_aux === true
        );

        console.log(encuestasFiltradas);
        const cantidad = encuestasFiltradas.length;
        commit("setEncuestas", encuestasFiltradas);
        commit("setcantEncuestas", cantidad);

        return cantidad;
      } catch (error) {
        console.error("Error en getAllRegistersByIduserProf:", error);
        throw error;
      }
    },

    /**
     * Obtiene registros por ID de usuario enfermero
     */
    getAllRegistersByIduserEnfer: async ({ commit }, { idUsuario, convenio }) => {
      console.log("datos que entran enfermero", idUsuario, convenio);
      try {
        const { data } = await firebase_api.get("/Encuesta.json");
        if (!data) {
          commit("setcantEncuestas", 0);
          return 0;
        }

        const convenioNormalizado = String(convenio ?? "").trim();

        const encuestas = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));

        const encuestasFiltradas = encuestas.filter((encuesta) => {
          if (encuesta.idEnfermeroAtiende !== idUsuario) return false;
          if (encuesta.status_gest_enfermera !== false) return false;

          if (convenioNormalizado) {
            return String(encuesta.convenio ?? "").trim() === convenioNormalizado;
          }

          return true;
        });

        console.log(encuestasFiltradas);
        const cantidad = encuestasFiltradas.length;
        commit("setEncuestas", encuestasFiltradas);
        commit("setcantEncuestas", cantidad);

        return cantidad;
      } catch (error) {
        console.error("Error en getAllRegistersByIduserProf:", error);
        throw error;
      }
    },

    /**
     * Obtiene registros por rango de fechas - Auxiliar
     */
    GetAllRegistersbyRangeAux: async ({ commit }, rango) => {
      const { fechaInicio, fechaFin, idempleado, cargo } = rango;
      console.log("data que entra", fechaFin, fechaInicio, idempleado, cargo);
      try {
        if (!fechaInicio || !fechaFin) {
          throw new Error("Debes proporcionar ambas fechas para el filtro.");
        }

        const { data } = await firebase_api.get("/Encuesta.json");
        if (!data) {
          commit("setEncuestasfiltradas", []);
          return [];
        }

        const encuestas = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));

        const encuestasFiltradas = encuestas.filter((encuesta) => {
          const fecha = encuesta.fecha;
          if (!fecha) return false;

          if (!(fecha >= fechaInicio && fecha <= fechaFin)) return false;

          if (idempleado && encuesta.idEncuestador !== idempleado) return false;

          return true;
        });

        commit("setEncuestasfiltradas", encuestasFiltradas);
        return encuestasFiltradas;
      } catch (error) {
        console.error("Error en GetAllRegistersbyRangeAux:", error);
        throw error;
      }
    },

    /**
     * Obtiene registros por rango de fechas - Médico
     */
    GetAllRegistersbyRangeMed: async ({ commit }, rango) => {
      const { fechaInicio, fechaFin, idempleado, cargo } = rango;
      try {
        if (!fechaInicio || !fechaFin) {
          throw new Error("Debes proporcionar ambas fechas para el filtro.");
        }

        const { data } = await firebase_api.get("/Encuesta.json");
        if (!data) {
          commit("setEncuestasfiltradas", []);
          return [];
        }

        const encuestas = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));

        const encuestasFiltradas = encuestas.filter((encuesta) => {
          const fecha = encuesta.fecha;
          if (!fecha) return false;

          if (!(fecha >= fechaInicio && fecha <= fechaFin)) return false;

          if (idempleado && encuesta.idMedicoAtiende !== idempleado) return false;
          if (cargo && encuesta.status_gest_medica !== true) return false;
          if (cargo && encuesta.status_gest_enfermera !== true) return false;

          if (encuesta.tipoActividad && typeof encuesta.tipoActividad === "object") {
            encuesta.actividadesRealizadas = Object.values(encuesta.tipoActividad).filter(
              (act) => {
                return act.Profesional && act.Profesional.includes(cargo);
              }
            );
          } else {
            encuesta.actividadesRealizadas = [];
          }

          return true;
        });

        commit("setEncuestasfiltradas", encuestasFiltradas);
        return encuestasFiltradas;
      } catch (error) {
        console.error("Error en GetAllRegistersbyRangeMed:", error);
        throw error;
      }
    },

    /**
     * Obtiene registros por rango de fechas - Enfermero
     */
    GetAllRegistersbyRangeEnf: async ({ commit }, rango) => {
      const { fechaInicio, fechaFin, idempleado, cargo } = rango;
      console.log("data que entra", fechaFin, fechaInicio, idempleado, cargo);
      try {
        if (!fechaInicio || !fechaFin) {
          throw new Error("Debes proporcionar ambas fechas para el filtro.");
        }

        const { data } = await firebase_api.get("/Encuesta.json");
        if (!data) {
          commit("setEncuestasfiltradas", []);
          return [];
        }

        const encuestas = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));

        const encuestasFiltradas = encuestas.filter((encuesta) => {
          const fecha = encuesta.fechagestEnfermera;
          if (!fecha) return false;

          if (!(fecha >= fechaInicio && fecha <= fechaFin)) return false;

          if (idempleado && encuesta.idEnfermeroAtiende !== idempleado) return false;

          if (cargo && encuesta.status_gest_medica !== true) return false;
          if (cargo && encuesta.status_gest_aux !== true) return false;
          if (cargo && encuesta.status_gest_enfermera !== true) return false;

          return true;
        });

        commit("setEncuestasfiltradas", encuestasFiltradas);
        return encuestasFiltradas;
      } catch (error) {
        console.error("Error en GetAllRegistersbyRangeEnf:", error);
        throw error;
      }
    },

    /**
     * Obtiene encuesta por ID
     */
    getEncuestaById: async ({ commit }, idEncuesta) => {
      try {
        // Consultar asignaciones, datos de encuesta y actividades
        const [asignacionesRes, encuestaRes, actividadesRes] = await Promise.all([
          firebase_api.get(`/Asignaciones/${idEncuesta}.json`),
          firebase_api.get(`/Encuesta/${idEncuesta}.json`),
          firebase_api.get(`/Actividades/${idEncuesta}.json`),
        ]);

        const asignacionesData = asignacionesRes.data;
        const encuestaData = encuestaRes.data;
        const actividadesData = actividadesRes.data;

        // Extraer cups del objeto de asignaciones
        const cupsPaciente = asignacionesData?.cups || {};
        const tipoActividad = actividadesData?.tipoActividad || encuestaData?.tipoActividad || {};

        let resultData = {};

        // Estructurar los datos
        if (encuestaData) {
          resultData = {
            id: idEncuesta,
            ...encuestaData,
            cups: cupsPaciente,
            tipoActividad,
          };
        }

        commit("setEncuesta", resultData);
        return resultData;
      } catch (error) {
        console.error("Error en getEncuestaById:", error);
        throw error;
      }
    },

    /**
     * Obtiene actividades por ID
     */
    getActividadesById: async ({ commit }, idEncuesta) => {
      try {
        const { data } = await firebase_api.get(`/Actividades/${idEncuesta}.json`);
        commit("setActividades", data);
        return data;
      } catch (error) {
        console.error("Error en getActividadesById:", error);
        throw error;
      }
    },

    // ====================================================================
    // PACIENTES
    // ====================================================================

    /**
     * Obtiene datos de paciente por tipodoc y numdoc
     * Busca el paciente en Encuesta y luego carga datos relacionados
     */
    getAllByPacientesID: async ({ commit }, { tipodoc, numdoc }) => {
      try {
        // Obtener todas las encuestas (contienen datos básicos del paciente)
        const { data } = await firebase_api.get("/Encuesta.json");

        if (!data || data === null) {
          commit("setDatosPaciente", []);
          return [];
        }

        // Convertir a array con IDs y buscar por tipodoc y numdoc
        const pacientesEncontrados = [];
        
        for (const [encuestaId, encuesta] of Object.entries(data)) {
          if (encuesta.tipodoc === tipodoc && encuesta.numdoc === numdoc) {
            pacientesEncontrados.push({
              id: encuestaId,
              ...encuesta,
            });
          }
        }

        if (pacientesEncontrados.length === 0) {
          commit("setDatosPaciente", []);
          return [];
        }

        // Para cada paciente encontrado, cargar datos relacionados
        const pacientesConDatos = await Promise.all(
          pacientesEncontrados.map(async (paciente) => {
            const encuestaId = paciente.id; // ID de Firebase usado como parámetro

            try {
              // Obtener caracterización buscando por idEncuesta
              const caracResp = await firebase_api.get(`/caracterizacion.json`);
              let caracterizacion = {};
              if (caracResp.data) {
                const caracterizacionEncontrada = Object.values(caracResp.data).find(
                  (carac) => carac.idEncuesta === encuestaId
                );
                caracterizacion = caracterizacionEncontrada || {};
              }

              // Obtener asignaciones usando encuestaId
              const asignResp = await firebase_api.get(`/Asignaciones/${encuestaId}.json`);
              const asignaciones = asignResp.data || {};
              
              // Crear un nuevo objeto con todas las propiedades para garantizar reactividad
              const pacienteCompleto = {
                ...paciente,
                caracterizacion,
                asignaciones
              };
              return pacienteCompleto;
            } catch (err) {
              return paciente;
            }
          })
        );

        commit("setDatosPaciente", pacientesConDatos);
        return pacientesConDatos;
      } catch (error) {
        throw error;
      }
    },

    /**
     * Obtiene datos de paciente por tipo, número y convenio (exclusivo E Basicos)
     */
    getAllByPacientesIDEB: async ({ commit }, { tipodoc, numdoc, convenio }) => {
      console.log("datos que entran EB - tipodoc, numdoc, convenio:", tipodoc, numdoc, convenio);
      try {
        // Obtener todas las encuestas
        const { data } = await firebase_api.get("/Encuesta.json");

        if (!data || data === null) {
          console.log("No hay encuestas registradas");
          return [];
        }

        const tipodocNormalizado = String(tipodoc ?? "").trim();
        const numdocNormalizado = String(numdoc ?? "").trim();
        const convenioNormalizado = String(convenio ?? "").trim();

        // Buscar en las encuestas por tipodoc, numdoc y convenio
        const datospaciente = [];
        
        for (const [encuestaId, encuesta] of Object.entries(data)) {
          if (
            String(encuesta?.tipodoc ?? "").trim() === tipodocNormalizado &&
            String(encuesta?.numdoc ?? "").trim() === numdocNormalizado &&
            String(encuesta?.convenio ?? "").trim() === convenioNormalizado
          ) {
            datospaciente.push({
              id: encuestaId,
              ...encuesta,
            });
          }
        }

        commit("setDatosPaciente", datospaciente);
        return datospaciente;
      } catch (error) {
        console.error("Error en getAllByPacientesIDEB:", error);
        throw error;
      }
    },

    // ====================================================================
    // CARACTERIZACIÓN
    // ====================================================================

    /**
     * Guarda datos de caracterización
     */
    guardarCaracterizacion: async ({ commit }, entradasC) => {
      const caracterizacion = {
        estadoCaracterizacion: entradasC.estadoCaracterizacion,
        idEncuesta: entradasC.idEncuesta,
        convenio: entradasC.convenio,
        visita: entradasC.visita,
        tipovisita: entradasC.tipovisita,
        tipovivienda: entradasC.tipovivienda,
        EstActual_Iluminacion: entradasC.EstActual_Iluminacion,
        EstActual_Ventilacion: entradasC.EstActual_Ventilacion,
        EstActual_Paredes: entradasC.EstActual_Paredes,
        EstActual_Pisos: entradasC.EstActual_Pisos,
        EstActual_Techo: entradasC.EstActual_Techo,
        peso: entradasC.peso,
        talla: entradasC.talla,
        tensionSistolica: entradasC.tensionSistolica,
        tensionDiastolica: entradasC.tensionDiastolica,
        perimetroAbdominal: entradasC.perimetroAbdominal,
        perimetroBranquial: entradasC.perimetroBranquial,
        oximetria: entradasC.oximetria,
        temperatura: entradasC.temperatura,
        imc: entradasC.imc,
        clasificacionImc: entradasC.clasificacionImc,
        Oizquierdo: entradasC.Oizquierdo,
        Oderecho: entradasC.Oderecho,
        Evacunal: entradasC.Evacunal,
        seleccionadosServPublic: entradasC.seleccionadosServPublic,
        seleccionadosFactoresRiesgo: entradasC.seleccionadosFactoresRiesgo,
        seleccionadosPresenciaAnimales: entradasC.seleccionadosPresenciaAnimales,
        seleccionadosAntecedentes: entradasC.seleccionadosAntecedentes,
        grupoFamiliar: entradasC.grupoFamiliar,
        seleccionadosRiesgos: entradasC.seleccionadosRiesgos,
      };

      try {
        const response = await firebase_api.post(`caracterizacion.json`, caracterizacion);
        console.log("caracterizacion guardada correctamente");

        await firebase_api.patch(`/Encuesta/${caracterizacion.idEncuesta}.json`, {
          status_caracterizacion: true,
        });

        return response.data;
      } catch (error) {
        console.error("Error al guardar caracterización:", error);
        throw error;
      }
    },

    // ====================================================================
    // AGENDAS
    // ====================================================================

    /**
     * Guarda agenda de toma de muestras
     */
    guardarAgendaT: async ({ commit }, datos) => {
      if (
        !datos ||
        !datos.idAgenda ||
        !datos.idEncuesta ||
        !datos.fechaAgenda ||
        !datos.horalab ||
        !datos.grupo ||
        !datos.encuestador ||
        !datos.paciente ||
        !datos.barrio ||
        !datos.direccion
      ) {
        console.error("guardarAgendaT: Faltan datos obligatorios", datos);
        throw new Error(
          "Faltan datos obligatorios para guardar la agenda de toma de muestras"
        );
      }

      const agenda = {
        idAgenda: datos.idAgenda,
        idEncuesta: datos.idEncuesta,
        tomademuestras: {
          fechaAgenda: datos.fechaAgenda,
          horalab: datos.horalab,
          idEncuesta: datos.idEncuesta,
          grupo: datos.grupo,
          encuestador: datos.encuestador,
          paciente: datos.paciente,
          barrio: datos.barrio,
          direccion: datos.direccion,
        },
      };
      const key = agenda.idAgenda;

      try {
        const response = await firebase_api.get(`/agendas/${key}.json`);
        let tomademuestrasExistentes = [];

        if (response.data && response.data.tomademuestras) {
          tomademuestrasExistentes = response.data.tomademuestras;
          if (!Array.isArray(tomademuestrasExistentes)) {
            tomademuestrasExistentes = [tomademuestrasExistentes];
          }
        }

        const existe = tomademuestrasExistentes.some(
          (item) =>
            item.horalab === agenda.tomademuestras.horalab &&
            item.paciente === agenda.tomademuestras.paciente &&
            item.idEncuesta === agenda.tomademuestras.idEncuesta
        );

        if (!existe) {
          tomademuestrasExistentes.push(agenda.tomademuestras);
        } else {
          console.warn("Cita de toma de muestras duplicada detectada, no se agrega.");
        }

        if (response.data) {
          await firebase_api.patch(`/agendas/${key}.json`, {
            tomademuestras: tomademuestrasExistentes,
          });
          console.log("Agenda actualizada:", key, tomademuestrasExistentes);
        } else {
          await firebase_api.put(`/agendas/${key}.json`, {
            ...agenda,
            tomademuestras: [agenda.tomademuestras],
          });
          console.log("Agenda creada:", key, agenda);
        }

        await firebase_api.patch(`/Encuesta/${agenda.idEncuesta}.json`, {
          Agenda_tomademuestras: {
            cita_tomamuestras: true,
            idAgendaT: agenda.idAgenda,
          },
        });
        console.log(
          "Estado de toma de muestras actualizado en Encuesta:",
          agenda.idEncuesta
        );

        return {
          message: "Toma de muestras guardada y estado actualizado correctamente",
          agenda: agenda,
          tomademuestras: tomademuestrasExistentes,
        };
      } catch (error) {
        console.error(
          "Error al guardar toma de muestras y actualizar estado:",
          error,
          datos
        );
        throw error;
      }
    },

    /**
     * Guarda agenda de visita médica
     */
    guardarAgendaV: async ({ commit }, data) => {
      if (
        !data ||
        !data.idAgenda ||
        !data.idEncuesta ||
        !data.fechaAgenda ||
        !data.horavisita ||
        !data.grupo ||
        !data.encuestador ||
        !data.paciente ||
        !data.barrio ||
        !data.direccion
      ) {
        console.error("guardarAgendaV: Faltan datos obligatorios", data);
        throw new Error(
          "Faltan datos obligatorios para guardar la agenda de visita médica"
        );
      }

      const agenda = {
        idAgenda: data.idAgenda,
        idEncuesta: data.idEncuesta,
        visitamedica: {
          fechaAgenda: data.fechaAgenda,
          horavisita: data.horavisita,
          idEncuesta: data.idEncuesta,
          grupo: data.grupo,
          encuestador: data.encuestador,
          paciente: data.paciente,
          barrio: data.barrio,
          direccion: data.direccion,
        },
      };
      console.log("Estos son los datos de la agenda:", agenda.visitamedica);
      const key = agenda.idAgenda;

      try {
        const response = await firebase_api.get(`/agendas/${key}.json`);
        let visitamedicaExistentes = [];

        if (response.data && response.data.visitamedica) {
          visitamedicaExistentes = response.data.visitamedica;
          if (!Array.isArray(visitamedicaExistentes)) {
            visitamedicaExistentes = [visitamedicaExistentes];
          }
        }

        const existe = visitamedicaExistentes.some(
          (item) =>
            item.horavisita === agenda.visitamedica.horavisita &&
            item.paciente === agenda.visitamedica.paciente &&
            item.idEncuesta === agenda.visitamedica.idEncuesta
        );

        if (!existe) {
          visitamedicaExistentes.push(agenda.visitamedica);
        } else {
          console.warn("Cita de visita médica duplicada detectada, no se agrega.");
        }

        if (response.data) {
          await firebase_api.patch(`/agendas/${key}.json`, {
            visitamedica: visitamedicaExistentes,
          });
          console.log(
            "Agenda de visita médica actualizada:",
            key,
            visitamedicaExistentes
          );
        } else {
          await firebase_api.put(`/agendas/${key}.json`, {
            ...agenda,
            visitamedica: [agenda.visitamedica],
          });
          console.log("Agenda de visita médica creada:", key, agenda);
        }

        await firebase_api.patch(`/Encuesta/${agenda.idEncuesta}.json`, {
          Agenda_Visitamedica: {
            cita_visitamedica: true,
            idAgendaV: agenda.idAgenda,
          },
        });
        console.log(
          "Estado de visita médica actualizado en Encuesta:",
          agenda.idEncuesta
        );

        return {
          message: "Visita médica guardada y estado actualizado correctamente",
          agenda: agenda,
          visitamedica: visitamedicaExistentes,
        };
      } catch (error) {
        console.error("Error al guardar visita médica:", error, data);
        throw error;
      }
    },

    /**
     * Obtiene listado de agendas por fecha
     */
    getListAgendas: async ({ commit }, fecha) => {
      console.log("consultando agendas desde:", fecha);
      try {
        // Obtener todas las agendas y filtrar en el cliente
        const { data } = await firebase_api.get("/agendas.json");

        const agendas = data
          ? Object.entries(data)
              .map(([key, value]) => ({
                id: key,
                ...value,
              }))
              .filter((agenda) => agenda.fecha === fecha)
          : [];

        commit("setAgendas", agendas);
        return agendas;
      } catch (error) {
        console.error("Error en getListagendas:", error);
        throw error;
      }
    },

    /**
     * Obtiene agendas de toma de laboratorio
     */
    getAgendasTomaLab: async ({ commit }, dataidlab) => {
      console.log("datos que entran", dataidlab);
      try {
        const { data } = await firebase_api.get("/agendas.json");
        const encuestas = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));

        const encuestasFiltradas = encuestas.filter(
          (encuesta) =>
            encuesta.tomademuestras &&
            encuesta.tomademuestras.dateIDlab &&
            encuesta.tomademuestras.dateIDlab.id === dataidlab
        );

        commit("setEncuestasfiltradas", encuestasFiltradas);
        return encuestasFiltradas;
      } catch (error) {
        console.error("Error en Action_getAgendasTomaLab:", error);
        throw error;
      }
    },

    /**
     * Obtiene agendas de toma de laboratorio por ID
     */
    getAgendasTomaLabById: async ({ commit }, { id }) => {
      console.log("datos que entran", id);
      try {
        const { data } = await firebase_api.get("/agendas.json");
        const encuestas = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));

        const encuestasFiltradas = encuestas.filter((encuesta) => encuesta.id === id);

        commit("setEncuestaslabbyId", encuestasFiltradas);
        return encuestasFiltradas;
      } catch (error) {
        console.error("Error en getAgendasLabById:", error);
        throw error;
      }
    },

    /**
     * Obtiene agendas de visita por ID
     */
    getAgendasVisitaById: async ({ commit }, { id }) => {
      console.log("datos que entran", id);
      try {
        const { data } = await firebase_api.get("/agendas.json");
        const encuestas = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));

        const encuestasFiltradas = encuestas.filter((encuesta) => encuesta.id === id);

        commit("setEncuestasvisitaById", encuestasFiltradas);
        return encuestasFiltradas;
      } catch (error) {
        console.error("Error en getAgendasVisitaById:", error);
        throw error;
      }
    },

    /**
     * Elimina una agenda
     */
    eliminarAgenda: async ({ commit }, { indice, encuestaID, lista }) => {
      console.log("Eliminando agenda con índice:", indice, "y encuestaID:", encuestaID);

      if (indice === undefined || indice === null || indice === "") {
        throw new Error("Índice inválido para eliminar");
      }
      if (!encuestaID) {
        throw new Error("encuestaID inválido para eliminar");
      }

      try {
        await firebase_api.delete(`/agendas/${encuestaID}/${lista}/${indice}.json`);
        console.log("Registro eliminado correctamente");
        return true;
      } catch (error) {
        console.error("Error en Action eliminarAgenda:", error);
        throw error;
      }
    },

    // ====================================================================
    // USUARIOS Y PROFESIONALES
    // ====================================================================

    /**
     * Crea un nuevo usuario
     */
    createUser: async ({ commit }, entradasU) => {
      try {
        const {
          bd,
          nombres,
          documento,
          email,
          cargo,
          password,
          estado,
          rol,
          grupo,
        } = entradasU;

        const DataToSaveE = {
          nombres,
          documento,
          email,
          cargo,
          password,
          estado,
          rol,
          grupo,
        };

        const Ruta = `/${bd}.json`;
        const { data } = await firebase_api.post(Ruta, DataToSaveE);
        return data;
      } catch (error) {
        console.error("Error en Action_createUser:", error);
        throw error;
      }
    },

    /**
     * Elimina un usuario
     */
    deleteUser: async ({ commit }, id) => {
      try {
        const { data } = await firebase_api.delete(`/usuarios/${id}.json`);
        return data;
      } catch (error) {
        console.error("Error en Action_deleteUser:", error);
        throw error;
      }
    },

    /**
     * Consulta usuarios de Firestore
     */
    async consultarUsuariosFirestore({ commit }) {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        console.error("Error consultando usuarios Firestore:", error);
        throw error;
      }
    },

    /**
     * Obtiene médicos por grupo y convenio
     */
    getAllMedicosbyGrupo: async ({ commit }, { grupo, convenio }) => {
      console.log("datos que entran en getAllMedicosbyGrupo - grupo:", grupo, "convenio:", convenio);
      try {
        const q = query(
          collection(db, "users"),
          where("grupo", "==", grupo),
          where("convenio", "==", convenio),
          where("cargo", "==", "Medico")
        );

        const querySnapshot = await getDocs(q);

        const encuestasFiltradas = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        commit("setMedicosByGrupo", encuestasFiltradas);
        return encuestasFiltradas;
      } catch (error) {
        console.error("Error en getAllMedicosbyGrupo:", error);
        throw error;
      }
    },

    /**
     * Obtiene enfermeros por grupo y convenio
     */
    getAllEnfermerosbyGrupo: async ({ commit }, { grupo, convenio }) => {
      console.log("datos que entran en getAllEnfermerosbyGrupo - grupo:", grupo, "convenio:", convenio);
      try {
        const q = query(
          collection(db, "users"),
          where("grupo", "==", grupo),
          where("convenio", "==", convenio),
          where("cargo", "==", "Enfermero")
        );

        const querySnapshot = await getDocs(q);

        const encuestasFiltradas = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        commit("setEnfermerosByGrupo", encuestasFiltradas);
        return encuestasFiltradas;
      } catch (error) {
        console.error("Error en getAllEnfermerosbyGrupo:", error);
        throw error;
      }
    },

    /**
     * Obtiene psicólogos por grupo y convenio
     */
    getAllPsicologosbyGrupo: async ({ commit }, { grupo, convenio }) => {
      console.log("datos que entran en getAllPsicologosbyGrupo - grupo:", grupo, "convenio:", convenio);
      try {
        const q = query(
          collection(db, "users"),
          where("grupo", "==", grupo),
          where("convenio", "==", convenio),
          where("cargo", "==", "Psicologo")
        );

        const querySnapshot = await getDocs(q);

        const psicologosFiltrados = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        commit("setPsicologosByGrupo", psicologosFiltrados);
        return psicologosFiltrados;
      } catch (error) {
        console.error("Error en getAllPsicologosbyGrupo:", error);
        throw error;
      }
    },

    /**
     * Obtiene trabajadores sociales por grupo y convenio
     */
    getAllTsocialesbyGrupo: async ({ commit }, { grupo, convenio }) => {
      console.log("datos que entran en getAllTsocialesbyGrupo - grupo:", grupo, "convenio:", convenio);
      try {
        const q = query(
          collection(db, "users"),
          where("grupo", "==", grupo),
          where("convenio", "==", convenio),
          where("cargo", "==", "Tsocial")
        );

        const querySnapshot = await getDocs(q);

        const tsocialesFiltrados = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        commit("setTsocialesByGrupo", tsocialesFiltrados);
        return tsocialesFiltrados;
      } catch (error) {
        console.error("Error en getAllTsocialesbyGrupo:", error);
        throw error;
      }
    },

    /**
     * Resetea contraseña a valor por defecto
     */
    resetPassword: async ({ commit }, id) => {
      console.log("ID:", id);
      try {
        const { data } = await firebase_api.patch(`/usuarios/${id}.json`, {
          password: "12345",
        });
        return data;
      } catch (error) {
        console.error("Error en Action_updateUser:", error);
        throw error;
      }
    },

    /**
     * Establece nueva contraseña
     */
    NewPassword: async ({ commit }, { id, newPassword }) => {
      try {
        const { data } = await firebase_api.patch(`/usuarios/${id}.json`, {
          password: newPassword,
        });
        return data;
      } catch (error) {
        console.error("Error en Action_updateUser:", error);
        throw error;
      }
    },

    // ====================================================================
    // PARÁMETROS DEL SISTEMA
    // ====================================================================

    /**
     * Crea comuna y barrio
     */
    crearComunaBarrio: async ({ commit }, entradasC) => {
      try {
        const { bd, comuna, barrio } = entradasC;

        const DataToSaveC = { comuna, barrio };

        const Ruta = `/${bd}.json`;
        const { data } = await firebase_api.post(Ruta, DataToSaveC);
        return data;
      } catch (error) {
        console.error("Error en Action_crearComunaBarrio:", error);
        throw error;
      }
    },

    /**
     * Obtiene todas las comunas y barrios
     */
    getAllComunaBarrios: async ({ commit }) => {
      try {
        const { data } = await firebase_api.get("/comunasybarrios.json");
        const comunasBarrios = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));
        commit("setComunasBarrios", comunasBarrios);
        return comunasBarrios;
      } catch (error) {
        console.error("Error en Action_getAllComunaBarrios:", error);
        throw error;
      }
    },

    /**
     * Actualiza una comuna y barrio
     */
    actualizarComunaBarrio: async ({ commit }, { id, comuna, barrio }) => {
      try {
        if (!id) throw new Error("ID inválido para actualizar");
        const DataToSaveC = { comuna, barrio };
        const { data } = await firebase_api.put(`/comunasybarrios/${id}.json`, DataToSaveC);
        return data;
      } catch (error) {
        console.error("Error en Action_actualizarComunaBarrio:", error);
        throw error;
      }
    },

    /**
     * Elimina comuna y barrio
     */
    deleteComunaBarrio: async ({ commit }, id) => {
      try {
        if (!id) throw new Error("ID inválido para eliminar");
        const { data } = await firebase_api.delete(`/comunasybarrios/${id}.json`);
        return data;
      } catch (error) {
        console.error("Error en Action deleteComunaBarrio:", error);
        throw error;
      }
    },

    /**
     * Crea EPS
     */
    crearEps: async ({ commit }, entradaseps) => {
      try {
        const { bd, eps } = entradaseps;

        const DataToSaveC = { eps };

        const Ruta = `/${bd}.json`;
        const { data } = await firebase_api.post(Ruta, DataToSaveC);
        return data;
      } catch (error) {
        console.error("Error en Action_crearEps:", error);
        throw error;
      }
    },

    /**
     * Obtiene todas las EPS
     */
    getAllEps: async ({ commit }) => {
      try {
        const { data } = await firebase_api.get("/eps.json");
        const eps = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));
        commit("setEps", eps);
        return eps;
      } catch (error) {
        console.error("Error en Action_getAllEps:", error);
        throw error;
      }
    },

    /**
     * Obtiene todas las EPS (método alternativo)
     */
    getAllEpss: async ({ commit }) => {
      try {
        const { data } = await firebase_api.get("/eps.json");
        const eps = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));
        commit("setEps", eps);
        return eps;
      } catch (error) {
        console.error("Error en Action_getAllEps:", error);
        throw error;
      }
    },

    /**
     * Actualiza una EPS
     */
    actualizarEps: async ({ commit }, { id, eps }) => {
      try {
        if (!id) throw new Error("ID inválido para actualizar");
        const DataToSave = { eps };
        const { data } = await firebase_api.put(`/eps/${id}.json`, DataToSave);
        return data;
      } catch (error) {
        console.error("Error en Action_actualizarEps:", error);
        throw error;
      }
    },

    /**
     * Elimina EPS
     */
    deleteEps: async ({ commit }, id) => {
      try {
        if (!id) throw new Error("ID inválido para eliminar");
        const { data } = await firebase_api.delete(`/eps/${id}.json`);
        return data;
      } catch (error) {
        console.error("Error en Action deleteEps:", error);
        throw error;
      }
    },

    // ====================================================================
    // CONTRATOS - GESTIÓN
    // ====================================================================

    /**
     * Crea un nuevo contrato
     */
    crearContrato: async ({ commit }, contratoData) => {
      try {
        const { epsId, epsNombre, cups } = contratoData;

        const DataToSave = {
          epsId,
          epsNombre,
          cups,
          fechaCreacion: new Date().toISOString()
        };

        const { data } = await firebase_api.post("/contratos.json", DataToSave);
        return data;
      } catch (error) {
        console.error("Error en Action_crearContrato:", error);
        throw error;
      }
    },

    /**
     * Obtiene todos los contratos
     */
    getAllContratos: async ({ commit }) => {
      try {
        const { data } = await firebase_api.get("/contratos.json");
        if (!data) {
          commit("setContratos", []);
          return [];
        }
        const contratos = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));
        commit("setContratos", contratos);
        return contratos;
      } catch (error) {
        console.error("Error en Action_getAllContratos:", error);
        throw error;
      }
    },

    /**
     * Elimina un contrato
     */
    eliminarContrato: async ({ commit }, contratoId) => {
      try {
        if (!contratoId) throw new Error("ID inválido para eliminar");
        const { data } = await firebase_api.delete(`/contratos/${contratoId}.json`);
        return data;
      } catch (error) {
        console.error("Error en Action_eliminarContrato:", error);
        throw error;
      }
    },

    /**
     * Actualiza un contrato existente
     */
    actualizarContrato: async ({ commit }, { contratoId, contratoData }) => {
      try {
        if (!contratoId) throw new Error("ID inválido para actualizar");
        const { data } = await firebase_api.put(`/contratos/${contratoId}.json`, contratoData);
        return data;
      } catch (error) {
        console.error("Error en Action_actualizarContrato:", error);
        throw error;
      }
    },

    /**
     * Obtiene datos de IPS
     */
    getdataips: async ({ commit }, id) => {
      try {
        const { data } = await firebase_api.get(`/ips/${id}.json`);
        if (data && Object.keys(data).length > 0) {
          commit("setdatosips", data);
        }
        console.log("getdataips:", data);
      } catch (error) {
        console.error("Error en Action_getdataips:", error);
        throw error;
      }
    },

    /**
     * Crea CUPS
     */
    crearCups: async ({ commit }, entradasCups) => {
      try {
        const { bd, nombre, codigo, profesional, grupo } = entradasCups;

        const DataToSaveC = {
          DescripcionCUP: nombre,
          profesional: profesional,
          codigo: codigo,
          Grupo: grupo || ""
        };

        const Ruta = `/${bd}.json`;
        const { data } = await firebase_api.post(Ruta, DataToSaveC);
        return data;
      } catch (error) {
        console.error("Error en Action_crearCups:", error);
        throw error;
      }
    },

    /**
     * Edita CUPS
     */
    editarCups: async ({ commit }, entradasCups) => {
      try {
        const { bd, id, nombre, codigo, profesional, grupo, roles, eps } = entradasCups;

        if (!id) throw new Error("ID inválido para editar");

        // Construir objeto con solo los campos que tienen valores
        const DataToSaveC = {
          DescripcionCUP: nombre,
          codigo: codigo,
          profesional: profesional,
        };

        // Agregar campos opcionales solo si tienen valores
        if (grupo) DataToSaveC.Grupo = grupo;
        if (roles && Array.isArray(roles) && roles.length > 0) DataToSaveC.Roles = roles;
        if (eps && Array.isArray(eps) && eps.length > 0) DataToSaveC.Eps = eps;

        const Ruta = `/${bd}/${id}.json`;
        const { data } = await firebase_api.put(Ruta, DataToSaveC);
        console.log("CUPS editado exitosamente, datos guardados:", DataToSaveC);
        return data;
      } catch (error) {
        console.error("Error en Action_editarCups:", error);
        throw error;
      }
    },

    /**
     * Elimina un CUPS
     */
    eliminarCups: async ({ commit }, cupsId) => {
      try {
        if (!cupsId) throw new Error("ID inválido para eliminar");
        const { data } = await firebase_api.delete(`/cups/${cupsId}.json`);
        return data;
      } catch (error) {
        console.error("Error en Action_eliminarCups:", error);
        throw error;
      }
    },

    /**
     * Agrega reserva
     */
    addreserva: async ({ commit }, entradasr) => {
      try {
        const { bd, fecha, grupo } = entradasr;

        const DataToSaver = { fecha, grupo };

        const Ruta = `/${bd}.json`;
        const { data } = await firebase_api.post(Ruta, DataToSaver);
        return data;
      } catch (error) {
        console.error("Error en Action_addreserva:", error);
        throw error;
      }
    },

    // ====================================================================
    // CUPS Y ACTIVIDADES
    // ====================================================================

    /**
     * Obtiene CUPS por actividad
     */
    selectCupsByActividad: async ({ commit }, { enc, act }) => {
      console.log("ejecutando procesos, esto entra ", enc, act);

      try {
        let ruta = `/cupsActividades/${enc}/tipoActividad/${act}.json`;

        const { data } = await firebase_api.get(ruta);
        commit("setCupsbyActividad", data);
        return data;
      } catch (error) {
        console.error("Error en Action_selectCupsByActividad:", error);
        throw error;
      }
    },

    /**
     * Obtiene CUPS asignados por actividad y rol
     */
    selectCupsAsignadosByActividad: async ({ commit }, { enc, act, rol }) => {
      try {
        if (!enc || !act || !rol) return null;
        const ruta = `/Asignaciones/${enc}/tipoActividad/${act}/cups/${rol}.json`;
        const { data } = await firebase_api.get(ruta);
        return data;
      } catch (error) {
        console.error("Error en Action_selectCupsAsignadosByActividad:", error);
        throw error;
      }
    },

    /**
     * Obtiene asignaciones de una encuesta
     */
    getAsignacionesByEncuesta: async ({ commit }, idEncuesta) => {
      try {
        if (!idEncuesta) return null;
        const ruta = `/Asignaciones/${idEncuesta}.json`;
        const { data } = await firebase_api.get(ruta);
        return data;
      } catch (error) {
        console.error("Error en Action_getAsignacionesByEncuesta:", error);
        return null;
      }
    },

    /**
     * Obtiene todas las actividades extra
     */
    getAllActividadesExtra: async ({ commit }) => {
      try {
        const { data } = await firebase_api.get("/actividadesExtra.json");

        // Manejar caso cuando no hay registros (data es null)
        if (!data || data === null) {
          commit("setActividadesExtra", []);
          return [];
        }

        // Mapear actividades extra
        const actividadesExtra = Object.entries(data)
          .filter(([key, value]) => {
            return value !== null &&
              typeof value === 'object' &&
              value.nombre;
          })
          .map(([key, value]) => ({
            id: key,
            key: value.key || "",
            nombre: value.nombre || "",
            descripcion: value.descripcion || "",
            Profesional: value.Profesional || [],
          }));

        console.log("Actividades Extra cargadas correctamente:", actividadesExtra);
        commit("setActividadesExtra", actividadesExtra);
        return actividadesExtra;
      } catch (error) {
        console.error("Error en Action_getAllActividadesExtra:", error);
        // Si la tabla no existe, retornar array vacío
        commit("setActividadesExtra", []);
        return [];
      }
    },

    /**
     * Obtiene todos los CUPS
     */
    getAllCups: async ({ commit }) => {
      try {
        const { data } = await firebase_api.get("/cups.json");

        // Manejar caso cuando no hay registros (data es null)
        if (!data || data === null) {
          commit("setCups", []);
          return [];
        }

        // Mapear y filtrar solo registros válidos y completos
        const cups = Object.entries(data)
          .filter(([key, value]) => {
            // Filtrar registros null o incompletos
            return value !== null &&
              typeof value === 'object' &&
              (value.DescripcionCUP || value.codigo || value.profesional);
          })
          .map(([key, value]) => ({
            id: key,
            codigo: value.codigo || "",
            DescripcionCUP: value.DescripcionCUP || "",
            profesional: value.profesional || "",
            Grupo: value.Grupo || value.grupo || value.group || "",
            Roles: Array.isArray(value.Roles) ? value.Roles : [],
            Eps: Array.isArray(value.Eps) ? value.Eps : [],
          }));

        console.log("CUPS cargados correctamente:", cups);
        commit("setCups", cups);
        return cups;
      } catch (error) {
        console.error("Error en Action_getAllCups:", error);
        throw error;
      }
    },

    /**
     * Adiciona CUPS a una actividad
     */
    adicionarCups: async ({ commit }, entradasC) => {
      try {
        const {
          key,
          cups: nuevosCups,
          idEncuesta,
          nombrePtof,
          convenio,
        } = entradasC;

        if (!key) throw new Error("El identificador 'key' es obligatorio");

        const Ruta = `/Asignaciones/${idEncuesta}.json`;

        // 1. Leer datos existentes
        const response = await firebase_api.get(Ruta);
        const datosExistentes = response.data || {};

        // 2. Normalizar cups existentes sin sobrescribir por cup.id
        let cupsExistentesObj = {};
        if (Array.isArray(datosExistentes.cups)) {
          datosExistentes.cups.forEach((cup) => {
            if (cup) {
              const key = generarId();
              cupsExistentesObj[key] = cup;
            }
          });
        } else if (
          typeof datosExistentes.cups === "object" &&
          datosExistentes.cups !== null
        ) {
          const valores = Object.values(datosExistentes.cups);
          const esNested = valores.some(
            (val) =>
              val &&
              typeof val === "object" &&
              !("id" in val) &&
              !("cupsNombre" in val) &&
              !("DescripcionCUP" in val) &&
              !("codigo" in val)
          );

          if (esNested) {
            Object.entries(datosExistentes.cups).forEach(
              ([actividadId, cupsPorActividad]) => {
                if (cupsPorActividad && typeof cupsPorActividad === "object") {
                  Object.values(cupsPorActividad).forEach((cup) => {
                    if (cup) {
                      const key = generarId();
                      cupsExistentesObj[key] = {
                        ...cup,
                        actividadId: cup.actividadId ?? actividadId,
                      };
                    }
                  });
                }
              }
            );
          } else {
            Object.entries(datosExistentes.cups).forEach(([key, cup]) => {
              if (cup) {
                cupsExistentesObj[key] = cup;
              }
            });
          }
        }

        // 3. Crear entradas nuevas con llave unica
        const nuevosCupsObj = {};
        nuevosCups.forEach((cup) => {
          const id = cup.id || generarId();
          const key = generarId();
          nuevosCupsObj[key] = {
            ...cup,
            id,
            convenio: cup?.convenio ?? convenio ?? "",
          };
        });

        // 4. Combinar cups existentes con los nuevos
        const cupsActualizadosObj = { ...cupsExistentesObj, ...nuevosCupsObj };

        // 5. Crear objeto actualizado para guardar
        const datacups = {
          ...datosExistentes,
          key,
          nombrePtof,
          idEncuesta,
          convenio: convenio ?? datosExistentes.convenio ?? "",
          cups: cupsActualizadosObj,
        };

        // 6. Guardar datos actualizados
        const { data } = await firebase_api.put(Ruta, datacups);

        return data;
      } catch (error) {
        console.error("Error en Action_adicionarCups:", error);
        throw error;
      }
    },

    /**
     * Elimina un CUPS
     */
    deleteCUPS: async ({ commit }, { idEncuesta, idActividad, idCup, rol }) => {
      try {
        if (!idEncuesta || !idActividad) throw new Error("ID inválido para eliminar");
        const { data } = await firebase_api.delete(
          `/Asignaciones/${idEncuesta}/tipoActividad/${idActividad}/cups/${rol}/cups/${idCup}.json`
        );
        return data;
      } catch (error) {
        console.error("Error en Action deleteCUPS:", error);
        throw error;
      }
    },

    /**
     * Genera ID único
     */
    generarId() {
      return generarId();
    },

    // ====================================================================
    // FACTURACIÓN
    // ====================================================================

    /**
     * Aprovisiona paciente para facturación
     */
    aprovicionarP: async ({ commit }, data) => {
      const { idEnc, idProf } = data;
      try {
        const response = await firebase_api.patch(`/Encuesta/${data.idEnc}.json`, {
          asigfact: idProf,
          status_facturacion: false,
        });
        console.log("Paciente aprovisionado:", response.data);
        return response.data;
      } catch (error) {
        console.error("Error al aprovisionar paciente:", error);
        throw error;
      }
    },

    /**
     * Cierra la facturación de una encuesta
     */
    cerrarFacturacion: async ({ commit }, idEnc) => {
      try {
        const response = await firebase_api.patch(`/Encuesta/${idEnc}.json`, {
          status_facturacion: true,
          FechaFacturacion: new Date().toISOString(),
        });
        console.log("Facturación cerrada:", response.data);
        return response.data;
      } catch (error) {
        console.error("Error al cerrar facturación:", error);
        throw error;
      }
    },

    /**
     * Asigna facturación a un CUPS
     */
    asigFacturacion: async ({ commit }, datafact) => {
      const {
        rol,
        cup,
        idEncuesta,
        idFacturador,
        numFactura,
        idActividad,
        cupId,
        facturado,
      } = datafact;

      const hoy = new Date();
      const fechaFacturacion = hoy.toISOString().split('T')[0];

      await firebase_api.patch(
        `/Asignaciones/${idEncuesta}/cups/${cupId}.json`,
        {
          FactNum: numFactura,
          FactProf: idFacturador,
          facturado: facturado || true,
          fechaFacturacion: fechaFacturacion,
        }
      );
    },

    /**
     * Obtiene registros generales para facturación
     */
    GetRegistersbyRangeGeneralFact: async ({ commit }, parametros) => {
      try {
        const { finicial, ffinal, convenio } = parametros;
        const normalizarTexto = (valor) =>
          String(valor ?? "")
            .trim()
            .toLowerCase();

        const inicio = String(finicial ?? "").trim();
        const fin = String(ffinal ?? "").trim();
        const convenioFiltro = normalizarTexto(convenio);

        if (!inicio || !fin) {
          console.warn("⚠️ Filtro inválido: fechas vacías en facturación");
          commit("setEncuestasFact", []);
          return [];
        }

        console.log("📋 Parámetros de búsqueda:");
        console.log("   finicial:", inicio, "| tipo:", typeof inicio);
        console.log("   ffinal:", fin, "| tipo:", typeof fin);
        console.log("   convenio:", convenioFiltro, "| tipo:", typeof convenioFiltro);

        // Obtener actividades, encuestas y asignaciones (CUPS)
        const { data: actividades } = await firebase_api.get("/Actividades.json");
        const { data: encuestas } = await firebase_api.get("/Encuesta.json");
        const { data: asignaciones } = await firebase_api.get("/Asignaciones.json");

        if (!actividades || !encuestas) {
          console.warn("⚠️ No hay datos en /Actividades.json o /Encuesta.json");
          commit("setEncuestasFact", []);
          return [];
        }

        // Mapear encuestas
        const encuestasMap = Object.entries(encuestas).map(([key, value]) => ({
          id: key,
          ...value,
        }));

        // Función auxiliar para extraer convenio de CUPS
        const obtenerConvenioDelCUPS = (idEncuesta) => {
          if (!asignaciones || !asignaciones[idEncuesta]) {
            return "";
          }

          const asignacionData = asignaciones[idEncuesta];

          // Si la asignación tiene directamente convenio, usarlo
          if (asignacionData.convenio) {
            return normalizarTexto(asignacionData.convenio);
          }

          // Si tiene cups, extraer convenio del primer CUPS disponible
          if (asignacionData.cups && typeof asignacionData.cups === 'object') {
            const cupsArray = Object.values(asignacionData.cups);
            for (let cup of cupsArray) {
              if (cup && cup.convenio) {
                return normalizarTexto(cup.convenio);
              }
            }
          }

          return "";
        };

        // Mapear actividades y combinar con datos de encuesta
        const resultados = [];
        Object.entries(actividades).forEach(([idActividad, actividadData]) => {
          if (actividadData && typeof actividadData === 'object') {
            const encuestaAsociada = encuestasMap.find(e => e.id === idActividad);
            if (encuestaAsociada) {
              const fechaBD = encuestaAsociada.fechagestEnfermera;
              const fechaBDSolo = fechaBD ? fechaBD.split(" ")[0] : null;

              // Obtener convenio del CUPS en lugar de usar regimen de encuesta
              const conveniodelCUPS = obtenerConvenioDelCUPS(idActividad);

              const cumpleFecha =
                !!fechaBDSolo && fechaBDSolo >= inicio && fechaBDSolo <= fin;
              const cumpleConvenio =
                !convenioFiltro || conveniodelCUPS === convenioFiltro;
              const sinFacturar = encuestaAsociada.status_facturacion !== true;
              const noAsignado = !encuestaAsociada.asigfact;

              if (cumpleFecha && sinFacturar && cumpleConvenio && noAsignado) {
                resultados.push({
                  id: idActividad,
                  ...encuestaAsociada,
                  tipoActividad: actividadData
                });
              }
            }
          }
        });

        console.log(`✅ Registros de actividades filtradas por fecha y convenio: ${resultados.length}`);
        console.log("📄 JSON de resultados:", JSON.stringify(resultados, null, 2));

        commit("setEncuestasFact", resultados);
        return resultados;
      } catch (error) {
        console.error("❌ Error en Action_GetRegistersbyRangeGeneralFact:", error);
        throw error;
      }
    },

    /**
     * Obtiene registros para facturación por ID de paciente
     */
    GetRegistersbyRangeGeneralFactByID: async ({ commit }, parametros) => {
      try {
        const { data: actividades } = await firebase_api.get("/Actividades.json");
        const { data: encuestas } = await firebase_api.get("/Encuesta.json");

        if (!actividades || !encuestas) {
          commit("setEncuestasFact", []);
          return [];
        }

        const encuestasMap = Object.entries(encuestas).map(([key, value]) => ({
          id: key,
          ...value,
        }));

        const resultados = [];
        Object.entries(actividades).forEach(([idActividad, actividadData]) => {
          const encuestaAsociada = encuestasMap.find(e =>
            e.numdoc === parametros.numdoc &&
            e.tipodoc === parametros.tipodoc &&
            (e.asigfact === "" || e.asigfact === null || e.asigfact === undefined) &&
            e.id === idActividad
          );

          if (encuestaAsociada && actividadData) {
            resultados.push({
              id: idActividad,
              ...encuestaAsociada,
              tipoActividad: actividadData
            });
          }
        });

        commit("setEncuestasFact", resultados);
        return resultados;
      } catch (error) {
        console.error("Error en Action_GetRegistersbyRangeGeneralFactByID:", error);
        throw error;
      }
    },

    /**
     * Obtiene registros aprobados para facturación
     */
    GetRegistersbyRangeGeneralFactAprov: async ({ commit }, iduser) => {
      try {
        const { data: actividades } = await firebase_api.get("/Actividades.json");
        const { data: encuestas } = await firebase_api.get("/Encuesta.json");

        if (!actividades || !encuestas) {
          commit("setEncuestasFactAprov", []);
          return [];
        }

        const encuestasMap = Object.entries(encuestas).map(([key, value]) => ({
          id: key,
          ...value,
        }));

        const resultados = [];
        Object.entries(actividades).forEach(([idActividad, actividadData]) => {
          const encuestaAsociada = encuestasMap.find(e =>
            e.asigfact === iduser &&
            e.status_facturacion === false &&
            e.id === idActividad
          );

          if (encuestaAsociada && actividadData) {
            resultados.push({
              id: idActividad,
              ...encuestaAsociada,
              tipoActividad: actividadData
            });
          }
        });

        commit("setEncuestasFactAprov", resultados);
        return resultados;
      } catch (error) {
        console.error("Error en Action_GetRegistersbyRangeGeneralFactAprov:", error);
        throw error;
      }
    },

    // ====================================================================
    // INFORMES Y REPORTES
    // ====================================================================

    /**
     * Obtiene registros por rango - General (Admin)
     */
    GetRegistersbyRangeGeneral: async ({ commit }, parametros) => {
      try {
        const { data } = await firebase_api.get("/Encuesta.json");
        const encuestas = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));

        const encuestasFiltradas = encuestas.filter(
          (encuesta) =>
            encuesta.fecha >= parametros.finicial && encuesta.fecha <= parametros.ffinal
        );

        commit("setEncuestasAdmin", encuestasFiltradas);
        return encuestasFiltradas;
      } catch (error) {
        console.error("Error en Action_GetRegistersbyRangeGeneral:", error);
        throw error;
      }
    },

    /**
     * Obtiene registros cerrados por rango (Admin)
     */
    GetRegistersbyRangeCerrados: async ({ commit }, parametros) => {
      try {
        const { data } = await firebase_api.get("/Encuesta.json");
        const encuestas = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));

        const encuestasFiltradas = encuestas.filter(
          (encuesta) =>
            encuesta.fechagestEnfermera >= parametros.finicial &&
            encuesta.fechagestEnfermera <= parametros.ffinal &&
            encuesta.status_gest_enfermera === true
        );

        commit("setEncuestasAdmin", encuestasFiltradas);
        return encuestasFiltradas;
      } catch (error) {
        console.error("Error en Action_GetRegistersbyRangeCerrados:", error);
        throw error;
      }
    },

    /**
     * Obtiene todos los registros por rango y profesional
     */
    GetAllRegistersbyRangeAndProf: async ({ commit }, parametros) => {
      try {
        const { data } = await firebase_api.get("/Encuesta.json");
        const encuestas = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));

        const encuestasFiltradas = encuestas.filter(
          (encuesta) =>
            encuesta.fecha >= parametros.finicial &&
            encuesta.fecha <= parametros.ffinal &&
            (encuesta.idEnfermeroAtiende === parametros.idprof ||
              encuesta.idMedicoAtiende === parametros.idprof ||
              encuesta.idEncuestador === parametros.idprof)
        );

        commit("setEncuestasAdmin", encuestasFiltradas);
        return encuestasFiltradas;
      } catch (error) {
        console.error("Error en Action_GetAllRegistersbyRangeAndProf:", error);
        throw error;
      }
    },

    // ====================================================================
    // AUTENTICACIÓN
    // ====================================================================

    /**
     * Login de usuario
     */
    login({ commit }, { token, uid }) {
      commit("setToken", token);
      commit("setUid", uid);
      localStorage.setItem("token", token);
      localStorage.setItem("uid", uid);
    },

    /**
     * Logout de usuario
     */
    async userLogout({ commit }) {
      return auth
        .signOut()
        .then(() => {
          commit("CLEAR_ALL_STATE");
          localStorage.clear();
          sessionStorage.clear();
          commit("clearAuth");
          commit("clearUserData");
          // NO redirigir aquí, lo maneja el navbar
        })
        .catch((error) => {
          console.error("Logout error:", error);
          throw error;
        });
    },

    /**
     * Obtiene datos de usuario por UID
     */
    async fetchUserDataByUid({ commit }, uid) {
      try {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          commit("setUserData", userData);
          localStorage.setItem("userData", JSON.stringify(userData));
        } else {
          console.log("No existe documento para este UID");
          commit("clearUserData");
          localStorage.removeItem("userData");
        }
      } catch (error) {
        console.error("Error al obtener datos de Firestore:", error);
        commit("clearUserData");
        localStorage.removeItem("userData");
      }
    },

    /**
     * Elimina todas las actividades asociadas a un paciente
     * @param {string} pacienteId - ID del paciente
     */
    deleteActividadesByPacienteId: async ({ commit }, pacienteId) => {
      try {
        if (!pacienteId) {
          throw new Error("ID de paciente inválido");
        }

        console.log(`[deleteActividadesByPacienteId] Eliminando actividades para paciente: ${pacienteId}`);

        // Eliminar la rama completa de actividades para este paciente
        const { data } = await firebase_api.delete(`/Actividades/${pacienteId}.json`);

        console.log(`[deleteActividadesByPacienteId] Actividades eliminadas correctamente para paciente: ${pacienteId}`);
        return data;
      } catch (error) {
        console.error(`[deleteActividadesByPacienteId] Error: ${error.message}`);
        // No lanzar error para permitir continuidad en cascada
        return null;
      }
    },

    /**
     * Elimina todas las asignaciones asociadas a un paciente
     * @param {string} pacienteId - ID del paciente
     */
    deleteAsignacionesByPacienteId: async ({ commit }, pacienteId) => {
      try {
        if (!pacienteId) {
          throw new Error("ID de paciente inválido");
        }

        console.log(`[deleteAsignacionesByPacienteId] Eliminando asignaciones para paciente: ${pacienteId}`);

        // Eliminar la rama completa de asignaciones para este paciente
        const { data } = await firebase_api.delete(`/Asignaciones/${pacienteId}.json`);

        console.log(`[deleteAsignacionesByPacienteId] Asignaciones eliminadas correctamente para paciente: ${pacienteId}`);
        return data;
      } catch (error) {
        console.error(`[deleteAsignacionesByPacienteId] Error: ${error.message}`);
        // No lanzar error para permitir continuidad en cascada
        return null;
      }
    },
  },

  // ========================================================================
  // MUTATIONS
  // ========================================================================
  mutations: {
    // Actividades
    setActividades(state, actividades) {
      state.actividades = actividades;
    },

    setActividadesExtra(state, actividadesExtra) {
      state.actividadesExtra = actividadesExtra;
    },

    // Usuarios
    setUsuarios(state, usuarios) {
      state.usuarios = usuarios;
    },

    // Encuestas
    setEncuestas(state, encuestas) {
      state.encuestas = encuestas;
    },
    setEncuestasfiltradas(state, encuestasf) {
      state.encuestasFiltradas = encuestasf;
    },
    setEncuestasToday(state, encuestas) {
      state.encuestasToday = encuestas;
    },
    setEncuestaslabbyId(state, encuestas) {
      state.encuestasFiltradasLabById = encuestas;
    },
    setEncuestasvisitaById(state, encuestas) {
      state.encuestasFiltradasVisitaById = encuestas;
    },
    setEncuesta(state, encuesta) {
      if (encuesta && typeof encuesta === "object" && Object.keys(encuesta).length > 0) {
        state.InfoEncuestasById = [encuesta];
      } else {
        state.InfoEncuestasById = [];
      }
    },
    setcantEncuestas(state, cantidad) {
      state.cantEncuestas = cantidad;
    },
    setEncuestasProf(state, encuestas) {
      state.EncuestasProf = encuestas;
    },
    setEncuestasAdmin(state, encuestas) {
      state.EncuestasAdmin = encuestas;
    },
    setEncuestasFact(state, encuestas) {
      state.EncuestasFact = encuestas;
    },
    setEncuestasFactAprov(state, encuestas) {
      state.EncuestasFactAprov = encuestas;
    },

    // Parámetros
    setComunasBarrios(state, comunasBarrios) {
      state.comunasBarrios = comunasBarrios;
    },
    setEps(state, eps) {
      state.epss = eps;
    },
    setdatosips(state, datosips) {
      state.dataips = datosips;
    },

    // Agendas
    setAgendas(state, agendas) {
      state.agendas = agendas;
    },

    // CUPS
    setCups(state, cups) {
      state.cups = cups;
    },
    setCupsbyActividad(state, cups) {
      state.cupsbyActividad = cups;
    },
    setContratos(state, contratos) {
      state.contratos = contratos;
    },

    // Profesionales
    setMedicosByGrupo(state, medicos) {
      state.medicosByGrupo = medicos;
    },
    setEnfermerosByGrupo(state, enfermeros) {
      state.enfermerosByGrupo = enfermeros;
    },
    setPsicologosByGrupo(state, psicologos) {
      state.psicologosByGrupo = psicologos;
    },
    setTsocialesByGrupo(state, tsociales) {
      state.tsocialesByGrupo = tsociales;
    },

    // Pacientes
    setDatosPaciente(state, datos) {
      state.datosPaciente = datos;
    },

    // Autenticación
    setToken(state, token) {
      state.token = token;
      if (token) {
        localStorage.setItem("token", token);
      } else {
        localStorage.removeItem("token");
      }
    },
    setUid(state, uid) {
      state.uid = uid;
      if (uid) {
        localStorage.setItem("uid", uid);
      } else {
        localStorage.removeItem("uid");
      }
    },
    clearAuth(state) {
      state.token = null;
      state.uid = null;
      localStorage.removeItem("token");
      localStorage.removeItem("uid");
    },
    setUserData(state, data) {
      state.userData = data;
      if (data) {
        localStorage.setItem("userData", JSON.stringify(data));
      } else {
        localStorage.removeItem("userData");
      }
    },
    clearUserData(state) {
      state.userData = {};
      localStorage.removeItem("userData");
    },
    CLEAR_ALL_STATE(state) {
      state.accessToken = null;
      state.userData = {};
    },
  },

  // ========================================================================
  // GETTERS
  // ========================================================================
  getters: {
    getUserData: (state) => state.userData,
    getAllEpss: (state) => state.epss,
    getInfoEncuestasById: (state) => state.InfoEncuestasById,
  },
});
