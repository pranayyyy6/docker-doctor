"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContainerEnvironment = getContainerEnvironment;
const child_process_1 = require("child_process");
function getContainerEnvironment(containerName) {
    return new Promise((resolve, reject) => {
        (0, child_process_1.exec)(`docker inspect --format="{{json .Config.Env}}" ${containerName}`, (error, stdout) => {
            if (error) {
                reject(error);
                return;
            }
            try {
                const rawEnvironment = JSON.parse(stdout.trim());
                const variables = {};
                for (const item of rawEnvironment) {
                    const separatorIndex = item.indexOf("=");
                    if (separatorIndex === -1) {
                        continue;
                    }
                    const key = item.substring(0, separatorIndex);
                    const value = item.substring(separatorIndex + 1);
                    variables[key] = value;
                }
                resolve({
                    containerName,
                    variables
                });
            }
            catch {
                resolve({
                    containerName,
                    variables: {}
                });
            }
        });
    });
}
//# sourceMappingURL=containerEnv.js.map