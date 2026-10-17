import { ContainerInfo } from "../diagnostics/containers";
import { ContainerNetworkInfo } from "../diagnostics/containerNetworks";
import { ContainerEnvironment } from "../diagnostics/containerEnv";
import { DiagnosticResult } from "../types";

export function detectKafkaIssue(
    container: ContainerInfo,
    networkInfo: ContainerNetworkInfo,
    environment: ContainerEnvironment,
    logs: string,
    services: ContainerInfo[],
    serviceNetworkInfo?: Map<string, ContainerNetworkInfo>
): DiagnosticResult | null {

    // ========================================
    // Detect Kafka bootstrap failure
    // ========================================

    const normalizedLogs =
        logs.toLowerCase();

    const hasKafkaFailure =
        normalizedLogs.includes(
            "no resolvable bootstrap urls given in bootstrap.servers"
        ) ||
        normalizedLogs.includes(
            "failed to construct kafka consumer"
        );


    if (!hasKafkaFailure) {
        return null;
    }


    // ========================================
    // Find Kafka bootstrap configuration
    // ========================================

    const bootstrapVariables = [
        "KAFKA_BOOTSTRAP_SERVERS",
        "SPRING_KAFKA_BOOTSTRAP_SERVERS"
    ];


    let bootstrapVariable:
        string | undefined;

    let bootstrapServers:
        string | undefined;


    for (
        const variable
        of bootstrapVariables
    ) {

        const value =
            environment.variables[variable];

        if (value) {

            bootstrapVariable =
                variable;

            bootstrapServers =
                value;

            break;
        }
    }


    // ========================================
    // Extract first broker
    // ========================================

    let hostname:
        string | undefined;

    let port:
        number | undefined;


    if (bootstrapServers) {

        const firstServer =
            bootstrapServers
                .split(",")[0]
                .trim();


        const parts =
            firstServer.split(":");


        hostname =
            parts[0];


        if (parts[1]) {

            const parsedPort =
                Number(parts[1]);


            if (
                Number.isInteger(parsedPort) &&
                parsedPort > 0 &&
                parsedPort <= 65535
            ) {

                port =
                    parsedPort;
            }
        }
    }


    // ========================================
    // Find matching Docker container
    // ========================================

    let matchingBroker:
        ContainerInfo | undefined;


    if (hostname) {

        matchingBroker =
            services.find(
                (item: ContainerInfo) =>
                    item.name.toLowerCase() ===
                    hostname.toLowerCase()
            );
    }


    // ========================================
    // Build evidence
    // ========================================

    const evidence: string[] = [];


    evidence.push(
        "Kafka bootstrap failure detected in container logs"
    );


    if (bootstrapVariable) {

        evidence.push(
            `${bootstrapVariable}=${bootstrapServers}`
        );

    } else {

        evidence.push(
            "No common Kafka bootstrap environment variable was found"
        );
    }


    if (hostname) {

        evidence.push(
            `Kafka broker hostname: ${hostname}`
        );
    }


    if (port) {

        evidence.push(
            `Kafka broker port: ${port}`
        );
    }


    // ========================================
    // Broker does not exist
    // ========================================

    if (
        hostname &&
        !matchingBroker
    ) {

        evidence.push(
            `No Docker container named ${hostname} was found`
        );


        return {

            severity: "error",

            title:
                "Kafka broker does not exist",

            explanation:
                `${container.name} is configured to connect to Kafka broker ${hostname}, but Docker Doctor could not find a container with that name.`,

            evidence,

            recommendation:
                `Check ${bootstrapVariable ?? "the Kafka bootstrap configuration"} and make sure the broker hostname matches the Docker Compose service name.`,

            confidence: 98
        };
    }


    // ========================================
    // Broker exists
    // ========================================

    if (matchingBroker) {

        evidence.push(
            `Docker container found: ${matchingBroker.name}`
        );


        evidence.push(
            `Broker status: ${matchingBroker.status}`
        );


        // ====================================
        // Broker is not running
        // ====================================

        const brokerRunning =
            matchingBroker.status
                .toLowerCase()
                .includes("up");


        if (!brokerRunning) {

            return {

                severity: "error",

                title:
                    "Kafka broker is not running",

                explanation:
                    `${container.name} is configured to connect to ${matchingBroker.name}, but the Kafka broker container is not currently running.`,

                evidence,

                recommendation:
                    `Start ${matchingBroker.name} and inspect its logs if it exits again.`,

                confidence: 99
            };
        }
    }


    // ========================================
    // Check Docker network
    // ========================================

    if (
        matchingBroker &&
        serviceNetworkInfo
    ) {

        const brokerNetworkInfo =
            serviceNetworkInfo.get(
                matchingBroker.name
            );


        if (brokerNetworkInfo) {

            const sharedNetwork =
                networkInfo.networks.some(
                    (network) =>
                        brokerNetworkInfo.networks.includes(
                            network
                        )
                );


            if (!sharedNetwork) {

                evidence.push(
                    `${container.name}: ${
                        networkInfo.networks.length > 0
                            ? networkInfo.networks.join(", ")
                            : "no network"
                    }`
                );


                evidence.push(
                    `${matchingBroker.name}: ${
                        brokerNetworkInfo.networks.length > 0
                            ? brokerNetworkInfo.networks.join(", ")
                            : "no network"
                    }`
                );


                return {

                    severity: "error",

                    title:
                        "Kafka broker is not reachable on a shared Docker network",

                    explanation:
                        `${container.name} and ${matchingBroker.name} are running but do not share a Docker network.`,

                    evidence,

                    recommendation:
                        "Connect the Kafka client and broker to the same Docker network and use the broker's Docker service hostname.",

                    confidence: 98
                };
            }


            evidence.push(
                `Shared Docker network detected: ${
                    networkInfo.networks.filter(
                        (network) =>
                            brokerNetworkInfo.networks.includes(
                                network
                            )
                    ).join(", ")
                }`
            );
        }
    }


    // ========================================
    // Broker exists and network looks correct
    // ========================================

    return {

        severity: "error",

        title:
            "Kafka broker configuration may be invalid",

        explanation:
            `${container.name} can identify the Kafka broker container and the containers appear to be connected to the same Docker network, but Kafka still cannot resolve or establish the bootstrap connection.`,

        evidence,

        recommendation:
            "Check Kafka advertised.listeners, listener configuration, broker hostname, broker port, and the address advertised to Kafka clients.",

        confidence: 92
    };
}