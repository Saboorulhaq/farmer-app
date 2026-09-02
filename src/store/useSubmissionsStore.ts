import { create } from 'zustand';
import { Submission } from '@/services/submissions.service';
import { submissionsService } from '@/services/submissions.service';

type SubmissionsState = {
  submissions: Submission[];
  loading: boolean;
  error: string | null;
  fetchSubmissions: () => Promise<void>;
  hasActiveLoan: () => boolean;
};

export const useSubmissionsStore = create<SubmissionsState>((set, get) => ({
  submissions: [],
  loading: false,
  error: null,

  fetchSubmissions: async () => {
    set({ loading: true, error: null });
    try {
      const response = await submissionsService.getAllSubmissions();
      set({ submissions: response.data, loading: false });
    } catch (error: any) {
      set({
        error: error?.message || 'Failed to fetch submissions',
        loading: false,
      });
    }
  },

  hasActiveLoan: () => {
    const { submissions } = get();
    const terminalStatuses = ['rejected', 'completed', 'cancelled', 'closed'];
    return submissions.some(
      (s) => !terminalStatuses.includes(s.status),
    );
  },
}));
