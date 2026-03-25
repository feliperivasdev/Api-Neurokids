-- Registro de cada inicio de sesión del estudiante en la plataforma (fecha/hora, opcional IP y user-agent)
-- Ejecutar en PostgreSQL: psql -d tu_base_datos -f migrations/003_accesos_plataforma_estudiante.sql

CREATE TABLE IF NOT EXISTS accesos_plataforma_estudiante (
  id BIGSERIAL PRIMARY KEY,
  estudiante_id BIGINT NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
  fecha_hora TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  ip_address VARCHAR(45),
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_accesos_plataforma_estudiante
  ON accesos_plataforma_estudiante(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_accesos_plataforma_fecha
  ON accesos_plataforma_estudiante(fecha_hora DESC);
