/**
 * Sistema de caché inteligente con TTL (Time To Live)
 * Evita consultas innecesarias a Firebase Realtime Database
 * 
 * Uso:
 * - cacheManager.set('key', data) // Guardar en caché
 * - cacheManager.get('key') // Obtener del caché si es válido
 * - cacheManager.has('key') // Verificar si existe
 * - cacheManager.remove('key') // Eliminar una entrada
 * - cacheManager.clearAll() // Limpiar todo (al logout)
 * - cacheManager.getStats() // Ver estadísticas
 */

export class CacheManager {
  constructor(ttlMinutes = 120) {
    // Convertir minutos a milisegundos (default 2 horas)
    this.ttl = ttlMinutes * 60 * 1000;
    this.PREFIX = 'EXTRAMUR_CACHE_';
  }

  /**
   * Guardar datos en caché con timestamp
   * @param {string} key - Identificador único
   * @param {any} data - Datos a cachear
   */
  set(key, data) {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
        version: '1.0'
      };
      localStorage.setItem(
        this.PREFIX + key,
        JSON.stringify(cacheData)
      );
      console.log(
        `✅ [CACHÉ GUARDADO] ${key} - Tamaño: ${JSON.stringify(cacheData).length} bytes`
      );
    } catch (error) {
      console.error(`❌ Error guardando caché ${key}:`, error);
      // Si hay error de storage (quota excedida), no fallar, solo loguear
    }
  }

  /**
   * Obtener datos del caché si es válido (no expirado)
   * @param {string} key - Identificador único
   * @returns {any|null} - Datos si son válidos, null si no existen o expiraron
   */
  get(key) {
    try {
      const cached = localStorage.getItem(this.PREFIX + key);

      if (!cached) {
        return null;
      }

      const { data, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;
      const ageMinutes = Math.round(age / 60000);

      // Si expiró según TTL, limpiarlo y retornar null
      if (age > this.ttl) {
        console.log(
          `⏰ [CACHÉ EXPIRADO] ${key} - ${ageMinutes} minutos de antigüedad`
        );
        this.remove(key);
        return null;
      }

      console.log(`📦 [CACHÉ HIT] ${key} - ${ageMinutes} min de antigüedad`);
      return data;
    } catch (error) {
      console.error(`❌ Error obteniendo caché ${key}:`, error);
      this.remove(key);
      return null;
    }
  }

  /**
   * Verificar si existe una entrada en caché y es válida
   * @param {string} key - Identificador único
   * @returns {boolean}
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Limpiar una entrada específica del caché
   * @param {string} key - Identificador único
   */
  remove(key) {
    try {
      localStorage.removeItem(this.PREFIX + key);
      console.log(`🗑️  [CACHÉ REMOVIDO] ${key}`);
    } catch (error) {
      console.error(`❌ Error removiendo caché ${key}:`, error);
    }
  }

  /**
   * Limpiar TODO el caché (al logout)
   */
  clearAll() {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.PREFIX)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));

      console.log(
        `🗑️  [CACHÉ LIMPIO] ${keysToRemove.length} entradas eliminadas`
      );
    } catch (error) {
      console.error('❌ Error limpiando todo el caché:', error);
    }
  }

  /**
   * Obtener estadísticas del caché actual
   * @returns {object} - {itemCount, totalSize, items}
   */
  getStats() {
    let totalSize = 0;
    let itemCount = 0;
    const items = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.PREFIX)) {
        itemCount++;
        const value = localStorage.getItem(key);
        const size = value ? value.length : 0;
        totalSize += size;

        items.push({
          key: key.replace(this.PREFIX, ''),
          size: `${(size / 1024).toFixed(2)} KB`,
          sizeBytes: size
        });
      }
    }

    const stats = {
      itemCount,
      totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
      totalSizeBytes: totalSize,
      items: items.sort((a, b) => b.sizeBytes - a.sizeBytes)
    };

    console.table(stats);
    return stats;
  }
}

// Exportar instancia global configurada con 2 horas de TTL
export const cacheManager = new CacheManager(120);
