// Retos organizados por área con dificultad y puntos
export const challengesByArea = {
  "Matemáticas": [
    {
      id: 1,
      title: "Sumas Básicas",
      description: "Resuelve 10 sumas de dos dígitos en menos de 2 minutos",
      difficulty: "Fácil",
      points: 10,
      time: "2 min",
      category: "Aritmética",
      problem: "¿Cuánto es 45 + 37?",
      answer: "82"
    },
    {
      id: 2,
      title: "Restas Intermedias",
      description: "Resuelve 8 restas con números de tres dígitos",
      difficulty: "Media",
      points: 20,
      time: "5 min",
      category: "Aritmética",
      problem: "¿Cuánto es 250 - 125?",
      answer: "125"
    },
    {
      id: 3,
      title: "Multiplicaciones",
      description: "Resuelve 5 multiplicaciones de dos cifras",
      difficulty: "Media",
      points: 30,
      time: "8 min",
      category: "Aritmética",
      problem: "¿Cuánto es 12 x 12?",
      answer: "144"
    },
    {
      id: 4,
      title: "Álgebra Básica",
      description: "Resuelve 3 ecuaciones lineales simples",
      difficulty: "Difícil",
      points: 50,
      time: "12 min",
      category: "Álgebra",
      problem: "Si 2x + 5 = 15, ¿cuánto vale x?",
      answer: "5"
    }
  ],
  "Lógica": [
    {
      id: 1,
      title: "Patrones Lógicos",
      description: "Identifica el patrón en la secuencia",
      difficulty: "Fácil",
      points: 15,
      time: "3 min",
      category: "Secuencias",
      problem: "2, 4, 8, 16... ¿Cuál sigue?",
      answer: "32"
    },
    {
      id: 2,
      title: "Series Numéricas",
      description: "Completa la serie",
      difficulty: "Media",
      points: 25,
      time: "6 min",
      category: "Secuencias",
      problem: "1, 1, 2, 3, 5, 8... ¿Cuál sigue?",
      answer: "13"
    }
  ],
  "Programación": [
    {
      id: 1,
      title: "Variables",
      description: "Fundamentos de JS",
      difficulty: "Fácil",
      points: 10,
      time: "2 min",
      category: "Fundamentos",
      problem: "¿Qué palabra clave se usa para una constante en JS?",
      answer: "const"
    }
  ],
  "Memoria": [
    {
      id: 1,
      title: "Secuencias Numéricas",
      difficulty: "Media",
      points: 20,
      time: "5 min",
      category: "MN",
      problem: "Repite: 5-8-2-1-9",
      answer: "58219"
    }
  ]
};

export const difficultyColors = {
  "Fácil": "#55efc4",
  "Media": "#ffeaa7",
  "Difícil": "#ff7675"
};

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
