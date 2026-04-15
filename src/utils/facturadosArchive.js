import firebase_api from "@/api/ApiFirebase";

const ARCHIVE_BACKUP_PATH = "/ArchivoPacientesRespaldo.json";

function safeObject(value) {
  return value && typeof value === "object" ? value : {};
}

function mapByKey(data, keyField, fallbackField) {
  return Object.values(safeObject(data)).reduce((acc, item) => {
    if (!item || typeof item !== "object") return acc;

    const key = String(item[keyField] ?? item[fallbackField] ?? "").trim();
    if (key) {
      acc[key] = item.nombre || item.descripcion || item.DescripcionCUP || key;
    }
    return acc;
  }, {});
}

function getTimestampFromValue(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return Number.MAX_SAFE_INTEGER;

  const normalized = raw.includes(" ") ? raw.replace(" ", "T") : raw;
  const parsed = Date.parse(normalized);
  if (!Number.isNaN(parsed)) {
    return parsed;
  }

  const fallback = Date.parse(raw);
  return Number.isNaN(fallback) ? Number.MAX_SAFE_INTEGER : fallback;
}

export function getEncuestaArchiveDate(encuesta) {
  return String(
    encuesta?.FechaFacturacion ||
    encuesta?.fechagestEnfermera ||
    encuesta?.fechagestMedica ||
    encuesta?.fecha ||
    ""
  ).split(" ")[0];
}

export function getEncuestaArchiveTimestamp(encuesta) {
  return getTimestampFromValue(
    encuesta?.FechaFacturacion ||
    encuesta?.fechagestEnfermera ||
    encuesta?.fechagestMedica ||
    encuesta?.fecha
  );
}

export function getEligibleFacturadosByDate(encuestasRaw, { fechaInicio, fechaFin } = {}) {
  const inicio = String(fechaInicio || "").trim();
  const fin = String(fechaFin || "").trim();

  return Object.entries(safeObject(encuestasRaw))
    .map(([id, value]) => ({ id, ...safeObject(value) }))
    .filter((encuesta) => encuesta.status_facturacion === true)
    .filter((encuesta) => {
      const fecha = getEncuestaArchiveDate(encuesta);
      if (!inicio || !fin) return true;
      return !!fecha && fecha >= inicio && fecha <= fin;
    })
    .sort((a, b) => {
      const fechaA = getEncuestaArchiveTimestamp(a);
      const fechaB = getEncuestaArchiveTimestamp(b);
      if (fechaA !== fechaB) {
        return fechaA - fechaB;
      }
      return String(a.id).localeCompare(String(b.id));
    });
}

function normalizeActividades(actividadesNode, actividadesExtraMap) {
  const tipoActividad = safeObject(actividadesNode).tipoActividad;
  return Object.values(safeObject(tipoActividad))
    .filter((actividad) => actividad && typeof actividad === "object")
    .map((actividad) => {
      const key = String(actividad.key ?? actividad.id ?? "").trim();
      return {
        ...actividad,
        key,
        nombre: actividadesExtraMap[key] || actividad.nombre || actividad.descripcion || key || "Actividad",
      };
    });
}

function flattenNestedAssignments(cupsNode) {
  const values = Object.values(safeObject(cupsNode)).filter(Boolean);
  const nested = values.some((value) =>
    value &&
    typeof value === "object" &&
    !("actividadId" in value) &&
    !("idActividad" in value) &&
    !("DescripcionCUP" in value) &&
    !("codigo" in value)
  );

  if (!nested) {
    return values;
  }

  return values.flatMap((value) => Object.values(safeObject(value)).filter(Boolean));
}

function normalizeAsignaciones(asignacionesNode) {
  const cupsNode = safeObject(asignacionesNode).cups;
  if (!cupsNode || typeof cupsNode !== "object") {
    return [];
  }

  return flattenNestedAssignments(cupsNode).map((item) => ({ ...item }));
}

