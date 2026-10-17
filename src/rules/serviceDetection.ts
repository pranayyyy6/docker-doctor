import { ContainerInfo } from "../diagnostics/containers";

export type ServiceType =
    | "postgres"
    | "mysql"
    | "redis"
    | "kafka"
    | "zookeeper"
    | "unknown";

export interface DetectedService {
    container: ContainerInfo;
    type: ServiceType;
    defaultPort?: number;
}

export function detectService(
    container: ContainerInfo
): DetectedService {

    const name =
        container.name.toLowerCase();

    const image =
        container.image.toLowerCase();


    /*
     * --------------------------------------------------
     * PostgreSQL
     * --------------------------------------------------
     */

    if (
        name.includes("postgres") ||
        image.includes("postgres")
    ) {

        return {
            container,
            type: "postgres",
            defaultPort: 5432
        };
    }


    /*
     * --------------------------------------------------
     * MySQL
     * --------------------------------------------------
     */

    if (
        name.includes("mysql") ||
        image.includes("mysql")
    ) {

        return {
            container,
            type: "mysql",
            defaultPort: 3306
        };
    }


    /*
     * --------------------------------------------------
     * Redis
     * --------------------------------------------------
     */

    if (
        name.includes("redis") ||
        image.includes("redis")
    ) {

        return {
            container,
            type: "redis",
            defaultPort: 6379
        };
    }


    /*
     * --------------------------------------------------
     * Zookeeper
     * --------------------------------------------------
     */

    if (
        name.includes("zookeeper") ||
        image.includes("zookeeper")
    ) {

        return {
            container,
            type: "zookeeper",
            defaultPort: 2181
        };
    }


    /*
     * --------------------------------------------------
     * Kafka
     *
     * IMPORTANT:
     *
     * Do NOT classify every container containing
     * "kafka" as a Kafka broker.
     *
     * Examples that should NOT become brokers:
     *
     * kafka-ui
     * kafka-connect
     * kafka-exporter
     * kafka-consumer
     *
     * We first exclude known Kafka-related
     * applications.
     * --------------------------------------------------
     */

    const kafkaRelatedApplication =
        name.includes("kafka-ui") ||
        name.includes("kafka_connect") ||
        name.includes("kafka-connect") ||
        name.includes("kafka-exporter") ||
        name.includes("kafka-export") ||
        name.includes("kafka-consumer") ||
        name.includes("kafka-producer");


    if (
        !kafkaRelatedApplication &&
        (
            name === "kafka" ||
            name.endsWith("-kafka") ||
            name.includes("kafka-broker") ||
            image.includes("apache/kafka") ||
            image.includes("confluentinc/cp-kafka")
        )
    ) {

        return {
            container,
            type: "kafka",
            defaultPort: 9092
        };
    }


    /*
     * --------------------------------------------------
     * Unknown service
     * --------------------------------------------------
     */

    return {
        container,
        type: "unknown"
    };
}