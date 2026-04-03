-- Seed sugerido (PostgreSQL): insignias de progreso + criterios alineados con el código (insigniasProgresoService.js)
-- y con IDs de actividades del front: neuroKids-front/src/config/activities.ts (dbId 1–18).
--
-- La insignia 14 suele ser la de bienvenida (registro); no se duplica aquí.
-- Si ya tienes filas con id 15–20 o criterios 10001+, ajusta rangos o usa solo el script de validación.
--
-- Ejecutar manualmente tras revisar: psql -f migrations/004_seed_insignias_y_criterios_neurokids.sql

-- --- Insignias (id 15–20) ---
INSERT INTO insignias (id, nombre, descripcion, icono, color_hex, categoria, rareza, puntos_otorgados, estado, orden_presentacion, created_at, updated_at)
VALUES
  (15, 'Primer paso', 'Completaste tu primera actividad en Neurokids.', 'star', '#FFD700', 'progreso', 'comun', 15, true, 2, NOW(), NOW()),
  (16, 'Jugador', 'Completaste tu primer juego (tres niveles).', 'gamepad', '#4CAF50', 'progreso', 'comun', 20, true, 3, NOW(), NOW()),
  (17, 'Lector', 'Completaste tu primera lectura.', 'book', '#2196F3', 'progreso', 'comun', 20, true, 4, NOW(), NOW()),
  (18, 'Explorador', 'Completaste 5 actividades distintas.', 'compass', '#9C27B0', 'progreso', 'raro', 30, true, 5, NOW(), NOW()),
  (19, 'Maestro', 'Completaste 10 actividades distintas.', 'trophy', '#FF9800', 'progreso', 'epico', 50, true, 6, NOW(), NOW()),
  (20, 'Bingo campeón', 'Completaste el juego Bingo de Palabras.', 'bingo', '#E91E63', 'actividad', 'comun', 25, true, 7, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- --- Criterios (id manual 10001+) ---
-- primera_actividad*, primer_juego, primera_lectura: requieren actividad completada en esa petición (juegos: 3 niveles).
INSERT INTO criterios_insignias (id, insignia_id, tipo_criterio, valor_requerido, grupo_edad_id, tipo_actividad_id, condicion_adicional, descripcion_criterio, created_at, updated_at)
VALUES
  (10001, 15, 'primera_actividad', 1, NULL, NULL, NULL, 'Total actividades completadas = 1', NOW(), NOW()),
  (10002, 16, 'primer_juego', 1, NULL, NULL, NULL, 'Primera actividad tipo juego (tipo_actividad_id=2)', NOW(), NOW()),
  (10003, 17, 'primera_lectura', 1, NULL, NULL, NULL, 'Primera actividad tipo lectura (tipo_actividad_id=1)', NOW(), NOW()),
  (10004, 18, 'cantidad_actividades', 5, NULL, NULL, NULL, 'Cinco actividades completadas (cualquier tipo)', NOW(), NOW()),
  (10005, 19, 'cantidad_actividades', 10, NULL, NULL, NULL, 'Diez actividades completadas', NOW(), NOW()),
  (10006, 20, 'completar_actividad', 1, NULL, NULL, '{"actividad_id": 10}'::jsonb, 'Actividad id 10 = Bingo de Palabras (activities.ts)', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
