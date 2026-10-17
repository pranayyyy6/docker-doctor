import { DiagnosticResult } from "../types";
import { DockerState } from "./dockerState";

import { detectDatabaseConnectionIssue } from "../rules/databaseConnection";
import { detectNetworkConnectivityIssue } from "../rules/networkConnectivity";
import { resolveDependencies } from "../rules/dependencyResolver";

import {
    detectKafkaIssue
} from "../rules/kafkaDiagnosis";

import {
    diagnoseContainerStatus
} from "../rules/containerStatus";

import {
    detectDnsResolutionIssue
} from "../rules/dnsResolution";

import {
    getContainerLogs
} from "../diagnostics/containerLogs";

import {
    ContainerNetworkInfo
} from "../diagnostics/containerNetworks";

import {
    buildDependencyGraph
} from "./dependencyGraph";

import {
    rankRootCauses,
    RankedDiagnostic
} from "./rootCauseAnalyzer";


export interface DiagnosticEngineResult {
    results: Map<string, DiagnosticResult[]>;
    rankedDiagnostics: RankedDiagnostic[];
}


export async function runDiagnostics(
    state: DockerState
): Promise<DiagnosticEngineResult> {

    const results =
        new Map<string, DiagnosticResult[]>();


    /*
     * --------------------------------------------------
     * BUILD DEPENDENCY GRAPH
     * --------------------------------------------------
     */

    const dependencyGraph =
        buildDependencyGraph(state);


    console.log("");
    console.log("Dependency Graph");
    console.log("----------------");


    if (
        dependencyGraph.edges.length === 0
    ) {

        console.log(
            "No service dependencies detected."
        );

    } else {

        for (
            const edge
            of dependencyGraph.edges
        ) {

            console.log(
                `${edge.source} -> ${edge.target} (${edge.serviceType})`
            );
        }
    }


    console.log("");


    /*
     * --------------------------------------------------
     * CACHE NETWORK INFORMATION
     * --------------------------------------------------
     */

    const serviceNetworkInfo =
        new Map<string, ContainerNetworkInfo>();


    for (
        const containerState
        of state.containerStates
    ) {

        serviceNetworkInfo.set(
            containerState.container.name,
            containerState.networkInfo
        );
    }


    /*
     * --------------------------------------------------
     * DIAGNOSE EACH CONTAINER
     * --------------------------------------------------
     */

    for (
        const containerState
        of state.containerStates
    ) {

        const container =
            containerState.container;


        const containerResults:
            DiagnosticResult[] = [];


        /*
         * --------------------------------------------------
         * COLLECT LOGS
         * --------------------------------------------------
         */

        const logs =
            await getContainerLogs(
                container.name
            );


        /*
         * --------------------------------------------------
         * KAFKA DIAGNOSIS
         * --------------------------------------------------
         */

        const kafkaDiagnosis =
            detectKafkaIssue(
                container,
                containerState.networkInfo,
                containerState.environment,
                logs,
                state.containers,
                serviceNetworkInfo
            );


        if (kafkaDiagnosis) {

            containerResults.push(
                kafkaDiagnosis
            );
        }


        /*
         * --------------------------------------------------
         * DNS DIAGNOSIS
         * --------------------------------------------------
         */

        if (!kafkaDiagnosis) {

            const dnsDiagnosis =
                detectDnsResolutionIssue(
                    container,
                    containerState.networkInfo,
                    containerState.environment,
                    logs,
                    state.containers
                );


            if (dnsDiagnosis) {

                containerResults.push(
                    dnsDiagnosis
                );
            }
        }


        /*
         * --------------------------------------------------
         * CONTAINER STATUS
         * --------------------------------------------------
         */

        const statusResults =
            await diagnoseContainerStatus(
                container
            );


        const hasSpecificDiagnosis =
            containerResults.length > 0;


        if (hasSpecificDiagnosis) {

            const filteredStatusResults =
                statusResults.filter(
                    (result) =>
                        result.title !==
                        "Container exited with an unknown error"
                );


            containerResults.push(
                ...filteredStatusResults
            );

        } else {

            containerResults.push(
                ...statusResults
            );
        }


        /*
         * --------------------------------------------------
         * RESOLVE DEPENDENCIES
         * --------------------------------------------------
         */

        const dependencies =
            resolveDependencies(
                containerState.environment,
                state.services
            );


        for (
            const dependency
            of dependencies
        ) {

            const targetService =
                dependency.targetService;


            /*
             * Prevent self dependency.
             */

            if (
                targetService.container.name ===
                container.name
            ) {
                continue;
            }


            const targetState =
                state.containerStates.find(
                    (item) =>
                        item.container.name ===
                        targetService.container.name
                );


            if (!targetState) {
                continue;
            }


            /*
             * --------------------------------------------------
             * DATABASE DIAGNOSIS
             * --------------------------------------------------
             */

            if (
                dependency.serviceType ===
                    "postgres" ||
                dependency.serviceType ===
                    "mysql"
            ) {

                const databaseDiagnosis =
                    detectDatabaseConnectionIssue(
                        container,
                        containerState.networkInfo,
                        containerState.environment,
                        targetService,
                        targetState.networkInfo
                    );


                if (databaseDiagnosis) {

                    containerResults.push(
                        databaseDiagnosis
                    );
                }
            }


            /*
             * --------------------------------------------------
             * NETWORK DIAGNOSIS
             * --------------------------------------------------
             */

            const networkDiagnosis =
                detectNetworkConnectivityIssue(
                    container,
                    containerState.networkInfo,
                    targetService.container,
                    targetState.networkInfo,
                    containerState.environment
                );


            if (networkDiagnosis) {

                containerResults.push(
                    networkDiagnosis
                );
            }
        }


        /*
         * --------------------------------------------------
         * STORE RESULTS
         * --------------------------------------------------
         */

        results.set(
            container.name,
            containerResults
        );
    }


    /*
     * --------------------------------------------------
     * ROOT CAUSE ANALYSIS
     * --------------------------------------------------
     */

    const rankedDiagnostics =
        rankRootCauses(
            results,
            dependencyGraph
        );


    /*
     * --------------------------------------------------
     * DISPLAY ROOT CAUSE RANKING
     * --------------------------------------------------
     */

    console.log("");
    console.log("Root Cause Ranking");
    console.log("------------------");


    if (
        rankedDiagnostics.length === 0
    ) {

        console.log(
            "No diagnostics available for ranking."
        );

    } else {

        let rank = 1;


        for (
            const ranked
            of rankedDiagnostics
        ) {

            console.log(
                `${rank}. ` +
                `${ranked.role.toUpperCase()} | ` +
                `${ranked.container} | ` +
                `${ranked.diagnosis.title} | ` +
                `Score: ${ranked.rootCauseScore}`
            );


            rank++;
        }
    }


    console.log("");


    /*
     * --------------------------------------------------
     * RETURN COMPLETE DIAGNOSTIC REPORT
     * --------------------------------------------------
     */

    return {
        results,
        rankedDiagnostics
    };
}