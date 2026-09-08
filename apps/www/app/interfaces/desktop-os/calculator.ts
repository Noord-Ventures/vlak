/** Parse calculator arithmetic without evaluating JavaScript. */
export function calculate(expression: string): number {
  const text = expression.replaceAll("×", "*").replaceAll("÷", "/").replaceAll("−", "-").replace(/\s+/g, "");
  let position = 0;
  const factor = (): number => {
    if (text[position] === "+") { position++; return factor(); }
    if (text[position] === "-") { position++; return -factor(); }
    if (text[position] === "(") { position++; const value = sum(); if (text[position++] !== ")") throw new Error("Close the parentheses."); return value; }
    const number = text.slice(position).match(/^(?:\d+(?:\.\d*)?|\.\d+)/)?.[0];
    if (!number) throw new Error("Enter a calculation."); position += number.length; return Number(number);
  };
  const product = (): number => {
    let value = factor();
    while (text[position] === "*" || text[position] === "/") { const operator = text[position++]; const right = factor(); value = operator === "*" ? value * right : value / right; }
    return value;
  };
  const sum = (): number => {
    let value = product();
    while (text[position] === "+" || text[position] === "-") { const operator = text[position++]; const right = product(); value = operator === "+" ? value + right : value - right; }
    return value;
  };
  const result = sum();
  if (position !== text.length || !Number.isFinite(result)) throw new Error("This calculation is not valid.");
  return Number(result.toPrecision(12));
}
