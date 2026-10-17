export type Severity = "info" | "warning" | "error";

export interface DiagnosticResult {
    severity: Severity;
    title: string;
    explanation: string;
    evidence: string[];
    recommendation?: string;
    confidence?: number;
}