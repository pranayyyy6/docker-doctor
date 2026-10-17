import { exec } from "child_process";

export interface ContainerPort {
    containerPort: number;
    hostPort?: number;
    protocol: string;
}

export function getContainerPorts(
    containerName: string
): Promise<ContainerPort[]> {

    return new Promise((resolve, reject) => {

        exec(
            `docker port ${containerName}`,
            (error, stdout) => {

                if (error) {
                    resolve([]);
                    return;
                }

                const ports: ContainerPort[] = [];

                const lines = stdout
                    .trim()
                    .split("\n")
                    .filter(Boolean);

                for (const line of lines) {

                    /*
                     Example:

                     5432/tcp -> 0.0.0.0:15432
                    */

                    const match =
                        line.match(
                            /(\d+)\/(\w+)\s+->\s+[\d.:]+:(\d+)/
                        );

                    if (!match) {
                        continue;
                    }

                    const containerPort =
                        Number(match[1]);

                    const protocol =
                        match[2];

                    const hostPort =
                        Number(match[3]);

                    ports.push({
                        containerPort,
                        hostPort,
                        protocol
                    });
                }

                resolve(ports);
            }
        );
    });
}