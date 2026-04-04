// Retos organizados por área - Nivel Bachillerato (CON PROBLEMAS Y RESPUESTAS)
export const challengesByArea = {
  Matemáticas: [
    {
      id: 1,
      title: "Ecuaciones Cuadráticas",
      description: "Resuelve usando fórmula general",
      problem: "x² - 5x + 6 = 0. ¿Cuáles son las raíces?",
      answer: "x=2, x=3",
      difficulty: "Media",
      points: 25,
      time: "10 min",
      category: "Álgebra"
    },
    {
      id: 2,
      title: "Funciones Lineales",
      description: "Encuentra la intersección",
      problem: "f(x)=2x+1 y g(x)=-x+4. ¿En qué x se intersectan?",
      answer: "x=1",
      difficulty: "Media",
      points: 30,
      time: "12 min",
      category: "Álgebra"
    },
    {
      id: 3,
      title: "Trigonometría Básica",
      description: "Valores de ángulos notables",
      problem: "¿Cuánto vale sen(30°)?",
      answer: "0.5",
      difficulty: "Fácil",
      points: 20,
      time: "5 min",
      category: "Trigonometría"
    },
    {
      id: 4,
      title: "Derivadas Simples",
      description: "Calcula la derivada",
      problem: "f(x) = 3x² + 2x. ¿Cuál es f'(x)?",
      answer: "6x+2",
      difficulty: "Difícil",
      points: 40,
      time: "15 min",
      category: "Cálculo"
    },
    {
      id: 5,
      title: "Probabilidad",
      description: "Probabilidad condicional",
      problem: "Si P(A)=0.4 y P(B|A)=0.5, ¿cuánto vale P(A∩B)?",
      answer: "0.2",
      difficulty: "Media",
      points: 35,
      time: "10 min",
      category: "Estadística"
    }
  ],
  Lógica: [
    {
      id: 1,
      title: "Silogismos",
      description: "Identifica la conclusión válida",
      problem: "Todos los humanos son mortales. Sócrates es humano. Conclusión:",
      answer: "Sócrates es mortal",
      difficulty: "Fácil",
      points: 20,
      time: "5 min",
      category: "Lógica Formal"
    },
    {
      id: 2,
      title: "Tablas de Verdad",
      description: "Operador lógico AND",
      problem: "Si P=true y Q=false, ¿cuánto vale P AND Q?",
      answer: "false",
      difficulty: "Media",
      points: 25,
      time: "8 min",
      category: "Lógica Proposicional"
    },
    {
      id: 3,
      title: "Falacias",
      description: "Identifica el tipo de falacia",
      problem: "'No puedes criticar el gobierno porque no eres político'. ¿Qué falacia es?",
      answer: "ad hominem",
      difficulty: "Difícil",
      points: 35,
      time: "10 min",
      category: "Pensamiento Crítico"
    },
    {
      id: 4,
      title: "Analogías",
      description: "Completa la analogía",
      problem: "Libro es a leer como piano es a: ?",
      answer: "tocar",
      difficulty: "Media",
      points: 22,
      time: "6 min",
      category: "Razonamiento"
    }
  ],
  Programación: [
    {
      id: 1,
      title: "Variables en JS",
      description: "Declaración correcta",
      problem: "¿Cómo declaras una constante en JavaScript?",
      answer: "const",
      difficulty: "Fácil",
      points: 15,
      time: "3 min",
      category: "Fundamentos"
    },
    {
      id: 2,
      title: "Condicionales",
      description: "Sintaxis if-else",
      problem: "¿Qué operador se usa para comparar igualdad estricta en JS?",
      answer: "===",
      difficulty: "Media",
      points: 25,
      time: "5 min",
      category: "Estructuras de Control"
    },
    {
      id: 3,
      title: "Bucles",
      description: "Iteración con for",
      problem: "¿Cuántas veces se ejecuta: for(let i=0; i<5; i++)?",
      answer: "5",
      difficulty: "Fácil",
      points: 20,
      time: "4 min",
      category: "Estructuras de Control"
    },
    {
      id: 4,
      title: "Funciones",
      description: "Retorno de valor",
      problem: "function suma(a,b){return a+b}. ¿Qué retorna suma(3,4)?",
      answer: "7",
      difficulty: "Media",
      points: 30,
      time: "6 min",
      category: "Fundamentos"
    }
  ],
  Memoria: [
    {
      id: 1,
      title: "Fórmulas",
      description: "Geometría básica",
      problem: "¿Cuál es la fórmula del área de un círculo?",
      answer: "pi*r²",
      difficulty: "Media",
      points: 25,
      time: "5 min",
      category: "Memoria Académica"
    },
    {
      id: 2,
      title: "Vocabulario",
      description: "Términos en inglés",
      problem: "¿Qué significa 'array' en programación?",
      answer: "arreglo",
      difficulty: "Fácil",
      points: 18,
      time: "4 min",
      category: "Memoria Verbal"
    },
    {
      id: 3,
      title: "Algoritmos",
      description: "Ordenamiento",
      problem: "¿Qué algoritmo usa 'dividir y vencerás' para ordenar?",
      answer: "quicksort",
      difficulty: "Difícil",
      points: 40,
      time: "12 min",
      category: "Memoria Procedimental"
    },
    {
      id: 4,
      title: "Historia",
      description: "Fechas importantes",
      problem: "¿En qué año llegó el hombre a la Luna?",
      answer: "1969",
      difficulty: "Media",
      points: 22,
      time: "5 min",
      category: "Memoria Semántica"
    }
  ]
};

// Dificultad por color
export const difficultyColors = {
  Fácil: "#55efc4",
  Media: "#ffeaa7",
  Difícil: "#ff7675"
};

// Categoría por ícono
export const categoryIcons = {
  "Álgebra": "AL",
  "Trigonometría": "TR",
  "Cálculo": "CA",
  "Estadística": "ES",
  "Lógica Formal": "LF",
  "Lógica Proposicional": "LP",
  "Pensamiento Crítico": "PC",
  "Razonamiento": "RZ",
  "Fundamentos": "FD",
  "Estructuras de Control": "EC",
  "Memoria Académica": "MA",
  "Memoria Verbal": "MV",
  "Memoria Procedimental": "MP",
  "Memoria Semántica": "MS"
};
