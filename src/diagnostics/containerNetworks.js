"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContainerNetworks = getContainerNetworks;
const child_process_1 = require("child_process");
function getContainerNetworks(containerName) {
    return new Promise((resolve, reject) => {
        (0, child_process_1.exec)(`docker inspect --format="{{json .NetworkSettings.Networks}}" ${containerName}`, (error, stdout) => {
            if (error) {
                reject(error);
                return;
            }
            try {
                const networkData = JSON.parse(stdout.trim());
                const networks = Object.keys(networkData);
                resolve({
                    containerName,
                    networks
                });
            }
            catch {
                resolve({
                    containerName,
                    networks: []
                });
            }
        });
    });
}
//# sourceMappingURL=containerNetworks.js.map