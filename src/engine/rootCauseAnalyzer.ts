import { DiagnosticResult } from "../types";
import { DependencyGraph } from "./dependencyGraph";

export interface RankedDiagnostic {
    container: string;
    diagnosis: DiagnosticResult;
    rootCauseScore: number;
    role:
        | "root-cause"
        | "affected-service"
        | "independent";
}

export function rankRootCauses(
    results: Map<string, DiagnosticResult[]>,
    dependencyGraph: DependencyGraph
): RankedDiagnostic[] {

    const ranked: RankedDiagnostic[] = [];

    for (
        const [container, diagnoses]
        of results
    ) {

        for (
            const diagnosis
            of diagnoses
        ) {

            const incomingEdges =
                dependencyGraph.edges.filter(
                    (edge) =>
                        edge.target === container
                );

            const outgoingEdges =
                dependencyGraph.edges.filter(
                    (edge) =>
                        edge.source === container
                );

            let score =
                diagnosis.confidence ?? 50;

            /*
             * Severity weighting
             */

            if (
                diagnosis.severity === "error"
            ) {
                score += 10;
            }
            else if (
                diagnosis.severity === "warning"
            ) {
                score += 5;
            }

            /*
             * Determine whether this diagnosis
             * represents an actual failure.
             */

            const actualFailure =
                isActualFailure(
                    diagnosis
                );

            let role:
                "root-cause" |
                "affected-service" |
                "independent" =
                "independent";

            /*
             * A service that other containers depend on
             * is a potential root-cause candidate.
             */

            if (
                incomingEdges.length > 0 &&
                actualFailure
            ) {

                role =
                    "root-cause";

                score +=
                    incomingEdges.length * 25;
            }

            /*
             * A service that depends on another service
             * is potentially affected by that service.
             */

            else if (
                outgoingEdges.length > 0
            ) {

                role =
                    "affected-service";

                score -=
                    outgoingEdges.length * 10;
            }

            /*
             * Strong standalone failures should still
             * rank highly even when they have no
             * dependency edges.
             */

            if (
                role === "independent" &&
                diagnosis.severity === "error"
            ) {

                score += 5;
            }

            score =
                Math.min(
                    100,
                    Math.max(
                        0,
                        score
                    )
                );

            ranked.push({
                container,
                diagnosis,
                rootCauseScore:
                    score,
                role
            });
        }
    }

    const rolePriority = {
        "root-cause": 3,
        "affected-service": 2,
        "independent": 1
    };

    ranked.sort(
        (a, b) => {

            const roleDifference =
                rolePriority[b.role] -
                rolePriority[a.role];

            if (
                roleDifference !== 0
            ) {
                return roleDifference;
            }

            return (
                b.rootCauseScore -
                a.rootCauseScore
            );
        }
    );

    return ranked;
}

function isActualFailure(
    diagnosis: DiagnosticResult
): boolean {

    /*
     * Explicit error severity is always
     * considered a real failure.
     */

    if (
        diagnosis.severity === "error"
    ) {
        return true;
    }

    const title =
        diagnosis.title.toLowerCase();

    /*
     * Known failure states.
     */

    const failureIndicators = [
        "stopped",
        "not running",
        "not started",
        "shut down",
        "shutdown",
        "exited",
        "failed",
        "connection refused",
        "connection timeout",
        "hostname resolution",
        "dns",
        "network",
        "unknown error"
    ];

    return failureIndicators.some(
        (indicator) =>
            title.includes(indicator)
    );
}