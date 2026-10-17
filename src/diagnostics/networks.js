"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNetworks = getNetworks;
const child_process_1 = require("child_process");
function getNetworks() {
    return new Promise((resolve, reject) => {
        (0, child_process_1.exec)('docker network ls --format "{{.ID}}|{{.Name}}"', (error, stdout) => {
            if (error) {
                reject(error);
                return;
            }
            const networks = stdout
                .trim()
                .split("\n")
                .filter(Boolean)
                .map((line) => {
                const [id, name] = line.split("|");
                return {
                    id,
                    name
                };
            });
            resolve(networks);
        });
    });
}
//# sourceMappingURL=networks.js.map