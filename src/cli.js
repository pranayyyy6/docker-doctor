"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const daemon_1 = require("./diagnostics/daemon");
const containers_1 = require("./diagnostics/containers");
const containerStatus_1 = require("./rules/containerStatus");
const networks_1 = require("./diagnostics/networks");
const containerNetworks_1 = require("./diagnostics/containerNetworks");
const containerEnv_1 = require("./diagnostics/containerEnv");
const databaseConnection_1 = require("./rules/databaseConnection");
async function main() {
    console.log("");
    console.log("🐳 Docker Doctor");
    console.log("================");
    console.log("");
    // --------------------------------
    // Docker daemon
    // --------------------------------
    const dockerRunning = await (0, daemon_1.checkDockerDaemon)();
    if (!dockerRunning) {
        console.log("✗ Docker daemon is not running");
        console.log("");
        console.log("💡 Start Docker Desktop and try again.");
        console.log("");
        return;
    }
    console.log("✓ Docker daemon is running");
    console.log("");
    // --------------------------------
    // Containers
    // --------------------------------
    const containers = await (0, containers_1.getContainers)();
    console.log("Containers");
    console.log("----------");
    console.log("");
    if (containers.length === 0) {
        console.log("No containers found.");
        console.log("");
        return;
    }
    // --------------------------------
    // Diagnose containers
    // --------------------------------
    for (const container of containers) {
        await (0, containerStatus_1.diagnoseContainer)(container);
        // Network information
        const networkInfo = await (0, containerNetworks_1.getContainerNetworks)(container.name);
        console.log("   Networks:");
        if (networkInfo.networks.length === 0) {
            console.log("   → None");
        }
        else {
            for (const network of networkInfo.networks) {
                console.log(`   → ${network}`);
            }
        }
        // --------------------------------
        // Environment information
        // --------------------------------
        const environment = await (0, containerEnv_1.getContainerEnvironment)(container.name);
        const interestingVariables = Object.entries(environment.variables).filter(([key]) => key.includes("DATABASE") ||
            key.includes("DB_") ||
            key.includes("POSTGRES") ||
            key.includes("REDIS") ||
            key.includes("KAFKA"));
        if (interestingVariables.length > 0) {
            console.log("");
            console.log("   Environment:");
            for (const [key, value] of interestingVariables) {
                console.log(`   → ${key}=${value}`);
            }
        }
        // --------------------------------
        // Database diagnosis
        // --------------------------------
        const postgresContainer = containers.find((other) => other.name
            .toLowerCase()
            .includes("postgres"));
        if (postgresContainer) {
            const postgresNetworkInfo = await (0, containerNetworks_1.getContainerNetworks)(postgresContainer.name);
            const databaseDiagnosis = (0, databaseConnection_1.detectDatabaseConnectionIssue)(container, networkInfo, environment, containers, postgresNetworkInfo);
            if (databaseDiagnosis) {
                console.log("");
                console.log("   🔍 Docker Doctor Diagnosis");
                console.log(`   ${databaseDiagnosis.title}`);
                console.log("");
                console.log(`   ${databaseDiagnosis.explanation}`);
                console.log("");
                console.log("   Evidence:");
                for (const evidence of databaseDiagnosis.evidence) {
                    console.log(`   → ${evidence}`);
                }
                console.log("");
                console.log("   Recommendation:");
                console.log(`   ${databaseDiagnosis.recommendation}`);
                console.log("");
                console.log(`   Confidence: ${databaseDiagnosis.confidence}%`);
            }
        }
        console.log("");
    }
    // --------------------------------
    // Docker networks
    // --------------------------------
    const networks = await (0, networks_1.getNetworks)();
    console.log("Docker Networks");
    console.log("---------------");
    console.log("");
    for (const network of networks) {
        console.log(`✓ ${network.name}`);
    }
    console.log("");
}
main();
//# sourceMappingURL=cli.js.map