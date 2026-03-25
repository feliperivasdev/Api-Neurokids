-- Migración: Agregar campos de reporte (respuestas correctas/incorrectas, uso audio)
-- Ejecutar en PostgreSQL: psql -d tu_base_datos -f migrations/001_add_report_metrics.sql

-- 1. Agregar columnas a progreso_actividades
ALTER TABLE progreso_actividades 
  ADD COLUMN IF NOT EXISTS respuestas_correctas INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS respuestas_incorrectas INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS uso_audio INTEGER DEFAULT 0;

-- 2. Crear tabla sesiones_actividad (historial por sesión)
CREATE TABLE IF NOT EXISTS sesiones_actividad (
  id BIGSERIAL PRIMARY KEY,
  estudiante_id BIGINT NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
  actividad_id BIGINT NOT NULL REFERENCES actividades(id) ON DELETE CASCADE,
  nivel INTEGER DEFAULT 1,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duracion_seg INTEGER DEFAULT 0,
  completado BOOLEAN DEFAULT false,
  respuestas_correctas INTEGER DEFAULT 0,
  respuestas_incorrectas INTEGER DEFAULT 0,
  uso_audio INTEGER DEFAULT 0,
  puntuacion INTEGER DEFAULT 0,
  puntuacion_maxima INTEGER DEFAULT 100
);

CREATE INDEX IF NOT EXISTS idx_sesiones_estudiante ON sesiones_actividad(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_sesiones_actividad ON sesiones_actividad(actividad_id);
CREATE INDEX IF NOT EXISTS idx_sesiones_fecha ON sesiones_actividad(fecha);
