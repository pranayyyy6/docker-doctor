import { DiagnosticResult } from "../types";
import { RankedDiagnostic } from "./rootCauseAnalyzer";

export function printDiagnosticResults(
    results: Map<string, DiagnosticResult[]>,
    rankedDiagnostics?: RankedDiagnostic[]
): void {

    console.log("");
    console.log("Docker Doctor");
    console.log("=============");
    console.log("");

    /*
     * --------------------------------------------------
     * Summary
     * --------------------------------------------------
     */

    let diagnosticCount = 0;
    let errorCount = 0;
    let warningCount = 0;

    for (
        const diagnoses
        of results.values()
    ) {

        diagnosticCount +=
            diagnoses.length;

        for (
            const diagnosis
            of diagnoses
        ) {

            if (
                diagnosis.severity === "error"
            ) {
                errorCount++;
            }

            if (
                diagnosis.severity === "warning"
            ) {
                warningCount++;
            }
        }
    }

    console.log(
        `Diagnostics found: ${diagnosticCount}`
    );

    console.log(
        `Errors: ${errorCount}`
    );

    console.log(
        `Warnings: ${warningCount}`
    );

    /*
     * --------------------------------------------------
     * Root causes
     * --------------------------------------------------
     */

    const rootCauses =
        rankedDiagnostics?.filter(
            (diagnostic) =>
                diagnostic.role ===
                "root-cause"
        ) ?? [];

    if (
        rootCauses.length > 0
    ) {

        console.log("");
        console.log("ROOT CAUSES");
        console.log("-----------");

        for (
            const rootCause
            of rootCauses
        ) {

            printDiagnostic(
                rootCause.container,
                rootCause.diagnosis
            );
        }
    }


    /*
     * --------------------------------------------------
     * Affected services
     * --------------------------------------------------
     */

    const affectedServices =
        rankedDiagnostics?.filter(
            (diagnostic) =>
                diagnostic.role ===
                "affected-service"
        ) ?? [];

    if (
        affectedServices.length > 0
    ) {

        console.log("");
        console.log("AFFECTED SERVICES");
        console.log("-----------------");

        for (
            const affected
            of affectedServices
        ) {

            console.log(
                `${affected.container}`
            );

            console.log(
                `  → ${affected.diagnosis.title}`
            );
        }
    }


    /*
     * --------------------------------------------------
     * Independent issues
     * --------------------------------------------------
     */

    const independentIssues =
        rankedDiagnostics?.filter(
            (diagnostic) =>
                diagnostic.role ===
                "independent"
        ) ?? [];

    if (
        independentIssues.length > 0
    ) {

        console.log("");
        console.log("OTHER ISSUES");
        console.log("------------");

        for (
            const issue
            of independentIssues
        ) {

            printDiagnostic(
                issue.container,
                issue.diagnosis
            );
        }
    }


    /*
     * --------------------------------------------------
     * No problems
     * --------------------------------------------------
     */

    if (
        diagnosticCount === 0
    ) {

        console.log("");
        console.log(
            "✓ No problems detected."
        );
    }

    console.log("");
}


/*
 * --------------------------------------------------
 * Print one complete diagnostic
 * --------------------------------------------------
 */

function printDiagnostic(
    containerName: string,
    diagnosis: DiagnosticResult
): void {

    console.log("");

    console.log(
        `[${diagnosis.severity.toUpperCase()}] ` +
        `${diagnosis.title}`
    );

    console.log(
        `Container: ${containerName}`
    );

    console.log("");

    console.log(
        diagnosis.explanation
    );


    /*
     * Evidence
     */

    if (
        diagnosis.evidence.length > 0
    ) {

        console.log("");

        console.log(
            "Evidence:"
        );

        for (
            const evidence
            of diagnosis.evidence
        ) {

            console.log(
                `  → ${evidence}`
            );
        }
    }


    /*
     * Recommendation
     */

    if (
        diagnosis.recommendation
    ) {

        console.log("");

        console.log(
            "Recommendation:"
        );

        console.log(
            `  ${diagnosis.recommendation}`
        );
    }


    /*
     * Confidence
     */

    if (
        diagnosis.confidence !==
        undefined
    ) {

        console.log("");

        console.log(
            `Confidence: ${diagnosis.confidence}%`
        );
    }
}