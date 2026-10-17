"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContainers = getContainers;
const child_process_1 = require("child_process");
function getContainers() {
    return new Promise((resolve, reject) => {
        (0, child_process_1.exec)('docker ps -a --format "{{.ID}}|{{.Names}}|{{.Image}}|{{.Status}}"', (error, stdout) => {
            if (error) {
                reject(error);
                return;
            }
            const containers = stdout
                .trim()
                .split("\n")
                .filter(Boolean)
                .map((line) => {
                const [id, name, image, status] = line.split("|");
                return {
                    id,
                    name,
                    image,
                    status,
                };
            });
            resolve(containers);
        });
    });
}
//# sourceMappingURL=containers.js.map