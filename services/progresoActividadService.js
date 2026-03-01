// progresoActividadService.js

class ProgresoActividadService {
    constructor() {
        this.actividades = [];
    }

    agregarActividad(actividad) {
        this.actividades.push(actividad);
    }

    obtenerProgresoActividad(actividadId) {
        const actividad = this.actividades.find(a => a.id === actividadId);
        if (!actividad) {
            throw new Error('Actividad no encontrada');
        }
        return actividad.progreso;
    }

    actualizarProgresoActividad(actividadId, nuevoProgreso) {
        const actividad = this.actividades.find(a => a.id === actividadId);
        if (!actividad) {
            throw new Error('Actividad no encontrada');
        }
        actividad.progreso = nuevoProgreso;
    }

    eliminarActividad(actividadId) {
        this.actividades = this.actividades.filter(a => a.id !== actividadId);
    }
}

module.exports = ProgresoActividadService;