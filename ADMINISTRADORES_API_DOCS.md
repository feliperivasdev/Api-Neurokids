# API Endpoints para Gestión de Administradores

## Descripción
Se ha implementado la funcionalidad completa para registrar y gestionar administradores en el sistema. Los administradores son usuarios con `rol_id = 1`.

## Rutas de Autenticación para Administradores

### 1. Registro de Administrador
**POST** `/auth/administradores/registro`

**Cuerpo de la petición:**
```json
{
  "nombre": "Carlos Administrador",
  "correo": "carlos.admin@neurokids.com",
  "contrasena": "admin_password_123",
  "institucion_id": 1
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Cuenta de administrador creada exitosamente",
  "data": {
    "administrador": {
      "id": 1,
      "nombre": "Carlos Administrador",
      "correo": "carlos.admin@neurokids.com",
      "rol_id": 1,
      "institucion_id": 1,
      "institucion": "Escuela Primaria San José",
      "estado": true,
      "created_at": "2024-03-10T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 604800
  }
}
```

### 2. Inicio de Sesión para Administrador
**POST** `/auth/administradores/iniciar-sesion`

**Cuerpo de la petición:**
```json
{
  "correo": "carlos.admin@neurokids.com",
  "contrasena": "admin_password_123"
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Sesión de administrador iniciada exitosamente",
  "data": {
    "administrador": {
      "id": 1,
      "nombre": "Carlos Administrador",
      "correo": "carlos.admin@neurokids.com",
      "rol_id": 1,
      "rol": "administrador",
      "institucion_id": 1,
      "institucion": "Escuela Primaria San José",
      "estado": true,
      "email_verified_at": "2024-03-10T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 604800
  }
}
```

### 3. Obtener Datos del Administrador Actual
**GET** `/auth/administradores/me`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Carlos Administrador",
    "correo": "carlos.admin@neurokids.com",
    "rol_id": 1,
    "institucion_id": 1,
    "estado": true,
    "created_at": "2024-03-10T10:30:00.000Z",
    "email_verified_at": "2024-03-10T10:30:00.000Z",
    "institucion": {
      "nombre": "Escuela Primaria San José",
      "direccion": "Calle 123",
      "telefono": "+57 123 456 7890"
    },
    "rol": {
      "nombre": "administrador",
      "descripcion": "Rol para administradores del sistema"
    }
  }
}
```

### 4. Actualizar Perfil de Administrador
**PUT** `/auth/administradores/perfil`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Cuerpo de la petición:**
```json
{
  "nombre": "Carlos Alberto Administrador",
  "correo": "carlos.alberto.admin@neurokids.com",
  "contrasena_actual": "admin_password_123",
  "contrasena_nueva": "new_admin_password_456"
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Perfil actualizado exitosamente",
  "data": {
    "id": 1,
    "nombre": "Carlos Alberto Administrador",
    "correo": "carlos.alberto.admin@neurokids.com",
    ...
  }
}
```

## Rutas Administrativas para Gestión de Usuarios

### 5. Obtener Todos los Administradores
**GET** `/usuarios/administradores`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Cantidad por página (default: 10)
- `institucion_id` (opcional): Filtrar por institución

**Ejemplo:** `/usuarios/administradores?page=1&limit=5&institucion_id=1`

### 6. Crear Administrador Administrativamente
**POST** `/usuarios`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Cuerpo de la petición:**
```json
{
  "nombre": "Ana Gómez",
  "correo": "ana.gomez@neurokids.com",
  "contrasena": "password123",
  "rol_id": 1,
  "institucion_id": 1
}
```

## Campos para Postman - Administradores

### 🔹 **1. Registro de Administrador**
**POST** `/auth/administradores/registro`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "nombre": "Carlos Administrador",
  "correo": "carlos.admin@neurokids.com",
  "contrasena": "admin123456",
  "institucion_id": 1
}
```

### 🔹 **2. Login de Administrador**
**POST** `/auth/administradores/iniciar-sesion`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "correo": "carlos.admin@neurokids.com",
  "contrasena": "admin123456"
}
```

### 🔹 **3. Obtener Perfil del Administrador**
**GET** `/auth/administradores/me`

**Headers:**
```
Authorization: Bearer TOKEN_DEL_LOGIN
```

**Body:** *(Vacío - es GET)*

### 🔹 **4. Actualizar Perfil de Administrador**
**PUT** `/auth/administradores/perfil`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer TOKEN_DEL_LOGIN
```

**Body (JSON) - Todos opcionales:**
```json
{
  "nombre": "Carlos Alberto Administrador",
  "correo": "carlos.alberto@neurokids.com",
  "contrasena_actual": "admin123456",
  "contrasena_nueva": "newadmin789"
}
```

### 🔹 **5. Listar Administradores (Administrativo)**
**GET** `/usuarios/administradores`

**Headers:**
```
Authorization: Bearer TOKEN_DEL_LOGIN
```

**Query Parameters (opcionales):**
```
page=1
limit=10
institucion_id=1
```
*En Postman: Pestaña "Params"*

### 🔹 **6. Crear Administrador Administrativamente**
**POST** `/usuarios`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer TOKEN_DEL_LOGIN
```

**Body (JSON):**
```json
{
  "nombre": "Ana Gutierrez",
  "correo": "ana.gutierrez@neurokids.com",
  "contrasena": "password123",
  "rol_id": 1,
  "institucion_id": 1
}
```

## Estructura de Roles Actualizada

- **ID 1**: Administrador
- **ID 2**: Docente  
- **ID 3**: Estudiante

## Validaciones y Seguridad

- **Contraseñas**: Se encriptan con bcrypt (salt rounds: 10)
- **Tokens JWT**: Expiran en 7 días
- **Validación de correo**: Formato email válido
- **Contraseña mínima**: 6 caracteres
- **Estado de usuario**: Los usuarios eliminados se marcan como `estado: false`
- **Institución**: Opcional para administradores (pueden ser globales)

## Permisos de Administrador

Los administradores (rol_id = 1) tienen acceso completo a:
- Gestión de todos los usuarios
- Gestión de instituciones
- Gestión de estudiantes
- Gestión de docentes
- Configuraciones del sistema
- Reportes y estadísticas

## Códigos de Error Comunes

- **400**: Datos inválidos o faltantes
- **401**: No autorizado (token inválido/expirado)
- **403**: Permisos insuficientes
- **404**: Usuario/recurso no encontrado
- **409**: Conflicto (correo ya registrado)
- **500**: Error interno del servidor

## Flujo Recomendado para Pruebas

1. **Primero** → `GET /auth/instituciones` (opcional, para ver instituciones)
2. **Segundo** → `POST /auth/administradores/registro` (guarda el token)
3. **Tercero** → `GET /auth/administradores/me` (usa el token del paso anterior)
4. **Cuarto** → `GET /usuarios/administradores` (listar otros admins)
5. **Quinto** → `POST /usuarios` con rol_id: 1 (crear admin administrativamente)

## Notas Adicionales

- Los administradores pueden tener o no institución asociada
- Pueden gestionar usuarios de todas las instituciones
- Tienen permisos completos sobre el sistema
- El campo `institucion_id` es opcional en el registro