import { DiagnosticResult } from "../types";

interface ErrorPattern {
    name: string;
    patterns: string[];
    severity: "info" | "warning" | "error";
    explanation: string;
    recommendation: string;
    confidence: number;
}

const ERROR_PATTERNS: ErrorPattern[] = [

    // ========================================
    // Connection refused
    // ========================================

    {
        name: "Connection refused",

        patterns: [
            "ECONNREFUSED",
            "connection refused",
            "Connection refused"
        ],

        severity: "error",

        explanation:
            "The application attempted to connect to a service, but nothing accepted the connection.",

        recommendation:
            "Check whether the target container is running and whether the correct host and port are being used.",

        confidence: 95
    },


    // ========================================
    // Port already allocated
    // ========================================

    {
        name: "Port already allocated",

        patterns: [
            "port is already allocated",
            "address already in use",
            "bind: address already in use"
        ],

        severity: "error",

        explanation:
            "Docker could not bind the requested host port because another process or container is already using it.",

        recommendation:
            "Find the process using the port or change the host port in your Docker configuration.",

        confidence: 99
    },


    // ========================================
    // Permission denied
    // ========================================

    {
        name: "Permission denied",

        patterns: [
            "permission denied",
            "Permission denied",
            "EACCES"
        ],

        severity: "error",

        explanation:
            "The container or application attempted an operation without sufficient permissions.",

        recommendation:
            "Check filesystem permissions, mounted volumes, container user settings, and security policies.",

        confidence: 90
    },


    // ========================================
    // Command not found
    // ========================================

    {
        name: "Command not found",

        patterns: [
            "command not found",
            "/bin/sh: not found",
            "/bin/bash: not found"
        ],

        severity: "error",

        explanation:
            "The container attempted to execute a command that could not be found.",

        recommendation:
            "Check the container image, PATH configuration, command, and entrypoint.",

        confidence: 94
    },


    // ========================================
    // Executable not found
    // ========================================

    {
        name: "Executable not found",

        patterns: [
            "executable file not found",
            "no such file or directory"
        ],

        severity: "error",

        explanation:
            "Docker or the application could not find the executable or file required to start the process.",

        recommendation:
            "Check the image contents, executable path, working directory, mounted files, and container command.",

        confidence: 92
    },


    // ========================================
    // Connection timeout
    // ========================================

    {
        name: "Connection timeout",

        patterns: [
            "connection timed out",
            "connect timeout",
            "ETIMEDOUT"
        ],

        severity: "error",

        explanation:
            "The application attempted to connect to a service, but the connection did not complete within the expected time.",

        recommendation:
            "Check network connectivity, service availability, Docker networks, firewall rules, and the target host and port.",

        confidence: 93
    },


    // ========================================
    // Authentication failure
    // ========================================

    {
        name: "Authentication failed",

        patterns: [
            "authentication failed",
            "authentication failure",
            "password authentication failed",
            "invalid password",
            "access denied"
        ],

        severity: "error",

        explanation:
            "The application reached the target service, but authentication was rejected.",

        recommendation:
            "Check the username, password, authentication configuration, and environment variables.",

        confidence: 94
    }
];


// ========================================
// Analyze container logs
// ========================================

export function analyzeLogs(
    logs: string
): DiagnosticResult[] {

    const results: DiagnosticResult[] = [];


    // ========================================
    // Check every error pattern
    // ========================================

    for (
        const pattern
        of ERROR_PATTERNS
    ) {

        const matched =
            pattern.patterns.some(
                (text) =>
                    logs.includes(text)
            );


        if (!matched) {
            continue;
        }


        // ====================================
        // Extract matching evidence
        // ====================================

        const evidence =
            logs
                .split("\n")
                .filter((line) =>
                    pattern.patterns.some(
                        (text) =>
                            line.includes(text)
                    )
                )
                .slice(0, 5);


        // ====================================
        // Create diagnostic result
        // ====================================

        results.push({

            severity:
                pattern.severity,

            title:
                pattern.name,

            explanation:
                pattern.explanation,

            evidence,

            recommendation:
                pattern.recommendation,

            confidence:
                pattern.confidence
        });
    }


    return results;
}