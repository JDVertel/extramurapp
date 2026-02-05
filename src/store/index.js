import firebase_api from "@/api/ApiFirebase.js";
import persistedState from './persistedstate';
import { createStore } from "vuex";
import { getFirestore, doc, getDoc, collection, query, where, getDocs, collectionGroup } from "firebase/firestore";
import { getAuth } from "firebase/auth";
const db = getFirestore();
const auth = getAuth();
import router from "../router/index.js"; // Asegúrate de que la ruta sea correcta
import moment from "moment"; // Asegúrate de tener moment.js instalado




export default createStore({
    state: {
        encuestasFiltradasLabById: [],
        encuestasFiltradasVisitaById: [],
        usuarios: [],
        encuestas: [],
        comunasBarrios: [],
        dataips: [],
        encuestasFiltradas: [],
        agendas: [],
        token: localStorage.getItem('token') || null,
        uid: localStorage.getItem('uid') || null,
        userData: (() => {
            try {
                const data = localStorage.getItem('userData');
                return data ? JSON.parse(data) : {};
            } catch (e) { return {}; }
        })(),
        user: null,
        epss: [],
        accessToken: null, // Para manejar el token de acceso
        cantEncuestas: "",
        encuestasToday: [], // Para manejar la cantidad de encuestas diarias
        InfoEncuestasById: [],
        cupsbyActividad: {},
        EncuestasProf: [],
        EncuestasFact: [],
        EncuestasFactAprov: [],
        datosPaciente:[], // Para manejar la información de CUPS por actividad
        // Puedes agregar más estados según sea necesario
    },
    // plugins: [persistedState],

    actions: {
        /* ----------------------------------------AUTH------------------------------------- */

        /* ---------------------------------------POST------------------------------------- */


        createNewRegister: async ({ commit }, entradasE) => {
            try {
                // ... (desestructuración de entradasE permanece igual)
                const {
                    bd,
                    idMedicoAtiende,
                    idEnfermeroAtiende,
                    fechavisita,
                    status_gest_aux,
                    status_gest_medica,
                    status_gest_enfermera,
                    status_tomamuestras,
                    status_caracterizacion,
                    status_visita,
                    idEncuesta,
                    grupo,
                    idEncuestador,
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
                    tipoActividad,
                    poblacionRiesgo,
                    requiereRemision,
                } = entradasE;

                const DataToSaveE = {
                    idMedicoAtiende,
                    idEnfermeroAtiende,
                    fechavisita,
                    status_gest_aux,
                    status_gest_medica,
                    status_gest_enfermera,
                    status_tomamuestras,
                    status_caracterizacion,
                    status_visita,
                    idEncuesta,
                    grupo,
                    idEncuestador,
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
                const Actividades = {
                    tipoActividad,
                }

                // 1. Guardar registro principal (POST genera un ID automático en Firebase)
                const { data } = await firebase_api.post(`/${bd}.json`, DataToSaveE);
                const mainId = data.name; // Firebase retorna el ID generado en 'name'

                // 2. Guardar actividades con IDs capturados
                const actividadesIds = {};

                for (const actividad of tipoActividad) {
                    // POST para crear el registro (Firebase genera el id)
                    const { data: actividadData } = await firebase_api.post(`/${bd}/${mainId}/tipoActividad.json`, {
                        ...actividad
                    });

                    const idGenerado = actividadData.name;

                    // PATCH para actualizar el registro con el id generado
                    await firebase_api.patch(`/${bd}/${mainId}/tipoActividad/${idGenerado}.json`, {
                        id: idGenerado
                    });

                    // Guarda el ID generado para la actividad
                    actividadesIds[idGenerado] = actividad.key;
                }


                // 3. Retorna IDs importantes para futuras operaciones
                return {
                    mainId: mainId,
                    actividadesIds: actividadesIds
                };

            } catch (error) {
                console.error("Error en Action_createDataEmpresa:", error);
                throw error;
            }
        },



        guardarCaracterizacion: async ({ commit }, entradasC) => {
            const caracterizacion = {
                estadoCaracterizacion: entradasC.estadoCaracterizacion,
                idEncuesta: entradasC.idEncuesta,
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
            //metodo para guardar

            try {
                const response = await firebase_api.post(
                    `caracterizacion.json`,
                    caracterizacion
                );
                console.error("caracterizacion guardada correctamente");

                // Actualizar segunda tabla
                await firebase_api.patch(`/Encuesta/${caracterizacion.idEncuesta}.json`, {
                    status_caracterizacion: true,
                });

                return response.data;

                // Retorna la respuesta del servidor
            } catch (error) {
                console.error("Error al guardar caracterización:", error);
                throw error; // Lanza el error para que pueda ser manejado por el componente
            }
        },

        aprovicionarP: async ({ commit }, data) => {
            const { idEnc, idProf } = data;
            try {
                const response = await firebase_api.patch(`/Encuesta/${data.idEnc}.json`, { asigfact: idProf, status_facturacion: false });
                console.log("Paciente aprovisionado:", response.data);
                return response.data;
            } catch (error) {
                console.error("Error al aprovisionar paciente:", error);
                throw error;
            }
        },

        cerrarFacturacion: async ({ commit }, idEnc) => {
            try {
                const response = await firebase_api.patch(`/Encuesta/${idEnc}.json`, { status_facturacion: true, FechaFacturacion: new Date().toISOString() });
                console.log("Facturación cerrada:", response.data);
                return response.data;
            } catch (error) {
                console.error("Error al cerrar facturación:", error);
                throw error;
            }
        },

        guardarAgendaT: async ({ commit }, datos) => {
            // Validación de datos obligatorios
            if (!datos || !datos.idAgenda || !datos.idEncuesta || !datos.fechaAgenda || !datos.horalab || !datos.grupo || !datos.encuestador || !datos.paciente || !datos.barrio || !datos.direccion) {
                console.error("guardarAgendaT: Faltan datos obligatorios", datos);
                throw new Error("Faltan datos obligatorios para guardar la agenda de toma de muestras");
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
                // Obtener agenda existente
                const response = await firebase_api.get(`/agendas/${key}.json`);
                let tomademuestrasExistentes = [];
                if (response.data && response.data.tomademuestras) {
                    tomademuestrasExistentes = response.data.tomademuestras;
                    if (!Array.isArray(tomademuestrasExistentes)) {
                        tomademuestrasExistentes = [tomademuestrasExistentes];
                    }
                }
                // Verificar duplicados antes de agregar
                const existe = tomademuestrasExistentes.some(item =>
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
                    // Actualizar agenda existente
                    await firebase_api.patch(`/agendas/${key}.json`, {
                        tomademuestras: tomademuestrasExistentes,
                    });
                    console.log("Agenda actualizada:", key, tomademuestrasExistentes);
                } else {
                    // Crear nueva agenda
                    await firebase_api.put(`/agendas/${key}.json`, {
                        ...agenda,
                        tomademuestras: [agenda.tomademuestras],
                    });
                    console.log("Agenda creada:", key, agenda);
                }

                // Actualizar status en Encuesta
                await firebase_api.patch(`/Encuesta/${agenda.idEncuesta}.json`, {
                    Agenda_tomademuestras: {
                        cita_tomamuestras: true,
                        idAgendaT: agenda.idAgenda,
                    }
                });
                console.log("Estado de toma de muestras actualizado en Encuesta:", agenda.idEncuesta);

                return { message: "Toma de muestras guardada y estado actualizado correctamente", agenda: agenda, tomademuestras: tomademuestrasExistentes };

            } catch (error) {
                console.error("Error al guardar toma de muestras y actualizar estado:", error, datos);
                throw error;
            }
        },



        guardarAgendaV: async ({ commit }, data) => {
            // Validación de datos obligatorios
            if (!data || !data.idAgenda || !data.idEncuesta || !data.fechaAgenda || !data.horavisita || !data.grupo || !data.encuestador || !data.paciente || !data.barrio || !data.direccion) {
                console.error("guardarAgendaV: Faltan datos obligatorios", data);
                throw new Error("Faltan datos obligatorios para guardar la agenda de visita médica");
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
                // Obtener agenda existente
                const response = await firebase_api.get(`/agendas/${key}.json`);
                let visitamedicaExistentes = [];
                if (response.data && response.data.visitamedica) {
                    visitamedicaExistentes = response.data.visitamedica;
                    if (!Array.isArray(visitamedicaExistentes)) {
                        visitamedicaExistentes = [visitamedicaExistentes];
                    }
                }
                // Verificar duplicados antes de agregar
                const existe = visitamedicaExistentes.some(item =>
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
                    // Actualizar agenda existente
                    await firebase_api.patch(`/agendas/${key}.json`, {
                        visitamedica: visitamedicaExistentes,
                    });
                    console.log("Agenda de visita médica actualizada:", key, visitamedicaExistentes);
                } else {
                    // Crear nueva agenda
                    await firebase_api.put(`/agendas/${key}.json`, {
                        ...agenda,
                        visitamedica: [agenda.visitamedica],
                    });
                    console.log("Agenda de visita médica creada:", key, agenda);
                }

                // Actualizar status en Encuesta
                await firebase_api.patch(`/Encuesta/${agenda.idEncuesta}.json`, {
                    Agenda_Visitamedica: {
                        cita_visitamedica: true,
                        idAgendaV: agenda.idAgenda,
                    }
                });
                console.log("Estado de visita médica actualizado en Encuesta:", agenda.idEncuesta);

                return { message: "Visita médica guardada y estado actualizado correctamente", agenda: agenda, visitamedica: visitamedicaExistentes };

            } catch (error) {
                console.error("Error al guardar visita médica:", error, data);
                throw error;
            }
        },


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
                // Llamada al servicio (asumiendo que firebase_api está importado y configurado)
                const { data } = await firebase_api.post(Ruta, DataToSaveE);
                return data; // Retornar la respuesta si se necesita
            } catch (error) {
                console.error("Error en Action_createDataEmpresa:", error);
                // Opcional: manejar error, por ejemplo con commit a una mutación de error
                throw error; // Re-lanzar para que el componente pueda manejarlo
            }
        },

        crearComunaBarrio: async ({ commit }, entradasC) => {
            try {
                const { bd, comuna, barrio } = entradasC;

                const DataToSaveC = {
                    comuna,
                    barrio,
                };

                const Ruta = `/${bd}.json`;
                // Llamada al servicio (asumiendo que firebase_api está importado y configurado)
                const { data } = await firebase_api.post(Ruta, DataToSaveC);
                return data; // Retornar la respuesta si se necesita
            } catch (error) {
                console.error("Error en Action_createDataEmpresa:", error);
                // Opcional: manejar error, por ejemplo con commit a una mutación de error
                throw error; // Re-lanzar para que el componente pueda manejarlo
            }
        },
        crearEps: async ({ commit }, entradaseps) => {
            try {
                const { bd, eps } = entradaseps;

                const DataToSaveC = {
                    eps,
                };

                const Ruta = `/${bd}.json`;
                // Llamada al servicio (asumiendo que firebase_api está importado y configurado)
                const { data } = await firebase_api.post(Ruta, DataToSaveC);
                return data; // Retornar la respuesta si se necesita
            } catch (error) {
                console.error("Error en Action_createDataEmpresa:", error);
                // Opcional: manejar error, por ejemplo con commit a una mutación de error
                throw error; // Re-lanzar para que el componente pueda manejarlo
            }
        },

        addreserva: async ({ commit }, entradasr) => {
            try {
                const { bd, fecha, grupo } = entradasr;

                const DataToSaver = {
                    fecha,
                    grupo,
                };

                const Ruta = `/${bd}.json`;
                // Llamada al servicio (asumiendo que firebase_api está importado y configurado)
                const { data } = await firebase_api.post(Ruta, DataToSaver);
                return data; // Retornar la respuesta si se necesita
            } catch (error) {
                console.error("Error en Action_createDataEmpresa:", error);
                // Opcional: manejar error, por ejemplo con commit a una mutación de error
                throw error; // Re-lanzar para que el componente pueda manejarlo
            }
        },

        asigFacturacion: async ({ commit }, datafact) => {
            const { rol, cup, idEncuesta, idFacturador, numFactura, idActividad, cupId } = datafact;

            await firebase_api.patch(`/Encuesta/${idEncuesta}/tipoActividad/${idActividad}/cups/${rol}/cups/${cupId}.json`, {
                FactNum: numFactura,
                FactProf: idFacturador
            });
        },

        generarId() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
        },



        adicionarCups: async ({ commit }, entradasC) => {
            try {
                const { key, idcargo, cups: nuevosCups, idEncuesta, idActividad, nombre } = entradasC;

                if (!key) throw new Error("El identificador 'key' es obligatorio");

                const Ruta = `/Encuesta/${idEncuesta}/tipoActividad/${idActividad}/cups/${key}.json`;

                // 1. Leer datos existentes
                const response = await firebase_api.get(Ruta);
                const datosExistentes = response.data || {};

                // 2. Obtener objeto actual de cups o inicializar vacío
                // Si cups es un arreglo (por compatibilidad), convertirlo a objeto
                let cupsExistentesObj = {};
                if (Array.isArray(datosExistentes.cups)) {
                    datosExistentes.cups.forEach(cup => {
                        if (cup.id) {
                            cupsExistentesObj[cup.id] = cup;
                        }
                    });
                } else if (typeof datosExistentes.cups === 'object' && datosExistentes.cups !== null) {
                    cupsExistentesObj = datosExistentes.cups;
                }

                // 3. Generar id para nuevos cups que no tengan id y convertir a objeto
                const nuevosCupsObj = {};
                nuevosCups.forEach(cup => {
                    const id = cup.id || generarId();
                    nuevosCupsObj[id] = { ...cup, id };
                });

                // 4. Combinar cups existentes con los nuevos (los nuevos reemplazan a los existentes con mismo id)
                const cupsActualizadosObj = { ...cupsExistentesObj, ...nuevosCupsObj };

                // 5. Crear objeto actualizado para guardar
                const datacups = {
                    key,
                    idcargo,
                    nombre,
                    cups: cupsActualizadosObj
                };

                // 6. Guardar datos actualizados con PUT (reemplaza el nodo)
                const { data } = await firebase_api.put(Ruta, datacups);

                return data;

            } catch (error) {
                console.error("Error en Action_adicionarCups:", error);
                throw error;
            }
        },



        /* ---------------------------------------GET------------------------------------- */

        async consultarUsuariosFirestore({ commit }) {
            try {
                const db = getFirestore();
                const querySnapshot = await getDocs(collection(db, "users"));
                // Si quieres guardar los usuarios en el state, haz un commit aquí
                // commit('setUsuariosFirestore', usuarios);
                // O retorna los datos si solo los necesitas en el componente
                return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } catch (error) {
                console.error("Error consultando usuarios Firestore:", error);
                throw error;
            }
        },


        selectCupsByActividad: async ({ commit }, { enc, act }) => {
            console.log("ejecutando procesos, esto entra ", enc, act);

            try {
                let ruta = `/cupsActividades/${enc}/tipoActividad/${act}.json`;

                const { data } = await firebase_api.get(ruta);
                commit("setCupsbyActividad", data); // Guardar en el estado
                /*   console.log(data); */
                return data; // La acción devuelve los datos directamente
            } catch (error) {
                console.error("Error en Action_selectCupsByActividad:", error);
                throw error;
            }
        },
        /* ------------------------ inicio admin informes------------------------------------ */
        GetRegistersbyRangeGeneral: async ({ commit }, parametros) => {
            try {
                const { data } = await firebase_api.get("/Encuesta.json");
                const encuestas = Object.entries(data).map(([key, value]) => ({
                    id: key,
                    ...value,
                }));

                // Filtrar por fecha
                const encuestasFiltradas = encuestas.filter(
                    (encuesta) =>
                        encuesta.fecha >= parametros.finicial &&
                        encuesta.fecha <= parametros.ffinal
                );

                commit("setEncuestasAdmin", encuestasFiltradas);
                return encuestasFiltradas;
            } catch (error) {
                console.error("Error en Action_GetRegistersbyRangeGeneral:", error);
                throw error;
            }
        },

        GetRegistersbyRangeCerrados: async ({ commit }, parametros) => {
            try {
                const { data } = await firebase_api.get("/Encuesta.json");
                const encuestas = Object.entries(data).map(([key, value]) => ({
                    id: key,
                    ...value,
                }));

                // Filtrar por fecha y status_gest_enfermera === true
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

        /* ------------------------ fin admin informes------------------------------------ */


        GetRegistersbyRangeGeneralFact: async ({ commit }, parametros) => {

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
                        (
                            encuesta.asigfact === '' ||
                            encuesta.asigfact === null ||
                            encuesta.asigfact === undefined
                        )
                );
                commit("setEncuestasFact", encuestasFiltradas);
                return encuestasFiltradas;
            } catch (error) {
                console.error("Error en Action_GetRegistersbyRangeGeneral:", error);
                throw error;
            }
        },
        /* ------------------------------------------------------------------------------------- */
        GetRegistersbyRangeGeneralFactByID: async ({ commit }, parametros) => {

            try {
                const { data } = await firebase_api.get("/Encuesta.json");
                const encuestas = Object.entries(data).map(([key, value]) => ({
                    id: key,
                    ...value,
                }));

                const encuestasFiltradas = encuestas.filter(
                    (encuesta) =>

                    (
                        encuesta.numdoc === parametros.numdoc &&
                        encuesta.tipodoc === parametros.tipodoc &&
                        (
                            encuesta.asigfact === '' ||
                            encuesta.asigfact === null ||
                            encuesta.asigfact === undefined
                        )

                    )
                );
                commit("setEncuestasFact", encuestasFiltradas);
                return encuestasFiltradas;
            } catch (error) {
                console.error("Error en Action_GetRegistersbyRangeGeneral:", error);
                throw error;
            }
        },


        GetRegistersbyRangeGeneralFactAprov: async ({ commit }, iduser) => {
            try {
                const { data } = await firebase_api.get("/Encuesta.json");
                const encuestas = Object.entries(data).map(([key, value]) => ({
                    id: key,
                    ...value,
                }));

                // Filtrar por fecha y que asigfact sea true
                const encuestasFiltradas = encuestas.filter(
                    (encuesta) =>
                        encuesta.asigfact === iduser &&
                        encuesta.status_facturacion === false
                );
                commit("setEncuestasFactAprov", encuestasFiltradas);
                return encuestasFiltradas;
            } catch (error) {
                console.error("Error en Action_GetRegistersbyRangeGeneralFactAprov:", error);
                throw error;
            }
        },




        GetAllRegistersbyRangeAndProf: async ({ commit }, parametros) => {
            try {
                const { data } = await firebase_api.get("/Encuesta.json");
                const encuestas = Object.entries(data).map(([key, value]) => ({
                    id: key,
                    ...value,
                }));

                // Filtrar por fecha y profesional
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
        /* ------------------------------------------------------------------------------------- */
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

        getAllCups: async ({ commit }) => {
            try {
                const { data } = await firebase_api.get("/cups.json");
                const cups = Object.entries(data).map(([key, value]) => ({
                    id: key,
                    ...value,
                }));
                commit("setCups", cups);
                return cups;
            } catch (error) {
                console.error("Error en Action_getAllCups:", error);
                throw error;
            }
        },

        getAllRegisters: async ({ commit }, idUsuario) => {
            try {
                const { data } = await firebase_api.get("/Encuesta.json");
                const encuestas = Object.entries(data).map(([key, value]) => ({
                    id: key,
                    ...value,
                }));

                // Filtrar por el idUsuario recibido como parámetro
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

        getAllRegistersByFecha: async ({ commit }, { idUsuario, fecha }) => {
            console.log("datos que entran", idUsuario, fecha);
            try {
                const { data } = await firebase_api.get("/Encuesta.json");
                const encuestas = Object.entries(data).map(([key, value]) => ({
                    id: key,
                    ...value,
                }));

                // Filtrar por idEncuestador y fecha recibidos como parámetros
                const encuestasFiltradas = encuestas.filter(
                    (encuesta) =>
                        encuesta.idEncuestador === idUsuario && encuesta.fecha === fecha // Verifica que el formato de fecha coincida
                );

                commit("setEncuestasToday", encuestasFiltradas);
                return encuestasFiltradas;
            } catch (error) {
                console.error("Error en Action_setEncuestasToday:", error);
                throw error;
            }
        },
        /* ------------------------------ */
        getAllByPacientesID: async ({ commit }, { tipodoc, numdoc }) => {
            console.log("datos que entran", tipodoc, numdoc);
            try {
                const { data } = await firebase_api.get("/Encuesta.json");
                const consultaUsuarios = Object.entries(data).map(([key, value]) => ({
                    id: key,
                    ...value,
                }));

                // Filtrar por idEncuestador y fecha recibidos como parámetros
                const datospaciente = consultaUsuarios.filter(
                    (encuesta) =>
                        encuesta.tipodoc === tipodoc && encuesta.numdoc === numdoc
                );

                commit("setDatosPaciente", datospaciente);
                return datospaciente;
            } catch (error) {
                console.error("Error en Action_setDatosPPaciente:", error);
                throw error;
            }
        },

        /* ---------------------------------- */

        // Encuestas finalizadas en el diarias
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
                        encuesta.fechavisita === fecha // Verifica que el formato de fecha coincida
                );

                commit("setEncuestasToday", encuestasFiltradas);
                return encuestasFiltradas;
            } catch (error) {
                console.error("Error en Action_setEncuestasToday:", error);
                throw error;
            }
        },





        getAllMedicosbyGrupo: async ({ commit }, { grupo }) => {
            console.log("datos que entran en data2", grupo);
            try {
                // Crea la consulta para filtrar por grupo e incluir solo médicos
                const q = query(
                    collection(db, "users"),
                    where("grupo", "==", grupo),
                    where("cargo", "==", "Medico")
                );

                // Ejecuta la consulta
                const querySnapshot = await getDocs(q);

                // Mapea los documentos encontrados
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

        getAllEnfermerosbyGrupo: async ({ commit }, { grupo }) => {
            console.log("datos que entran en data3", grupo);
            try {
                // Crea la consulta para filtrar por grupo e incluir solo médicos
                const q = query(
                    collection(db, "users"),
                    where("grupo", "==", grupo),
                    where("cargo", "==", "Enfermero")
                );

                // Ejecuta la consulta
                const querySnapshot = await getDocs(q);

                // Mapea los documentos encontrados
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




        getAllRegistersByFechaStatus: async ({ commit }, { idUsuario }) => {
            console.log("parametro de consulta  abiertas aux", idUsuario);
            try {
                const { data } = await firebase_api.get("/Encuesta.json");
                const encuestas = Object.entries(data).filter(([_, value]) =>
                    value.idEncuestador === idUsuario && value.status_gest_aux === false
                ).map(([key, value]) => ({
                    id: key,
                    ...value,
                }));

                // Filtrar por idEncuestador y visita = false
                const encuestasFiltradas = encuestas.filter(
                    (encuesta) =>
                        encuesta.idEncuestador === idUsuario &&
                        encuesta.status_visita === false
                );
                const cantidad = encuestasFiltradas.length;
                commit("setEncuestas", encuestasFiltradas);
                commit("setcantEncuestas", cantidad);
                return encuestasFiltradas;
            } catch (error) {
                console.error("Error en getAllRegistersByFechaStatus:", error);
                throw error;
            }
        },



        getAllRegistersByIduserProf: async ({ commit }, { idUsuario }) => {
            console.log("datos que entran medico", idUsuario);
            try {
                const { data } = await firebase_api.get("/Encuesta.json");
                if (!data) {
                    commit("setcantEncuestas", 0);
                    return 0;
                }

                const encuestas = Object.entries(data).filter(([_, value]) =>
                    value.idMedicoAtiende === idUsuario && value.status_gest_medica === false
                ).map(([key, value]) => ({
                    id: key,
                    ...value,
                }));
                // Filtrar por idMedicoAtiende

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



        getAllRegistersByIduserEnfer: async ({ commit }, { idUsuario }) => {
            console.log("datos que entran medico", idUsuario);
            try {
                const { data } = await firebase_api.get("/Encuesta.json");
                if (!data) {
                    commit("setcantEncuestas", 0);
                    return 0;
                }
                /* aqui esta el problema */
                const encuestas = Object.entries(data).filter(([_, value]) =>
                    value.idEnfermeroAtiende === idUsuario && value.status_gest_enfermera === false
                ).map(([key, value]) => ({
                    id: key,
                    ...value,
                }));
                // Filtrar por idEnfermeroAtiende

                const encuestasFiltradas = encuestas.filter(
                    (encuesta) =>
                        encuesta.idEnfermeroAtiende === idUsuario &&
                        encuesta.status_gest_enfermera === false &&
                        encuesta.status_gest_medica === true &&
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


        /*  consulta auxiliar */
        GetAllRegistersbyRangeAux: async ({ commit }, rango) => {
            const { fechaInicio, fechaFin, idempleado, cargo } = rango;
            console.log("data que entra xxx", fechaFin, fechaInicio, idempleado, cargo);
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

                    // Filtrar rango de fechas
                    if (!(fecha >= fechaInicio && fecha <= fechaFin)) return false;

                    // Filtrar por idempleado si se proporcionó
                    if (idempleado && encuesta.idEncuestador !== idempleado) return false;

                    // Filtrar por cargo si se proporcionó
                    /*   if (cargo && encuesta.status_gest_aux !== true) return false; */




                    return true; // Si pasa todos los filtros, incluir
                });

                commit("setEncuestasfiltradas", encuestasFiltradas);
                return encuestasFiltradas;
            } catch (error) {
                console.error("Error en GetAllRegistersbyRange:", error);
                throw error;
            }
        },
        /* consulta medico */
        GetAllRegistersbyRangeMed: async ({ commit }, rango) => {
            const { fechaInicio, fechaFin, idempleado, cargo } = rango;
            //  console.log("data que entra xxx", fechaFin, fechaInicio, idempleado, cargo);
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

                    // Filtrar rango de fechas
                    if (!(fecha >= fechaInicio && fecha <= fechaFin)) return false;

                    // Filtrar por idempleado si se proporcionó
                    if (idempleado && encuesta.idMedicoAtiende !== idempleado) return false;
                    if (cargo && encuesta.status_gest_medica !== true) return false;
                    if (cargo && encuesta.status_gest_enfermera !== true) return false;

                    // Agregar actividadesRealizadas solo con las que coincidan con el cargo
                    if (encuesta.tipoActividad && typeof encuesta.tipoActividad === 'object') {
                        encuesta.actividadesRealizadas = Object.values(encuesta.tipoActividad).filter(act => {
                            return act.Profesional && act.Profesional.includes(cargo);
                        });
                    } else {
                        encuesta.actividadesRealizadas = [];
                    }

                    return true; // Si pasa todos los filtros, incluir
                });

                commit("setEncuestasfiltradas", encuestasFiltradas);
                return encuestasFiltradas;
            } catch (error) {
                console.error("Error en GetAllRegistersbyRange:", error);
                throw error;
            }
        },
        /* consulta enfermero */
        GetAllRegistersbyRangeEnf: async ({ commit }, rango) => {
            const { fechaInicio, fechaFin, idempleado, cargo } = rango;
            console.log("data que entra xxx", fechaFin, fechaInicio, idempleado, cargo);
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

                    // Filtrar rango de fechas
                    if (!(fecha >= fechaInicio && fecha <= fechaFin)) return false;

                    // Filtrar por idempleado si se proporcionó
                    if (idempleado && encuesta.idEnfermeroAtiende !== idempleado) return false;

                    // Filtrar por cargo si se proporcionó (status)
                    if (cargo && encuesta.status_gest_medica !== true) return false;
                    if (cargo && encuesta.status_gest_aux !== true) return false;
                    if (cargo && encuesta.status_gest_enfermera !== true) return false;

                    // Filtro adicional: tipoActividad debe incluir al menos un objeto con profesional que contenga el cargo


                    return true; // Si pasa todos los filtros, incluir
                });

                commit("setEncuestasfiltradas", encuestasFiltradas);
                return encuestasFiltradas;
            } catch (error) {
                console.error("Error en GetAllRegistersbyRange:", error);
                throw error;
            }
        },




        /*  */
        getEncuestaById: async ({ commit }, idEncuesta) => {
            try {
                const { data } = await firebase_api.get(`/Encuesta/${idEncuesta}.json`);
                commit("setEncuesta", data);
                return data;
            } catch (error) {
                console.error("Error en getEncuestaById:", error);
                throw error;
            }
        },

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

        getdataips: async ({ commit }, id) => {
            try {
                const { data } = await firebase_api.get(`/ips/${id}.json`);
                if (data && Object.keys(data).length > 0) {
                    commit("setdatosips", data);
                } else {
                    // No sobrescribas si no hay datos válidos
                }
                console.log("getdataips:", data);
            } catch (error) {
                console.error("Error en Action_getdataips:", error);
                throw error;
            }
        },

        /* agendamiento listado de agendas grupo*/
        getListAgendas: async ({ commit }, fecha) => {
            console.log("consultando agendas desde:", fecha);
            try {
                // La fecha debe ir entre comillas para la consulta REST
                const fechaQuery = `"${fecha}"`;
                const url = `/agendas.json?orderBy="fecha"&startAt=${fechaQuery}`;

                const { data } = await firebase_api.get(url);

                // Convertir resultado a arreglo
                const agendas = data
                    ? Object.entries(data).map(([key, value]) => ({
                        id: key,
                        ...value,
                    }))
                    : [];

                commit("setAgendas", agendas);
                return agendas;
            } catch (error) {
                console.error("Error en getListagendas:", error);
                throw error;
            }
        },
        //metodo para obtener agendas por id de toma de muestras
        getAgendasTomaLab: async ({ commit }, dataidlab) => {
            console.log("datos que entran xxx", dataidlab);
            try {
                const { data } = await firebase_api.get("/agendas.json");
                const encuestas = Object.entries(data).map(([key, value]) => ({
                    id: key,
                    ...value,
                }));

                // Filtrar registros por el id recibido
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
        getAgendasTomaLabById: async ({ commit }, { id }) => {
            console.log("datos que entran", id);
            try {
                const { data } = await firebase_api.get("/agendas.json");
                const encuestas = Object.entries(data).map(([key, value]) => ({
                    id: key,
                    ...value,
                }));

                // Filtrar registros por el id recibido
                const encuestasFiltradas = encuestas.filter(
                    (encuesta) => encuesta.id === id // ✅ usar el parámetro correcto
                );

                commit("setEncuestaslabbyId", encuestasFiltradas);
                return encuestasFiltradas;
            } catch (error) {
                console.error("Error en Action_setEncuestasToday:", error);
                throw error;
            }
        },

        getAgendasVisitaById: async ({ commit }, { id }) => {
            console.log("datos que entran", id);
            try {
                const { data } = await firebase_api.get("/agendas.json");
                const encuestas = Object.entries(data).map(([key, value]) => ({
                    id: key,
                    ...value,
                }));

                // Filtrar registros por el id recibido
                const encuestasFiltradas = encuestas.filter(
                    (encuesta) => encuesta.id === id // ✅ usar el parámetro correcto
                );

                commit("setEncuestasvisitaById", encuestasFiltradas);
                return encuestasFiltradas;
            } catch (error) {
                console.error("Error en Action_setEncuestasToday:", error);
                throw error;
            }
        },
        /* ---------------------------------------DELETE------------------------------------- */
        eliminarAgenda: async ({ commit }, { indice, encuestaID, lista }) => {
            console.log("Eliminando agenda con índice:", indice, "y encuestaID:", encuestaID);

            // Validar que los parámetros no sean nulos ni indefinidos ni vacíos
            if (indice === undefined || indice === null || indice === '') {
                throw new Error("Índice inválido para eliminar");
            }
            if (!encuestaID) {
                throw new Error("encuestaID inválido para eliminar");
            }

            try {
                await firebase_api.delete(`/agendas/${encuestaID}/${lista}/${indice}.json`);
                console.log("Registro eliminado correctamente");

                // Si tienes mutation para actualizar el estado local, descomenta y ajusta según tu store
                // commit('eliminarTomaDeMuestraLocal', { encuestaID, indice });

                return true;
            } catch (error) {
                console.error("Error en Action eliminarAgenda:", error);
                throw error;
            }
        },

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

        deleteComunaBarrio: async ({ commit }, id) => {
            try {
                if (!id) throw new Error("ID inválido para eliminar");
                const { data } = await firebase_api.delete(
                    `/comunasybarrios/${id}.json`
                );
                return data;
            } catch (error) {
                console.error("Error en Action deleteComunaBarrio:", error);
                throw error;
            }
        },
        deleteEps: async ({ commit }, id) => {
            try {
                if (!id) throw new Error("ID inválido para eliminar");
                const { data } = await firebase_api.delete(`/eps/${id}.json`);
                return data;
            } catch (error) {
                console.error("Error en Action deleteComunaBarrio:", error);
                throw error;
            }
        },
        deleteUser: async ({ commit }, id) => {
            try {
                const { data } = await firebase_api.delete(`/usuarios/${id}.json`);
                return data;
            } catch (error) {
                console.error("Error en Action_deleteUser:", error);
                throw error;
            }
        },

        removeRegEnc: async ({ commit }, id) => {
            try {
                const { data } = await firebase_api.delete(`/Encuesta/${id}.json`);
                return data;
            } catch (error) {
                console.error("Error en Action_removeRegEnc:", error);
                throw error;
            }
        },


        deleteCUPS: async ({ commit }, { idEncuesta, idActividad, idCup, rol }) => {
            /* console.log("parametros para eliminar", idEncuesta,"/", idActividad,"/", idCup ,"/", rol); */
            try {
                if (!idEncuesta || !idActividad) throw new Error("ID inválido para eliminar");
                const { data } = await firebase_api.delete(`/Encuesta/${idEncuesta}/tipoActividad/${idActividad}/cups/${rol}/cups/${idCup}.json`);
                return data;
            } catch (error) {
                console.error("Error en Action deleteCUPS:", error);
                throw error;
            }
        },

        /* ----------------------------------------UPDATE------------------------------------- */

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
        login({ commit }, { token, uid }) {
            commit("setToken", token);
            commit("setUid", uid);
            localStorage.setItem('token', token);
            localStorage.setItem('uid', uid);
        },

        async userLogout({ commit }) {
            return auth
                .signOut() // Usa la instancia importada[4][5]
                .then(() => {
                    commit("CLEAR_ALL_STATE");
                    localStorage.clear();
                    sessionStorage.clear();
                    commit("clearAuth");
                    commit("clearUserData");
                    router.push("/login");
                })
                .catch((error) => {
                    console.error("Logout error:", error);
                });
        },
        async fetchUserDataByUid({ commit }, uid) {
            try {
                const docRef = doc(db, "users", uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    commit("setUserData", userData);
                    localStorage.setItem('userData', JSON.stringify(userData));
                } else {
                    console.log("No existe documento para este UID");
                    commit("clearUserData");
                    localStorage.removeItem('userData');
                }
            } catch (error) {
                console.error("Error al obtener datos de Firestore:", error);
                commit("clearUserData");
                localStorage.removeItem('userData');
            }
        },

        /* ----------------------------------------CERRAR ENCUESTA------------------------------------- */


        cerrarEncuesta: async ({ commit }, { id, cargo, fecha = Date.now() }) => {
            // console.log("Objeto fecha:", fecha, "ID Encuesta:", id, "Cargo:", cargo);
            let varStatus = '';
            let dateStatus = '';
            let cargoTexto = '';

            if (cargo === "Enfermero") {
                varStatus = "status_gest_enfermera";
                dateStatus = "fechagestEnfermera";
                cargoTexto = "enfermera";
            } else if (cargo === "Medico") {
                varStatus = "status_gest_medica";
                dateStatus = "fechagestMedica";
                cargoTexto = "médico";
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
            } catch (error) {
                console.error("Error al cerrar encuesta:", error);
            }
        },
    },
    mutations: {
        setUsuarios(state, usuarios) {
            state.usuarios = usuarios;
        },
        setEncuestas(state, encuestas) {
            state.encuestas = encuestas;
        },
        setComunasBarrios(state, comunasBarrios) {
            state.comunasBarrios = comunasBarrios;
        },
        setEps(state, eps) {
            state.epss = eps;
        },
        setdatosips(state, datosips) {
            state.dataips = datosips;
        },
        setEncuestasfiltradas(state, encuestasf) {
            state.encuestasFiltradas = encuestasf;
        },
        setAgendas(state, agendas) {
            state.agendas = agendas;
        },
        setToken(state, token) {
            state.token = token;
            if (token) {
                localStorage.setItem('token', token);
            } else {
                localStorage.removeItem('token');
            }
        },
        setUid(state, uid) {
            state.uid = uid;
            if (uid) {
                localStorage.setItem('uid', uid);
            } else {
                localStorage.removeItem('uid');
            }
        },
        clearAuth(state) {
            state.token = null;
            state.uid = null;
            localStorage.removeItem('token');
            localStorage.removeItem('uid');
        },
        setUserData(state, data) {
            state.userData = data;
            if (data) {
                localStorage.setItem('userData', JSON.stringify(data));
            } else {
                localStorage.removeItem('userData');
            }
        },
        clearUserData(state) {
            state.userData = {};
            localStorage.removeItem('userData');
        },
        CLEAR_ALL_STATE(state) {
            state.accessToken = null;
            state.userData = {};
        },
        setcantEncuestas(state, cantidad) {
            state.cantEncuestas = cantidad;
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
            if (encuesta && typeof encuesta === 'object' && Object.keys(encuesta).length > 0) {
                state.InfoEncuestasById = [encuesta];
            } else {
                state.InfoEncuestasById = [];
            }
        },
        setCups(state, cups) {
            state.cups = cups;
        },
        setCupsbyActividad(state, cups) {
            state.cupsbyActividad = cups;
        },
        setMedicosByGrupo(state, medicos) {
            state.medicosByGrupo = medicos;
        },
        setEnfermerosByGrupo(state, enfermeros) {
            state.enfermerosByGrupo = enfermeros;
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
        setDatosPaciente(state, datos) {
            state.datosPaciente = datos;
        },
    },
    getters: {
        getUserData: (state) => state.userData,
        getAllEpss: (state) => state.epss,
        getInfoEncuestasById: (state) => state.InfoEncuestasById,
    },
});
