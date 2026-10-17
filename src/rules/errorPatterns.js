"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeLogs = analyzeLogs;
const types_1 = require("../types");
const ERROR_PATTERNS = [
    {
        name: "Connection refused",
        patterns: [
            "ECONNREFUSED",
            "connection refused",
            "Connection refused"
        ],
        severity: "error",
        explanation: "The application attempted to connect to a service, but nothing accepted the connection.",
        recommendation: "Check whether the target container is running and whether the correct host and port are being used.",
        confidence: 95
    },
    {
        name: "Port already allocated",
        patterns: [
            "port is already allocated",
            "address already in use",
            "bind: address already in use"
        ],
        severity: "error",
        explanation: "Docker could not bind the requested host port because another process or container is already using it.",
        recommendation: "Find the process using the port or change the host port in your Docker configuration.",
        confidence: 99
    },
    {
        name: "Permission denied",
        patterns: [
            "permission denied",
            "Permission denied",
            "EACCES"
        ],
        severity: "error",
        explanation: "The container or application attempted an operation without sufficient permissions.",
        recommendation: "Check filesystem permissions, mounted volumes, container user settings, and security policies.",
        confidence: 90
    }
];
function analyzeLogs(logs) {
    for (const pattern of ERROR_PATTERNS) {
        const matched = pattern.patterns.some((text) => logs.includes(text));
        if (matched) {
            const evidence = logs
                .split("\n")
                .filter((line) => pattern.patterns.some((text) => line.includes(text)))
                .slice(0, 5);
            return {
                severity: pattern.severity,
                title: pattern.name,
                explanation: pattern.explanation,
                evidence,
                recommendation: pattern.recommendation,
                confidence: pattern.confidence
            };
        }
    }
    return null;
}
//# sourceMappingURL=errorPatterns.js.map