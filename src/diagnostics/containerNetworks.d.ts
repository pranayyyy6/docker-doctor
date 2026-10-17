export interface ContainerNetworkInfo {
    containerName: string;
    networks: string[];
}
export declare function getContainerNetworks(containerName: string): Promise<ContainerNetworkInfo>;
//# sourceMappingURL=containerNetworks.d.ts.map