// Acción auxiliar para traer todas las encuestas crudas
export default async function getAllEncuestasRaw() {
  try {
    const { data } = await require('@/api/ApiFirebase').default.get('/Encuesta.json');
    if (!data) return [];
    return Object.entries(data).map(([key, value]) => ({ id: key, ...value }));
  } catch (error) {
    return [];
  }
}