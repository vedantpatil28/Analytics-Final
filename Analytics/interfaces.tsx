export interface DataPoint<T, U> {
    x: T;
    y: U;
}

export interface GraphResponseDTO<T, U> {
    label: string;
    data: DataPoint<T, U>[];
}

export interface IReport {
    reportId?: number;
    scope: string;
    metrics: string;
    generatedDate?: string;
}

export interface IReportRequest {
    scope: string;
    metrics: string;
}
