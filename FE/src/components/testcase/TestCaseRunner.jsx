// components/TestCaseRunner.js
import React, { useState } from "react";
import "./TestCaseRunner.css";

const TestCaseRunner = ({ question, code, onResult }) => {
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    const results = [];
    let allPassed = true;

    for (const testCase of question.testCases) {
      try {
        // Gọi đến backend để chạy code
        const result = await evaluateCode(code, testCase.input);
        const passed = result.output.trim() === testCase.expected;
        if (!passed) allPassed = false;

        results.push({
          input: testCase.input,
          expected: testCase.expected,
          output: result.output,
          passed,
          visible: testCase.visible,
        });
      } catch (error) {
        results.push({
          input: testCase.input,
          expected: testCase.expected,
          output: error.message,
          passed: false,
          visible: testCase.visible,
        });
        allPassed = false;
      }
    }

    setTestResults(results);
    setIsRunning(false);
    onResult?.({ passed: allPassed, results });
  };

  // Giả lập gọi API chấm code
  const evaluateCode = async (code, input) => {
    // Trong thực tế, gọi backend API
    return new Promise((resolve) => {
      setTimeout(() => {
        // Giả lập kết quả
        resolve({ output: "4" }); // Thay bằng logic thật
      }, 500);
    });
  };

  return (
    <div className="test-runner">
      <div className="test-header">
        <button onClick={runTests} disabled={isRunning}>
          {isRunning ? "⏳ Đang chạy..." : "▶️ Chạy thử"}
        </button>
      </div>

      {testResults.length > 0 && (
        <div className="test-results">
          <h4>Kết quả:</h4>
          {testResults.map((result, idx) => (
            <div
              key={idx}
              className={`test-case ${result.passed ? "passed" : "failed"}`}
            >
              <div className="test-header">
                <span>Test case {idx + 1}</span>
                <span>{result.passed ? "✅" : "❌"}</span>
              </div>
              {!result.passed && result.visible && (
                <>
                  <div>
                    Input: <code>{result.input}</code>
                  </div>
                  <div>
                    Expected: <code>{result.expected}</code>
                  </div>
                  <div>
                    Your output: <code>{result.output}</code>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestCaseRunner;
