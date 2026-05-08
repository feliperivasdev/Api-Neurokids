require('dotenv').config();
const db = require('./models');
(async () => {
  try {
    await db.sequelize.authenticate();
    console.log('DB connected');
    const count = await db.progreso_actividades_model.count();
    console.log('progreso_actividades count:', count);
    const sample = await db.progreso_actividades_model.findOne({
      include: [{ model: db.actividades_model, as: 'actividad', attributes: ['id','nombre','tipo_actividad_id'] }],
    });
    if (!sample) {
      console.log('sample progress row: none');
    } else {
      console.log('sample progress row:', {
        id: sample.id,
        estudiante_id: sample.estudiante_id,
        actividad_id: sample.actividad_id,
        completado: sample.completado,
        ultima_interaccion: sample.ultima_interaccion,
        tipo_actividad_id: sample.actividad?.tipo_actividad_id,
        actividad_nombre: sample.actividad?.nombre
      });
    }
    const lecturas = await db.progreso_actividades_model.count({
      include: [{ model: db.actividades_model, as: 'actividad', where: { tipo_actividad_id: 1 }, required: true }]
    });
    const juegos = await db.progreso_actividades_model.count({
      include: [{ model: db.actividades_model, as: 'actividad', where: { tipo_actividad_id: 2 }, required: true }]
    });
    console.log('lecturas rows:', lecturas, 'juegos rows:', juegos);
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await db.sequelize.close();
  }
})();
