import { axiosPrivate } from '@/config/axios';

export interface HarvestLog {
  id: string;
  harvest_detail_id: string;
  farm_uuid: string;
  actual_volume: number;
  actual_volume_unit: string;
  harvested_at: string;
  pickup_location: string;
  notes?: string;
  status?: string;
}

export interface HarvestDetail {
  id: string;
  attributes: {
    selected_produce?: string;
    farm_uuids?: string[];
    linked_farms?: Array<{
      farm_uuid: string;
      status: string;
      actual_volume?: number;
      actual_volume_unit?: string;
      pickup_location?: string;
      harvest_log_id?: string;
    }>;
    [key: string]: any;
  };
}

export interface CreateHarvestLogPayload {
  data: {
    type: 'harvest_log';
    attributes: {
      harvest_detail_id: string;
      farm_uuid: string;
      actual_volume: number;
      actual_volume_unit: string;
      harvested_at: string;
      pickup_location: string;
      notes?: string;
    };
  };
}

export interface UpdateHarvestLogPayload {
  data: {
    type: 'harvest_log';
    attributes: {
      actual_volume?: number;
      actual_volume_unit?: string;
      harvested_at?: string;
      pickup_location?: string;
      notes?: string;
    };
  };
}

export const harvestLogsService = {
  getHarvestDetails: async () => {
    const response = await axiosPrivate.get('/harvest_details');
    return response.data;
  },

  createHarvestLog: async (payload: CreateHarvestLogPayload) => {
    const response = await axiosPrivate.post('/harvest_logs', payload);
    return response.data;
  },

  getAllHarvestLogs: async () => {
    const response = await axiosPrivate.get('/harvest_logs');
    return response.data;
  },

  getHarvestLogsByDetail: async (harvestDetailId: string) => {
    const response = await axiosPrivate.get('/harvest_logs', {
      params: { harvest_detail_id: harvestDetailId },
    });
    return response.data;
  },

  getHarvestLogById: async (id: string) => {
    const response = await axiosPrivate.get(`/harvest_logs/${id}`);
    return response.data;
  },

  updateHarvestLog: async (id: string, payload: UpdateHarvestLogPayload) => {
    const response = await axiosPrivate.patch(`/harvest_logs/${id}`, payload);
    return response.data;
  },

  deleteHarvestLog: async (id: string) => {
    const response = await axiosPrivate.delete(`/harvest_logs/${id}`);
    return response.data;
  },
};
