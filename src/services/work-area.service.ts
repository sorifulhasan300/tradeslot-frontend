import { apiClient } from '@/lib/api-client';
import { ApiResponse, CreateWorkAreaDto, DailyWorkArea } from '@/types/api.types';

export const workAreaService = {
  async upsertWorkArea(dto: CreateWorkAreaDto): Promise<ApiResponse<DailyWorkArea>> {
    const response = await apiClient.post<ApiResponse<DailyWorkArea>>('/work-area', dto);
    return response.data;
  },

  async getWorkArea(traderId: string, date?: string): Promise<ApiResponse<DailyWorkArea>> {
    const response = await apiClient.get<ApiResponse<DailyWorkArea>>(`/work-area/${traderId}`, {
      params: { date },
    });
    return response.data;
  },
};
