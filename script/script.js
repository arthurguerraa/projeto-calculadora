/* ----------------------
  script.js - lógica da calculadora (corrigido: aceita '−' e normaliza operadores)
------------------------*/

// --- Funções matemáticas básicas ---
function soma(a, b) {
  return a + b;
}
function subtrair(a, b) {
  return a - b;
}
function multiplicar(a, b) {
  return a * b;
}
function dividir(a, b) {
  return a / b;
}

/*
  calcular: converte entradas, valida e retorna:
    - número (resultado)
    - null (erro genérico)
    - "DIV_ZERO" (caso específico de divisão por zero)
*/
function calcular(n1, operador, n2) {
  const a = parseFloat(n1);
  const b = parseFloat(n2);

  if (Number.isNaN(a) || Number.isNaN(b)) {
    return null;
  }

  if ((operador === "/" || operador === "÷") && b === 0) {
    return "DIV_ZERO";
  }

  switch (operador) {
    case "+":
      return soma(a, b);
    case "-":
    case "−": // aceita também o sinal unicode
      return subtrair(a, b);
    case "×":
    case "*":
      return multiplicar(a, b);
    case "÷":
    case "/":
      return dividir(a, b);
    default:
      return null;
  }
}

// --- Estado da calculadora ---
const calculadora = {
  displayValue: "0",
  primeiroOperando: null,
  operador: null,
  esperandoSegundo: false,
  resultadoMostrado: false
};

// --- Seletores DOM ---
const elementoDisplay = document.getElementById("display");
const teclasEl = document.querySelector(".keys");

// Atualiza o display
function atualizarDisplay() {
  elementoDisplay.textContent = calculadora.displayValue;
}

// Formatar resultado para caber no display
function formatarResultado(value) {
  if (value === null) return "Erro";
  if (value === "DIV_ZERO") return "Erro: divisão por 0 — boa tentativa 😉";

  const MAX_CHARS = 12;
  const num = Number(value);
  if (!isFinite(num)) return "Erro";

  let str = String(parseFloat(num.toFixed(10)));
  if (str.length <= MAX_CHARS) return str;

  const intPart = Math.trunc(Math.abs(num)).toString();
  if (intPart.length >= MAX_CHARS) {
    return num.toExponential(6);
  }

  const availableForDecimals = MAX_CHARS - intPart.length - (num < 0 ? 1 : 0) - 1;
  const decimals = Math.max(0, availableForDecimals);
  str = String(parseFloat(num.toFixed(decimals)));

  if (str.length > MAX_CHARS) {
    return num.toExponential(6);
  }

  return str;
}

// Inserir dígito
function inserirDigito(digito) {
  if (calculadora.esperandoSegundo) {
    calculadora.displayValue = digito;
    calculadora.esperandoSegundo = false;
  } else if (calculadora.resultadoMostrado) {
    calculadora.displayValue = digito;
    calculadora.resultadoMostrado = false;
    calculadora.primeiroOperando = null;
    calculadora.operador = null;
  } else {
    calculadora.displayValue = calculadora.displayValue === "0" ? digito : calculadora.displayValue + digito;
  }
}

// Inserir decimal
function inserirDecimal() {
  if (calculadora.esperandoSegundo) {
    calculadora.displayValue = "0.";
    calculadora.esperandoSegundo = false;
    return;
  }
  if (!calculadora.displayValue.includes(".")) {
    calculadora.displayValue += ".";
  }
}

// Reset
function resetarCalculadora() {
  calculadora.displayValue = "0";
  calculadora.primeiroOperando = null;
  calculadora.operador = null;
  calculadora.esperandoSegundo = false;
  calculadora.resultadoMostrado = false;
}

// Backspace
function retroceder() {
  if (calculadora.resultadoMostrado) {
    resetarCalculadora();
    return;
  }
  if (calculadora.displayValue.length === 1) {
    calculadora.displayValue = "0";
  } else {
    calculadora.displayValue = calculadora.displayValue.slice(0, -1);
  }
}

// Porcentagem
function porcentagem() {
  const val = parseFloat(calculadora.displayValue);
  if (Number.isNaN(val)) return;
  calculadora.displayValue = String(val / 100);
}

// Normalizar operador (converte símbolos visuais para formas consistentes)
// opcional mas ajuda evitar bugs com diferentes símbolos
function normalizarOperador(op) {
  if (!op) return op;
  const mapa = {
    "×": "*",
    "÷": "/",
    "−": "-"
  };
  return mapa[op] || op;
}

