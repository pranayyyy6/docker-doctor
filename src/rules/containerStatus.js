"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.diagnoseContainer = diagnoseContainer;
const containers_1 = require("../diagnostics/containers");
const containerLogs_1 = require("../diagnostics/containerLogs");
const errorPatterns_1 = require("./errorPatterns");
async function diagnoseContainer(container) {
    const status = container.status.toLowerCase();
    // --------------------------------
    // 1. Container is running
    // --------------------------------
    if (status.includes("up") ||
        status.includes("running")) {
        console.log(`✓ ${container.name} is running`);
        return;
    }
    // --------------------------------
    // 2. Container was created but
    //    has never been started
    // --------------------------------
    if (status.includes("created")) {
        console.log(`⚪ ${container.name}`);
        console.log(`   Status: ${container.status}`);
        console.log("   Container exists but has not been started.");
        console.log("");
        return;
    }
    // --------------------------------
    // 3. Container exited successfully
    // --------------------------------
    if (status.includes("exited (0)")) {
        console.log(`⚪ ${container.name}`);
        console.log(`   Status: ${container.status}`);
        console.log("   Container stopped with exit code 0.");
        console.log("");
        return;
    }
    // --------------------------------
    // 4. Container exited with an error
    // --------------------------------
    console.log(`🔴 ${container.name}`);
    console.log(`   Status: ${container.status}`);
    // Get container logs
    const logs = await (0, containerLogs_1.getContainerLogs)(container.name);
    // Analyze logs for known error patterns
    const diagnosis = (0, errorPatterns_1.analyzeLogs)(logs);
    if (diagnosis) {
        console.log("");
        console.log(`   Diagnosis: ${diagnosis.title}`);
        console.log(`   ${diagnosis.explanation}`);
        // Evidence
        console.log("");
        console.log("   Evidence:");
        for (const evidence of diagnosis.evidence) {
            console.log(`   → ${evidence}`);
        }
        // Recommendation
        if (diagnosis.recommendation) {
            console.log("");
            console.log("   Recommendation:");
            console.log(`   ${diagnosis.recommendation}`);
        }
        // Confidence
        if (diagnosis.confidence !== undefined) {
            console.log("");
            console.log(`   Confidence: ${diagnosis.confidence}%`);
        }
    }
    else {
        console.log("");
        console.log("   ⚠ No known error pattern was detected.");
    }
    console.log("");
}
//# sourceMappingURL=containerStatus.js.map