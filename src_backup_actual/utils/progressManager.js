// Sistema de progreso del usuario con localStorage
class ProgressManager {
  constructor() {
    this.storageKey = 'cognify_user_progress';
    this.userKey = 'cognify_user';
    this.initialize();
  }

  // Inicializar datos si no existen
  initialize() {
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify({
        completedChallenges: {},
        totalPoints: 0,
        level: 1,
        streakDays: 0,
        lastLogin: null
      }));
    }
    
    if (!localStorage.getItem(this.userKey)) {
      localStorage.setItem(this.userKey, JSON.stringify({
        name: 'Usuario',
        email: '',
        createdAt: new Date().toISOString()
      }));
    }
  }

  // Obtener progreso actual
  getProgress() {
    return JSON.parse(localStorage.getItem(this.storageKey)) || {
      completedChallenges: {},
      totalPoints: 0,
      level: 1,
      streakDays: 0,
      lastLogin: null
    };
  }

  // Obtener usuario
  getUser() {
    return JSON.parse(localStorage.getItem(this.userKey)) || { name: 'Usuario' };
  }

  // Completar un reto
  completeChallenge(area, challengeId, points) {
    const progress = this.getProgress();
    
    // Inicializar área si no existe
    if (!progress.completedChallenges[area]) {
      progress.completedChallenges[area] = [];
    }
    
    // Verificar si ya está completado
    if (progress.completedChallenges[area].includes(challengeId)) {
      return false;
    }
    
    // Agregar reto completado
    progress.completedChallenges[area].push(challengeId);
    
    // Actualizar puntos
    progress.totalPoints += points;
    
    // Calcular nivel (cada 100 puntos = nuevo nivel)
    progress.level = Math.floor(progress.totalPoints / 100) + 1;
    
    // Actualizar racha
    this.updateStreak();
    
    // Guardar
    localStorage.setItem(this.storageKey, JSON.stringify(progress));
    return true;
  }

  // Verificar si un reto está completado
  isChallengeCompleted(area, challengeId) {
    const progress = this.getProgress();
    return progress.completedChallenges[area]?.includes(challengeId) || false;
  }

  // Obtener estadísticas por área
  getAreaStats(area) {
    const progress = this.getProgress();
    const completed = progress.completedChallenges[area] || [];
    const total = window.challengesByArea?.[area]?.length || 0;
    
    return {
      completed: completed.length,
      total,
      percentage: total > 0 ? Math.round((completed.length / total) * 100) : 0
    };
  }

  // Obtener todos los retos completados
  getAllCompletedChallenges() {
    const progress = this.getProgress();
    return progress.completedChallenges;
  }

  // Actualizar racha de días
  updateStreak() {
    const progress = this.getProgress();
    const today = new Date().toDateString();
    const lastLogin = progress.lastLogin ? new Date(progress.lastLogin).toDateString() : null;
    
    if (!lastLogin) {
      progress.streakDays = 1;
    } else if (lastLogin === today) {
      // Ya inició sesión hoy
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastLogin === yesterday.toDateString()) {
        progress.streakDays += 1;
      } else {
        progress.streakDays = 1;
      }
    }
    
    progress.lastLogin = new Date().toISOString();
    localStorage.setItem(this.storageKey, JSON.stringify(progress));
  }

  // Resetear progreso (para desarrollo)
  resetProgress() {
    localStorage.removeItem(this.storageKey);
    this.initialize();
  }
}

// Exportar instancia única
export const progressManager = new ProgressManager();
