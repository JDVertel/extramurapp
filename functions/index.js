const { initializeApp } = require("firebase-admin/app");
const { getDatabase } = require("firebase-admin/database");
const functions = require("firebase-functions");

const ARCHIVE_JOBS_PATH = "ArchivoProcesos";
const ARCHIVE_BACKUP_PATH = "ArchivoPacientesRespaldo";

initializeApp();

const db = getDatabase();

function safeObject(value) {
	return value && typeof value === "object" ? value : {};
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

function getEncuestaArchiveTimestamp(encuesta) {
	return getTimestampFromValue(
		encuesta?.FechaFacturacion ||
		encuesta?.fechagestEnfermera ||
		encuesta?.fechagestMedica ||
		encuesta?.fecha
	);
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
		!Object.prototype.hasOwnProperty.call(value, "actividadId") &&
		!Object.prototype.hasOwnProperty.call(value, "idActividad") &&
		!Object.prototype.hasOwnProperty.call(value, "DescripcionCUP") &&
		!Object.prototype.hasOwnProperty.call(value, "codigo")
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
			});
		});
	});

	return { seguimiento, actividades: actividadesRows };
}

function createFacturadosTableRows(encuestaId, rows, archivedAt, job) {
	return rows.reduce((acc, row, index) => {
		const key = `${encuestaId}_${String(index).padStart(4, "0")}`;
		acc[key] = {
			...row,
			idEncuesta: encuestaId,
			archivedAt,
			jobId: job?.jobId || "",
			archivedBy: job?.requestedBy?.documento || job?.requestedBy?.uid || "",
		};
		return acc;
	}, {});
}

async function updateJob(jobId, payload) {
	await db.ref(`${ARCHIVE_JOBS_PATH}/${jobId}`).update({
		...payload,
		updatedAt: new Date().toISOString(),
	});
}

