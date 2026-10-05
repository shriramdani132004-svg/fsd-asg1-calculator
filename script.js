let currentInput = "0";
let firstOperand = null;
let selectedOperator = null;
let waitingForSecondOperand = false;
let justCalculated = false;
let hasError = false;

const display = document.getElementById("display");

function updateDisplay() {
    display.textContent = currentInput;
}

function clearCalculator() {
    currentInput = "0";
    firstOperand = null;
    selectedOperator = null;
    waitingForSecondOperand = false;
    justCalculated = false;
    hasError = false;
    updateDisplay();
}

function formatResult(value) {
    if (!Number.isFinite(value)) {
        return null;
    }

    const rounded = Number.parseFloat(value.toPrecision(12));
    return String(rounded);
}

function showError() {
    currentInput = "Error";
    firstOperand = null;
    selectedOperator = null;
    waitingForSecondOperand = true;
    justCalculated = false;
    hasError = true;
    updateDisplay();
}

function performOperation(a, b, operator) {
    switch (operator) {
        case "+":
            return a + b;

        case "-":
            return a - b;

        case "*":
            return a * b;

        case "/":
            return b === 0 ? null : a / b;

        default:
            return null;
    }
}

function appendNumber(value) {
    if (hasError) {
        clearCalculator();
    }

    if (justCalculated) {
        currentInput = value === "." ? "0." : value;
        firstOperand = null;
        selectedOperator = null;
        waitingForSecondOperand = false;
        justCalculated = false;
        updateDisplay();
        return;
    }

    if (waitingForSecondOperand) {
        currentInput = value === "." ? "0." : value;
        waitingForSecondOperand = false;
        updateDisplay();
        return;
    }

    if (value === ".") {
        if (currentInput.includes(".")) {
            return;
        }

        currentInput += ".";
    } else if (currentInput === "0") {
        currentInput = value;
    } else {
        currentInput += value;
    }

    updateDisplay();
}

function chooseOperator(nextOperator) {
    if (hasError) {
        return;
    }

    const inputValue = Number(currentInput);

    if (!Number.isFinite(inputValue)) {
        showError();
        return;
    }

    if (firstOperand === null) {
        firstOperand = inputValue;
    } else if (!waitingForSecondOperand && selectedOperator !== null) {
        const result = performOperation(
            firstOperand,
            inputValue,
            selectedOperator
        );

        const formatted = result === null ? null : formatResult(result);

        if (formatted === null) {
            showError();
            return;
        }

        currentInput = formatted;
        firstOperand = Number(formatted);
        updateDisplay();
    }

    selectedOperator = nextOperator;
    waitingForSecondOperand = true;
    justCalculated = false;
}

function calculate() {
    if (
        hasError ||
        firstOperand === null ||
        selectedOperator === null ||
        waitingForSecondOperand
    ) {
        return;
    }

    const secondOperand = Number(currentInput);

    if (!Number.isFinite(secondOperand)) {
        showError();
        return;
    }

    const result = performOperation(
        firstOperand,
        secondOperand,
        selectedOperator
    );

    const formatted = result === null ? null : formatResult(result);

    if (formatted === null) {
        showError();
        return;
    }

    currentInput = formatted;
    firstOperand = null;
    selectedOperator = null;
    waitingForSecondOperand = false;
    justCalculated = true;

    updateDisplay();
}

function deleteLast() {
    if (hasError) {
        clearCalculator();
        return;
    }

    if (waitingForSecondOperand || justCalculated) {
        return;
    }

    currentInput =
        currentInput.length > 1
            ? currentInput.slice(0, -1)
            : "0";

    if (currentInput === "-" || currentInput === "") {
        currentInput = "0";
    }

    updateDisplay();
}

document.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
        if (button.dataset.number !== undefined) {
            appendNumber(button.dataset.number);
        } else if (button.dataset.operator) {
            chooseOperator(button.dataset.operator);
        } else if (button.dataset.action === "equals") {
            calculate();
        } else if (button.dataset.action === "clear") {
            clearCalculator();
        } else if (button.dataset.action === "delete") {
            deleteLast();
        }
    });
});

document.addEventListener("keydown", (event) => {
    const key = event.key;

    if (/^[0-9.]$/.test(key)) {
        event.preventDefault();
        appendNumber(key);
    } else if (["+", "-", "*", "/"].includes(key)) {
        event.preventDefault();
        chooseOperator(key);
    } else if (key === "Enter" || key === "=") {
        event.preventDefault();
        calculate();
    } else if (key === "Escape" || key.toLowerCase() === "c") {
        event.preventDefault();
        clearCalculator();
    } else if (key === "Backspace") {
        event.preventDefault();
        deleteLast();
    }
});

updateDisplay();
