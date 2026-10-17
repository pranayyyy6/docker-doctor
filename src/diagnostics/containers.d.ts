export interface ContainerInfo {
    id: string;
    name: string;
    image: string;
    status: string;
}
export declare function getContainers(): Promise<ContainerInfo[]>;
//# sourceMappingURL=containers.d.ts.map