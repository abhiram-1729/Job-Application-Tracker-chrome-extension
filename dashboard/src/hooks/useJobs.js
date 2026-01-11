import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobsAPI } from '../services/api';

export function useJobs(filters = {}) {
    return useQuery({
        queryKey: ['jobs', filters],
        queryFn: () => jobsAPI.getAll(filters).then(res => res.data),
        refetchInterval: 5000 // Poll every 5 seconds for "real-time" updates
    });
}

export function useJobStats() {
    return useQuery({
        queryKey: ['job-stats'],
        queryFn: () => jobsAPI.getStats().then(res => res.data),
        refetchInterval: 5000 // Poll every 5 seconds
    });
}

export function useCreateJob() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => jobsAPI.create(data).then(res => res.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
            queryClient.invalidateQueries({ queryKey: ['job-stats'] });
        }
    });
}

export function useUpdateJob() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => jobsAPI.update(id, data).then(res => res.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
            queryClient.invalidateQueries({ queryKey: ['job-stats'] });
        }
    });
}

export function useDeleteJob() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => jobsAPI.delete(id).then(res => res.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
            queryClient.invalidateQueries({ queryKey: ['job-stats'] });
        }
    });
}

export function useInitSheet() {
    return useMutation({
        mutationFn: () => jobsAPI.init().then(res => res.data)
    });
}
