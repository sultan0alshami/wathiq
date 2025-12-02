import React, { useCallback, useEffect, useMemo, useState, useRef, startTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useDateContext } from '@/contexts/DateContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationsContext';
import {
  getDataForDate,
  updateSectionData,
  TripChecklist,
  TripChecklistRating,
  TripEntry,
  TripSyncStatus,
  TripAttachment,
  TripDraft,
  TripRecycleRecord,
  TripFormSnapshot,
  TRIP_FORM_DEFAULTS,
  TRIP_CHECKLIST_DEFAULTS,
  formatHijriDateLabel,
  formatGregorianDateLabel,
} from '@/lib/mockData';
import {
  TripService,
  TripPhotoAttachment,
  OfflineTripRecord,
  TripReportInput,
} from '@/services/TripService';
import { TripReportsService } from '@/services/TripReportsService';
import { ARABIC_TRIPS_MESSAGES, ChecklistKey } from '@/lib/arabicTripsMessages';
import { cn } from '@/lib/utils';
import {
  AlertCircle,
  AlertTriangle,
  Archive,
  Camera,
  CheckCircle2,
  CloudOff,
  Image as ImageIcon,
  Loader2,
  PencilLine,
  RefreshCw,
  RotateCcw,
  Trash2,
  Undo2,
  Upload,
  X,
} from 'lucide-react';
import { addDays, differenceInCalendarDays, format } from 'date-fns';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

interface SelectedPhoto {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  base64: string;
  previewUrl: string;
}

const BOOKING_PREFIX = 'WTH';

const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10);

const parseSequenceFromBookingId = (bookingId?: string) => {
  if (!bookingId) return 0;
  const match = bookingId.match(/WTH-\d{2}-\d{2}-(\d{4})$/);
  return match ? parseInt(match[1], 10) : 0;
};

const buildBookingId = (date: Date, sequence: number) => {
  const yy = format(date, 'yy');
  const mm = format(date, 'MM');
  const seq = sequence.toString().padStart(4, '0');
  return `${BOOKING_PREFIX}-${yy}-${mm}-${seq}`;
};

const computeNextSequence = (
  entries: TripEntry[],
  queueRecords: OfflineTripRecord[],
  reservedBookingIds: string[] = []
) => {
  const sequences = [
    ...entries.map((entry) => parseSequenceFromBookingId(entry.bookingId)),
    ...queueRecords.map((record) =>
      parseSequenceFromBookingId(record.payload.bookingId)
    ),
    ...reservedBookingIds.map((bookingId) => parseSequenceFromBookingId(bookingId)),
  ];
  const maxSeq = sequences.length ? Math.max(...sequences) : 0;
  return maxSeq + 1;
};

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('ar-SA', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));

const bookingSources = ['تطبيق المطار', 'نسك', 'تطبيق واثق (مباشر)', 'B2B'];
const suppliers = ['ديار مكة', 'المنهاج', 'أسطول واثق', 'أخرى'];

const REQUIRED_FORM_FIELDS: Array<keyof TripFormSnapshot> = [
  'bookingSource',
  'supplier',
  'clientName',
  'driverName',
  'carType',
  'parkingLocation',
  'pickupPoint',
  'dropoffPoint',
];

const FORM_FIELD_LABELS: Record<keyof TripFormSnapshot, string> = {
  sourceRef: ARABIC_TRIPS_MESSAGES.SOURCE_REF_LABEL,
  bookingSource: ARABIC_TRIPS_MESSAGES.BOOKING_SOURCE_LABEL,
  supplier: ARABIC_TRIPS_MESSAGES.SUPPLIER_LABEL,
  clientName: ARABIC_TRIPS_MESSAGES.CLIENT_NAME_LABEL,
  driverName: ARABIC_TRIPS_MESSAGES.DRIVER_NAME_LABEL,
  carType: ARABIC_TRIPS_MESSAGES.CAR_TYPE_LABEL,
  parkingLocation: ARABIC_TRIPS_MESSAGES.PARKING_LOCATION_LABEL,
  pickupPoint: ARABIC_TRIPS_MESSAGES.PICKUP_POINT_LABEL,
  dropoffPoint: ARABIC_TRIPS_MESSAGES.DROPOFF_POINT_LABEL,
  supervisorName: ARABIC_TRIPS_MESSAGES.SUPERVISOR_NAME_LABEL,
  supervisorRating: ARABIC_TRIPS_MESSAGES.SUPERVISOR_RATING_LABEL,
  supervisorNotes: ARABIC_TRIPS_MESSAGES.SUPERVISOR_NOTES_LABEL,
  passengerFeedback: ARABIC_TRIPS_MESSAGES.PASSENGER_FEEDBACK_LABEL,
};

const ratingOptions = [
  { value: 1, label: '⭐ سيء' },
  { value: 2, label: '⭐⭐ ضعيف' },
  { value: 3, label: '⭐⭐⭐ مقبول' },
  { value: 4, label: '⭐⭐⭐⭐ جيد' },
  { value: 5, label: '⭐⭐⭐⭐⭐ ممتاز' },
];

const IMPORTANT_CHECKLIST_KEYS = new Set<ChecklistKey>([
  'carSmell',
  'driverAppearance',
]);

const checklistRatingOptions: Array<{
  value: TripChecklistRating;
  label: string;
  className: string;
  selectedClassName: string;
}> = [
  {
    value: 'bad',
    label: 'سيء',
    className: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
    selectedClassName: 'bg-red-600 text-white border-red-600 hover:bg-red-500',
  },
  {
    value: 'normal',
    label: 'عادي',
    className: 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100',
    selectedClassName: 'bg-slate-600 text-white border-slate-600 hover:bg-slate-500',
  },
  {
    value: 'good',
    label: 'جيد',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
    selectedClassName: 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-500',
  },
];

const MAX_PHOTOS = 6;
const RECYCLE_RETENTION_DAYS = 30;

const buildFormState = (preferredSupervisorName?: string): TripFormSnapshot => ({
  ...TRIP_FORM_DEFAULTS,
  supervisorName: preferredSupervisorName || TRIP_FORM_DEFAULTS.supervisorName || 'هاني بخش',
});

const purgeExpiredRecycle = (records: TripRecycleRecord[]) => {
  const now = Date.now();
  return records.filter((record) => new Date(record.purgeAt).getTime() > now);
};

