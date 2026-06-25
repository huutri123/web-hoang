// components/CodeEditor.js
import React, { useState, useEffect } from "react";
import "./CodeEditor.css";

const CodeEditor = ({
  value = "",
  onChange,
  language = "python",
  readOnly = false,
}) => {
  const [code, setCode] = useState(value);
  const [lineCount, setLineCount] = useState(1);

  useEffect(() => {
    setCode(value);
    setLineCount(value.split("\n").length);
  }, [value]);

  const handleChange = (e) => {
    const newCode = e.target.value;
    setCode(newCode);
    setLineCount(newCode.split("\n").length);
    onChange?.(newCode);
  };

  // Syntax highlighting (simplified)
  const highlightCode = (code) => {
    const keywords = [
      "def",
      "return",
      "if",
      "else",
      "for",
      "while",
      "True",
      "False",
      "None",
      "import",
      "from",
    ];
    let highlighted = code;
    for (const kw of keywords) {
      const regex = new RegExp(`\\b${kw}\\b`, "g");
      highlighted = highlighted.replace(
        regex,
        `<span class="keyword">${kw}</span>`,
      );
    }
    return highlighted;
  };

  return (
    <div className="code-editor">
      <div className="line-numbers">
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i + 1} className="line-number">
            {i + 1}
          </div>
        ))}
      </div>
      <div className="editor-wrapper">
        <pre
          className="highlight-layer"
          dangerouslySetInnerHTML={{ __html: highlightCode(code) }}
        />
        <textarea
          className="code-input"
          value={code}
          onChange={handleChange}
          spellCheck={false}
          readOnly={readOnly}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
