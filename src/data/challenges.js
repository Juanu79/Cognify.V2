// Retos organizados por área - Nivel Bachillerato (Brilliant-style)
export const challengesByArea = {
  Matemáticas: [
    {
      id: 1,
      title: "Ecuaciones Cuadráticas",
      description: "Resuelve usando fórmula general",
      problem: "x² - 5x + 6 = 0. ¿Cuáles son las raíces?",
      answer: "x=2, x=3",
      hints: [
        "Recuerda: la fórmula general es x = (-b ± √(b²-4ac)) / 2a",
        "En esta ecuación: a=1, b=-5, c=6",
        "Calcula el discriminante: b²-4ac = 25-24 = 1"
      ],
      explanation: "Al aplicar la fórmula: x = (5 ± 1)/2, obtenemos x₁=3 y x₂=2. ¡Verifica sustituyendo!",
      difficulty: "Media",
      points: 25,
      time: "10 min",
      category: "Álgebra",
      unlocked: true
    },
    {
      id: 2,
      title: "Funciones Lineales",
      description: "Encuentra la intersección",
      problem: "f(x)=2x+1 y g(x)=-x+4. ¿En qué x se intersectan?",
      answer: "x=1",
      hints: [
        "Dos funciones se intersectan cuando f(x) = g(x)",
        "Iguala: 2x+1 = -x+4",
        "Despeja x: 3x = 3"
      ],
      explanation: "Al igualar: 2x+1 = -x+4 → 3x = 3 → x = 1. Verifica: f(1)=3 y g(1)=3 ✓",
      difficulty: "Media",
      points: 30,
      time: "12 min",
      category: "Álgebra",
      unlocked: true
    },
    {
      id: 3,
      title: "Trigonometría Básica",
      description: "Valores de ángulos notables",
      problem: "¿Cuánto vale sen(30°)?",
      answer: "0.5",
      hints: [
        "Recuerda el triángulo 30-60-90",
        "En un triángulo equilátero de lado 2, la altura es √3",
        "sen(30°) = cateto opuesto / hipotenusa = 1/2"
      ],
      explanation: "sen(30°) = 1/2 = 0.5. Este valor es fundamental en trigonometría.",
      difficulty: "Fácil",
      points: 20,
      time: "5 min",
      category: "Trigonometría",
      unlocked: true
    },
    {
      id: 4,
      title: "Derivadas Simples",
      description: "Calcula la derivada",
      problem: "f(x) = 3x² + 2x. ¿Cuál es f'(x)?",
      answer: "6x+2",
      hints: [
        "Regla de potencia: d/dx[xⁿ] = n·xⁿ⁻¹",
        "La derivada es lineal: (af+bg)' = af' + bg'",
        "Deriva término por término"
      ],
      explanation: "f'(x) = 3·2x¹ + 2·1x⁰ = 6x + 2. ¡La derivada de una constante sería 0!",
      difficulty: "Difícil",
      points: 40,
      time: "15 min",
      category: "Cálculo",
      unlocked: false,
      unlockRequirement: { area: "Matemáticas", challengeId: 3 }
    },
    {
      id: 5,
      title: "Probabilidad",
      description: "Probabilidad condicional",
      problem: "Si P(A)=0.4 y P(B|A)=0.5, ¿cuánto vale P(A∩B)?",
      answer: "0.2",
      hints: [
        "Fórmula: P(B|A) = P(A∩B) / P(A)",
        "Despeja: P(A∩B) = P(B|A) × P(A)",
        "Multiplica: 0.5 × 0.4"
      ],
      explanation: "P(A∩B) = P(B|A) × P(A) = 0.5 × 0.4 = 0.2. ¡Esta es la regla de multiplicación!",
      difficulty: "Media",
      points: 35,
      time: "10 min",
      category: "Estadística",
      unlocked: false,
      unlockRequirement: { area: "Matemáticas", challengeId: 2 }
    }
  ],
  Lógica: [
    {
      id: 1,
      title: "Silogismos",
      description: "Identifica la conclusión válida",
      problem: "Todos los humanos son mortales. Sócrates es humano. Conclusión:",
      answer: "Sócrates es mortal",
      hints: [
        "Un silogismo tiene: premisa mayor, premisa menor, conclusión",
        "Si A→B y C→A, entonces C→B",
        "Aplica la transitividad"
      ],
      explanation: "Por transitividad: si todos los humanos son mortales y Sócrates es humano, entonces Sócrates es mortal.",
      difficulty: "Fácil",
      points: 20,
      time: "5 min",
      category: "Lógica Formal",
      unlocked: true
    },
    {
      id: 2,
      title: "Tablas de Verdad",
      description: "Operador lógico AND",
      problem: "Si P=true y Q=false, ¿cuánto vale P AND Q?",
      answer: "false",
      hints: [
        "AND solo es true si AMBOS operandos son true",
        "true AND false = ?",
        "Piensa en interruptores en serie"
      ],
      explanation: "P AND Q es true solo cuando P=true Y Q=true. Como Q=false, el resultado es false.",
      difficulty: "Media",
      points: 25,
      time: "8 min",
      category: "Lógica Proposicional",
      unlocked: true
    },
    {
      id: 3,
      title: "Falacias",
      description: "Identifica el tipo de falacia",
      problem: "'No puedes criticar el gobierno porque no eres político'. ¿Qué falacia es?",
      answer: "ad hominem",
      hints: [
        "¿Se ataca a la persona en lugar del argumento?",
        "Esta falacia desvía la atención del tema principal",
        "Busca: 'contra la persona' en latín"
      ],
      explanation: "Es falacia ad hominem: se ataca a la persona (no ser político) en lugar de refutar el argumento.",
      difficulty: "Difícil",
      points: 35,
      time: "10 min",
      category: "Pensamiento Crítico",
      unlocked: false,
      unlockRequirement: { area: "Lógica", challengeId: 2 }
    },
    {
      id: 4,
      title: "Analogías",
      description: "Completa la analogía",
      problem: "Libro es a leer como piano es a: ?",
      answer: "tocar",
      hints: [
        "¿Qué acción se realiza CON un libro?",
        "Busca la relación: objeto → acción principal",
        "¿Qué haces con un piano?"
      ],
      explanation: "Relación: objeto → acción. Se lee un libro, se toca un piano. ¡Las analogías prueban razonamiento relacional!",
      difficulty: "Media",
      points: 22,
      time: "6 min",
      category: "Razonamiento",
      unlocked: true
    }
  ],
  Programación: [
    {
      id: 1,
      title: "Variables en JS",
      description: "Declaración correcta",
      problem: "¿Cómo declaras una constante en JavaScript?",
      answer: "const",
      hints: [
        "Hay 3 formas: var, let, const",
        "Una constante NO puede cambiar después de declararse",
        "Empieza con 'c'"
      ],
      explanation: "Se usa 'const nombre = valor;'. Las constantes son inmutables, ideal para valores fijos.",
      difficulty: "Fácil",
      points: 15,
      time: "3 min",
      category: "Fundamentos",
      unlocked: true
    },
    {
      id: 2,
      title: "Condicionales",
      description: "Sintaxis if-else",
      problem: "¿Qué operador se usa para comparar igualdad estricta en JS?",
      answer: "===",
      hints: [
        "Hay == (igualdad) y === (estricta)",
        "La estricta compara valor Y tipo de dato",
        "Son tres signos de igual"
      ],
      explanation: "=== compara valor y tipo. Ej: 5 === '5' es false porque uno es number y otro string.",
      difficulty: "Media",
      points: 25,
      time: "5 min",
      category: "Estructuras de Control",
      unlocked: true
    },
    {
      id: 3,
      title: "Bucles",
      description: "Iteración con for",
      problem: "¿Cuántas veces se ejecuta: for(let i=0; i<5; i++)?",
      answer: "5",
      hints: [
        "i empieza en 0",
        "El bucle corre mientras i < 5",
        "Cuenta: 0, 1, 2, 3, 4"
      ],
      explanation: "i toma valores 0,1,2,3,4 (5 valores). Cuando i=5, la condición i<5 es false y termina.",
      difficulty: "Fácil",
      points: 20,
      time: "4 min",
      category: "Estructuras de Control",
      unlocked: false,
      unlockRequirement: { area: "Programación", challengeId: 1 }
    },
    {
      id: 4,
      title: "Funciones",
      description: "Retorno de valor",
      problem: "function suma(a,b){return a+b}. ¿Qué retorna suma(3,4)?",
      answer: "7",
      hints: [
        "La función recibe dos parámetros: a y b",
        "return a+b significa que devuelve la suma",
        "3 + 4 = ?"
      ],
      explanation: "suma(3,4) → a=3, b=4 → return 3+4 → 7. ¡Las funciones encapsulan lógica reutilizable!",
      difficulty: "Media",
      points: 30,
      time: "6 min",
      category: "Fundamentos",
      unlocked: true
    }
  ],
  Memoria: [
    {
      id: 1,
      title: "Fórmulas",
      description: "Geometría básica",
      problem: "¿Cuál es la fórmula del área de un círculo?",
      answer: "pi*r²",
      hints: [
        "Depende del radio (r)",
        "Incluye la constante π (pi)",
        "El radio está elevado al cuadrado"
      ],
      explanation: "Área = π × r². π ≈ 3.1416. Esta fórmula es fundamental en geometría y física.",
      difficulty: "Media",
      points: 25,
      time: "5 min",
      category: "Memoria Académica",
      unlocked: true
    },
    {
      id: 2,
      title: "Vocabulario",
      description: "Términos en inglés",
      problem: "¿Qué significa 'array' en programación?",
      answer: "arreglo",
      hints: [
        "Es una estructura de datos",
        "Almacena múltiples valores en orden",
        "En español también se dice 'vector' o 'lista'"
      ],
      explanation: "Array = arreglo: colección ordenada de elementos accesibles por índice. Fundamental en cualquier lenguaje.",
      difficulty: "Fácil",
      points: 18,
      time: "4 min",
      category: "Memoria Verbal",
      unlocked: true
    },
    {
      id: 3,
      title: "Algoritmos",
      description: "Ordenamiento",
      problem: "¿Qué algoritmo usa 'dividir y vencerás' para ordenar?",
      answer: "quicksort",
      hints: [
        "Elige un 'pivote' y particiona el array",
        "Recursivamente ordena las subpartes",
        "Nombre en inglés, empieza con 'q'"
      ],
      explanation: "Quicksort: elige pivote, particiona, ordena recursivamente. Complejidad promedio: O(n log n).",
      difficulty: "Difícil",
      points: 40,
      time: "12 min",
      category: "Memoria Procedimental",
      unlocked: false,
      unlockRequirement: { area: "Memoria", challengeId: 2 }
    },
    {
      id: 4,
      title: "Historia",
      description: "Fechas importantes",
      problem: "¿En qué año llegó el hombre a la Luna?",
      answer: "1969",
      hints: [
        "Fue en el siglo XX",
        "Misión Apollo 11",
        "Antes del año 2000, después de 1960"
      ],
      explanation: "20 de julio de 1969: Neil Armstrong y Buzz Aldrin caminaron en la Luna. 'Un pequeño paso para el hombre...'",
      difficulty: "Media",
      points: 22,
      time: "5 min",
      category: "Memoria Semántica",
      unlocked: true
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
