// Gestor de progreso del usuario
class ProgressManager {
  constructor() {
    this.storageKey = 'cognify_progress';
    this.defaultState = {
      level: 1,
      totalPoints: 0,
      completedChallenges: {}, // { "Matemáticas": [1, 2], "Lógica": [1] }
      areaStats: {}
    };
  }

  // Obtener progreso actual
  getProgress() {
    const saved = localStorage.getItem(this.storageKey);
    if (!saved) {
      return this.defaultState;
    }
    try {
      const parsed = JSON.parse(saved);
      // Asegurar que existe el objeto completo
      return {
        ...this.defaultState,
        ...parsed,
        completedChallenges: parsed.completedChallenges || {}
      };
    } catch (e) {
      console.error('Error loading progress:', e);
      return this.defaultState;
    }
  }

  // Guardar progreso
  saveProgress(state) {
    localStorage.setItem(this.storageKey, JSON.stringify(state));
  }

  // Completar un reto
  completeChallenge(area, challengeId, points) {
    const state = this.getProgress();
    
    // Inicializar completedChallenges para el área si no existe
    if (!state.completedChallenges[area]) {
      state.completedChallenges[area] = [];
    }

    // Verificar si ya está completado
    if (state.completedChallenges[area].includes(challengeId)) {
      return false; // Ya fue completado
    }

    // Agregar a completados
    state.completedChallenges[area].push(challengeId);
    
    // Sumar puntos
    state.totalPoints += points;
    
    // Calcular nuevo nivel (cada 100 puntos sube de nivel)
    const newLevel = Math.floor(state.totalPoints / 100) + 1;
    if (newLevel > state.level) {
      state.level = newLevel;
    }

    // Actualizar estadísticas del área
    if (!state.areaStats[area]) {
      state.areaStats[area] = { completed: 0, totalPoints: 0 };
    }
    state.areaStats[area].completed += 1;
    state.areaStats[area].totalPoints += points;

    // Guardar
    this.saveProgress(state);
    
    return true;
  }

  // Reiniciar un reto (permitir reintentar)
  resetChallenge(area, challengeId) {
    const state = this.getProgress();
    
    if (state.completedChallenges[area]) {
      state.completedChallenges[area] = state.completedChallenges[area].filter(
        id => id !== challengeId
      );
      this.saveProgress(state);
      return true;
    }
    return false;
  }

  // Reiniciar todo el progreso
  resetAllProgress() {
    localStorage.removeItem(this.storageKey);
    return this.defaultState;
  }

  // Obtener estadísticas de un área
  getAreaStats(area) {
    const state = this.getProgress();
    const completed = state.completedChallenges[area] || [];
    return {
      completed: completed.length,
      total: completed.length, // Esto debería venir de challengesByArea
      percentage: 0 // Se calcula en el componente
    };
  }

  // Verificar si un reto está completado
  isChallengeCompleted(area, challengeId) {
    const state = this.getProgress();
    return state.completedChallenges[area]?.includes(challengeId) || false;
  }
}

export const progressManager = new ProgressManager();
