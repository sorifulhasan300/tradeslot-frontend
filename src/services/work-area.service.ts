import { apiClient } from '@/lib/api-client';
import { ApiResponse, CreateWorkAreaDto, DailyWorkArea } from '@/types/api.types';

export const workAreaService = {
  async setWorkArea(dto: Partial<CreateWorkAreaDto> & { zoneName?: string }): Promise<ApiResponse<DailyWorkArea>> {
    const payload = {
      date: dto.date || new Date().toISOString().split('T')[0],
      zoneName: dto.zoneName || dto.postcodeOrCity || 'Default Work Zone',
      ...dto,
    };
    const response = await apiClient.post<ApiResponse<DailyWorkArea>>('/work-area', payload);
    return response.data;
  },

  async upsertWorkArea(dto: CreateWorkAreaDto): Promise<ApiResponse<DailyWorkArea>> {
    return this.setWorkArea(dto);
  },

  async createWorkArea(dto: CreateWorkAreaDto): Promise<ApiResponse<DailyWorkArea>> {
    return this.setWorkArea(dto);
  },

  async getWorkArea(traderId: string, date?: string): Promise<ApiResponse<DailyWorkArea>> {
    const response = await apiClient.get<ApiResponse<DailyWorkArea>>(`/work-area/${traderId}`, {
      params: { date },
    });
    return response.data;
  },
};