function buildBaseRow(encuesta) {
  return {
    convenio: encuesta.convenio || "",
    grupo: encuesta.grupo || "",
    paciente: `${encuesta.nombre1 || ""} ${encuesta.nombre2 || ""} ${encuesta.apellido1 || ""} ${encuesta.apellido2 || ""}`
      .replace(/\s+/g, " ")
      .trim(),
    sexo: encuesta.sexo || "",
    documento: `${encuesta.tipodoc || ""}-${encuesta.numdoc || ""}`.replace(/^-$/, ""),
    fechaNac: encuesta.fechaNac || "",
    eps: encuesta.eps || "",
    regimen: encuesta.regimen || "",
    direccion: encuesta.direccion || "",
    barrio: encuesta.barrioVeredacomuna?.barrio || "",
    comuna: encuesta.barrioVeredacomuna?.comuna || "",
    labVisit: `${encuesta.Agenda_tomademuestras?.cita_tomamuestras ? "Si" : "No"}/${encuesta.Agenda_Visitamedica?.cita_visitamedica ? "Si" : "No"}`,
    gestAux: encuesta.status_gest_aux ? encuesta.fechagestAuxiliar || "Si" : "No",
    gestEnfermera: encuesta.status_gest_enfermera ? encuesta.fechagestEnfermera || "Si" : "No",
    gestMedica: encuesta.status_gest_medica ? encuesta.fechagestMedica || "Si" : "No",
    fechaFacturacion: encuesta.FechaFacturacion || "",
    remision: encuesta.requiereRemision || "",
  };
}

function buildActivityBaseRow(encuesta) {
  return {
    convenio: encuesta.convenio || "",
    grupo: encuesta.grupo || "",
    fecha: encuesta.fecha || "",
    paciente: `${encuesta.nombre1 || ""} ${encuesta.nombre2 || ""} ${encuesta.apellido1 || ""} ${encuesta.apellido2 || ""}`
      .replace(/\s+/g, " ")
      .trim(),
    sexo: encuesta.sexo || "",
    documento: `${encuesta.tipodoc || ""}-${encuesta.numdoc || ""}`.replace(/^-$/, ""),
    eps: encuesta.eps || "",
    regimen: encuesta.regimen || "",
    direccion: encuesta.direccion || "",
    barrio: encuesta.barrioVeredacomuna?.barrio || "",
    comuna: encuesta.barrioVeredacomuna?.comuna || "",
    fechaNac: encuesta.fechaNac || "",
    labVisit: `${encuesta.Agenda_tomademuestras?.cita_tomamuestras ? "Si" : "No"}/${encuesta.Agenda_Visitamedica?.cita_visitamedica ? "Si" : "No"}`,
    gestAux: encuesta.status_gest_aux ? encuesta.fechagestAuxiliar || "Si" : "No",
    gestEnfermera: encuesta.status_gest_enfermera ? encuesta.fechagestEnfermera || "Si" : "No",
    gestMedica: encuesta.status_gest_medica ? encuesta.fechagestMedica || "Si" : "No",
    fechaFacturacion: encuesta.FechaFacturacion || "",
    riesgo: Array.isArray(encuesta.poblacionRiesgo) ? encuesta.poblacionRiesgo.join(", ") : encuesta.poblacionRiesgo || "",
    remision: encuesta.requiereRemision || "",
  };
}

