import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import weatherService from '../api/weatherService';

// Hook pentru obținerea datelor curente
export function useCurrentWeather() {
  return useQuery({
    queryKey: ['currentWeather'],
    queryFn: weatherService.getCurrentData,
    refetchInterval: 5000, // Reîmprospătare la fiecare 5 secunde pentru actualizare în timp real
    refetchOnWindowFocus: true,
    staleTime: 2000, // Considerate datele învechite după 2 secunde
  });
}

// Hook pentru obținerea datelor istorice
export function useHistoryData(params) {
  return useQuery({
    queryKey: ['historyData', params],
    queryFn: () => weatherService.getHistoryData(params),
    enabled: !!params, // Execută query doar dacă params există
  });
}

// Hook pentru obținerea statisticilor
export function useStatistics(params) {
  return useQuery({
    queryKey: ['statistics', params],
    queryFn: () => weatherService.getStatistics(params || {}),
    // Rulează automat chiar și fără parametri
  });
}

// Hook pentru adăugarea datelor de test
export function useAddTestData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: weatherService.addTestData,
    onSuccess: () => {
      // Invalidarea cache-ului pentru a reîmprospăta datele
      queryClient.invalidateQueries({ queryKey: ['currentWeather'] });
      queryClient.invalidateQueries({ queryKey: ['historyData'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
    },
  });
}
