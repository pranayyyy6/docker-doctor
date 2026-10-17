import { exec } from "child_process";

export interface ContainerNetworkInfo {
    containerName: string;
    networks: string[];
}

export function getContainerNetworks(
    containerName: string
): Promise<ContainerNetworkInfo> {

    return new Promise((resolve, reject) => {

        exec(
            `docker inspect --format="{{json .NetworkSettings.Networks}}" ${containerName}`,
            (error, stdout) => {

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

                } catch {
                    resolve({
                        containerName,
                        networks: []
                    });
                }
            }
        );
    });
}