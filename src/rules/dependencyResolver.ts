import { ContainerEnvironment } from "../diagnostics/containerEnv";
import {
    DetectedService,
    ServiceType
} from "./serviceDetection";

export interface ServiceDependency {

    variable: string;

    host: string;

    port?: number;

    serviceType: ServiceType;

    targetService: DetectedService;
}

export function resolveDependencies(
    environment: ContainerEnvironment,
    services: DetectedService[]
): ServiceDependency[] {

    const dependencies: ServiceDependency[] = [];

    const variables =
        environment.variables;


    // ========================================
    // DATABASE_HOST
    // ========================================

    const databaseHost =
        variables["DATABASE_HOST"];

    const databasePort =
        parsePort(
            variables["DATABASE_PORT"]
        );


    if (databaseHost) {

        const databaseService =
            findService(
                databaseHost,
                databasePort,
                services,
                ["postgres", "mysql"]
            );


        if (databaseService) {

            dependencies.push({

                variable: "DATABASE_HOST",

                host: databaseHost,

                port:
                    databasePort ??
                    databaseService.defaultPort,

                serviceType:
                    databaseService.type,

                targetService:
                    databaseService
            });
        }
    }


    // ========================================
    // DB_HOST
    // ========================================

    const dbHost =
        variables["DB_HOST"];

    const dbPort =
        parsePort(
            variables["DB_PORT"]
        );


    if (dbHost) {

        const databaseService =
            findService(
                dbHost,
                dbPort,
                services,
                ["postgres", "mysql"]
            );


        if (databaseService) {

            dependencies.push({

                variable: "DB_HOST",

                host: dbHost,

                port:
                    dbPort ??
                    databaseService.defaultPort,

                serviceType:
                    databaseService.type,

                targetService:
                    databaseService
            });
        }
    }


    // ========================================
    // POSTGRES_HOST
    // ========================================

    const postgresHost =
        variables["POSTGRES_HOST"];


    if (postgresHost) {

        const postgresService =
            findService(
                postgresHost,
                undefined,
                services,
                ["postgres"]
            );


        if (postgresService) {

            dependencies.push({

                variable: "POSTGRES_HOST",

                host: postgresHost,

                port:
                    postgresService.defaultPort,

                serviceType:
                    "postgres",

                targetService:
                    postgresService
            });
        }
    }


    // ========================================
    // REDIS_HOST
    // ========================================

    const redisHost =
        variables["REDIS_HOST"];

    const redisPort =
        parsePort(
            variables["REDIS_PORT"]
        );


    if (redisHost) {

        const redisService =
            findService(
                redisHost,
                redisPort,
                services,
                ["redis"]
            );


        if (redisService) {

            dependencies.push({

                variable: "REDIS_HOST",

                host: redisHost,

                port:
                    redisPort ??
                    redisService.defaultPort,

                serviceType:
                    "redis",

                targetService:
                    redisService
            });
        }
    }


    // ========================================
    // KAFKA_BOOTSTRAP_SERVERS
    // ========================================

    const kafkaServers =
        variables["KAFKA_BOOTSTRAP_SERVERS"];


    if (kafkaServers) {

        const firstServer =
            kafkaServers
                .split(",")[0]
                .trim();


        const [host, portText] =
            firstServer.split(":");


        const kafkaPort =
            parsePort(portText);


        const kafkaService =
            findService(
                host,
                kafkaPort,
                services,
                ["kafka"]
            );


        if (kafkaService) {

            dependencies.push({

                variable:
                    "KAFKA_BOOTSTRAP_SERVERS",

                host,

                port:
                    kafkaPort ??
                    kafkaService.defaultPort,

                serviceType:
                    "kafka",

                targetService:
                    kafkaService
            });
        }
    }


    return dependencies;
}


// ========================================
// Find matching service
// ========================================

function findService(
    host: string,
    port: number | undefined,
    services: DetectedService[],
    allowedTypes: ServiceType[]
): DetectedService | null {

    const normalizedHost =
        host.toLowerCase();


    const candidates =
        services.filter((service) =>
            allowedTypes.includes(
                service.type
            )
        );


    // ========================================
    // 1. Match explicit hostname
    // ========================================

    for (const service of candidates) {

        const serviceName =
            service.container.name
                .toLowerCase();

        const imageName =
            service.container.image
                .toLowerCase();


        if (
            normalizedHost ===
            serviceName
        ) {

            return service;
        }


        if (
            normalizedHost.includes(
                serviceName
            )
        ) {

            return service;
        }


        if (
            serviceName.includes(
                normalizedHost
            )
        ) {

            return service;
        }


        if (
            normalizedHost.includes(
                imageName
            )
        ) {

            return service;
        }


        // Example:
        //
        // DATABASE_HOST=postgres
        //
        // service.type = postgres

        if (
            normalizedHost ===
            service.type
        ) {

            return service;
        }
    }


    // ========================================
    // 2. localhost / 127.0.0.1
    // ========================================

    if (
        normalizedHost === "localhost" ||
        normalizedHost === "127.0.0.1"
    ) {

        // ------------------------------------
        // Use port as evidence
        // ------------------------------------

        if (port !== undefined) {

            const portMatch =
                candidates.find(
                    (service) =>
                        service.defaultPort ===
                        port
                );


            if (portMatch) {

                return portMatch;
            }
        }


        // ------------------------------------
        // Safe fallback
        // ------------------------------------

        if (
            candidates.length === 1
        ) {

            return candidates[0];
        }
    }


    return null;
}


// ========================================
// Parse port safely
// ========================================

function parsePort(
    value: string | undefined
): number | undefined {

    if (!value) {
        return undefined;
    }


    const port =
        Number(value);


    if (
        !Number.isInteger(port) ||
        port <= 0 ||
        port > 65535
    ) {

        return undefined;
    }


    return port;
}