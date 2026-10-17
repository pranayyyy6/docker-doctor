import { ContainerInfo } from "../diagnostics/containers";
import { getContainerLogs } from "../diagnostics/containerLogs";
import { analyzeLogs } from "./errorPatterns";
import { DiagnosticResult } from "../types";
import {
    detectService
} from "./serviceDetection";


export async function diagnoseContainerStatus(
    container: ContainerInfo
): Promise<DiagnosticResult[]> {

    const results: DiagnosticResult[] = [];

    const status =
        container.status.toLowerCase();


    // ========================================
    // Container is running
    // ========================================

    if (
        status.includes("up") ||
        status.includes("running")
    ) {

        return results;
    }


    // ========================================
    // Container exists but never started
    // ========================================

    if (
        status.includes("created")
    ) {

        results.push({

            severity: "warning",

            title:
                "Container has not been started",

            explanation:
                `${container.name} exists but has not been started.`,

            evidence: [
                `Status: ${container.status}`
            ],

            recommendation:
                "Start the container with Docker or Docker Compose.",

            confidence: 99
        });


        return results;
    }


    // ========================================
    // Container exited successfully
    // ========================================

    if (
        status.includes("exited (0)")
    ) {

        return results;
    }
    const detectedService =
    detectService(container);

if (
    detectedService.type === "kafka"
) {

    const logs =
        await getContainerLogs(
            container.name
        );

    const logEvidence =
        extractLogEvidence(logs);

    results.push({
        severity: "error",
        title:
            "Kafka broker container is stopped",
        explanation:
            `${container.name} is detected as a Kafka broker, but the container is currently stopped with a non-zero exit status.`,
        evidence: [
            `Status: ${container.status}`,
            `Detected service: Kafka`,
            `Expected Kafka port: ${detectedService.defaultPort}`,
            ...logEvidence
        ],
        recommendation:
            `Start ${container.name} and inspect its Kafka configuration if it exits again. Check broker listeners, advertised.listeners, and its dependency configuration.`,
        confidence: 98
    });

    return results;
}


    // ========================================
    // Container exited with an error
    // ========================================

    const logs =
        await getContainerLogs(
            container.name
        );


    // ========================================
    // Known error pattern
    // ========================================

    const logDiagnosis =
        analyzeLogs(logs);


    if (logDiagnosis.length > 0) {

        results.push(
            ...logDiagnosis
        );

        return results;
    }


    // ========================================
    // Unknown error
    // ========================================

    const logEvidence =
        extractLogEvidence(logs);


    results.push({

        severity: "warning",

        title:
            "Container exited with an unknown error",

        explanation:
            `${container.name} stopped with a non-zero exit status, but Docker Doctor could not identify a known error pattern.`,

        evidence: [
            `Status: ${container.status}`,
            ...logEvidence
        ],

        recommendation:
            "Inspect the container logs to determine the root cause.",

        confidence: 60
    });


    return results;
}


// ========================================
// Extract useful log evidence
// ========================================

function extractLogEvidence(
    logs: string
): string[] {

    if (
        !logs ||
        logs.trim().length === 0
    ) {

        return [
            "No container logs were available."
        ];
    }


    const lines =
        logs
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);


    // ----------------------------------------
    // Look for suspicious lines first
    // ----------------------------------------

    const suspiciousLines =
        lines.filter((line) => {

            const normalized =
                line.toLowerCase();

            return (
                normalized.includes("error") ||
                normalized.includes("fatal") ||
                normalized.includes("failed") ||
                normalized.includes("exception") ||
                normalized.includes("refused") ||
                normalized.includes("denied") ||
                normalized.includes("invalid") ||
                normalized.includes("cannot") ||
                normalized.includes("unable")
            );
        });


    if (
        suspiciousLines.length > 0
    ) {

        return suspiciousLines
            .slice(-5)
            .map(
                (line) =>
                    `Log: ${line}`
            );
    }


    // ----------------------------------------
    // No obvious error keywords
    // ----------------------------------------

    return lines
        .slice(-5)
        .map(
            (line) =>
                `Log: ${line}`
        );
}