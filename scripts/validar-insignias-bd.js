/**
 * Revisa coherencia entre `insignias`, `criterios_insignias` y `actividades`.
 * Uso (desde la raíz del proyecto API): node scripts/validar-insignias-bd.js
 * Requiere `config/config.json` (o DATABASE_URL según tu entorno).
 */
'use strict';

const path = require('path');
const db = require(path.join(__dirname, '..', 'models'));

const TIPOS_VALIDOS = new Set([
  'completar_actividad',
  'actividad_completada',
  'primera_actividad_completada',
  'primera_actividad',
  'primer_juego',
  'primera_actividad_tipo_juego',
  'primera_lectura',
  'primer_lectura',
  'primera_actividad_tipo_lectura',
  'completar_actividades',
  'cantidad_actividades',
  'actividades_completadas',
  'lecturas_completadas',
  'sin_errores',
  'racha_dias',
  'evaluacion_perfecta',
  'registro_nuevo',
  ''
]);

function parseCondicion(raw) {
  if (raw == null) return {};
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return raw;
}

async function main() {
  const sequelize = db.sequelize;
  try {
    await sequelize.authenticate();
    console.log('Conexión OK.\n');
  } catch (e) {
    console.error('No se pudo conectar a la base de datos:', e.message);
    process.exit(1);
  }

  const [insRows] = await sequelize.query('SELECT COUNT(*)::int AS n FROM insignias');
  const [critRows] = await sequelize.query('SELECT COUNT(*)::int AS n FROM criterios_insignias');
  const insCount = insRows[0];
  const critCount = critRows[0];

  console.log('--- Resumen ---');
  console.log('insignias:', insCount.n);
  console.log('criterios_insignias:', critCount.n);
  if (critCount.n === 0) {
    console.log('\n⚠ No hay criterios: ninguna insignia se desbloqueará por actividades (salvo la de registro).\n');
  }

  const [criterios] = await sequelize.query(
    `SELECT c.id, c.insignia_id, c.tipo_criterio, c.valor_requerido, c.tipo_actividad_id, c.grupo_edad_id,
            c.condicion_adicional, i.nombre AS insignia_nombre, i.estado AS insignia_estado
     FROM criterios_insignias c
     LEFT JOIN insignias i ON i.id = c.insignia_id
     ORDER BY c.insignia_id, c.id`
  );

  console.log('\n--- Criterios (detalle) ---');
  const problemas = [];

  for (const row of criterios) {
    const tipo = String(row.tipo_criterio || '')
      .toLowerCase()
      .trim();
    const cond = parseCondicion(row.condicion_adicional);
    const actId = cond.actividad_id != null ? Number(cond.actividad_id) : null;

    if (!TIPOS_VALIDOS.has(tipo) && !cond.actividad_id) {
      problemas.push(
        `Criterio id=${row.id}: tipo_criterio "${row.tipo_criterio}" no reconocido y sin actividad_id en condicion_adicional.`
      );
    }

    if (Number(row.insignia_id) === 14) {
      problemas.push(
        `Criterio id=${row.id}: insignia_id=14 (bienvenida) no se evalúa en el servicio; conviene eliminar criterios asociados.`
      );
    }

    if (row.insignia_id && !row.insignia_nombre) {
      problemas.push(`Criterio id=${row.id}: insignia_id=${row.insignia_id} sin fila en insignias (FK rota).`);
    }

    if (row.insignia_estado === false || row.insignia_estado === 0) {
      problemas.push(`Insignia id=${row.insignia_id} (${row.insignia_nombre}): estado=false → no se otorgará.`);
    }

    if (actId != null && Number.isFinite(actId)) {
      const [exRows] = await sequelize.query(
        'SELECT id, nombre, tipo_actividad_id FROM actividades WHERE id = :id LIMIT 1',
        { replacements: { id: actId } }
      );
      const ex = exRows[0];
      if (!ex) {
        problemas.push(
          `Criterio id=${row.id}: condicion_adicional.actividad_id=${actId} no existe en tabla actividades.`
        );
      }
    }

    console.log(
      `  [${row.insignia_id}] ${row.insignia_nombre || '?'} | criterio#${row.id} tipo=${row.tipo_criterio} valor=${row.valor_requerido} extra=${JSON.stringify(cond)}`
    );
  }

  const [actividades] = await sequelize.query(
    'SELECT id, nombre, tipo_actividad_id, grupo_edad_id FROM actividades ORDER BY id'
  );
  console.log('\n--- Actividades en BD (ids usados por el front en activities.ts: 1–18) ---');
  const ids = new Set(actividades.map((a) => Number(a.id)));
  for (let n = 1; n <= 18; n += 1) {
    if (!ids.has(n)) {
      problemas.push(`Falta actividad id=${n} en BD (el front la usa en ACTIVITIES_CONFIG).`);
    }
  }
  for (const a of actividades) {
    console.log(`  id=${a.id} tipo=${a.tipo_actividad_id} grupo=${a.grupo_edad_id} ${a.nombre || ''}`);
  }

  if (problemas.length) {
    console.log('\n--- Posibles problemas ---');
    for (const p of [...new Set(problemas)]) {
      console.log(' ⚠', p);
    }
  } else {
    console.log('\n--- Sin advertencias automáticas (revisar manualmente reglas de negocio). ---');
  }

  await sequelize.close();
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
