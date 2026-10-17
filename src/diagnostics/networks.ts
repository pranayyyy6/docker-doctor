import { exec } from "child_process";

export interface DockerNetwork {
    name: string;
    id: string;
}

export function getNetworks(): Promise<DockerNetwork[]> {
    return new Promise((resolve, reject) => {
        exec(
            'docker network ls --format "{{.ID}}|{{.Name}}"',
            (error, stdout) => {
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
            }
        );
    });
}