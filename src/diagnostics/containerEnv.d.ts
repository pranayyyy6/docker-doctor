export interface ContainerEnvironment {
    containerName: string;
    variables: Record<string, string>;
}
export declare function getContainerEnvironment(containerName: string): Promise<ContainerEnvironment>;
//# sourceMappingURL=containerEnv.d.ts.map