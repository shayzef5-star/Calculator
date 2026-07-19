const display = document.getElementById('result');
const expressionDisplay = document.getElementById('expression');

let currentValue = '0';
let previousValue = '';
let operator = null;
let waitingForOperand = false;
let expression = '';
let shouldResetDisplay = false;
let lastAction = '';

function updateDisplay() {
    const displayValue = currentValue;
    if (displayValue.length > 12) {
        display.textContent = parseFloat(displayValue).toExponential(6);
        display.classList.add('shrink');
    } else {
        display.textContent = displayValue;
        display.classList.remove('shrink');
    }
    expressionDisplay.textContent = expression;
}

function inputDigit(digit) {
    if (shouldResetDisplay) {
        currentValue = '0';
        shouldResetDisplay = false;
    }

    if (digit === '0' && currentValue === '0') return;

    if (currentValue === '0' && digit !== '.') {
        currentValue = digit;
    } else {
        if (currentValue.length >= 15) return;
        currentValue += digit;
    }
    lastAction = 'digit';
    updateDisplay();
}

function inputDecimal() {
    if (shouldResetDisplay) {
        currentValue = '0';
        shouldResetDisplay = false;
    }

    if (!currentValue.includes('.')) {
        currentValue += '.';
    }
    lastAction = 'decimal';
    updateDisplay();
}

function handleOperator(nextOperator) {
    const current = parseFloat(currentValue);

    if (operator && !waitingForOperand) {
        const result = calculate(parseFloat(previousValue), current, operator);
        currentValue = String(result);
        expression = `${formatNumber(result)} ${getSymbol(nextOperator)} `;
    } else {
        expression = `${formatNumber(current)} ${getSymbol(nextOperator)} `;
    }

    previousValue = currentValue;
    operator = nextOperator;
    waitingForOperand = true;
    shouldResetDisplay = true;
    lastAction = 'operator';
    updateDisplay();
}

function getSymbol(op) {
    switch (op) {
        case '+': return '+';
        case '-': return '−';
        case '*': return '×';
        case '/': return '÷';
        default: return op;
    }
}

function calculate(a, b, op) {
    switch (op) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/': return a / b;
        default: return b;
    }
}

function formatNumber(num) {
    if (Number.isInteger(num)) {
        return String(num);
    }
    return String(parseFloat(num.toFixed(10)));
}

function handleEquals() {
    if (!operator) {
        if (lastAction === 'equals') return;
        return;
    }

    const current = parseFloat(currentValue);
    const result = calculate(parseFloat(previousValue), current, operator);

    expression = `${formatNumber(parseFloat(previousValue))} ${getSymbol(operator)} ${formatNumber(current)} =`;
    currentValue = String(result);
    operator = null;
    previousValue = '';
    waitingForOperand = true;
    shouldResetDisplay = true;
    lastAction = 'equals';
    updateDisplay();
}

function clearAll() {
    currentValue = '0';
    previousValue = '';
    operator = null;
    waitingForOperand = false;
    expression = '';
    shouldResetDisplay = false;
    lastAction = 'clear';
    updateDisplay();
}

function toggleSign() {
    if (currentValue === '0') return;
    if (currentValue.startsWith('-')) {
        currentValue = currentValue.slice(1);
    } else {
        currentValue = '-' + currentValue;
    }
    updateDisplay();
}

function percent() {
    const current = parseFloat(currentValue);
    if (isNaN(current)) return;

    if (operator && previousValue) {
        // Если есть операция — считаем процент от предыдущего числа
        const prev = parseFloat(previousValue);
        const result = prev * (current / 100);
        currentValue = String(result);
    } else {
        // Если нет операции — просто делим на 100
        currentValue = String(current / 100);
    }
    updateDisplay();
}

function backspace() {
    if (shouldResetDisplay || waitingForOperand) return;
    if (currentValue.length > 1) {
        currentValue = currentValue.slice(0, -1);
    } else {
        currentValue = '0';
    }
    updateDisplay();
}

document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', (e) => {
        e.stopPropagation();
        const value = button.dataset.value;

        if (button.classList.contains('dark') || button.classList.contains('gray')) {
            if (value === 'clear') {
                clearAll();
            } else if (value === 'sign') {
                toggleSign();
            } else if (value === 'percent') {
                percent();
            } else if (value === '.') {
                inputDecimal();
            } else {
                inputDigit(value);
            }
        } else if (button.classList.contains('orange')) {
            if (value === '=') {
                handleEquals();
            } else {
                handleOperator(value);
            }
        }
    });
});

document.addEventListener('keydown', (e) => {
    const key = e.key;

    if (key >= '0' && key <= '9') {
        e.preventDefault();
        inputDigit(key);
    } else if (key === '.') {
        e.preventDefault();
        inputDecimal();
    } else if (key === ',') {
        e.preventDefault();
        inputDecimal();
    } else if (key === '+' || key === '-' || key === '*' || key === '/') {
        e.preventDefault();
        handleOperator(key);
    } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        handleEquals();
    } else if (key === 'Backspace') {
        e.preventDefault();
        backspace();
    } else if (key === 'Escape' || key === 'c' || key === 'C') {
        clearAll();
    } else if (key === '%') {
        percent();
    }
});

updateDisplay();