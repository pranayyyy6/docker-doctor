"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDockerDaemon = checkDockerDaemon;
const child_process_1 = require("child_process");
function checkDockerDaemon() {
    return new Promise((resolve) => {
        (0, child_process_1.exec)("docker info", (error) => {
            resolve(!error);
        });
    });
}
//# sourceMappingURL=daemon.js.map