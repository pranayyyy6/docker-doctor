import { ContainerInfo } from "../diagnostics/containers";
import { ContainerNetworkInfo } from "../diagnostics/containerNetworks";
import { ContainerEnvironment } from "../diagnostics/containerEnv";
import { DiagnosticResult } from "../types";

import {
    DetectedService,
    ServiceType
} from "./serviceDetection";


export function detectDatabaseConnectionIssue(
    container: ContainerInfo,
    networkInfo: ContainerNetworkInfo,
    environment: ContainerEnvironment,
    databaseService: DetectedService,
    databaseNetworkInfo: ContainerNetworkInfo
): DiagnosticResult | null {

    // ========================================
    // Only handle database services
    // ========================================

    if (
        databaseService.type !== "postgres" &&
        databaseService.type !== "mysql"
    ) {

        return null;
    }


    // ========================================
    // Find configured database host
    // ========================================

    const databaseHost =
        environment.variables["DATABASE_HOST"] ||
        environment.variables["DB_HOST"] ||
        environment.variables["POSTGRES_HOST"];


    if (!databaseHost) {
        return null;
    }


    const databasePort =
        environment.variables["DATABASE_PORT"] ||
        environment.variables["DB_PORT"] ||
        String(
            databaseService.defaultPort ?? ""
        );


    // ========================================
    // Check localhost configuration
    // ========================================

    const isLocalhost =
        databaseHost === "localhost" ||
        databaseHost === "127.0.0.1";


    if (!isLocalhost) {
        return null;
    }


    // ========================================
    // Check database container status
    // ========================================

    const databaseRunning =
        databaseService.container.status
            .toLowerCase()
            .includes("up");


    if (!databaseRunning) {
        return null;
    }


    // ========================================
    // Check shared network
    // ========================================

    const sharedNetwork =
        networkInfo.networks.some(
            (network) =>
                databaseNetworkInfo.networks.includes(
                    network
                )
        );


    // ========================================
    // Identify database name
    // ========================================

    const databaseName =
        getDatabaseDisplayName(
            databaseService.type
        );


    // ========================================
    // Build evidence
    // ========================================

    const evidence: string[] = [

        `${container.name} has DATABASE_HOST=${databaseHost}`,

        `${container.name} has DATABASE_PORT=${databasePort}`,

        `${databaseService.container.name} is running`
    ];


    if (sharedNetwork) {

        evidence.push(
            "Shared Docker network detected"
        );
    }


    // ========================================
    // Recommendation
    // ========================================

    const recommendation =
        buildRecommendation(
            databaseService.type,
            databasePort
        );


    // ========================================
    // Return diagnosis
    // ========================================

    return {

        severity: "warning",

        title:
            `Database is configured to use localhost`,

        explanation:
            `Inside a Docker container, localhost refers to that container itself. ${databaseName} is running in another container.`,

        evidence,

        recommendation,

        confidence:
            sharedNetwork
                ? 92
                : 88
    };
}


// ========================================
// Database display name
// ========================================

function getDatabaseDisplayName(
    serviceType: ServiceType
): string {

    switch (serviceType) {

        case "postgres":
            return "PostgreSQL";

        case "mysql":
            return "MySQL";

        default:
            return "The database service";
    }
}


// ========================================
// Build recommendation
// ========================================

function buildRecommendation(
    serviceType: ServiceType,
    port: string
): string {

    switch (serviceType) {

        case "postgres":

            return (
                `Use the PostgreSQL service hostname instead of localhost. ` +
                `For example: postgres:${port}`
            );


        case "mysql":

            return (
                `Use the MySQL service hostname instead of localhost. ` +
                `For example: mysql:${port}`
            );


        default:

            return (
                "Use the database container or Docker Compose service hostname instead of localhost."
            );
    }
}