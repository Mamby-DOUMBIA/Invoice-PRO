import type { QueryClient } from '@tanstack/react-query'

/** Refresh all query families that derive totals or document relationships. */
export function invalidateDerivedData(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] }),
    queryClient.invalidateQueries({ queryKey: ['revenue-chart'] }),
    queryClient.invalidateQueries({ queryKey: ['top-clients'] }),
    queryClient.invalidateQueries({ queryKey: ['recent-invoices'] }),
    queryClient.invalidateQueries({ queryKey: ['client-stats'] }),
    queryClient.invalidateQueries({ queryKey: ['all-payments'] }),
  ])
}

/** Refresh the document and product/client lists affected by a mutation. */
export function invalidateWorkspaceData(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ['invoices'] }),
    queryClient.invalidateQueries({ queryKey: ['quotes'] }),
    queryClient.invalidateQueries({ queryKey: ['purchase-orders'] }),
    queryClient.invalidateQueries({ queryKey: ['clients'] }),
    queryClient.invalidateQueries({ queryKey: ['products'] }),
    queryClient.invalidateQueries({ queryKey: ['receipts'] }),
    queryClient.invalidateQueries({ queryKey: ['payments'] }),
    invalidateDerivedData(queryClient),
  ])
}
