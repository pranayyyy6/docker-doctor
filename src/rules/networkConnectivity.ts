import { ContainerInfo } from "../diagnostics/containers";
import { ContainerNetworkInfo } from "../diagnostics/containerNetworks";
import { ContainerEnvironment } from "../diagnostics/containerEnv";
import { DiagnosticResult } from "../types";

export function detectNetworkConnectivityIssue(
    container: ContainerInfo,
    containerNetworkInfo: ContainerNetworkInfo,
    targetContainer: ContainerInfo,
    targetNetworkInfo: ContainerNetworkInfo,
    environment: ContainerEnvironment
): DiagnosticResult | null {

    // ========================================
    // Determine whether the container actually
    // depends on the target service
    // ========================================

    const variables =
        environment.variables;


    const targetName =
        targetContainer.name.toLowerCase();


    const dependencyVariables = [
        "DATABASE_HOST",
        "DB_HOST",
        "POSTGRES_HOST",
        "REDIS_HOST",
        "KAFKA_HOST",
        "KAFKA_BOOTSTRAP_SERVERS"
    ];


    let dependsOnTarget = false;


    for (
        const variable
        of dependencyVariables
    ) {

        const value =
            variables[variable];

        if (!value) {
            continue;
        }


        const normalizedValue =
            value.toLowerCase();


        if (
            normalizedValue.includes(
                targetName
            ) ||

            normalizedValue.includes(
                targetContainer.image
                    .toLowerCase()
            )
        ) {

            dependsOnTarget = true;

            break;
        }
    }


    // ========================================
    // No evidence of dependency
    // ========================================

    if (!dependsOnTarget) {
        return null;
    }


    // ========================================
    // Check shared network
    // ========================================

    const sharedNetwork =
        containerNetworkInfo.networks.some(
            (network) =>
                targetNetworkInfo.networks.includes(
                    network
                )
        );


    // They already share a network
    if (sharedNetwork) {
        return null;
    }


    // ========================================
    // Target must be running
    // ========================================

    const targetRunning =
        targetContainer.status
            .toLowerCase()
            .includes("up");


    if (!targetRunning) {
        return null;
    }


    // ========================================
    // Generate diagnosis
    // ========================================

    return {

        severity: "error",

        title:
            "Containers do not share a Docker network",

        explanation:
            `${container.name} appears to depend on ${targetContainer.name}, but the containers are not connected to a common Docker network.`,

        evidence: [

            `${container.name}: ${
                containerNetworkInfo.networks.length > 0
                    ? containerNetworkInfo.networks.join(", ")
                    : "no network"
            }`,

            `${targetContainer.name}: ${
                targetNetworkInfo.networks.length > 0
                    ? targetNetworkInfo.networks.join(", ")
                    : "no network"
            }`
        ],

        recommendation:
            "Connect both containers to the same Docker network so they can communicate using the Docker service or container hostname.",

        confidence: 96
    };
}