function buildReportRows(encuesta, actividades, asignaciones, cupsMap) {
  const seguimiento = [];
  const actividadesRows = [];
  const baseSeguimiento = buildBaseRow(encuesta);
  const baseActividad = buildActivityBaseRow(encuesta);

  if (!actividades.length) {
    seguimiento.push({
      ...baseSeguimiento,
      rowKey: `${encuesta.id || encuesta.idEncuesta || "sin-id"}-sin-actividad`,
      actividad: "Sin actividades",
      procedimiento: "",
      cupsNombre: "",
      codigo: "",
      descripcionCUP: "",
      cantidad: "",
      detalle: "",
      grupoCUP: "",
      factura: "",
      homolog: "",
      profesional: "",
      rol: "",
      fechaFactCUP: "",
      facturado: "",
    });
    actividadesRows.push({
      ...baseActividad,
      rowKey: `${encuesta.id || encuesta.idEncuesta || "sin-id"}-sin-actividad`,
      actividad: "Sin actividades",
      profesional: "",
      rol: "",
      cupsNombre: "",
      codigo: "",
      descripcionCUP: "",
      cantidad: "",
      detalle: "",
      grupoCUP: "",
      factura: "",
      homolog: "",
      fechaFactCUP: "",
      facturado: "",
    });
    return { seguimiento, actividades: actividadesRows };
  }

  actividades.forEach((actividad) => {
    const idActividad = String(actividad.key || "");
    const cupsActividad = asignaciones.filter((asignacion) => {
      const actividadId = String(asignacion?.actividadId ?? asignacion?.idActividad ?? "");
      return actividadId && idActividad && actividadId === idActividad;
    });

    if (!cupsActividad.length) {
      seguimiento.push({
        ...baseSeguimiento,
        rowKey: `${encuesta.id || encuesta.idEncuesta || "sin-id"}-${idActividad}-sin-asignacion`,
        actividad: actividad.nombre || "Actividad",
        procedimiento: "Sin asignaciones",
        cupsNombre: "",
        codigo: "",
        descripcionCUP: "",
        cantidad: "",
        detalle: "",
        grupoCUP: "",
        factura: "",
        homolog: "",
        profesional: "",
        rol: "",
        fechaFactCUP: "",
        facturado: "",
      });
      actividadesRows.push({
        ...baseActividad,
        rowKey: `${encuesta.id || encuesta.idEncuesta || "sin-id"}-${idActividad}-sin-asignacion`,
        actividad: actividad.nombre || "Actividad",
        profesional: "",
        rol: "",
        cupsNombre: "",
        codigo: "",
        descripcionCUP: "",
        cantidad: "",
        detalle: "",
        grupoCUP: "",
        factura: "",
        homolog: "",
        fechaFactCUP: "",
        facturado: "",
      });
      return;
    }

    cupsActividad.forEach((cup, index) => {
      const cupId = String(cup?.cupsId ?? cup?.id ?? "");
      const cupsNombre = cupsMap[cupId] || cup?.cupsNombre || cup?.DescripcionCUP || cup?.codigo || "";
      seguimiento.push({
        ...baseSeguimiento,
        rowKey: `${encuesta.id || encuesta.idEncuesta || "sin-id"}-${idActividad}-${index}`,
        actividad: actividad.nombre || "Actividad",
        procedimiento: cupsNombre,
        cupsNombre,
        codigo: cup?.codigo || "",
        descripcionCUP: cup?.DescripcionCUP || "",
        cantidad: cup?.cantidad ?? "",
        detalle: cup?.detalle || "",
        grupoCUP: cup?.Grupo || "",
        factura: cup?.FactNum || "",
        homolog: cup?.Homolog || "",
        profesional: cup?.nombreProf || "",
        rol: cup?.key || "",
        fechaFactCUP: cup?.fechaFacturacion || "",
        facturado: cup?.facturado === true ? "Si" : cup?.facturado === false ? "No" : "",
      });
      actividadesRows.push({
        ...baseActividad,
        rowKey: `${encuesta.id || encuesta.idEncuesta || "sin-id"}-${idActividad}-${index}`,
        actividad: actividad.nombre || "Actividad",
        profesional: cup?.nombreProf || "",
        rol: cup?.key || "",
        cupsNombre,
        codigo: cup?.codigo || "",
        descripcionCUP: cup?.DescripcionCUP || "",
        cantidad: cup?.cantidad ?? "",
        detalle: cup?.detalle || "",
        grupoCUP: cup?.Grupo || "",
        factura: cup?.FactNum || "",
        homolog: cup?.Homolog || "",
        fechaFactCUP: cup?.fechaFacturacion || "",
        facturado: cup?.facturado === true ? "Si" : cup?.facturado === false ? "No" : "",
      });
    });
  });

  return { seguimiento, actividades: actividadesRows };
}

export function createFacturadosTableRows(encuestaId, rows, archivedAt, requestedBy = {}) {
  return rows.reduce((acc, row, index) => {
    const key = `${encuestaId}_${String(index).padStart(4, "0")}`;
    acc[key] = {
      ...row,
      idEncuesta: encuestaId,
      archivedAt,
      archivedBy: requestedBy?.documento || requestedBy?.uid || "",
    };
    return acc;
  }, {});
}

