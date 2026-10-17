import { exec } from "child_process";

export function checkDockerDaemon(): Promise<boolean> {
    return new Promise((resolve) => {
        exec("docker info", (error) => {
            resolve(!error);
        });
    });
}