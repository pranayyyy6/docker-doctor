import { checkDockerDaemon } from "./diagnostics/daemon";

import {
    collectDockerState
} from "./engine/dockerState";

import {
    runDiagnostics
} from "./engine/diagnosticEngine";

import {
    printDiagnosticResults
} from "./engine/resultPrinter";


async function main(): Promise<void> {

    // ========================================
    // HEADER
    // ========================================

    console.log("");
    console.log("🐳 Docker Doctor");
    console.log("================");
    console.log("");


    // ========================================
    // DOCKER DAEMON
    // ========================================

    const dockerRunning =
        await checkDockerDaemon();


    if (!dockerRunning) {

        console.log(
            "❌ Docker daemon is not running"
        );

        console.log("");

        console.log(
            "💡 Start Docker Desktop and try again."
        );

        console.log("");

        return;
    }


    console.log(
        "✓ Docker daemon is running"
    );

    console.log("");


    // ========================================
    // COLLECT DOCKER STATE
    // ========================================

    console.log(
        "Collecting Docker state..."
    );

    console.log("");


    const dockerState =
        await collectDockerState();


    // ========================================
    // SHOW CONTAINERS
    // ========================================

    console.log("Containers");
    console.log("----------");
    console.log("");


    if (
        dockerState.containers.length === 0
    ) {

        console.log(
            "No containers found."
        );

        console.log("");

        return;
    }


    for (
        const container
        of dockerState.containers
    ) {

        console.log(
            `${container.name} → ${container.status}`
        );
    }


    console.log("");


    // ========================================
    // SHOW DETECTED SERVICES
    // ========================================

    console.log(
        "Detected Services"
    );

    console.log(
        "-----------------"
    );

    console.log("");


    for (
        const service
        of dockerState.services
    ) {

        if (
            service.type === "unknown"
        ) {
            continue;
        }


        console.log(
            `✓ ${service.container.name} → ${service.type}`
        );


        if (
            service.defaultPort
        ) {

            console.log(
                `  Default port: ${service.defaultPort}`
            );
        }
    }


    console.log("");


    // ========================================
    // RUN DIAGNOSTICS
    // ========================================

    const diagnosticReport =
        await runDiagnostics(
            dockerState
        );


    // ========================================
    // PRINT FINAL REPORT
    // ========================================

    printDiagnosticResults(
        diagnosticReport.results,
        diagnosticReport.rankedDiagnostics
    );
}


// ========================================
// START DOCKER DOCTOR
// ========================================

main();