export function buildArchivePayload({ encuesta, actividadesRaw, asignacionesRaw, actividadesExtraRaw, cupsRaw, requestedBy }) {
  const actividadesExtraMap = mapByKey(actividadesExtraRaw, "key", "id");
  const cupsMap = Object.entries(safeObject(cupsRaw)).reduce((acc, [id, item]) => {
    if (item && typeof item === "object") {
      acc[String(id)] = item.DescripcionCUP || item.nombre || item.codigo || String(id);
    }
    return acc;
  }, {});

  const actividadesNormalizadas = normalizeActividades(actividadesRaw, actividadesExtraMap);
  const asignacionesNormalizadas = normalizeAsignaciones(asignacionesRaw);
  const reportes = buildReportRows(encuesta, actividadesNormalizadas, asignacionesNormalizadas, cupsMap);
  const archivedAt = new Date().toISOString();
  const facturadosRows = createFacturadosTableRows(encuesta.id, reportes.seguimiento, archivedAt, requestedBy);
  const facturadores = Array.from(new Set(
    asignacionesNormalizadas
      .map((item) => String(item?.FactProf || "").trim())
      .filter(Boolean)
  ));

  return {
    archivedAt,
    facturadosRows,
    backupRecord: {
      idEncuesta: encuesta.id,
      encuesta,
      actividades: safeObject(actividadesRaw),
      asignaciones: safeObject(asignacionesRaw),
      reportes,
      metadata: {
        archivedAt,
        archivedBy: requestedBy || {},
        totalActividades: actividadesNormalizadas.length,
        totalAsignaciones: asignacionesNormalizadas.length,
        totalFacturadas: asignacionesNormalizadas.filter((item) => item?.facturado === true).length,
        facturadores,
        facturadosRowIds: Object.keys(facturadosRows),
      },
    },
  };
}

function stripMetaEntries(raw) {
  return Object.fromEntries(
    Object.entries(safeObject(raw)).filter(([id]) => !String(id).startsWith("__"))
  );
}

export function normalizeFacturados(raw) {
  return Object.entries(stripMetaEntries(raw)).map(([id, value]) => ({
    id,
    ...safeObject(value),
  }));
}

export function archiveEntryToEncuesta(entry) {
  const encuesta = safeObject(entry?.encuesta);
  const id = String(entry?.idEncuesta || encuesta?.id || entry?.id || "").trim();
  return {
    ...encuesta,
    id,
    idEncuesta: id,
    __archived: true,
    __archivo: entry,
  };
}

export function mergeEncuestasWithArchive(liveEncuestas = [], archiveRaw = {}) {
  const merged = new Map();

  normalizeFacturados(archiveRaw).forEach((entry) => {
    const encuesta = archiveEntryToEncuesta(entry);
    if (encuesta.id) {
      merged.set(encuesta.id, encuesta);
    }
  });

  liveEncuestas.forEach((encuesta) => {
    const id = String(encuesta?.id || encuesta?.idEncuesta || "").trim();
    if (id) {
      merged.set(id, encuesta);
    }
  });

  return Array.from(merged.values());
}

function normalizeFlatFacturados(raw) {
  return Object.entries(stripMetaEntries(raw)).map(([id, value]) => ({
    id,
    ...safeObject(value),
  }));
}

export function getAssignmentBranch(encuesta, liveAssignmentBranch) {
  if (liveAssignmentBranch && typeof liveAssignmentBranch === "object") {
    return liveAssignmentBranch;
  }
  return safeObject(encuesta?.__archivo?.asignaciones);
}

export function extractActividadIdsFromAssignmentBranch(branch) {
  const cupsNode = safeObject(branch).cups;
  const cupsValues = Object.values(safeObject(cupsNode)).filter(Boolean);

  const nested = cupsValues.some((value) =>
    value &&
    typeof value === "object" &&
    !("actividadId" in value) &&
    !("idActividad" in value) &&
    !("DescripcionCUP" in value) &&
    !("codigo" in value)
  );

  const cups = nested
    ? cupsValues.flatMap((value) => Object.values(safeObject(value)).filter(Boolean))
    : cupsValues;

  return Array.from(new Set(
    cups
      .map((cup) => String(cup?.actividadId ?? cup?.idActividad ?? "").trim())
      .filter(Boolean)
  ));
}

function matchConvenio(encuesta, convenio) {
  const filtro = String(convenio || "").trim().toLowerCase();
  if (!filtro) return true;
  return String(encuesta?.convenio || "").trim().toLowerCase() === filtro;
}

