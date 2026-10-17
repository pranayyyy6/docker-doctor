import { exec } from "child_process";

export interface ContainerEnvironment {
    containerName: string;
    variables: Record<string, string>;
}

export function getContainerEnvironment(
    containerName: string
): Promise<ContainerEnvironment> {

    return new Promise((resolve, reject) => {

        exec(
            `docker inspect --format="{{json .Config.Env}}" ${containerName}`,
            (error, stdout) => {

                if (error) {
                    reject(error);
                    return;
                }

                try {
                    const rawEnvironment = JSON.parse(
                        stdout.trim()
                    );

                    const variables: Record<string, string> = {};

                    for (const item of rawEnvironment) {

                        const separatorIndex =
                            item.indexOf("=");

                        if (separatorIndex === -1) {
                            continue;
                        }

                        const key =
                            item.substring(
                                0,
                                separatorIndex
                            );

                        const value =
                            item.substring(
                                separatorIndex + 1
                            );

                        variables[key] = value;
                    }

                    resolve({
                        containerName,
                        variables
                    });

                } catch {
                    resolve({
                        containerName,
                        variables: {}
                    });
                }
            }
        );
    });
}