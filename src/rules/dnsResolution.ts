import { ContainerInfo } from "../diagnostics/containers";
import { ContainerNetworkInfo } from "../diagnostics/containerNetworks";
import { ContainerEnvironment } from "../diagnostics/containerEnv";
import { DiagnosticResult } from "../types";

export function detectDnsResolutionIssue(
    container: ContainerInfo,
    networkInfo: ContainerNetworkInfo,
    environment: ContainerEnvironment,
    logs: string,
    services: ContainerInfo[]
): DiagnosticResult | null {

    // ========================================
    // Check for DNS / hostname errors
    // ========================================

    const hasDnsError =
        logs.includes("UnknownHostException") ||
        logs.toLowerCase().includes("could not resolve host") ||
        logs.toLowerCase().includes("name or service not known") ||
        logs.toLowerCase().includes("unknown host");


    if (!hasDnsError) {
        return null;
    }


    // ========================================
    // Extract hostname from UnknownHostException
    // ========================================

    const unknownHostMatch =
        logs.match(
            /UnknownHostException:\s*([a-zA-Z0-9._-]+)/
        );


    const hostname =
        unknownHostMatch
            ? unknownHostMatch[1]
            : undefined;


    // ========================================
    // Check whether hostname matches a
    // known Docker container
    // ========================================

    let matchingService:
        ContainerInfo | undefined;


    if (hostname) {

        matchingService =
            services.find(
                (service) =>
                    service.name.toLowerCase() ===
                    hostname.toLowerCase()
            );
    }


    // ========================================
    // Build evidence
    // ========================================

    const evidence: string[] = [];


    if (hostname) {

        evidence.push(
            `Hostname: ${hostname}`
        );
    }


    if (matchingService) {

        evidence.push(
            `Docker container found: ${matchingService.name}`
        );

    } else if (hostname) {

        evidence.push(
            `No Docker container named ${hostname} was found`
        );
    }


    if (
        networkInfo.networks.length > 0
    ) {

        evidence.push(
            `${container.name} networks: ${networkInfo.networks.join(", ")}`
        );
    }


    // ========================================
    // Build explanation
    // ========================================

    let explanation: string;

    let recommendation: string;

    let confidence = 94;


    if (matchingService) {

        explanation =
            `${container.name} attempted to connect to ${hostname}, but the hostname could not be resolved. A Docker container with that name exists, so the problem may be related to Docker network configuration or DNS visibility.`;

        recommendation =
            `Check that ${container.name} and ${matchingService.name} share a Docker network and that the application is using the correct Docker service hostname.`;

        confidence = 97;

    } else {

        explanation =
            `${container.name} attempted to connect to ${hostname ?? "a hostname"}, but Docker could not resolve the hostname. No matching Docker container was found.`;

        recommendation =
            `Check the configured hostname and make sure the target Docker service exists and is reachable from ${container.name}.`;

        confidence = 98;
    }


    // ========================================
    // Return diagnosis
    // ========================================

    return {

        severity: "error",

        title:
            "Hostname resolution failed",

        explanation,

        evidence,

        recommendation,

        confidence
    };
}