import { exec } from "child_process";

export function getContainerLogs(
    containerName: string
): Promise<string> {
    return new Promise((resolve) => {
        exec(
            `docker logs ${containerName}`,
            { maxBuffer: 1024 * 1024 },
            (error, stdout, stderr) => {
                if (error) {
                    resolve(stderr || stdout || "Unable to retrieve logs.");
                    return;
                }

                resolve(stdout || "Container produced no logs.");
            }
        );
    });
}