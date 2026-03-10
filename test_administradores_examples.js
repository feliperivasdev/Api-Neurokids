// Archivo de prueba para las funcionalidades de administradores
// Puedes usar este archivo como referencia para probar las APIs de administradores

const ejemplosAdministradores = {
    // 1. Registrar un nuevo administrador
    registroAdmin: {
        url: 'POST /auth/administradores/registro',
        body: {
            nombre: "Carlos Administrador López",
            correo: "carlos.admin@neurokids.com",
            contrasena: "AdminPass123!",
            institucion_id: 1 // Opcional para administradores
        },
        notas: "El correo debe ser único. La institución es opcional para administradores globales"
    },

    // 2. Registrar administrador global (sin institución)
    registroAdminGlobal: {
        url: 'POST /auth/administradores/registro',
        body: {
            nombre: "Super Administrador",
            correo: "super.admin@neurokids.com",
            contrasena: "SuperAdmin2024!"
            // institucion_id se omite para administradores globales
        },
        notas: "Administrador global sin institución específica"
    },

    // 3. Iniciar sesión como administrador
    loginAdmin: {
        url: 'POST /auth/administradores/iniciar-sesion',
        body: {
            correo: "carlos.admin@neurokids.com",
            contrasena: "AdminPass123!"
        },
        notas: "Solo permite login de usuarios con rol_id = 1 (administradores)"
    },

    // 4. Obtener perfil del administrador autenticado
    perfilAdmin: {
        url: 'GET /auth/administradores/me',
        headers: {
            'Authorization': 'Bearer TOKEN_AQUI'
        },
        notas: "Requiere token JWT válido de administrador"
    },

    // 5. Actualizar perfil de administrador
    actualizarPerfilAdmin: {
        url: 'PUT /auth/administradores/perfil',
        headers: {
            'Authorization': 'Bearer TOKEN_AQUI'
        },
        body: {
            nombre: "Carlos Alberto Administrador López",
            correo: "carlos.alberto.admin@neurokids.com",
            contrasena_actual: "AdminPass123!",
            contrasena_nueva: "NewAdminPass456!"
        },
        notas: "Todos los campos son opcionales, pero si cambias password necesitas el actual"
    },

    // 6. Listar todos los administradores (administrativo)
    listarAdministradores: {
        url: 'GET /usuarios/administradores?page=1&limit=5',
        headers: {
            'Authorization': 'Bearer TOKEN_AQUI'
        },
        notas: "Query params opcionales: page, limit, institucion_id"
    },

    // 7. Crear administrador administrativamente
    crearAdminAdmin: {
        url: 'POST /usuarios',
        headers: {
            'Authorization': 'Bearer TOKEN_AQUI'
        },
        body: {
            nombre: "María Rodríguez",
            correo: "maria.rodriguez@neurokids.com",
            contrasena: "MariaAdmin123",
            rol_id: 1, // 1 = Administrador
            institucion_id: null // Puede ser null para administradores globales
        },
        notas: "Requiere autenticación. Para crear administradores usar rol_id: 1"
    },

    // 8. Listar todos los usuarios con filtro por rol
    listarUsuariosPorRol: {
        url: 'GET /usuarios?rol_id=1&page=1&limit=10',
        headers: {
            'Authorization': 'Bearer TOKEN_AQUI'
        },
        notas: "Listar usuarios filtrando por rol_id (1=Admin, 2=Docente, 3=Estudiante)"
    }
};

// Flujo típico de registro e inicio de sesión para administradores
const flujoRegistroLoginAdmin = [
    {
        paso: 1,
        accion: "Registrar administrador",
        metodo: "POST /auth/administradores/registro",
        datos: "nombre, correo, contrasena, institucion_id (opcional)"
    },
    {
        paso: 2,
        accion: "Iniciar sesión (opcional, el registro devuelve token)",
        metodo: "POST /auth/administradores/iniciar-sesion",
        datos: "correo, contrasena"
    },
    {
        paso: 3,
        accion: "Acceder a rutas protegidas con el token",
        metodo: "Incluir header Authorization: Bearer TOKEN",
        notas: "El token expira en 7 días"
    },
    {
        paso: 4,
        accion: "Gestionar usuarios del sistema",
        metodo: "Usar endpoints de /usuarios/* para CRUD",
        notas: "Los administradores tienen acceso completo"
    }
];

