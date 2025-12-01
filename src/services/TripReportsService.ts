import { format } from 'date-fns';
import {
  TripEntry,
  TripAttachment,
  TRIP_CHECKLIST_DEFAULTS,
  formatGregorianDateLabel,
  formatHijriDateLabel,
} from '@/lib/mockData';
import { supabase } from '@/lib/supabase';

interface TripReportRow {
  id: string;
  booking_id: string;
  day_date: string;
  source_ref?: string;
  booking_source?: string;
  supplier?: string;
  client_name?: string;
  driver_name?: string;
  car_type?: string;
  parking_location?: string;
  pickup_point?: string;
  dropoff_point?: string;
  supervisor_name?: string;
  supervisor_rating?: number;
  supervisor_notes?: string;
  passenger_feedback?: string;
  checklist?: Record<string, unknown>;
  status?: string;
  created_at?: string;
  created_by?: string;
  trip_photos?: Array<{
    id: string;
    storage_path?: string;
    file_name?: string;
    file_size?: number;
    mime_type?: string;
  }>;
}

const formatDateKey = (date: Date): string => format(date, 'yyyy-MM-dd');

const mapPhotoToAttachment = (photo: NonNullable<TripReportRow['trip_photos']>[number]): TripAttachment => ({
  id: photo.id,
  name: photo.file_name || 'evidence',
  size: photo.file_size || 0,
  mimeType: photo.mime_type || 'image/jpeg',
  storagePath: photo.storage_path || undefined,
});

const mapRowToTripEntry = (row: TripReportRow): TripEntry => ({
  id: row.id,
  bookingId: row.booking_id,
  date: row.day_date,
  hijriDateLabel: formatHijriDateLabel(row.day_date),
  gregorianDateLabel: formatGregorianDateLabel(row.day_date),
  sourceRef: row.source_ref || '',
  bookingSource: row.booking_source || '',
  supplier: row.supplier || '',
  clientName: row.client_name || '',
  driverName: row.driver_name || '',
  carType: row.car_type || '',
  parkingLocation: row.parking_location || '',
  pickupPoint: row.pickup_point || '',
  dropoffPoint: row.dropoff_point || '',
  supervisorName: row.supervisor_name || '',
  supervisorRating: row.supervisor_rating || 0,
  supervisorNotes: row.supervisor_notes || '',
  passengerFeedback: row.passenger_feedback || '',
  status: row.status === 'warning' ? 'warning' : 'approved',
  checklist: { ...TRIP_CHECKLIST_DEFAULTS, ...(row.checklist || {}) },
  attachments: (row.trip_photos || []).map(mapPhotoToAttachment),
  createdAt: row.created_at || new Date().toISOString(),
  createdBy: row.created_by || undefined,
  syncStatus: 'synced',
});

export const TripReportsService = {
  async listByDate(date: Date): Promise<TripEntry[]> {
    const { data, error } = await supabase
      .from('trip_reports')
      .select('*, trip_photos(*)')
      .eq('day_date', formatDateKey(date))
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data as TripReportRow[] | null)?.map(mapRowToTripEntry) ?? [];
  },

  async delete(id: string): Promise<void> {
    console.log('[TripReportsService] Attempting to delete trip by ID:', id);
    const { data, error } = await supabase
      .from('trip_reports')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      console.error('[TripReportsService] Delete error:', error);
      throw new Error(error.message);
    }
    
    console.log('[TripReportsService] Delete result:', data);
    // If no rows were deleted, the trip might not exist or user doesn't have permission
    if (!data || data.length === 0) {
      console.warn('[TripReportsService] No rows deleted - trip may not exist or permission denied');
      throw new Error('Trip not found or permission denied');
    }
  },

  async deleteByBookingId(bookingId: string): Promise<void> {
    console.log('[TripReportsService] Attempting to delete trip by bookingId:', bookingId);
    const { data, error } = await supabase
      .from('trip_reports')
      .delete()
      .eq('booking_id', bookingId)
      .select();

    if (error) {
      console.error('[TripReportsService] Delete by bookingId error:', error);
      throw new Error(error.message);
    }
    
    console.log('[TripReportsService] Delete by bookingId result:', data);
    // If no rows were deleted, the trip might not exist or user doesn't have permission
    if (!data || data.length === 0) {
      console.warn('[TripReportsService] No rows deleted by bookingId - trip may not exist or permission denied');
      throw new Error('Trip not found or permission denied');
    }
  },
};