// Tratar operador (quando usuário clica em + - × ÷)
function tratarOperador(proximoOperadorRaw) {
  // normaliza para passar pra calcular quando necessário
  const proximoOperador = proximoOperadorRaw; // guardamos o símbolo exibido para UI
  const proximoOperadorNormalizado = normalizarOperador(proximoOperadorRaw);

  const valorAtual = calculadora.displayValue;

  if (calculadora.primeiroOperando === null && !calculadora.esperandoSegundo) {
    calculadora.primeiroOperando = parseFloat(valorAtual);
  } else if (calculadora.operador && !calculadora.esperandoSegundo) {
    // usamos operador armazenado (pode ser simbólico '×','÷','−' ou ASCII); calcular aceita ambos
    // para segurança, passamos a forma original (já aceita unicode no calcular)
    const resultado = calcular(calculadora.primeiroOperando, calculadora.operador, valorAtual);

    if (resultado === "DIV_ZERO") {
      calculadora.displayValue = "Erro: divisão por 0 — boa tentativa 😉";
      calculadora.primeiroOperando = null;
      calculadora.operador = null;
      calculadora.esperandoSegundo = false;
      calculadora.resultadoMostrado = true;
      atualizarDisplay();
      return;
    }

    if (resultado === null) {
      calculadora.displayValue = "Erro";
      calculadora.primeiroOperando = null;
      calculadora.operador = null;
      calculadora.esperandoSegundo = false;
      calculadora.resultadoMostrado = true;
      atualizarDisplay();
      return;
    }

    const formatado = formatarResultado(resultado);
    calculadora.displayValue = formatado;
    calculadora.primeiroOperando = parseFloat(formatado);
    calculadora.resultadoMostrado = true;
  }

  // Atualiza o operador que será exibido/armazenado (mantemos o símbolo do botão para UX)
  calculadora.operador = proximoOperadorRaw;
  calculadora.esperandoSegundo = true;
}

// Tratar '='
function tratarIgual() {
  if (calculadora.operador === null) return;
  if (calculadora.esperandoSegundo) return;

  const resultado = calcular(calculadora.primeiroOperando, calculadora.operador, calculadora.displayValue);

  if (resultado === "DIV_ZERO") {
    calculadora.displayValue = "Erro: divisão por 0 — boa tentativa 😉";
    calculadora.primeiroOperando = null;
    calculadora.operador = null;
    calculadora.esperandoSegundo = false;
    calculadora.resultadoMostrado = true;
    atualizarDisplay();
    return;
  }

  if (resultado === null) {
    calculadora.displayValue = "Erro";
    calculadora.primeiroOperando = null;
    calculadora.operador = null;
    calculadora.esperandoSegundo = false;
    calculadora.resultadoMostrado = true;
    atualizarDisplay();
    return;
  }

  const formatado = formatarResultado(resultado);
  calculadora.displayValue = formatado;
  calculadora.primeiroOperando = parseFloat(formatado);
  calculadora.operador = null;
  calculadora.esperandoSegundo = false;
  calculadora.resultadoMostrado = true;
}

// Delegação de eventos
teclasEl.addEventListener("click", (evento) => {
  const alvo = evento.target.closest("button");
  if (!alvo) return;

  if (alvo.classList.contains("clear")) {
    resetarCalculadora();
    atualizarDisplay();
    return;
  }

  if (alvo.id === "btn-back") {
    retroceder();
    atualizarDisplay();
    return;
  }

  if (alvo.id === "btn-percent") {
    porcentagem();
    atualizarDisplay();
    return;
  }

  if (alvo.classList.contains("operator")) {
    const op = alvo.textContent.trim();
    tratarOperador(op);
    atualizarDisplay();
    return;
  }

  if (alvo.classList.contains("equals")) {
    tratarIgual();
    atualizarDisplay();
    return;
  }

  if (alvo.id === "btn-dot") {
    inserirDecimal();
    atualizarDisplay();
    return;
  }

  const digito = alvo.textContent.trim();
  if (/^\d$/.test(digito)) {
    inserirDigito(digito);
    atualizarDisplay();
    return;
  }
});

// Suporte teclado físico (mantive como antes)
document.addEventListener("keydown", (e) => {
  if (e.key >= "0" && e.key <= "9") {
    inserirDigito(e.key);
    atualizarDisplay();
    return;
  }

  if (e.key === "." || e.key === ",") {
    inserirDecimal();
    atualizarDisplay();
    return;
  }

  if (e.key === "+" || e.key === "-" || e.key === "*" || e.key === "/") {
    const mapa = { "*": "×", "/": "÷" };
    const op = mapa[e.key] || e.key;
    tratarOperador(op);
    atualizarDisplay();
    return;
  }

  if (e.key === "Enter" || e.key === "=") {
    e.preventDefault();
    tratarIgual();
    atualizarDisplay();
    return;
  }

  if (e.key === "Backspace") {
    retroceder();
    atualizarDisplay();
    return;
  }

  if (e.key === "Escape") {
    resetarCalculadora();
    atualizarDisplay();
    return;
  }
});

// Inicializa display
atualizarDisplay();
