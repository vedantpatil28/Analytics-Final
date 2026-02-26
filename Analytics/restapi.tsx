import axios from 'axios';
import type { IReport, IReportRequest, GraphResponseDTO } from './interfaces';

const restapi = axios.create({
    baseURL: '/api/analytics'
});

restapi.interceptors.request.use(config => {
    const token = localStorage.getItem("JWT-Token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => Promise.reject(error));

// Reports CRUD
export const getAllReports    = () => restapi.get<IReport[]>('/reports');
export const createReport    = (data: IReportRequest) => restapi.post<IReport>('/reports', data);
export const updateReport    = (id: number, data: IReportRequest) => restapi.put<IReport>(`/reports/${id}`, data);
export const deleteReport    = (id: number) => restapi.delete(`/reports/${id}`);

// Analytics Data
export const getParticipationStatus = () => restapi.get<GraphResponseDTO<string, number>>('/participation/status');
export const getDeptParticipation   = () => restapi.get<GraphResponseDTO<string, number>>('/participation/department');
export const getProgramParticipation = () => restapi.get<GraphResponseDTO<string, number>>('/participation/program');
export const getMonthlyTrend        = () => restapi.get<GraphResponseDTO<string, number>>('/trend/monthly');
export const getCategoryParticipation = () => restapi.get<GraphResponseDTO<string, number>>('/participation/category');
export const getGoalStatus          = () => restapi.get<GraphResponseDTO<string, number>>('/goal/status');
