"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContainerLogs = getContainerLogs;
const child_process_1 = require("child_process");
function getContainerLogs(containerName) {
    return new Promise((resolve) => {
        (0, child_process_1.exec)(`docker logs ${containerName}`, { maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
            if (error) {
                resolve(stderr || stdout || "Unable to retrieve logs.");
                return;
            }
            resolve(stdout || "Container produced no logs.");
        });
    });
}
//# sourceMappingURL=containerLogs.js.map