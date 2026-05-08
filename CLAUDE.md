# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Comandos

```bash
# Iniciar servidor
npm start              # node ./bin/www (PORT 3000)

# Validar integridad del sistema de insignias
npm run validar-insignias

# Migraciones (ejecutar manualmente con psql o herramienta SQL)
# Los archivos SQL están en migrations/ — no hay CLI de migración automatizado

# Gestión de modelos Sequelize
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

No hay comandos de build, lint ni test configurados en package.json.

Para generar pares vacíos de controller/route desde modelos:
```bash
bash gen_Contr_Routs.sh
```

## Arquitectura

**Stack:** Express.js + Sequelize ORM + PostgreSQL (Neon.tech serverless)

### Flujo de request

```
bin/www → app.js → routes/ → middleware/authMiddleware.js → controllers/ → services/ → models/
```

### Capas

- **`routes/`** — Definición de endpoints, montaje de middleware de auth y rol por ruta
- **`controllers/`** — Handlers HTTP: parsean request, llaman services, devuelven response
- **`services/`** — Lógica de negocio. Los más complejos: `authService.js`, `insigniasProgresoService.js`, `rachaAccesosService.js`
- **`models/`** — Modelos Sequelize (~50+). Relaciones definidas en cada archivo con `associate()`
- **`middleware/authMiddleware.js`** — Verificación JWT + RBAC por rol_id (1=Admin, 2=Docente, 3=Estudiante)
- **`config/config.json`** — Config Sequelize para dev/test/prod (actualmente con credenciales hardcodeadas — ver abajo)
- **`migrations/`** — Archivos SQL numerados secuencialmente, ejecutar manualmente

### Autenticación

JWT Bearer token en header `Authorization`. Expiración: 7 días.

Tres roles con rutas de login separadas:
- `POST /auth/administradores/iniciar-sesion`
- `POST /auth/docentes/iniciar-sesion`
- `POST /auth/estudiantes/iniciar-sesion` (acepta nombre+apellido+institucion_id en lugar de email)

Middlewares de rol: `verificarAdministrador`, `verificarDocente`, `verificarEstudiante` — importar desde `middleware/authMiddleware.js`.

### Dominio principal

Sistema educativo multi-tenant por institución:
- **Insignias/logros:** criterios evaluados automáticamente por `insigniasProgresoService.js` al completar actividades o lecturas
- **Progreso:** `progreso_actividades`, `progreso_lecturas` — tracking por estudiante
- **Rachas:** `rachaAccesosService.js` — seguimiento de accesos consecutivos
- **Reportes:** endpoints en `/reportes` para docentes/admins

### Variables de entorno necesarias

```
JWT_SECRET=
PORT=
NODE_ENV=
DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASSWORD=
```

> `config/config.json` tiene credenciales hardcodeadas de Neon.tech. Para producción, migrar a env vars usando `process.env` en un `config.js` dinámico.

## Convenciones

- Nuevos recursos: crear `routes/nombre.js` + `controllers/nombreController.js` + `models/nombre.js`
- Proteger rutas con `verificarToken` y el middleware de rol correspondiente antes del controller
- Modelos: incluir `classMethods: { associate() {} }` para definir relaciones y llamarlo desde `models/index.js`