export const Trips: React.FC = () => {
  const { currentDate } = useDateContext();
  const { user, userName } = useAuth();
  const { addNotification } = useNotifications();
  const { toast } = useToast();

  const [bookingSequence, setBookingSequence] = useState(1);
  const [form, setForm] = useState<TripFormSnapshot>(() => buildFormState(userName || undefined));
  const [checklist, setChecklist] = useState<TripChecklist>(TRIP_CHECKLIST_DEFAULTS);
  const [selectedPhotos, setSelectedPhotos] = useState<SelectedPhoto[]>([]);
  const [trips, setTrips] = useState<TripEntry[]>([]);
  const [queue, setQueue] = useState<OfflineTripRecord[]>(TripService.loadQueue());
  const [drafts, setDrafts] = useState<TripDraft[]>([]);
  const [recycleBin, setRecycleBin] = useState<TripRecycleRecord[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [editingTripId, setEditingTripId] = useState<string | null>(null);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [persistedAttachments, setPersistedAttachments] = useState<TripAttachment[]>([]);
  const [editingQueueAttachments, setEditingQueueAttachments] = useState<TripPhotoAttachment[]>([]);
  const [canReuseExistingEvidence, setCanReuseExistingEvidence] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDeleteTrip, setPendingDeleteTrip] = useState<TripEntry | null>(null);
  const [purgeDialogOpen, setPurgeDialogOpen] = useState(false);
  const [pendingRecycleRecord, setPendingRecycleRecord] = useState<TripRecycleRecord | null>(null);
  const [deletedTripIds, setDeletedTripIds] = useState<string[]>([]);
  const isDeletingRef = React.useRef(false);
  const retryCountRef = React.useRef(0);
  const lastErrorRef = React.useRef<Error | null>(null);
  const fetchAbortControllerRef = React.useRef<AbortController | null>(null);

  const editingTrip = useMemo(
    () => (editingTripId ? trips.find((entry) => entry.id === editingTripId) || null : null),
    [editingTripId, trips]
  );

  const editingDraft = useMemo(
    () => (editingDraftId ? drafts.find((draft) => draft.id === editingDraftId) || null : null),
    [editingDraftId, drafts]
  );

  const bookingId = useMemo(
    () => {
      if (editingTrip) return editingTrip.bookingId;
      if (editingDraft) return editingDraft.bookingId;
      return buildBookingId(currentDate, bookingSequence);
    },
    [editingTrip, editingDraft, currentDate, bookingSequence]
  );

  const currentDateStr = useMemo(
    () => currentDate.toISOString().split('T')[0],
    [currentDate]
  );

  const hijriDateLabel = useMemo(
    () => formatHijriDateLabel(currentDate),
    [currentDate]
  );

  const gregorianDateLabel = useMemo(
    () => formatGregorianDateLabel(currentDate),
    [currentDate]
  );

  const updateNextBookingSequence = useCallback((
    entriesSnapshot: TripEntry[],
    queueSnapshot: OfflineTripRecord[],
    draftsSnapshot: TripDraft[] = drafts,
    recycleSnapshot: TripRecycleRecord[] = recycleBin,
  ) => {
    const reservedIds = [
      ...draftsSnapshot.map((draft) => draft.bookingId),
      ...recycleSnapshot.map((record) => record.bookingId),
    ];
    setBookingSequence(
      computeNextSequence(entriesSnapshot, queueSnapshot, reservedIds)
    );
  }, [drafts, recycleBin]);

  const persistTripsSection = useCallback(
    (
      entries: TripEntry[],
      pending: number,
      draftsSnapshot: TripDraft[] = drafts,
      recycleSnapshot: TripRecycleRecord[] = recycleBin
    ) => {
      updateSectionData(currentDate, 'trips', {
        totalTrips: entries.length,
        entries,
        pendingSync: pending,
        drafts: draftsSnapshot,
        recycleBin: recycleSnapshot,
      });
    },
    [currentDate, drafts, recycleBin]
  );

  const queueRecordToTripEntry = useCallback(
    (record: OfflineTripRecord): TripEntry => ({
      id: record.id,
      bookingId: record.payload.bookingId,
      date: record.payload.date,
      hijriDateLabel: formatHijriDateLabel(record.payload.date),
      gregorianDateLabel: formatGregorianDateLabel(record.payload.date),
      sourceRef: record.payload.sourceRef || '',
      bookingSource: record.payload.bookingSource || '',
      supplier: record.payload.supplier || '',
      clientName: record.payload.clientName || '',
      driverName: record.payload.driverName || '',
      carType: record.payload.carType || '',
      parkingLocation: record.payload.parkingLocation || '',
      pickupPoint: record.payload.pickupPoint || '',
      dropoffPoint: record.payload.dropoffPoint || '',
      supervisorName: record.payload.supervisorName || '',
      supervisorRating: record.payload.supervisorRating,
      supervisorNotes: record.payload.supervisorNotes || '',
      passengerFeedback: record.payload.passengerFeedback || '',
      status: record.payload.status,
      checklist: record.payload.checklist ?? { ...TRIP_CHECKLIST_DEFAULTS },
      attachments: (record.attachments || []).map((attachment) => ({
        id: attachment.id,
        name: attachment.name,
        size: attachment.size,
        mimeType: attachment.mimeType,
      })),
      createdAt: record.createdAt,
      createdBy: record.payload.createdBy || user?.id,
      syncStatus: record.status,
    }),
    [user?.id]
  );

  const loadRemoteTrips = useCallback(async (forceReload = false) => {
    // Cancel any previous request
    if (fetchAbortControllerRef.current) {
      fetchAbortControllerRef.current.abort();
    }
    
    // Create new abort controller
    fetchAbortControllerRef.current = new AbortController();
    const signal = fetchAbortControllerRef.current.signal;
    setLoadingTrips(true);
      
      // Load cached data first for instant display
      try {
        const storedData = getDataForDate(currentDate);
        const storedDrafts = storedData.trips.drafts || [];
        const cleanedRecycle = purgeExpiredRecycle(storedData.trips.recycleBin || []);
        const storedQueue = TripService.loadQueue();
        const queueEntries = storedQueue.map(queueRecordToTripEntry);
        
        // Show cached trips immediately, but filter out deleted ones
        const deletedSet = new Set(deletedTripIds);
        if (storedData.trips.entries && storedData.trips.entries.length > 0) {
          const cachedEntries = storedData.trips.entries as TripEntry[];
          // Filter out deleted trips from cache
          const filteredCached = cachedEntries.filter(
            entry => !deletedSet.has(entry.id) && !deletedSet.has(entry.bookingId)
          );
          // Also filter queue entries
          const filteredQueueEntries = queueEntries.filter(
            entry => !deletedSet.has(entry.id) && !deletedSet.has(entry.bookingId)
          );
          const combinedCached = [...filteredCached, ...filteredQueueEntries];
          setTrips(combinedCached);
          setDrafts(storedDrafts);
          setRecycleBin(cleanedRecycle);
          setQueue(storedQueue);
          // Update booking sequence immediately from cached data
          updateNextBookingSequence(combinedCached, storedQueue, storedDrafts, cleanedRecycle);
          setLoadingTrips(false); // Show UI immediately with cached data
        } else {
          const filteredQueueEntries = queueEntries.filter(
            entry => !deletedSet.has(entry.id) && !deletedSet.has(entry.bookingId)
          );
          setTrips(filteredQueueEntries);
          setDrafts(storedDrafts);
          setRecycleBin(cleanedRecycle);
          setQueue(storedQueue);
          // Update booking sequence immediately
          updateNextBookingSequence(filteredQueueEntries, storedQueue, storedDrafts, cleanedRecycle);
        }
      } catch (err) {
        console.warn('[Trips] Failed to load cached data:', err);
      }
      
      // Then fetch fresh data from Supabase in background
      // Only fetch if we're not in the middle of a delete operation
      // Skip if request was aborted
      if (signal.aborted) {
        console.log('[Trips] Request aborted, skipping Supabase fetch');
        return;
      }
      
      try {
        const remoteEntries = await TripReportsService.listByDate(currentDate);
        
        // Check if request was aborted during fetch
        if (signal.aborted) {
          console.log('[Trips] Request aborted during fetch, ignoring results');
          return;
        }
        const storedData = getDataForDate(currentDate);
        const storedDrafts = storedData.trips.drafts || [];
        const cleanedRecycle = purgeExpiredRecycle(storedData.trips.recycleBin || []);
        const storedQueue = TripService.loadQueue();
        const queueEntries = storedQueue.map(queueRecordToTripEntry);
        
        // Deduplicate: Remove queue entries that are already synced in remoteEntries
        // Also filter out any trips that have been deleted
        const deletedSet = new Set(deletedTripIds);
        const remoteIds = new Set(remoteEntries.map(e => e.id));
        const remoteBookingIds = new Set(remoteEntries.map(e => e.bookingId));
        const uniqueQueueEntries = queueEntries.filter(
          entry => !remoteIds.has(entry.id) && !remoteBookingIds.has(entry.bookingId) && !deletedSet.has(entry.id) && !deletedSet.has(entry.bookingId)
        );
        
        // Filter out deleted trips from remote entries
        const filteredRemoteEntries = remoteEntries.filter(
          entry => !deletedSet.has(entry.id) && !deletedSet.has(entry.bookingId)
        );
        
        const combinedEntries = [...filteredRemoteEntries, ...uniqueQueueEntries];
        
        // Use startTransition for non-urgent update
        startTransition(() => {
          // Only update if we have valid data and not in the middle of a delete operation
          if (!deleteDialogOpen && !purgeDialogOpen && !isDeletingRef.current) {
            setTrips(combinedEntries);
            setDrafts(storedDrafts);
            setRecycleBin(cleanedRecycle);
            setQueue(storedQueue);
            persistTripsSection(combinedEntries, storedQueue.length, storedDrafts, cleanedRecycle);
            updateNextBookingSequence(combinedEntries, storedQueue, storedDrafts, cleanedRecycle);
          }
        });
      } catch (error: any) {
        // Handle network errors gracefully
        const isInsufficientResources = error?.message?.includes('ERR_INSUFFICIENT_RESOURCES') ||
                                       error?.code === 'ERR_INSUFFICIENT_RESOURCES';
        const isNetworkError = error?.message?.includes('network') || 
                              error?.message?.includes('ERR_NETWORK') ||
                              error?.code === 'ERR_NETWORK_CHANGED';
        
        // NEVER retry on ERR_INSUFFICIENT_RESOURCES - it causes infinite loops
        if (isInsufficientResources) {
          console.error('[Trips] ERR_INSUFFICIENT_RESOURCES detected - using cached data only, no retries:', error);
          // Don't show error toast, just use cached data silently
          // The trips from localStorage will be shown
        } else if (isNetworkError) {
          console.warn('[Trips] Network error loading trips, using cached data:', error);
          // Don't show error toast for network issues, just use cached data
        } else {
          console.error('Failed to load trips from Supabase', error);
          toast({
            title: 'تعذر تحميل الرحلات',
            description: 'حدث خطأ أثناء تحميل الرحلات من قاعدة البيانات. حاول مرة أخرى لاحقاً.',
            variant: 'destructive',
          });
        }
      } finally {
        setLoadingTrips(false);
      }
  }, [currentDate, queueRecordToTripEntry, persistTripsSection, toast, updateNextBookingSequence, deletedTripIds, deleteDialogOpen, purgeDialogOpen]);

  useEffect(() => {
    loadRemoteTrips();
    
    return () => {
      // Cleanup: abort any in-flight requests when component unmounts or date changes
      if (fetchAbortControllerRef.current) {
        fetchAbortControllerRef.current.abort();
        fetchAbortControllerRef.current = null;
      }
    };
  }, [currentDate, loadRemoteTrips]);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      supervisorName: userName || prev.supervisorName || TRIP_FORM_DEFAULTS.supervisorName,
    }));
  }, [userName]);

  const isChecklistClean = Object.values(checklist).every(
    (value) => value === 'good'
  );
  const previewStatus =
    isChecklistClean && form.supervisorRating >= 3 ? 'approved' : 'warning';

  const handleInputChange = (
    field: keyof typeof form,
    value: string | number
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleChecklistRatingChange = (
    key: ChecklistKey,
    value: TripChecklistRating
  ) => {
    setChecklist((prev) => ({ ...prev, [key]: value }));
  };

  const computeMissingFields = () => {
    const missing: string[] = [];
    REQUIRED_FORM_FIELDS.forEach((field) => {
      if (!form[field]) {
        missing.push(FORM_FIELD_LABELS[field]);
      }
    });
    if (!editingTripId && selectedPhotos.length === 0) {
      missing.push('صور التوثيق');
    }
    return missing;
  };

  const handleSaveDraft = () => {
    const now = new Date().toISOString();
    const isEditing = Boolean(editingDraft);
    const draftId = editingDraft?.id || editingTrip?.id || createId();
    const targetDate = editingTrip?.date || editingDraft?.date || currentDateStr;
    const missingFields = computeMissingFields();
    const draft: TripDraft = {
      id: draftId,
      bookingId,
      date: targetDate,
      gregorianDateLabel:
        editingTrip?.gregorianDateLabel || editingDraft?.gregorianDateLabel || gregorianDateLabel,
      hijriDateLabel:
        editingTrip?.hijriDateLabel || editingDraft?.hijriDateLabel || hijriDateLabel,
      savedAt: editingDraft?.savedAt || now,
      updatedAt: now,
      form: { ...form },
      checklist,
      missingFields,
      note: missingFields.length ? 'بانتظار استكمال البيانات' : 'البيانات مكتملة وجاهزة للإرسال',
    };
    const updatedDrafts = isEditing
      ? drafts.map((item) => (item.id === draft.id ? draft : item))
      : [...drafts, draft];
    setDrafts(updatedDrafts);
    persistTripsSection(trips, queue.length, updatedDrafts, recycleBin);
    updateNextBookingSequence(trips, queue, updatedDrafts);
    toast({
      title: isEditing ? 'تم تحديث الأرشيف' : 'تم حفظ الرحلة في الأرشيف',
      description: 'يمكنك العودة لاحقاً لاستكمال الحقول وإرسال الرحلة.',
    });
    resetForm();
  };

  const handleResumeDraft = (draft: TripDraft) => {
    setEditingDraftId(draft.id);
    setEditingTripId(null);
    setForm({ ...draft.form });
    setChecklist(draft.checklist);
    setPersistedAttachments([]);
    setEditingQueueAttachments([]);
    setCanReuseExistingEvidence(false);
    setSelectedPhotos([]);
    toast({
      title: 'استئناف الرحلة المؤرشفة',
      description: `يمكنك الآن إكمال الرحلة رقم ${draft.bookingId}.`,
    });
  };

  const handleRemoveDraft = (draftId: string) => {
    const nextDrafts = drafts.filter((draft) => draft.id !== draftId);
    setDrafts(nextDrafts);
    persistTripsSection(trips, queue.length, nextDrafts, recycleBin);
    updateNextBookingSequence(trips, queue, nextDrafts);
    if (editingDraftId === draftId) {
      resetForm();
    }
    toast({
      title: 'تم حذف العنصر من الأرشيف',
      description: 'لم يعد هذا السجل موجوداً في الأرشيف.',
    });
  };

  const triggerDeleteTrip = (trip: TripEntry) => {
    console.log('[Trips] ========== TRIGGER DELETE TRIP CALLED ==========');
    console.log('[Trips] triggerDeleteTrip called for trip:', {
      id: trip.id,
      bookingId: trip.bookingId,
      syncStatus: trip.syncStatus
    });
    try {
      setPendingDeleteTrip(trip);
      console.log('[Trips] pendingDeleteTrip state updated');
      setDeleteDialogOpen(true);
      console.log('[Trips] Delete dialog opened, deleteDialogOpen set to true');
      console.log('[Trips] Dialog should now be visible');
    } catch (err) {
      console.error('[Trips] Error in triggerDeleteTrip:', err);
    }
  };

  const confirmDeleteTrip = async (tripToDelete?: TripEntry) => {
    console.log('[Trips] ========== CONFIRM DELETE TRIP STARTED ==========');
    console.log('[Trips] confirmDeleteTrip function called at:', new Date().toISOString());
    console.log('[Trips] tripToDelete parameter:', tripToDelete);
    console.log('[Trips] pendingDeleteTrip state:', pendingDeleteTrip);
    console.log('[Trips] deleteDialogOpen state:', deleteDialogOpen);
    
    // Use parameter if provided, otherwise fall back to state
    const target = tripToDelete || pendingDeleteTrip;
    
    if (!target) {
      console.error('[Trips] ❌ ERROR: No trip to delete, aborting deletion');
      toast({
        title: 'خطأ',
        description: 'لم يتم العثور على الرحلة المراد حذفها.',
        variant: 'destructive',
      });
      setDeleteDialogOpen(false);
      setPendingDeleteTrip(null);
      return;
    }
    console.log('[Trips] ✅ Target trip found:', {
      id: target.id,
      bookingId: target.bookingId,
      syncStatus: target.syncStatus,
      hasId: !!target.id,
      idLength: target.id?.length,
      isUUID: target.id?.length === 36,
      fullTrip: target
    });
    
    // Set flag to prevent useEffect from overwriting state
    isDeletingRef.current = true;
    console.log('[Trips] isDeletingRef set to true');
    
    // Delete from Supabase if trip is synced (or might be synced)
    // Try to delete by ID first, then by bookingId as fallback
    let deletedFromSupabase = false;
    // Always try to delete from Supabase if we have a valid UUID (trip might be synced even if status says otherwise)
    // Check if ID looks like a UUID (36 chars with dashes) or if syncStatus indicates it's synced
    const isLikelySynced = (target.id && target.id.length === 36) || 
                          target.syncStatus === 'synced' || 
                          target.syncStatus === 'pending' || 
                          target.syncStatus === 'failed';
    
    if (isLikelySynced) {
      try {
        // Try deleting by ID first if we have a UUID
        if (target.id && target.id.length === 36) {
          await TripReportsService.delete(target.id);
          deletedFromSupabase = true;
          console.log('[Trips] Successfully deleted trip from Supabase by ID:', target.id);
        } else {
          // If no UUID, try by bookingId
          await TripReportsService.deleteByBookingId(target.bookingId);
          deletedFromSupabase = true;
          console.log('[Trips] Successfully deleted trip from Supabase by bookingId:', target.bookingId);
        }
      } catch (error: any) {
        const errorMsg = error?.message || String(error);
        console.warn('[Trips] Failed to delete by ID, trying bookingId:', errorMsg);
        
        // If delete by ID fails, try by bookingId (in case ID mismatch)
        try {
          await TripReportsService.deleteByBookingId(target.bookingId);
          deletedFromSupabase = true;
          console.log('[Trips] Successfully deleted trip from Supabase by bookingId:', target.bookingId);
        } catch (bookingIdError: any) {
          // If both fail, check if it's a permission error
          const bookingErrorMsg = bookingIdError?.message || String(bookingIdError);
          console.error('[Trips] Both delete attempts failed:', {
            id: target.id,
            bookingId: target.bookingId,
            error: errorMsg,
            bookingError: bookingErrorMsg
          });
          
          if (bookingErrorMsg.includes('permission') || 
              bookingErrorMsg.includes('denied') || 
              bookingErrorMsg.includes('policy') || 
              bookingErrorMsg.includes('RLS') ||
              bookingErrorMsg.includes('row-level security')) {
            console.error('[Trips] Permission denied when deleting trip:', bookingErrorMsg);
            toast({
              title: 'خطأ في الصلاحيات',
              description: 'ليس لديك صلاحية لحذف هذه الرحلة. يرجى التأكد من تطبيق سياسات الحذف في Supabase أو الاتصال بالمدير.',
              variant: 'destructive',
            });
            // Don't continue with local deletion if permission denied
            isDeletingRef.current = false;
            setPendingDeleteTrip(null);
            setDeleteDialogOpen(false);
            return;
          } else if (bookingErrorMsg.includes('not found') || bookingErrorMsg.includes('Trip not found')) {
            // Trip doesn't exist in Supabase - this is okay, continue with local deletion
            console.warn('[Trips] Trip not found in Supabase (may not be synced yet):', target.bookingId);
          } else {
            // Other error - show warning but continue with local deletion
            console.warn('[Trips] Error deleting from Supabase, will delete locally only:', bookingErrorMsg);
            toast({
              title: 'تحذير',
              description: 'فشل حذف الرحلة من قاعدة البيانات. سيتم حذفها محلياً فقط.',
              variant: 'destructive',
            });
          }
        }
      }
    } else {
      console.log('[Trips] Trip appears to be local-only, skipping Supabase delete. ID:', target.id, 'syncStatus:', target.syncStatus);
    }
    
    // Add to deleted array to prevent it from reappearing
    const newDeletedIds = [...deletedTripIds];
    if (!newDeletedIds.includes(target.id)) newDeletedIds.push(target.id);
    if (!newDeletedIds.includes(target.bookingId)) newDeletedIds.push(target.bookingId);
    setDeletedTripIds(newDeletedIds);
    
    // Always remove from local state and queue
    // Remove if either id OR bookingId matches (to catch duplicates)
    const updatedEntries = trips.filter((entry) => {
      const shouldRemove = entry.id === target.id || entry.bookingId === target.bookingId;
      if (shouldRemove) {
        console.log('[Trips] Filtering out trip:', entry.id, entry.bookingId, 'matches target:', target.id, target.bookingId);
      }
      return !shouldRemove;
    });
    const updatedQueue = TripService.removeFromQueue(target.id);
    const recycleRecord: TripRecycleRecord = {
      id: target.id,
      bookingId: target.bookingId,
      entry: target,
      deletedAt: new Date().toISOString(),
      purgeAt: addDays(new Date(), RECYCLE_RETENTION_DAYS).toISOString(),
      deletedBy: user?.id,
    };
    const updatedRecycle = [...recycleBin.filter((item) => item.id !== target.id && item.bookingId !== target.bookingId), recycleRecord];
    
    console.log('[Trips] Updating state - trips before:', trips.length, 'after:', updatedEntries.length);
    // Update state immediately
    setTrips(updatedEntries);
    setQueue(updatedQueue);
    setRecycleBin(updatedRecycle);
    // Update booking sequence immediately
    updateNextBookingSequence(updatedEntries, updatedQueue, drafts, updatedRecycle);
    // Persist to localStorage
    persistTripsSection(updatedEntries, updatedQueue.length, drafts, updatedRecycle);
    
    if (editingTripId === target.id) {
      resetForm();
    }
    
    toast({
      title: 'تم نقل الرحلة إلى سلة المحذوفات',
      description: `يمكنك استعادة الرحلة ${target.bookingId} خلال 30 يوماً.`,
      variant: 'destructive',
    });
    
    setPendingDeleteTrip(null);
    setDeleteDialogOpen(false);
    
    // Reset flag after a short delay to allow state to settle
    setTimeout(() => {
      isDeletingRef.current = false;
    }, 1000);
  };

  const handleRestoreTrip = (record: TripRecycleRecord) => {
    const updatedRecycle = recycleBin.filter((item) => item.id !== record.id);
    const updatedEntries = [...trips, record.entry];
    setTrips(updatedEntries);
    setRecycleBin(updatedRecycle);
    persistTripsSection(updatedEntries, queue.length, drafts, updatedRecycle);
    updateNextBookingSequence(updatedEntries, queue, drafts, updatedRecycle);
    toast({
      title: 'تمت استعادة الرحلة',
      description: `الرحلة ${record.bookingId} عادت إلى السجلات.`,
    });
  };

  const requestRecyclePurge = (record: TripRecycleRecord) => {
    setPendingRecycleRecord(record);
    setPurgeDialogOpen(true);
  };

  const confirmRecyclePurge = async () => {
    if (!pendingRecycleRecord) return;
    
    // Set flag to prevent useEffect from overwriting state
    isDeletingRef.current = true;
    
    // Delete from Supabase if trip was synced (it might have been restored and synced)
    // Check if trip exists in current trips list (meaning it was restored)
    const tripInList = trips.find(t => t.id === pendingRecycleRecord.id);
    if (tripInList && tripInList.syncStatus === 'synced') {
      try {
        await TripReportsService.delete(pendingRecycleRecord.id);
      } catch (error) {
        console.error('[Trips] Failed to permanently delete trip from Supabase:', error);
        toast({
          title: 'تحذير',
          description: 'تم حذف الرحلة محلياً، لكن فشل الحذف النهائي من قاعدة البيانات.',
          variant: 'destructive',
        });
      }
    }
    
    // Also try to delete by booking ID in case the trip was synced before being deleted
    try {
      await TripReportsService.deleteByBookingId(pendingRecycleRecord.bookingId);
    } catch (error) {
      // Ignore error if trip doesn't exist in Supabase (already deleted or never synced)
      console.warn('[Trips] Trip not found in Supabase for permanent delete:', error);
    }
    
    // Add to deleted array to prevent it from reappearing
    const newDeletedIds = [...deletedTripIds];
    if (!newDeletedIds.includes(pendingRecycleRecord.id)) newDeletedIds.push(pendingRecycleRecord.id);
    if (!newDeletedIds.includes(pendingRecycleRecord.bookingId)) newDeletedIds.push(pendingRecycleRecord.bookingId);
    setDeletedTripIds(newDeletedIds);
    
    // Remove from trips list if it exists there (in case it was restored)
    // Filter by both id and bookingId to catch duplicates
    const updatedTrips = trips.filter((trip) => 
      trip.id !== pendingRecycleRecord.id && trip.bookingId !== pendingRecycleRecord.bookingId
    );
    const updatedRecycle = recycleBin.filter((item) => 
      item.id !== pendingRecycleRecord.id && item.bookingId !== pendingRecycleRecord.bookingId
    );
    setTrips(updatedTrips);
    setRecycleBin(updatedRecycle);
    // Update booking sequence immediately
    updateNextBookingSequence(updatedTrips, queue, drafts, updatedRecycle);
    // Persist to localStorage
    persistTripsSection(updatedTrips, queue.length, drafts, updatedRecycle);
    toast({
      title: 'تم حذف الرحلة نهائياً',
      description: `لن تظهر الرحلة ${pendingRecycleRecord.bookingId} في السجلات بعد الآن.`,
      variant: 'destructive',
    });
    setPendingRecycleRecord(null);
    setPurgeDialogOpen(false);
    
    // Reset flag after a short delay
    setTimeout(() => {
      isDeletingRef.current = false;
    }, 1000);
  };

  const handleEditTrip = (trip: TripEntry) => {
    setEditingDraftId(null);
    setEditingTripId(trip.id);
    setForm({
      sourceRef: trip.sourceRef,
      bookingSource: trip.bookingSource,
      supplier: trip.supplier,
      clientName: trip.clientName,
      driverName: trip.driverName,
      carType: trip.carType,
      parkingLocation: trip.parkingLocation,
      pickupPoint: trip.pickupPoint,
      dropoffPoint: trip.dropoffPoint,
      supervisorName: trip.supervisorName,
      supervisorRating: trip.supervisorRating,
      supervisorNotes: trip.supervisorNotes || '',
      passengerFeedback: trip.passengerFeedback || '',
    });
    setChecklist(trip.checklist);
    setPersistedAttachments(trip.attachments || []);
    const queueRecord =
      queue.find((record) => record.id === trip.id) || TripService.loadQueue().find((record) => record.id === trip.id);
    setEditingQueueAttachments(queueRecord?.attachments || []);
    setCanReuseExistingEvidence(Boolean(queueRecord));
    setSelectedPhotos([]);
    toast({
      title: 'وضع تعديل الرحلة',
      description: `يمكنك الآن تحديث بيانات الرحلة ${trip.bookingId}.`,
    });
  };

  const handleCancelEdit = () => {
    resetForm();
    toast({
      title: 'تم إلغاء التعديل',
      description: 'تمت إعادة النموذج لوضع الإدخال الجديد.',
    });
  };

  const handleRemovePersistedAttachment = (id: string) => {
    setPersistedAttachments((prev) => prev.filter((attachment) => attachment.id !== id));
    setEditingQueueAttachments((prev) => prev.filter((attachment) => attachment.id !== id));
  };

  const handlePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files) return;

    const existingCount = editingTripId ? persistedAttachments.length : 0;
    const remainingSlots = MAX_PHOTOS - existingCount - selectedPhotos.length;
    if (remainingSlots <= 0) {
      toast({
        title: 'تنبيه',
        description: ARABIC_TRIPS_MESSAGES.PHOTO_LIMIT_REACHED,
        variant: 'destructive',
      });
      return;
    }

    const slice = Array.from(files).slice(0, remainingSlots);

    const conversions = await Promise.all(
      slice.map(
        (file) =>
          new Promise<SelectedPhoto>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve({
                id: createId(),
                name: file.name,
                mimeType: file.type || 'image/jpeg',
                size: file.size,
                base64: reader.result as string,
                previewUrl: URL.createObjectURL(file),
              });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
      )
    );

    setSelectedPhotos((prev) => [...prev, ...conversions]);
    event.target.value = '';
  };

  const removePhoto = (id: string) => {
    setSelectedPhotos((prev) => {
      prev
        .filter((photo) => photo.id === id)
        .forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
      return prev.filter((photo) => photo.id !== id);
    });
  };

  const exitEditMode = () => {
    setEditingTripId(null);
    setPersistedAttachments([]);
    setEditingQueueAttachments([]);
    setCanReuseExistingEvidence(false);
    setEditingDraftId(null);
  };

  const resetForm = () => {
    setForm(buildFormState(userName || undefined));
    setChecklist(TRIP_CHECKLIST_DEFAULTS);
    selectedPhotos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    setSelectedPhotos([]);
    exitEditMode();
  };

  const attachmentsAvailable =
    selectedPhotos.length > 0 ||
    (!!editingTripId && canReuseExistingEvidence && persistedAttachments.length > 0);

  const formIsValid =
    form.bookingSource &&
    form.supplier &&
    form.clientName &&
    form.driverName &&
    form.carType &&
    form.parkingLocation &&
    form.pickupPoint &&
    form.dropoffPoint &&
    (editingTripId ? attachmentsAvailable : selectedPhotos.length > 0);

  const handleSubmit = async () => {
    if (!formIsValid) {
      toast({
        title: 'خطأ في الإدخال',
        description: ARABIC_TRIPS_MESSAGES.REQUIRED_FIELDS_ERROR,
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    const isEditing = Boolean(editingTrip);
    const isEditingDraft = Boolean(editingDraft);
    const entryId = editingTrip?.id ?? editingDraft?.id ?? createId();
    const createdAt = editingTrip?.createdAt ?? editingDraft?.savedAt ?? new Date().toISOString();
    const status = previewStatus;
    const entryDate = editingTrip?.date ?? editingDraft?.date ?? currentDateStr;
    const entryHijriLabel =
      editingTrip?.hijriDateLabel ?? editingDraft?.hijriDateLabel ?? hijriDateLabel;
    const entryGregorianLabel =
      editingTrip?.gregorianDateLabel ?? editingDraft?.gregorianDateLabel ?? gregorianDateLabel;

    const newPhotoMeta = selectedPhotos.map((photo) => ({
      id: photo.id,
      name: photo.name,
      mimeType: photo.mimeType,
      size: photo.size,
      previewUrl: photo.previewUrl,
    }));

    const entryAttachments: TripAttachment[] = [
      ...(isEditing ? persistedAttachments : []),
      ...newPhotoMeta,
    ];

    const preservedAttachmentIds = new Set(
      (isEditing ? persistedAttachments : []).map((attachment) => attachment.id)
    );

    const preservedQueuePayloads: TripPhotoAttachment[] =
      isEditing && canReuseExistingEvidence
        ? editingQueueAttachments.filter((attachment) =>
            preservedAttachmentIds.has(attachment.id)
          )
        : [];

    const newPhotoPayloads: TripPhotoAttachment[] = selectedPhotos.map((photo) => ({
      id: photo.id,
      name: photo.name,
      mimeType: photo.mimeType,
      size: photo.size,
      base64: photo.base64,
    }));

    const attachmentsPayload: TripPhotoAttachment[] = [
      ...preservedQueuePayloads,
      ...newPhotoPayloads,
    ];

    const updatedEntry: TripEntry = {
      ...(editingTrip || ({} as TripEntry)),
      id: entryId,
      bookingId,
      date: entryDate,
      hijriDateLabel: entryHijriLabel,
      gregorianDateLabel: entryGregorianLabel,
      sourceRef: form.sourceRef,
      bookingSource: form.bookingSource,
      supplier: form.supplier,
      clientName: form.clientName,
      driverName: form.driverName,
      carType: form.carType,
      parkingLocation: form.parkingLocation,
      pickupPoint: form.pickupPoint,
      dropoffPoint: form.dropoffPoint,
      supervisorName: form.supervisorName,
      supervisorRating: form.supervisorRating,
      supervisorNotes: form.supervisorNotes,
      passengerFeedback: form.passengerFeedback,
      status,
      checklist,
      attachments: entryAttachments,
      createdAt,
      createdBy: editingTrip?.createdBy || user?.id,
      syncStatus: 'pending',
    };

    const tripPayload: TripReportInput = {
      id: updatedEntry.id,
      bookingId: updatedEntry.bookingId,
      date: updatedEntry.date,
      sourceRef: updatedEntry.sourceRef,
      bookingSource: updatedEntry.bookingSource,
      supplier: updatedEntry.supplier,
      clientName: updatedEntry.clientName,
      driverName: updatedEntry.driverName,
      carType: updatedEntry.carType,
      parkingLocation: updatedEntry.parkingLocation,
      pickupPoint: updatedEntry.pickupPoint,
      dropoffPoint: updatedEntry.dropoffPoint,
      supervisorName: updatedEntry.supervisorName,
      supervisorRating: updatedEntry.supervisorRating,
      supervisorNotes: updatedEntry.supervisorNotes,
      passengerFeedback: updatedEntry.passengerFeedback,
      checklist,
      status,
      createdBy: user?.id,
      syncSource: navigator.onLine ? 'web' : 'offline-cache',
      offline: !navigator.onLine,
    };

    let updatedEntries = isEditing
      ? trips.map((entry) => (entry.id === entryId ? updatedEntry : entry))
      : [...trips, updatedEntry];
    const activeDrafts = isEditingDraft
      ? drafts.filter((draft) => draft.id !== editingDraftId)
      : drafts;
    if (isEditingDraft) {
      setDrafts(activeDrafts);
      setEditingDraftId(null);
    }
    setTrips(updatedEntries);
    // Update booking sequence immediately (before async operations)
    updateNextBookingSequence(updatedEntries, queue, activeDrafts, recycleBin);
    // Persist to localStorage
    persistTripsSection(updatedEntries, queue.length, activeDrafts, recycleBin);

    const offlineRecord: OfflineTripRecord = {
      id: updatedEntry.id,
      payload: tripPayload,
      attachments: attachmentsPayload,
      createdAt,
      status: 'pending',
    };

    const commitQueueState = (records: OfflineTripRecord[]) => {
      setQueue(records);
      persistTripsSection(updatedEntries, records.length, activeDrafts, recycleBin);
      updateNextBookingSequence(updatedEntries, records, activeDrafts, recycleBin);
    };

    if (!navigator.onLine) {
      const records = TripService.upsertRecord(offlineRecord);
      commitQueueState(records);
      toast({
        title: 'تم الحفظ بدون اتصال',
        description: ARABIC_TRIPS_MESSAGES.FORM_SUCCESS_OFFLINE,
      });
      resetForm();
      setSubmitting(false);
      return;
    }

    try {
      const response = await TripService.syncRecord(offlineRecord);
      updatedEntry.syncStatus = 'synced';
      
      // Update trip ID if Supabase returned a different one
      if (response.tripId && response.tripId !== updatedEntry.id) {
        console.log('[Trips] Updating trip ID from', updatedEntry.id, 'to', response.tripId);
        updatedEntry.id = response.tripId;
      }
      
      if (response.photos?.length) {
        updatedEntry.attachments = updatedEntry.attachments.map((attachment) => {
          const remote = response.photos?.find(
            (photo) =>
              photo.file_name === attachment.name ||
              photo.trip_id === response.tripId ||
              photo.trip_id === updatedEntry.id
          );
          return remote
            ? { ...attachment, storagePath: remote.storage_path }
            : attachment;
        });
      }

      updatedEntries = updatedEntries.map((entry) =>
        entry.id === updatedEntry.id ? updatedEntry : entry
      );
      setTrips(updatedEntries);
      const cleanedQueue = TripService.removeFromQueue(updatedEntry.id);
      commitQueueState(cleanedQueue);

      toast({
        title: 'تم الإرسال',
        description: ARABIC_TRIPS_MESSAGES.FORM_SUCCESS_ONLINE,
      });

      addNotification({
        type: 'success',
        title: isEditing ? 'تم تحديث رحلة' : 'رحلة جديدة مسجلة',
        message: `تم اعتماد رحلة رقم ${updatedEntry.bookingId} بنجاح.`,
      });
      
      // Reload trips from Supabase to ensure we have the latest data
      // Use a small delay to allow Supabase to process the insert
      setTimeout(() => {
        console.log('[Trips] Reloading trips after successful submission');
        loadRemoteTrips(true);
      }, 500);
    } catch (error) {
      const failedQueue = TripService.upsertRecord({
        ...offlineRecord,
        status: 'failed',
        error: error instanceof Error ? error.message : 'unknown_error',
      });
      commitQueueState(failedQueue);

      updatedEntries = updatedEntries.map((entry) =>
        entry.id === updatedEntry.id ? { ...entry, syncStatus: 'failed' } : entry
      );
      setTrips(updatedEntries);

      toast({
        title: 'تعذر الإرسال',
        description:
          error instanceof Error ? error.message : ARABIC_TRIPS_MESSAGES.FORM_ERROR_GENERIC,
        variant: 'destructive',
      });
    } finally {
      resetForm();
      setSubmitting(false);
    }
  };

  const handleSyncQueue = async () => {
    if (!navigator.onLine) {
      toast({
        title: 'لا يوجد اتصال',
        description: 'قم بالاتصال بالإنترنت لمزامنة التقارير المعلقة.',
        variant: 'destructive',
      });
      return;
    }

    setIsSyncing(true);
    const result = await TripService.syncQueue((record, status, error) => {
      setTrips((prev) =>
        prev.map((entry) =>
          entry.id === record.id ? { ...entry, syncStatus: status } : entry
        )
      );
      if (status === 'failed' && error) {
        toast({
          title: 'تعذر مزامنة تقرير',
          description: error,
          variant: 'destructive',
        });
      }
    });
    const records = TripService.loadQueue();
    setQueue(records);
    const syncedEntries: TripEntry[] = trips.map((entry) =>
      records.some((record) => record.id === entry.id)
        ? entry
        : { ...entry, syncStatus: 'synced' as TripSyncStatus }
    );
    setTrips(syncedEntries);
    persistTripsSection(syncedEntries, records.length, drafts, recycleBin);
    updateNextBookingSequence(syncedEntries, records, drafts, recycleBin);

    if (result.failed === 0) {
      toast({
        title: 'تمت المزامنة',
        description: ARABIC_TRIPS_MESSAGES.SYNC_QUEUE_SUCCESS,
      });
    } else {
      toast({
        title: 'مزامنة جزئية',
        description: ARABIC_TRIPS_MESSAGES.SYNC_QUEUE_PARTIAL(
          result.success,
          result.failed
        ),
      });
    }
    setIsSyncing(false);
  };

  useEffect(() => {
    const handleOnline = () => {
      if (TripService.loadQueue().length > 0) {
        handleSyncQueue();
      }
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusBadge = (status: TripEntry['syncStatus']) => {
    switch (status) {
      case 'synced':
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            <CheckCircle2 className="w-4 h-4 ml-1" />
            متزامن
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-700">
            <AlertTriangle className="w-4 h-4 ml-1" />
            فشل
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
            <CloudOff className="w-4 h-4 ml-1" />
            {ARABIC_TRIPS_MESSAGES.STATUS_PENDING}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-primary">
          {ARABIC_TRIPS_MESSAGES.PAGE_TITLE}
        </h1>
        <p className="text-muted-foreground">
          {ARABIC_TRIPS_MESSAGES.PAGE_DESCRIPTION}
        </p>
        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
          <span>التاريخ الميلادي: {gregorianDateLabel}</span>
          <span>التاريخ الهجري: {hijriDateLabel}</span>
        </div>
      </div>

      {editingTrip && (
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
          <div>
            <p className="font-semibold text-amber-900">
              يتم الآن تعديل الرحلة رقم {editingTrip.bookingId}
            </p>
            <p className="text-sm text-amber-800 mt-1">
              يمكن تحديث البيانات وإعادة إرسالها. {canReuseExistingEvidence
                ? 'سيتم إعادة استخدام الصور المرفوعة مسبقاً.'
                : 'هذه الرحلة متزامنة مسبقاً، يجب إضافة صورة جديدة لتوثيق التعديل.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-amber-300 text-amber-900 bg-white">
              وضع تعديل الرحلات
            </Badge>
            <Button variant="secondary" onClick={handleCancelEdit} size="sm">
              <X className="w-4 h-4 ml-2" />
              إلغاء التعديل
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {ARABIC_TRIPS_MESSAGES.STAT_TOTAL_TRIPS}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{trips.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {ARABIC_TRIPS_MESSAGES.STAT_PENDING_TRIPS}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-3xl font-bold">{queue.length}</div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSyncQueue}
              disabled={queue.length === 0 || isSyncing}
            >
              {isSyncing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 ml-2" />
              )}
              {ARABIC_TRIPS_MESSAGES.SYNC_QUEUE_BUTTON}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{ARABIC_TRIPS_MESSAGES.DETAILS_SECTION_TITLE}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>{ARABIC_TRIPS_MESSAGES.BOOKING_ID_LABEL}</Label>
              <Input
                value={bookingId}
                readOnly
                className="mt-2 text-base font-semibold tracking-[0.2em]"
              />
            </div>
            <div>
              <Label>{ARABIC_TRIPS_MESSAGES.SOURCE_REF_LABEL}</Label>
              <Input
                className="mt-2"
                value={form.sourceRef}
                onChange={(e) => handleInputChange('sourceRef', e.target.value)}
                placeholder="مثال: 2499301"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{ARABIC_TRIPS_MESSAGES.BOOKING_SOURCE_LABEL}</Label>
              <Select
                value={form.bookingSource}
                onValueChange={(value) => handleInputChange('bookingSource', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المصدر" />
                </SelectTrigger>
                <SelectContent>
                  {bookingSources.map((source) => (
                    <SelectItem key={source} value={source}>
                      {source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{ARABIC_TRIPS_MESSAGES.SUPPLIER_LABEL}</Label>
              <Select
                value={form.supplier}
                onValueChange={(value) => handleInputChange('supplier', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المورد" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier} value={supplier}>
                      {supplier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>{ARABIC_TRIPS_MESSAGES.CLIENT_NAME_LABEL}</Label>
              <Input
                className="mt-2"
                value={form.clientName}
                onChange={(e) => handleInputChange('clientName', e.target.value)}
              />
            </div>
            <div>
              <Label>{ARABIC_TRIPS_MESSAGES.DRIVER_NAME_LABEL}</Label>
              <Input
                className="mt-2"
                value={form.driverName}
                onChange={(e) => handleInputChange('driverName', e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>{ARABIC_TRIPS_MESSAGES.CAR_TYPE_LABEL}</Label>
              <Input
                className="mt-2"
                value={form.carType}
                onChange={(e) => handleInputChange('carType', e.target.value)}
                placeholder="مثال: جمس يوكن 2024"
              />
            </div>
            <div>
              <Label>{ARABIC_TRIPS_MESSAGES.PARKING_LOCATION_LABEL}</Label>
              <Input
                className="mt-2"
                value={form.parkingLocation}
                onChange={(e) =>
                  handleInputChange('parkingLocation', e.target.value)
                }
                placeholder="مثال: V12 - الدور الأول"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>{ARABIC_TRIPS_MESSAGES.PICKUP_POINT_LABEL}</Label>
              <Input
                className="mt-2"
                value={form.pickupPoint}
                onChange={(e) => handleInputChange('pickupPoint', e.target.value)}
                placeholder="مثال: صالة 1 - بوابة 4"
              />
            </div>
            <div>
              <Label>{ARABIC_TRIPS_MESSAGES.DROPOFF_POINT_LABEL}</Label>
              <Input
                className="mt-2"
                value={form.dropoffPoint}
                onChange={(e) =>
                  handleInputChange('dropoffPoint', e.target.value)
                }
                placeholder="مثال: فندق ساعة مكة"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{ARABIC_TRIPS_MESSAGES.CHECKLIST_SECTION_TITLE}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {ARABIC_TRIPS_MESSAGES.CHECKLIST_HINT}
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {ARABIC_TRIPS_MESSAGES.CHECKLIST_ITEMS.map((item) => {
            const important = IMPORTANT_CHECKLIST_KEYS.has(item.key);
            const selectedRating = checklist[item.key];
            return (
              <div
                key={item.key}
                className={cn(
                  'flex flex-col gap-3 rounded-xl border p-4 transition-colors',
                  important
                    ? 'bg-amber-50 border-amber-300'
                    : 'bg-muted/40 border-border'
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="pr-3">
                    <p className="font-semibold flex items-center gap-2">
                      {item.title}
                      {important && (
                        <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                          مهم
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {checklistRatingOptions.map((rating) => (
                    <Button
                      key={rating.value}
                      type="button"
                      variant="outline"
                      className={cn(
                        'min-w-[120px] border text-sm transition-all shadow-sm',
                        selectedRating === rating.value
                          ? rating.selectedClassName
                          : rating.className
                      )}
                      onClick={() =>
                        handleChecklistRatingChange(item.key, rating.value)
                      }
                    >
                      {rating.label}
                    </Button>
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{ARABIC_TRIPS_MESSAGES.PHOTOS_SECTION_TITLE}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {ARABIC_TRIPS_MESSAGES.PHOTOS_SECTION_HINT}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <label
            htmlFor="trip-photos"
            className="flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer bg-muted/40 hover:bg-muted transition-colors"
          >
            <input
              id="trip-photos"
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
            <Camera className="w-10 h-10 text-muted-foreground mb-3" />
            <span className="font-bold text-primary">
              اضغط هنا لرفع الصور (بحد أقصى {MAX_PHOTOS})
            </span>
            <span className="text-xs text-muted-foreground mt-1">
              يدعم JPG و PNG - يفضل دقة عالية
            </span>
          </label>

          {editingTrip && persistedAttachments.length > 0 && (
            <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50/40 p-4 space-y-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <p className="font-semibold text-sm text-amber-900">
                  الصور الحالية المرتبطة بالرحلة
                </p>
                {!canReuseExistingEvidence && (
                  <Badge variant="outline" className="border-amber-300 text-amber-900 bg-white">
                    يلزم إضافة صورة جديدة لإعادة التوثيق
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {persistedAttachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center gap-2 rounded-full border border-amber-200 bg-white/80 px-3 py-1 text-xs text-amber-900"
                  >
                    <span className="font-medium">{attachment.name}</span>
                    {canReuseExistingEvidence && (
                      <button
                        type="button"
                        className="text-amber-700 hover:text-amber-900"
                        onClick={() => handleRemovePersistedAttachment(attachment.id)}
                        title="إزالة الصورة من التعديل"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedPhotos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {selectedPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative rounded-xl overflow-hidden border bg-background shadow-sm"
                >
                  <img
                    src={photo.previewUrl}
                    alt={photo.name}
                    className="h-32 w-full object-cover"
                  />
                  <div className="absolute top-2 left-2 flex gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="bg-black/50 text-white hover:bg-black/70"
                      onClick={() => removePhoto(photo.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="p-2 text-xs text-right">
                    <p className="font-semibold truncate">{photo.name}</p>
                    <p className="text-muted-foreground">
                      {(photo.size / 1024).toFixed(1)} كيلوبايت
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{ARABIC_TRIPS_MESSAGES.EVALUATION_SECTION_TITLE}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>{ARABIC_TRIPS_MESSAGES.SUPERVISOR_NAME_LABEL}</Label>
              <Input
                className="mt-2"
                value={form.supervisorName}
                onChange={(e) =>
                  handleInputChange('supervisorName', e.target.value)
                }
              />
            </div>
            <div>
              <Label>{ARABIC_TRIPS_MESSAGES.SUPERVISOR_RATING_LABEL}</Label>
              <Select
                value={String(form.supervisorRating)}
                onValueChange={(value) =>
                  handleInputChange('supervisorRating', Number(value))
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="اختر التقييم" />
                </SelectTrigger>
                <SelectContent>
                  {ratingOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={String(option.value)}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>{ARABIC_TRIPS_MESSAGES.SUPERVISOR_NOTES_LABEL}</Label>
            <Textarea
              className="mt-2"
              rows={3}
              value={form.supervisorNotes}
              onChange={(e) => handleInputChange('supervisorNotes', e.target.value)}
            />
          </div>
          <div>
            <Label>{ARABIC_TRIPS_MESSAGES.PASSENGER_FEEDBACK_LABEL}</Label>
            <Textarea
              className="mt-2"
              rows={2}
              value={form.passengerFeedback}
              onChange={(e) =>
                handleInputChange('passengerFeedback', e.target.value)
              }
            />
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 rounded-xl border py-3 px-4 bg-muted/40">
              {previewStatus === 'approved' ? (
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              ) : (
                <AlertCircle className="w-6 h-6 text-amber-600" />
              )}
              <div>
                <p className="text-sm text-muted-foreground">حالة الرحلة</p>
                <p className="font-semibold">
                  {previewStatus === 'approved'
                    ? ARABIC_TRIPS_MESSAGES.STATUS_APPROVED
                    : ARABIC_TRIPS_MESSAGES.STATUS_WARNING}
                </p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleSaveDraft}
                disabled={submitting}
              >
                <Archive className="w-4 h-4 ml-2" />
                حفظ في الأرشيف
              </Button>
              <Button className="flex-1 md:flex-none" onClick={handleSubmit} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 ml-2" />
                    {ARABIC_TRIPS_MESSAGES.SUBMIT_BUTTON}
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{ARABIC_TRIPS_MESSAGES.OFFLINE_QUEUE_TITLE}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {queue.length
                  ? `${queue.length} تقرير بانتظار الاتصال`
                  : ARABIC_TRIPS_MESSAGES.OFFLINE_QUEUE_EMPTY}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSyncQueue}
              disabled={!queue.length || isSyncing}
            >
              {isSyncing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 ml-2" />
              )}
              مزامنة
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {queue.length === 0 ? (
              <div className="text-center text-muted-foreground py-6">
                <CloudOff className="w-8 h-8 mx-auto mb-2 opacity-60" />
                {ARABIC_TRIPS_MESSAGES.OFFLINE_QUEUE_EMPTY}
              </div>
            ) : (
              queue.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border p-3 bg-muted/30 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{item.payload.bookingId}</span>
                    {item.status === 'failed' ? (
                      <Badge variant="destructive">فشل</Badge>
                    ) : (
                      <Badge>{ARABIC_TRIPS_MESSAGES.STATUS_PENDING}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {item.payload.clientName} • {formatDateTime(item.createdAt)}
                  </p>
                  {item.error && (
                    <p className="text-xs text-destructive">{item.error}</p>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{ARABIC_TRIPS_MESSAGES.TRIPS_LIST_TITLE}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {currentDate.toLocaleDateString('ar-SA')}
            </p>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
            {trips.length === 0 ? (
              <div className="text-center text-muted-foreground py-10">
                <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-60" />
                {ARABIC_TRIPS_MESSAGES.NO_TRIPS_TEXT}
              </div>
            ) : (
              trips
                .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                .map((trip) => (
                  <div
                    key={trip.id}
                    className="border rounded-xl p-4 space-y-2 bg-muted/30"
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="font-semibold">{trip.bookingId}</p>
                        <p className="text-sm text-muted-foreground">
                          {trip.clientName} • {trip.driverName}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {statusBadge(trip.syncStatus)}
                        <Button
                          variant="ghost"
                          size="icon"
                          title="تعديل الرحلة"
                          onClick={() => handleEditTrip(trip)}
                        >
                          <PencilLine className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="حذف الرحلة"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('[Trips] ========== DELETE BUTTON CLICKED ==========');
                            console.log('[Trips] Delete button clicked for trip:', {
                              id: trip.id,
                              bookingId: trip.bookingId,
                              syncStatus: trip.syncStatus,
                              fullTrip: trip
                            });
                            try {
                              triggerDeleteTrip(trip);
                              console.log('[Trips] triggerDeleteTrip called successfully');
                            } catch (err) {
                              console.error('[Trips] Error calling triggerDeleteTrip:', err);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline">{trip.bookingSource}</Badge>
                      <Badge variant="outline">{trip.supplier}</Badge>
                      <Badge
                        variant={trip.status === 'approved' ? 'default' : 'destructive'}
                      >
                        {trip.status === 'approved'
                          ? ARABIC_TRIPS_MESSAGES.STATUS_APPROVED
                          : ARABIC_TRIPS_MESSAGES.STATUS_WARNING}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {trip.pickupPoint} → {trip.dropoffPoint}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      الميلادي:{' '}
                      {trip.gregorianDateLabel || formatGregorianDateLabel(trip.date)} • الهجري:{' '}
                      {trip.hijriDateLabel || formatHijriDateLabel(trip.date)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(trip.createdAt)}
                    </p>
                  </div>
                ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>أرشيف الرحلات (مسودات)</CardTitle>
            <p className="text-sm text-muted-foreground">
              احفظ الرحلات التي تحتاج إلى معلومات إضافية ثم عد لاستكمالها لاحقاً.
            </p>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[360px] overflow-y-auto pr-2">
            {drafts.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Archive className="w-8 h-8 mx-auto mb-2 opacity-60" />
                لا توجد رحلات مؤرشفة حالياً
              </div>
            ) : (
              drafts
                .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
                .map((draft) => (
                  <div
                    key={draft.id}
                    className="rounded-xl border p-3 bg-muted/40 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{draft.bookingId}</p>
                        <p className="text-xs text-muted-foreground">
                          آخر تحديث: {formatDateTime(draft.updatedAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleResumeDraft(draft)}
                        >
                          <RotateCcw className="w-4 h-4 ml-2" />
                          استئناف
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveDraft(draft.id)}
                          title="حذف من الأرشيف"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    {draft.missingFields.length ? (
                      <div className="text-xs text-amber-700">
                        ينقصه: {draft.missingFields.join('، ')}
                      </div>
                    ) : (
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                        مكتمل وجاهز للإرسال
                      </Badge>
                    )}
                  </div>
                ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>سلة المحذوفات (30 يوماً)</CardTitle>
            <p className="text-sm text-muted-foreground">
              يتم الاحتفاظ بالرحلات المحذوفة لمدة 30 يوماً لإمكانية استعادتها.
            </p>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[360px] overflow-y-auto pr-2">
            {recycleBin.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Undo2 className="w-8 h-8 mx-auto mb-2 opacity-60" />
                لا توجد عناصر في سلة المحذوفات
              </div>
            ) : (
              recycleBin
                .sort((a, b) => b.deletedAt.localeCompare(a.deletedAt))
                .map((record) => {
                  const daysLeft = Math.max(
                    0,
                    differenceInCalendarDays(new Date(record.purgeAt), new Date())
                  );
                  return (
                    <div
                      key={record.id}
                      className="rounded-xl border p-3 bg-destructive/5 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold">{record.bookingId}</p>
                          <p className="text-xs text-muted-foreground">
                            حذف في {formatDateTime(record.deletedAt)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            سيتم الحذف النهائي خلال {daysLeft} يوم
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleRestoreTrip(record)}
                          >
                            <CheckCircle2 className="w-4 h-4 ml-2 text-green-600" />
                            استعادة
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => requestRecyclePurge(record)}
                            title="حذف نهائي"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        العميل: {record.entry.clientName} • السائق: {record.entry.driverName}
                      </p>
                    </div>
                  );
                })
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) {
            setPendingDeleteTrip(null);
          }
        }}
        title="تأكيد الحذف"
        description={
          pendingDeleteTrip
            ? `سيتم نقل الرحلة ${pendingDeleteTrip.bookingId} إلى سلة المحذوفات لمدة 30 يوماً مع إمكانية الاستعادة.`
            : 'سيتم نقل الرحلة إلى سلة المحذوفات لمدة 30 يوماً.'
        }
        onConfirm={async () => {
          console.log('[Trips] ========== CONFIRMATION DIALOG CONFIRMED ==========');
          console.log('[Trips] onConfirm triggered at:', new Date().toISOString());
          console.log('[Trips] pendingDeleteTrip at confirm time:', pendingDeleteTrip);
          console.log('[Trips] deleteDialogOpen at confirm time:', deleteDialogOpen);
          
          // Store pendingDeleteTrip in a local variable to avoid stale closure
          const tripToDelete = pendingDeleteTrip;
          if (!tripToDelete) {
            console.error('[Trips] ❌ CRITICAL: pendingDeleteTrip is null in onConfirm!');
            toast({
              title: 'خطأ',
              description: 'لم يتم العثور على الرحلة المراد حذفها.',
              variant: 'destructive',
            });
            setDeleteDialogOpen(false);
            return;
          }
          
          try {
            console.log('[Trips] Calling confirmDeleteTrip with trip:', tripToDelete.id, tripToDelete.bookingId);
            await confirmDeleteTrip(tripToDelete);
            console.log('[Trips] ✅ confirmDeleteTrip completed successfully');
          } catch (error) {
            console.error('[Trips] ❌ Error in confirmDeleteTrip:', error);
            toast({
              title: 'خطأ',
              description: 'حدث خطأ أثناء حذف الرحلة. يرجى المحاولة مرة أخرى.',
              variant: 'destructive',
            });
          }
        }}
        cancelText="إلغاء"
        confirmText="نقل إلى السلة"
        variant="warning"
      />

      <ConfirmationDialog
        open={purgeDialogOpen}
        onOpenChange={(open) => {
          setPurgeDialogOpen(open);
          if (!open) {
            setPendingRecycleRecord(null);
          }
        }}
        title="حذف نهائي"
        description={
          pendingRecycleRecord
            ? `لن تتمكن من استعادة الرحلة ${pendingRecycleRecord.bookingId} بعد هذا الإجراء.`
            : 'لن تتمكن من استعادة هذه الرحلة بعد الحذف النهائي.'
        }
        onConfirm={confirmRecyclePurge}
        cancelText="إلغاء"
        confirmText="حذف نهائي"
        variant="destructive"
      />
    </div>
  );
};

export default Trips;

