import axios from 'axios';

const firebase_api2 = axios.create({
    baseURL: 'https://extramuraleseb-default-rtdb.firebaseio.com/', // importante la barra final
    headers: {
        'Content-Type': 'application/json'
    }
});

const CONSUMO_LOCAL_KEY = 'consumo_pendiente_v1';
const FLUSH_INTERVAL_MS = 60000;
let flushTimer = null;

function getTodayKey() {
    return new Date().toISOString().slice(0, 10);
}

function safeJsonLength(value) {
    try {
        return JSON.stringify(value || {}).length;
    } catch (_) {
        return 0;
    }
}

function sanitizePath(url = '') {
    const clean = String(url || '').split('?')[0];
    return clean || '/';
}

function getCurrentUserInfo() {
    const uid = localStorage.getItem('uid') || 'anon';
    let nombre = 'Sin nombre';
    let cargo = 'Sin cargo';
    try {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        nombre = userData?.nombre || nombre;
        cargo = userData?.cargo || cargo;
    } catch (_) {
        // No-op
    }
    return { uid, nombre, cargo };
}

function loadPendingMetric() {
    try {
        const raw = localStorage.getItem(CONSUMO_LOCAL_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (_) {
        return null;
    }
}

function createEmptyMetric() {
    const { uid, nombre, cargo } = getCurrentUserInfo();
    return {
        date: getTodayKey(),
        uid,
        userName: nombre,
        cargo,
        totalRequests: 0,
        totalReads: 0,
        totalWrites: 0,
        totalErrors: 0,
        totalDurationMs: 0,
        totalResponseBytes: 0,
        updatedAt: new Date().toISOString(),
        endpoints: {}
    };
}

function ensurePendingMetric() {
    const existing = loadPendingMetric();
    const today = getTodayKey();
    if (!existing || existing.date !== today) {
        const fresh = createEmptyMetric();
        localStorage.setItem(CONSUMO_LOCAL_KEY, JSON.stringify(fresh));
        return fresh;
    }

    const { uid, nombre, cargo } = getCurrentUserInfo();
    existing.uid = uid;
    existing.userName = nombre;
    existing.cargo = cargo;
    return existing;
}

function persistPendingMetric(metric) {
    metric.updatedAt = new Date().toISOString();
    localStorage.setItem(CONSUMO_LOCAL_KEY, JSON.stringify(metric));
}

function classifyMethod(method = '') {
    const m = String(method || '').toUpperCase();
    return m === 'GET' ? 'read' : 'write';
}

function trackRequestResult(config, status, durationMs, responseBytes, isError) {
    if (config?.metaSkipTracking) return;

    const metric = ensurePendingMetric();
    const method = String(config?.method || 'GET').toUpperCase();
    const path = sanitizePath(config?.url);
    const type = classifyMethod(method);

    if (!metric.endpoints[path]) {
        metric.endpoints[path] = {
            count: 0,
            reads: 0,
            writes: 0,
            errors: 0,
            totalDurationMs: 0,
            totalResponseBytes: 0,
            lastStatus: 0,
            lastMethod: method,
            updatedAt: new Date().toISOString()
        };
    }

    const endpoint = metric.endpoints[path];
    endpoint.count += 1;
    endpoint.lastMethod = method;
    endpoint.lastStatus = status || 0;
    endpoint.totalDurationMs += durationMs || 0;
    endpoint.totalResponseBytes += responseBytes || 0;
    endpoint.updatedAt = new Date().toISOString();

    metric.totalRequests += 1;
    metric.totalDurationMs += durationMs || 0;
    metric.totalResponseBytes += responseBytes || 0;

    if (type === 'read') {
        endpoint.reads += 1;
        metric.totalReads += 1;
    } else {
        endpoint.writes += 1;
        metric.totalWrites += 1;
    }

    if (isError) {
        endpoint.errors += 1;
        metric.totalErrors += 1;
    }

    persistPendingMetric(metric);
}

async function flushConsumptionMetric() {
    const metric = loadPendingMetric();
    if (!metric || !metric.uid || metric.uid === 'anon') return;

    try {
        await firebase_api2.put(
            `/consumo/diario/${metric.date}/usuarios/${metric.uid}.json`,
            {
                uid: metric.uid,
                userName: metric.userName,
                cargo: metric.cargo,
                totalRequests: metric.totalRequests,
                totalReads: metric.totalReads,
                totalWrites: metric.totalWrites,
                totalErrors: metric.totalErrors,
                totalDurationMs: metric.totalDurationMs,
                totalResponseBytes: metric.totalResponseBytes,
                endpoints: metric.endpoints,
                updatedAt: new Date().toISOString(),
            },
            { metaSkipTracking: true }
        );
    } catch (_) {
        // Si falla el envio, conservamos el estado local para siguiente intento.
    }
}

function scheduleFlush() {
    if (flushTimer) return;
    flushTimer = setTimeout(async () => {
        flushTimer = null;
        await flushConsumptionMetric();
    }, FLUSH_INTERVAL_MS);
}

if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        flushConsumptionMetric();
    });
}

// Interceptor para agregar el token a todas las peticiones
firebase_api2.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        // Agregar el token como parámetro auth en la URL
        config.params = config.params || {};
        config.params.auth = token;
    }
    config.metaStartTime = Date.now();
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Interceptor para manejar errores 401 (token expirado)
firebase_api2.interceptors.response.use(
    (response) => {
        const duration = Date.now() - (response?.config?.metaStartTime || Date.now());
        const bytes = safeJsonLength(response?.data);
        trackRequestResult(response?.config, response?.status || 200, duration, bytes, false);
        scheduleFlush();
        return response;
    },
    (error) => {
        const config = error?.config || {};
        const duration = Date.now() - (config.metaStartTime || Date.now());
        const bytes = safeJsonLength(error?.response?.data);
        const status = error?.response?.status || 0;
        trackRequestResult(config, status, duration, bytes, true);
        scheduleFlush();

        if (error.response && error.response.status === 401) {
            // Token expirado o inválido
            localStorage.removeItem('token');
            localStorage.removeItem('uid');
            
            // Redirigir al login
            window.location.href = '/login';
            
            return Promise.reject(new Error('Token expirado. Por favor inicia sesión nuevamente.'));
        }
        return Promise.reject(error);
    }
);

export default firebase_api2;
