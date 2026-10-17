import { exec } from "child_process";

export interface ContainerInfo {
    id: string;
    name: string;
    image: string;
    status: string;
}

export function getContainers(): Promise<ContainerInfo[]> {
    return new Promise((resolve, reject) => {
        exec(
            'docker ps -a --format "{{.ID}}|{{.Names}}|{{.Image}}|{{.Status}}"',
            (error, stdout) => {
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
            }
        );
    });
}