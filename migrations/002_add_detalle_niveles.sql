-- Progreso por niveles (1–3) y puntos acumulados por actividad.
-- PostgreSQL:
ALTER TABLE progreso_actividades ADD COLUMN IF NOT EXISTS detalle_niveles JSONB DEFAULT NULL;

-- MySQL 5.7+ (ejecutar solo si usas MySQL, no PostgreSQL):
-- ALTER TABLE progreso_actividades ADD COLUMN detalle_niveles JSON NULL;
