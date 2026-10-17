import { getContainers, ContainerInfo } from "../diagnostics/containers";
import {
    getContainerNetworks,
    ContainerNetworkInfo
} from "../diagnostics/containerNetworks";
import {
    getContainerEnvironment,
    ContainerEnvironment
} from "../diagnostics/containerEnv";
import {
    getContainerPorts,
    ContainerPort
} from "../diagnostics/containerPorts";
import {
    detectService,
    DetectedService
} from "../rules/serviceDetection";

export interface ContainerState {

    container: ContainerInfo;

    networkInfo: ContainerNetworkInfo;

    environment: ContainerEnvironment;

    ports: ContainerPort[];
}

export interface DockerState {

    containers: ContainerInfo[];

    services: DetectedService[];

    containerStates: ContainerState[];
}

export async function collectDockerState(): Promise<DockerState> {

    // --------------------------------
    // Get all containers
    // --------------------------------

    const containers =
        await getContainers();


    // --------------------------------
    // Detect services
    // --------------------------------

    const services =
        containers.map((container) =>
            detectService(container)
        );


    // --------------------------------
    // Collect detailed container state
    // --------------------------------

    const containerStates:
        ContainerState[] = [];


    for (const container of containers) {

        const networkInfo =
            await getContainerNetworks(
                container.name
            );


        const environment =
            await getContainerEnvironment(
                container.name
            );


        const ports =
            await getContainerPorts(
                container.name
            );


        containerStates.push({
            container,
            networkInfo,
            environment,
            ports
        });
    }


    return {
        containers,
        services,
        containerStates
    };
}