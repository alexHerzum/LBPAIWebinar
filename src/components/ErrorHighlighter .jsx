function ErrorHighlighter({ text }) {
  const hasError = text.includes("ERROR");
  const hasWarning = text.includes("WARNING");
  const isOrder = text.includes("ORDER");
  let textColor;
  if (hasError) textColor = "red";
  else if (hasWarning) textColor = "blue";
  else textColor = "black";
  return (
    <p style={{ color: textColor }}>{isOrder ? <b>{text}</b> : <>{text}</>}</p>
  );
}

export default ErrorHighlighter;
