let expression = "";
let justCalculated = false;
let hasError = false;

const display = document.getElementById("display");
const status = document.getElementById("status");

function render() {
    display.textContent = expression || "0";
}

function setStatus(message) {
    status.textContent = message;
}

function clearCalculator() {
    expression = "";
    justCalculated = false;
    hasError = false;

    setStatus("Ready");
    render();
}

function showError(message) {
    expression = "Error";
    justCalculated = false;
    hasError = true;

    setStatus(message);
    render();
}

function formatNumber(value) {
    if (!Number.isFinite(value)) {
        return null;
    }

    return String(Number.parseFloat(value.toPrecision(12)));
}

/*
 * Assignment requirement:
 * Basic arithmetic is implemented using a JavaScript function
 * and a switch statement.
 */
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
    if (hasError || justCalculated) {
        expression = "";
        hasError = false;
        justCalculated = false;
    }

    const parts = expression.split(/[+\-*/]/);
    const currentNumber = parts[parts.length - 1];

    if (value === ".") {
        if (currentNumber.includes(".")) {
            return;
        }

        if (
            expression === "" ||
            /[+\-*/]$/.test(expression)
        ) {
            expression += "0.";
        } else {
            expression += ".";
        }
    } else {
        if (currentNumber === "0") {
            expression =
                expression.slice(0, -1) + value;
        } else {
            expression += value;
        }
    }

    setStatus("Entering number");
    render();
}

function chooseOperator(nextOperator) {
    if (hasError || expression === "") {
        return;
    }

    /*
     * Important:
     * The operator is immediately added to the visible display.
     * So 85 then + visibly becomes "85 +".
     */
    if (/[+\-*/]$/.test(expression)) {
        expression =
            expression.slice(0, -1) + nextOperator;
    } else {
        expression += nextOperator;
    }

    justCalculated = false;

    setStatus("Operator selected");
    render();
}

function calculate() {
    if (
        hasError ||
        expression === "" ||
        !/[+\-*/]/.test(expression)
    ) {
        return;
    }

    if (/[+\-*/]$/.test(expression)) {
        showError("Enter a second number");
        return;
    }

    const tokens = expression.match(
        /(?:\d+(?:\.\d*)?|\.\d+)|[+\-*/]/g
    );

    if (!tokens) {
        showError("Invalid expression");
        return;
    }

    let result = Number(tokens[0]);

    if (!Number.isFinite(result)) {
        showError("Invalid number");
        return;
    }

    for (let i = 1; i < tokens.length; i += 2) {
        const operator = tokens[i];
        const operand = Number(tokens[i + 1]);

        if (!Number.isFinite(operand)) {
            showError("Invalid number");
            return;
        }

        const nextResult =
            performOperation(
                result,
                operand,
                operator
            );

        if (nextResult === null) {
            showError("Cannot divide by zero");
            return;
        }

        result = nextResult;
    }

    const formatted = formatNumber(result);

    if (formatted === null) {
        showError("Invalid result");
        return;
    }

    expression = formatted;
    justCalculated = true;

    setStatus("Calculated");
    render();
}

function deleteLast() {
    if (hasError || justCalculated) {
        clearCalculator();
        return;
    }

    expression = expression.slice(0, -1);

    setStatus(
        expression ? "Editing" : "Ready"
    );

    render();
}

/*
 * Button events
 */
document.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {

        const number = button.dataset.number;
        const operator = button.dataset.operator;
        const action = button.dataset.action;

        if (number !== undefined) {
            appendNumber(number);

        } else if (operator) {
            chooseOperator(operator);

        } else if (action === "equals") {
            calculate();

        } else if (action === "clear") {
            clearCalculator();

        } else if (action === "delete") {
            deleteLast();
        }
    });
});

/*
 * Keyboard support
 */
document.addEventListener("keydown", (event) => {
    const key = event.key;

    if (/^[0-9.]$/.test(key)) {
        event.preventDefault();
        appendNumber(key);

    } else if (
        ["+", "-", "*", "/"].includes(key)
    ) {
        event.preventDefault();
        chooseOperator(key);

    } else if (
        key === "Enter" ||
        key === "="
    ) {
        event.preventDefault();
        calculate();

    } else if (
        key === "Escape" ||
        key.toLowerCase() === "c"
    ) {
        event.preventDefault();
        clearCalculator();

    } else if (key === "Backspace") {
        event.preventDefault();
        deleteLast();
    }
});

render();