function matchDateRange(tipo, encuesta, fechaInicio, fechaFin) {
  const inicio = String(fechaInicio || "").trim();
  const fin = String(fechaFin || "").trim();
  const fechaBase = tipo === "actividades"
    ? String(encuesta?.fecha || "")
    : String(encuesta?.fechagestEnfermera || encuesta?.FechaFacturacion || "");
  const fecha = fechaBase.split(" ")[0];

  if (!inicio || !fin) return true;
  return !!fecha && fecha >= inicio && fecha <= fin;
}

export function getArchiveRows(archiveRaw, { tipo, fechaInicio, fechaFin, convenio }) {
  return normalizeFacturados(archiveRaw)
    .filter((entry) => {
      const encuesta = safeObject(entry?.encuesta);
      return matchDateRange(tipo, encuesta, fechaInicio, fechaFin) && matchConvenio(encuesta, convenio);
    })
    .flatMap((entry) => {
      const reportes = safeObject(entry?.reportes);
      if (tipo !== "actividades") {
        return Array.isArray(reportes[tipo]) ? reportes[tipo] : [];
      }

      const actividades = Array.isArray(reportes.actividades) ? reportes.actividades : [];
      const seguimiento = Array.isArray(reportes.seguimiento) ? reportes.seguimiento : [];
      const seguimientoByKey = seguimiento.reduce((acc, row) => {
        const rowKey = String(row?.rowKey || "").trim();
        if (rowKey) {
          acc[rowKey] = row;
        }
        return acc;
      }, {});

      return actividades.map((row) => {
        const extra = seguimientoByKey[String(row?.rowKey || "").trim()] || {};
        return {
          ...row,
          grupoCUP: row?.grupoCUP || extra?.grupoCUP || "",
          factura: row?.factura || extra?.factura || "",
          homolog: row?.homolog || extra?.homolog || "",
          fechaFactCUP: row?.fechaFactCUP || extra?.fechaFactCUP || "",
          facturado: row?.facturado || extra?.facturado || "",
          fechaFacturacion: row?.fechaFacturacion || extra?.fechaFacturacion || "",
          fechaNac: row?.fechaNac || extra?.fechaNac || "",
          labVisit: row?.labVisit || extra?.labVisit || "",
          gestAux: row?.gestAux || extra?.gestAux || "",
          gestEnfermera: row?.gestEnfermera || extra?.gestEnfermera || "",
          gestMedica: row?.gestMedica || extra?.gestMedica || "",
        };
      });
    });
}

export async function fetchFacturadosRaw() {
  const { data } = await firebase_api.get(ARCHIVE_BACKUP_PATH);
  return stripMetaEntries(data);
}

export async function fetchFacturadosActivityMap() {
  const { data } = await firebase_api.get("/Facturados.json");
  const rows = normalizeFlatFacturados(data);

  return rows.reduce((acc, row) => {
    const idEncuesta = String(row?.idEncuesta || "").trim();
    const actividad = String(row?.actividad || "").trim();

    if (!idEncuesta || !actividad) {
      return acc;
    }

    if (!acc[idEncuesta]) {
      acc[idEncuesta] = [];
    }

    if (!acc[idEncuesta].includes(actividad)) {
      acc[idEncuesta].push(actividad);
    }

    return acc;
  }, {});
}

async function fetchFacturadosTableRows(filters) {
  const { data } = await firebase_api.get("/Facturados.json");
  const rows = normalizeFlatFacturados(data);
  const inicio = String(filters?.fechaInicio || "").trim();
  const fin = String(filters?.fechaFin || "").trim();
  const convenio = String(filters?.convenio || "").trim().toLowerCase();

  return rows.filter((row) => {
    const fechaBase = String(row?.fechaFacturacion || row?.gestEnfermera || row?.fechaFactCUP || "");
    const fecha = fechaBase.split(" ")[0];
    const coincideFecha = (!inicio || !fin) ? true : (!!fecha && fecha >= inicio && fecha <= fin);
    const coincideConvenio = !convenio || String(row?.convenio || "").trim().toLowerCase() === convenio;
    return coincideFecha && coincideConvenio;
  });
}

export async function fetchArchiveRows(filters) {
  if (filters?.tipo === "seguimiento") {
    return fetchFacturadosTableRows(filters);
  }

  const raw = await fetchFacturadosRaw();
  return getArchiveRows(raw, filters);
}