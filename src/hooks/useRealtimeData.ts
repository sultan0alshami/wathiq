import { useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface RealtimeSubscriptionOptions {
  table: string;
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
  filter?: string;
}

export const useRealtimeSubscription = (options: RealtimeSubscriptionOptions) => {
  const { table, onInsert, onUpdate, onDelete, filter } = options;

  useEffect(() => {
    let channel: RealtimeChannel;

    const setupSubscription = async () => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Create channel
      channel = supabase
        .channel(`${table}_changes`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: table,
            filter: filter
          },
          (payload) => {
            console.log(`[Realtime] INSERT on ${table}:`, payload);
            onInsert?.(payload);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: table,
            filter: filter
          },
          (payload) => {
            console.log(`[Realtime] UPDATE on ${table}:`, payload);
            onUpdate?.(payload);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: table,
            filter: filter
          },
          (payload) => {
            console.log(`[Realtime] DELETE on ${table}:`, payload);
            onDelete?.(payload);
          }
        )
        .subscribe((status) => {
          console.log(`[Realtime] ${table} subscription status:`, status);
        });
    };

    setupSubscription();

    // Cleanup
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [table, onInsert, onUpdate, onDelete, filter]);
};

// =====================================================
// SPECIFIC REALTIME HOOKS
// =====================================================

export const useFinanceRealtime = (userId: string, onDataChange?: () => void) => {
  useRealtimeSubscription({
    table: 'finance_entries',
    filter: `user_id=eq.${userId}`,
    onInsert: () => {
      console.log('[Realtime] New finance entry added');
      onDataChange?.();
    },
    onUpdate: () => {
      console.log('[Realtime] Finance entry updated');
      onDataChange?.();
    },
    onDelete: () => {
      console.log('[Realtime] Finance entry deleted');
      onDataChange?.();
    }
  });
};

export const useSalesRealtime = (userId: string, onDataChange?: () => void) => {
  useRealtimeSubscription({
    table: 'sales_meetings',
    filter: `user_id=eq.${userId}`,
    onInsert: () => {
      console.log('[Realtime] New sales meeting added');
      onDataChange?.();
    },
    onUpdate: () => {
      console.log('[Realtime] Sales meeting updated');
      onDataChange?.();
    },
    onDelete: () => {
      console.log('[Realtime] Sales meeting deleted');
      onDataChange?.();
    }
  });
};

export const useOperationsRealtime = (userId: string, onDataChange?: () => void) => {
  useRealtimeSubscription({
    table: 'operations_entries',
    filter: `user_id=eq.${userId}`,
    onInsert: () => {
      console.log('[Realtime] New operations entry added');
      onDataChange?.();
    },
    onUpdate: () => {
      console.log('[Realtime] Operations entry updated');
      onDataChange?.();
    },
    onDelete: () => {
      console.log('[Realtime] Operations entry deleted');
      onDataChange?.();
    }
  });
};

export const useMarketingRealtime = (userId: string, onDataChange?: () => void) => {
  // Subscribe to marketing tasks
  useRealtimeSubscription({
    table: 'marketing_tasks',
    filter: `user_id=eq.${userId}`,
    onInsert: () => {
      console.log('[Realtime] New marketing task added');
      onDataChange?.();
    },
    onUpdate: () => {
      console.log('[Realtime] Marketing task updated');
      onDataChange?.();
    },
    onDelete: () => {
      console.log('[Realtime] Marketing task deleted');
      onDataChange?.();
    }
  });

  // Subscribe to marketing campaigns
  useRealtimeSubscription({
    table: 'marketing_campaigns',
    filter: `user_id=eq.${userId}`,
    onInsert: () => {
      console.log('[Realtime] New marketing campaign added');
      onDataChange?.();
    },
    onUpdate: () => {
      console.log('[Realtime] Marketing campaign updated');
      onDataChange?.();
    },
    onDelete: () => {
      console.log('[Realtime] Marketing campaign deleted');
      onDataChange?.();
    }
  });
};

export const useCustomersRealtime = (userId: string, onDataChange?: () => void) => {
  useRealtimeSubscription({
    table: 'customers',
    filter: `user_id=eq.${userId}`,
    onInsert: () => {
      console.log('[Realtime] New customer added');
      onDataChange?.();
    },
    onUpdate: () => {
      console.log('[Realtime] Customer updated');
      onDataChange?.();
    },
    onDelete: () => {
      console.log('[Realtime] Customer deleted');
      onDataChange?.();
    }
  });
};

export const useSuppliersRealtime = (userId: string, onDataChange?: () => void) => {
  useRealtimeSubscription({
    table: 'suppliers',
    filter: `user_id=eq.${userId}`,
    onInsert: () => {
      console.log('[Realtime] New supplier added');
      onDataChange?.();
    },
    onUpdate: () => {
      console.log('[Realtime] Supplier updated');
      onDataChange?.();
    },
    onDelete: () => {
      console.log('[Realtime] Supplier deleted');
      onDataChange?.();
    }
  });
};

// =====================================================
// GLOBAL REALTIME MANAGER
// =====================================================

export const useGlobalRealtime = (userId: string, onDataChange?: () => void) => {
  useFinanceRealtime(userId, onDataChange);
  useSalesRealtime(userId, onDataChange);
  useOperationsRealtime(userId, onDataChange);
  useMarketingRealtime(userId, onDataChange);
  useCustomersRealtime(userId, onDataChange);
  useSuppliersRealtime(userId, onDataChange);
};
