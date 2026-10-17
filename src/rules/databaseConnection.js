"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectDatabaseConnectionIssue = detectDatabaseConnectionIssue;
const containers_1 = require("../diagnostics/containers");
const containerNetworks_1 = require("../diagnostics/containerNetworks");
const containerEnv_1 = require("../diagnostics/containerEnv");
const types_1 = require("../types");
function detectDatabaseConnectionIssue(container, networkInfo, environment, allContainers, postgresNetworkInfo) {
    const databaseHost = environment.variables["DATABASE_HOST"];
    const databasePort = environment.variables["DATABASE_PORT"] || "5432";
    // No database host configured
    if (!databaseHost) {
        return null;
    }
    // Only investigate localhost connections
    if (databaseHost !== "localhost" &&
        databaseHost !== "127.0.0.1") {
        return null;
    }
    // Find PostgreSQL container
    const postgresContainer = allContainers.find((other) => other.name
        .toLowerCase()
        .includes("postgres"));
    if (!postgresContainer) {
        return null;
    }
    // PostgreSQL must be running
    const postgresRunning = postgresContainer.status
        .toLowerCase()
        .includes("up");
    if (!postgresRunning) {
        return null;
    }
    // Check whether both containers share a network
    const sharedNetwork = networkInfo.networks.some((network) => postgresNetworkInfo.networks.includes(network));
    if (!sharedNetwork) {
        return null;
    }
    return {
        severity: "warning",
        title: "Database is configured to use localhost",
        explanation: "Inside a Docker container, localhost refers to that container itself. PostgreSQL is running in another container on the same Docker network.",
        evidence: [
            `${container.name} has DATABASE_HOST=${databaseHost}`,
            `${container.name} has DATABASE_PORT=${databasePort}`,
            `${postgresContainer.name} is running`,
            `Shared Docker network detected`
        ],
        recommendation: `Use the PostgreSQL service hostname instead of localhost. For example: postgres:${databasePort}`,
        confidence: 92
    };
}
//# sourceMappingURL=databaseConnection.js.map