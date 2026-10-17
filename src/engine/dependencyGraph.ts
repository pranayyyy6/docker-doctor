import {
    DockerState
} from "./dockerState";

import {
    resolveDependencies
} from "../rules/dependencyResolver";

export interface DependencyEdge {
    source: string;
    target: string;
    serviceType: string;
    variable: string;
    host: string;
    port?: number;
}

export interface DependencyGraph {
    edges: DependencyEdge[];
}

export function buildDependencyGraph(
    state: DockerState
): DependencyGraph {

    const edges: DependencyEdge[] = [];

    for (
        const containerState
        of state.containerStates
    ) {

        const dependencies =
            resolveDependencies(
                containerState.environment,
                state.services
            );

        for (
            const dependency
            of dependencies
        ) {

            const target =
                dependency.targetService
                    .container;

            if (
                target.name ===
                containerState.container.name
            ) {
                continue;
            }

            edges.push({
                source:
                    containerState.container.name,

                target:
                    target.name,

                serviceType:
                    dependency.serviceType,

                variable:
                    dependency.variable,

                host:
                    dependency.host,

                port:
                    dependency.port
            });
        }
    }

    return {
        edges
    };
}