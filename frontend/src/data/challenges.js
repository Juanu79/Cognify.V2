// Retos organizados por área con dificultad y puntos
export const challengesByArea = {
  Matemáticas: [
    {
      id: 1,
      title: "Sumas Básicas",
      description: "Resuelve 10 sumas de dos dígitos en menos de 2 minutos",
      difficulty: "Fácil",
      points: 10,
      time: "2 min",
      category: "Aritmética"
    },
    {
      id: 2,
      title: "Restas Intermedias",
      description: "Resuelve 8 restas con números de tres dígitos",
      difficulty: "Media",
      points: 20,
      time: "5 min",
      category: "Aritmética"
    },
    {
      id: 3,
      title: "Multiplicaciones",
      description: "Resuelve 5 multiplicaciones de dos cifras",
      difficulty: "Media",
      points: 30,
      time: "8 min",
      category: "Aritmética"
    },
    {
      id: 4,
      title: "Álgebra Básica",
      description: "Resuelve 3 ecuaciones lineales simples",
      difficulty: "Difícil",
      points: 50,
      time: "12 min",
      category: "Álgebra"
    },
    {
      id: 5,
      title: "Fracciones",
      description: "Realiza 5 operaciones con fracciones",
      difficulty: "Media",
      points: 25,
      time: "7 min",
      category: "Aritmética"
    }
  ],
  Lógica: [
    {
      id: 1,
      title: "Patrones Lógicos",
      description: "Identifica el patrón en 5 secuencias numéricas",
      difficulty: "Fácil",
      points: 15,
      time: "3 min",
      category: "Secuencias"
    },
    {
      id: 2,
      title: "Series Numéricas",
      description: "Completa las siguientes 3 series numéricas",
      difficulty: "Media",
      points: 25,
      time: "6 min",
      category: "Secuencias"
    },
    {
      id: 3,
      title: "Problemas de Lógica",
      description: "Resuelve 2 problemas de lógica matemática",
      difficulty: "Difícil",
      points: 40,
      time: "10 min",
      category: "Razonamiento"
    },
    {
      id: 4,
      title: "Sudoku Básico",
      description: "Completa un sudoku 4x4",
      difficulty: "Media",
      points: 30,
      time: "8 min",
      category: "Rompecabezas"
    }
  ],
  Programación: [
    {
      id: 1,
      title: "Variables",
      description: "Declara 3 variables correctamente en JavaScript",
      difficulty: "Fácil",
      points: 10,
      time: "2 min",
      category: "Fundamentos"
    },
    {
      id: 2,
      title: "Condicionales",
      description: "Escribe un if-else para 2 condiciones",
      difficulty: "Media",
      points: 25,
      time: "5 min",
      category: "Estructuras de Control"
    },
    {
      id: 3,
      title: "Bucles",
      description: "Crea un bucle for que imprima números del 1 al 10",
      difficulty: "Difícil",
      points: 45,
      time: "8 min",
      category: "Estructuras de Control"
    },
    {
      id: 4,
      title: "Funciones",
      description: "Crea una función que sume dos números",
      difficulty: "Media",
      points: 30,
      time: "6 min",
      category: "Fundamentos"
    }
  ],
  Memoria: [
    {
      id: 1,
      title: "Recordar Secuencias",
      description: "Memoriza y repite 3 secuencias de números",
      difficulty: "Fácil",
      points: 12,
      time: "3 min",
      category: "Memoria Numérica"
    },
    {
      id: 2,
      title: "Emparejar Imágenes",
      description: "Encuentra las 5 parejas en el menor tiempo posible",
      difficulty: "Media",
      points: 22,
      time: "6 min",
      category: "Memoria Visual"
    },
    {
      id: 3,
      title: "Recordar Textos",
      description: "Lee y recuerda 3 párrafos cortos",
      difficulty: "Difícil",
      points: 35,
      time: "10 min",
      category: "Memoria Verbal"
    },
    {
      id: 4,
      title: "Secuencias de Colores",
      description: "Repite 4 secuencias de colores en orden",
      difficulty: "Media",
      points: 20,
      time: "5 min",
      category: "Memoria Visual"
    }
  ]
};

// Dificultad por color
export const difficultyColors = {
  Fácil: "#55efc4",
  Media: "#ffeaa7",
  Difícil: "#ff7675"
};

// Categoría por ícono (versión sin emojis)
export const categoryIcons = {
  "Aritmética": "AR",
  "Álgebra": "AL",
  "Secuencias": "SQ",
  "Razonamiento": "RZ",
  "Rompecabezas": "RP",
  "Fundamentos": "FD",
  "Estructuras de Control": "EC",
  "Memoria Numérica": "MN",
  "Memoria Visual": "MV",
  "Memoria Verbal": "MB"
};
