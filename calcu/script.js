const screen = document.getElementById('screen');
const historyEl = document.getElementById('history');
const buttons = document.querySelectorAll('.btn');

let expression = '';
let resultDisplayed = false;

function updateScreen(value) {
  screen.textContent = value || '0';
}

function updateHistory(value = '') {
  historyEl.textContent = value;
}

function isOperator(char) {
  return ['+', '-', '*', '/', '%'].includes(char);
}

function formatForDisplay(exp) {
  if (!exp) return '0';
  return exp
    .replace(/\*/g, '×')
    .replace(/\//g, '÷')
    .replace(/-/g, '−');
}

function appendValue(value) {
  if (resultDisplayed && !isOperator(value)) {
    expression = '';
    updateHistory('');
    resultDisplayed = false;
  }

  const lastChar = expression.slice(-1);

  if (value === '.') {
    const parts = expression.split(/[\+\-\*\/%]/);
    const currentPart = parts[parts.length - 1];
    if (currentPart.includes('.')) return;
    if (!currentPart) value = '0.';
  }

  if (isOperator(value)) {
    if (!expression && value !== '-') return;
    if (isOperator(lastChar)) {
      expression = expression.slice(0, -1) + value;
      updateScreen(formatForDisplay(expression));
      return;
    }
  }

  expression += value;
  updateScreen(formatForDisplay(expression));
}

function clearAll() {
  expression = '';
  resultDisplayed = false;
  updateScreen('0');
  updateHistory('');
}

function deleteLast() {
  if (resultDisplayed) {
    clearAll();
    return;
  }
  expression = expression.slice(0, -1);
  updateScreen(formatForDisplay(expression));
}

function calculate() {
  if (!expression) return;

  let safeExpression = expression;

  if (isOperator(safeExpression.slice(-1))) {
    safeExpression = safeExpression.slice(0, -1);
  }

  if (!safeExpression) return;

  try {
    const result = Function('"use strict"; return (' + safeExpression + ')')();

    if (!Number.isFinite(result)) {
      updateScreen('Error');
      resultDisplayed = true;
      return;
    }

    updateHistory(formatForDisplay(safeExpression) + ' =');
    expression = String(parseFloat(result.toFixed(10)));
    updateScreen(expression);
    resultDisplayed = true;
  } catch {
    updateScreen('Error');
    resultDisplayed = true;
  }
}

buttons.forEach(button => {
  button.addEventListener('click', () => {
    const { value, action } = button.dataset;

    if (action === 'clear') return clearAll();
    if (action === 'delete') return deleteLast();
    if (action === 'calculate') return calculate();
    if (value) appendValue(value);
  });
});

window.addEventListener('keydown', (e) => {
  const key = e.key;

  if ((key >= '0' && key <= '9') || ['+', '-', '*', '/', '%', '.'].includes(key)) {
    appendValue(key);
  } else if (key === 'Enter' || key === '=') {
    e.preventDefault();
    calculate();
  } else if (key === 'Backspace') {
    deleteLast();
  } else if (key === 'Escape' || key.toLowerCase() === 'c') {
clearAll();
}
});