exports.processFacturacionArchiveJob = functions.database
	.ref(`/${ARCHIVE_JOBS_PATH}/{jobId}`)
	.onCreate(async (snapshot, context) => {
		const jobId = context.params.jobId;
		const job = snapshot.val() || {};
		const requestedCount = Number(job.batchSize || 0);

		if (!Number.isFinite(requestedCount) || requestedCount <= 0) {
			await updateJob(jobId, {
				status: "error",
				message: "El lote solicitado es invalido.",
				processedCount: 0,
				remainingCount: 0,
			});
			return null;
		}

		try {
			await updateJob(jobId, {
				status: "running",
				message: "Consultando encuestas facturadas...",
				processedCount: 0,
				errorCount: 0,
				remainingCount: 0,
				requestedCount,
				startedAt: new Date().toISOString(),
			});

			const [encuestasSnap, actividadesExtraSnap, cupsSnap] = await Promise.all([
				db.ref("Encuesta").get(),
				db.ref("actividadesExtra").get(),
				db.ref("cups").get(),
			]);

			const encuestas = safeObject(encuestasSnap.val());
			const actividadesExtraMap = mapByKey(actividadesExtraSnap.val(), "key", "id");
			const cupsMap = Object.entries(safeObject(cupsSnap.val())).reduce((acc, [id, item]) => {
				if (item && typeof item === "object") {
					acc[String(id)] = item.DescripcionCUP || item.nombre || item.codigo || String(id);
				}
				return acc;
			}, {});

			const elegibles = Object.entries(encuestas)
				.filter(([, encuesta]) => encuesta && encuesta.status_facturacion === true)
				.sort((a, b) => {
					const fechaA = getEncuestaArchiveTimestamp(a[1]);
					const fechaB = getEncuestaArchiveTimestamp(b[1]);
					if (fechaA !== fechaB) {
						return fechaA - fechaB;
					}

					return String(a[0]).localeCompare(String(b[0]));
				});

			const seleccionados = elegibles.slice(0, requestedCount);

			await updateJob(jobId, {
				totalEligible: elegibles.length,
				totalSelected: seleccionados.length,
				remainingCount: seleccionados.length,
				message: seleccionados.length
					? "Procesando encuestas del lote..."
					: "No hay encuestas facturadas pendientes por archivar.",
			});

			if (!seleccionados.length) {
				await updateJob(jobId, {
					status: "completed",
					finishedAt: new Date().toISOString(),
				});
				return null;
			}

			let processedCount = 0;
			let errorCount = 0;
			const errors = [];

			for (const [encuestaId, encuestaValue] of seleccionados) {
				try {
					const archiveRef = db.ref(`${ARCHIVE_BACKUP_PATH}/${encuestaId}`);
					const existingArchive = await archiveRef.get();

					if (existingArchive.exists()) {
						await db.ref().update({
							[`Encuesta/${encuestaId}`]: null,
							[`Actividades/${encuestaId}`]: null,
							[`Asignaciones/${encuestaId}`]: null,
						});
					} else {
						const [actividadesSnap, asignacionesSnap] = await Promise.all([
							db.ref(`Actividades/${encuestaId}`).get(),
							db.ref(`Asignaciones/${encuestaId}`).get(),
						]);

						const encuesta = {
							id: encuestaId,
							idEncuesta: encuestaId,
							...safeObject(encuestaValue),
						};
						const actividades = safeObject(actividadesSnap.val());
						const asignaciones = safeObject(asignacionesSnap.val());
						const actividadesNormalizadas = normalizeActividades(actividades, actividadesExtraMap);
						const asignacionesNormalizadas = normalizeAsignaciones(asignaciones);
						const reportes = buildReportRows(
							encuesta,
							actividadesNormalizadas,
							asignacionesNormalizadas,
							cupsMap
						);
						const archivedAt = new Date().toISOString();
						const facturadosRows = createFacturadosTableRows(encuestaId, reportes.seguimiento, archivedAt, {
							jobId,
							requestedBy: job.requestedBy || {},
						});

						const facturadores = Array.from(
							new Set(
								asignacionesNormalizadas
									.map((item) => String(item?.FactProf || "").trim())
									.filter(Boolean)
							)
						);

						await db.ref().update({
							...Object.entries(facturadosRows).reduce((acc, [rowId, rowValue]) => {
								acc[`Facturados/${rowId}`] = rowValue;
								return acc;
							}, {}),
							[`${ARCHIVE_BACKUP_PATH}/${encuestaId}`]: {
								idEncuesta: encuestaId,
								encuesta,
								actividades,
								asignaciones,
								reportes,
								metadata: {
									archivedAt,
									archivedBy: job.requestedBy || {},
									jobId,
									totalActividades: actividadesNormalizadas.length,
									totalAsignaciones: asignacionesNormalizadas.length,
									totalFacturadas: asignacionesNormalizadas.filter((item) => item?.facturado === true).length,
									facturadores,
									facturadosRowIds: Object.keys(facturadosRows),
								},
							},
							[`Encuesta/${encuestaId}`]: null,
							[`Actividades/${encuestaId}`]: null,
							[`Asignaciones/${encuestaId}`]: null,
						});
					}

					processedCount += 1;
					await updateJob(jobId, {
						processedCount,
						remainingCount: Math.max(seleccionados.length - processedCount, 0),
						message: `Archivados ${processedCount} de ${seleccionados.length} pacientes del lote.`,
						currentEncuestaId: encuestaId,
					});
				} catch (error) {
					errorCount += 1;
					errors.push({
						encuestaId,
						message: error?.message || String(error),
					});
					await updateJob(jobId, {
						errorCount,
						message: `Se presento un error procesando la encuesta ${encuestaId}.`,
						lastError: error?.message || String(error),
						errors,
					});
				}
			}

			await updateJob(jobId, {
				status: errorCount > 0 ? "completed_with_errors" : "completed",
				finishedAt: new Date().toISOString(),
				processedCount,
				remainingCount: Math.max(seleccionados.length - processedCount, 0),
				errorCount,
				errors,
				message: errorCount > 0
					? `Proceso finalizado con ${errorCount} error(es).`
					: "Proceso finalizado correctamente.",
			});
		} catch (error) {
			await updateJob(jobId, {
				status: "error",
				message: error?.message || "Fallo inesperado procesando el archivo de facturacion.",
				lastError: error?.stack || error?.message || String(error),
				finishedAt: new Date().toISOString(),
			});
		}

		return null;
	});