// Casos de error específicos para administradores
const casosErrorAdmin = {
    correoYaExiste: {
        error: "Ya existe un usuario registrado con ese correo electrónico",
        status: 400,
        causa: "Intentar registrar administrador con correo ya usado"
    },
    credencialesInvalidas: {
        error: "Credenciales inválidas o cuenta no encontrada",
        status: 400,
        causa: "Correo o contraseña incorrectos en login, o usuario no es administrador"
    },
    tokenInvalido: {
        error: "Token inválido o expirado",
        status: 401,
        causa: "Token JWT malformado, expirado o ausente"
    },
    sinPermisos: {
        error: "No tienes permisos para acceder a este recurso",
        status: 403,
        causa: "Usuario autenticado pero sin permisos de administrador"
    },
    contrasenaCorta: {
        error: "La contraseña debe tener al menos 6 caracteres",
        status: 400,
        causa: "Password muy corto en registro o actualización"
    }
};

// Validaciones específicas para administradores
const validacionesAdmin = {
    registro: [
        "Nombre, correo y contraseña son requeridos",
        "Correo debe tener formato de email válido",
        "Contraseña mínimo 6 caracteres",
        "Institución es opcional (puede ser null para admins globales)",
        "Correo debe ser único en todo el sistema"
    ],
    login: [
        "Correo y contraseña son requeridos",
        "Usuario debe existir y tener rol_id = 1",
        "Usuario debe estar activo (estado = true)",
        "Contraseña debe coincidir con la almacenada (bcrypt)"
    ],
    permisos: [
        "Administradores pueden gestionar todos los usuarios",
        "Pueden crear/editar/eliminar cualquier tipo de usuario",
        "Acceso completo a configuraciones del sistema",
        "Pueden operar sin restricciones de institución"
    ]
};

// Ejemplos de gestión de usuarios desde administrador
const gestionUsuariosAdmin = {
    crearDocente: {
        url: 'POST /usuarios',
        body: {
            nombre: "Juan Profesor",
            correo: "juan.profesor@escuela.edu",
            contrasena: "profesor123",
            rol_id: 2,
            institucion_id: 1
        }
    },
    crearEstudiante: {
        url: 'POST /usuarios', // Si existe endpoint para estudiantes usuarios
        body: {
            nombre: "Pedro Estudiante",
            correo: "pedro.estudiante@escuela.edu",
            contrasena: "estudiante123",
            rol_id: 3,
            institucion_id: 1
        }
    },
    listarPorRol: {
        administradores: 'GET /usuarios?rol_id=1',
        docentes: 'GET /usuarios?rol_id=2',
        estudiantes: 'GET /usuarios?rol_id=3'
    }
};

// Diferencias clave entre administradores y otros roles
const diferenciaRoles = {
    administrador: {
        rol_id: 1,
        permisos: "Acceso completo a todo el sistema",
        institucion: "Opcional (pueden ser globales)",
        gestion: "Pueden gestionar todos los usuarios y configuraciones"
    },
    docente: {
        rol_id: 2,
        permisos: "Gestión de estudiantes y contenidos de su institución",
        institucion: "Requerida",
        gestion: "Limitado a su institución y funciones docentes"
    },
    estudiante: {
        rol_id: 3,
        permisos: "Acceso limitado a actividades y su progreso",
        institucion: "Requerida",
        gestion: "Solo su propio perfil y actividades"
    }
};

module.exports = {
    ejemplosAdministradores,
    flujoRegistroLoginAdmin,
    casosErrorAdmin,
    validacionesAdmin,
    gestionUsuariosAdmin,
    diferenciaRoles
};