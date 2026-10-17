import { ContainerInfo } from "../diagnostics/containers";
import { ContainerNetworkInfo } from "../diagnostics/containerNetworks";
import { ContainerEnvironment } from "../diagnostics/containerEnv";
import { DiagnosticResult } from "../types";
export declare function detectDatabaseConnectionIssue(container: ContainerInfo, networkInfo: ContainerNetworkInfo, environment: ContainerEnvironment, allContainers: ContainerInfo[], postgresNetworkInfo: ContainerNetworkInfo): DiagnosticResult | null;
//# sourceMappingURL=databaseConnection.d.ts.map