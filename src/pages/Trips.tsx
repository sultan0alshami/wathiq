import React, { useEffect, useMemo, useState } from 'react';
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
} from '@/lib/mockData';
import {
  TripService,
  TripPhotoAttachment,
  OfflineTripRecord,
  TripReportInput,
} from '@/services/TripService';
import { ARABIC_TRIPS_MESSAGES, ChecklistKey } from '@/lib/arabicTripsMessages';
import { cn } from '@/lib/utils';
import {
  AlertCircle,
  AlertTriangle,
  Camera,
  CheckCircle2,
  CloudOff,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  Trash2,
  Upload,
} from 'lucide-react';
import { format } from 'date-fns';

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
  queueRecords: OfflineTripRecord[]
) => {
  const sequences = [
    ...entries.map((entry) => parseSequenceFromBookingId(entry.bookingId)),
    ...queueRecords.map((record) =>
      parseSequenceFromBookingId(record.payload.bookingId)
    ),
  ];
  const maxSeq = sequences.length ? Math.max(...sequences) : 0;
  return maxSeq + 1;
};

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('ar-SA', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));

const checklistDefaults: TripChecklist = {
  externalClean: 'good',
  internalClean: 'good',
  carSmell: 'good',
  driverAppearance: 'good',
  acStatus: 'good',
  engineStatus: 'good',
};

const bookingSources = ['تطبيق المطار', 'نسك', 'تطبيق واثق (مباشر)', 'B2B'];
const suppliers = ['ديار مكة', 'المنهاج', 'أسطول واثق', 'أخرى'];

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
}> = [
  { value: 'bad', label: 'سيء', className: 'bg-red-50 text-red-700 border-red-200' },
  { value: 'normal', label: 'عادي', className: 'bg-gray-50 text-gray-700 border-gray-200' },
  { value: 'good', label: 'جيد', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
];

const MAX_PHOTOS = 6;

export const Trips: React.FC = () => {
  const { currentDate } = useDateContext();
  const { user, userName } = useAuth();
  const { addNotification } = useNotifications();
  const { toast } = useToast();

  const [bookingSequence, setBookingSequence] = useState(1);
  const [form, setForm] = useState({
    sourceRef: '',
    bookingSource: '',
    supplier: '',
    clientName: '',
    driverName: '',
    carType: '',
    parkingLocation: '',
    pickupPoint: '',
    dropoffPoint: '',
    supervisorName: userName || 'هاني بخش',
    supervisorRating: 5,
    supervisorNotes: '',
    passengerFeedback: '',
  });
  const [checklist, setChecklist] = useState<TripChecklist>(checklistDefaults);
  const [selectedPhotos, setSelectedPhotos] = useState<SelectedPhoto[]>([]);
  const [trips, setTrips] = useState<TripEntry[]>([]);
  const [queue, setQueue] = useState<OfflineTripRecord[]>(TripService.loadQueue());
  const [submitting, setSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const bookingId = useMemo(
    () => buildBookingId(currentDate, bookingSequence),
    [currentDate, bookingSequence]
  );

  const currentDateStr = useMemo(
    () => currentDate.toISOString().split('T')[0],
    [currentDate]
  );

  const updateNextBookingSequence = (
    entriesSnapshot: TripEntry[],
    queueSnapshot: OfflineTripRecord[]
  ) => {
    setBookingSequence(computeNextSequence(entriesSnapshot, queueSnapshot));
  };

  useEffect(() => {
    const data = getDataForDate(currentDate);
    const entries = data.trips.entries || [];
    const storedQueue = TripService.loadQueue();
    setTrips(entries);
    setQueue(storedQueue);
    updateNextBookingSequence(entries, storedQueue);
  }, [currentDate]);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      supervisorName: userName || prev.supervisorName,
    }));
  }, [userName]);

  const persistTripsSection = (entries: TripEntry[], pending = queue.length) => {
    updateSectionData(currentDate, 'trips', {
      totalTrips: entries.length,
      entries,
      pendingSync: pending,
    });
  };

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

  const handlePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files) return;

    const remainingSlots = MAX_PHOTOS - selectedPhotos.length;
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

  const resetForm = () => {
    setForm((prev) => ({
      ...prev,
      sourceRef: '',
      bookingSource: '',
      supplier: '',
      clientName: '',
      driverName: '',
      carType: '',
      parkingLocation: '',
      pickupPoint: '',
      dropoffPoint: '',
      supervisorNotes: '',
      passengerFeedback: '',
    }));
    setChecklist(checklistDefaults);
    selectedPhotos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    setSelectedPhotos([]);
  };

  const formIsValid =
    form.bookingSource &&
    form.supplier &&
    form.clientName &&
    form.driverName &&
    form.carType &&
    form.parkingLocation &&
    form.pickupPoint &&
    form.dropoffPoint &&
    selectedPhotos.length > 0;

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
    const entryId = createId();
    const createdAt = new Date().toISOString();
    const status = previewStatus;

    const attachmentsMeta = selectedPhotos.map((photo) => ({
      id: photo.id,
      name: photo.name,
      mimeType: photo.mimeType,
      size: photo.size,
    }));

    const newEntry: TripEntry = {
      id: entryId,
      bookingId,
      date: currentDateStr,
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
      attachments: attachmentsMeta.map((meta) => ({
        ...meta,
        previewUrl:
          selectedPhotos.find((photo) => photo.id === meta.id)?.previewUrl,
      })),
      createdAt,
      createdBy: user?.id,
      syncStatus: navigator.onLine ? 'pending' : 'pending',
    };

    const tripPayload: TripReportInput = {
      id: newEntry.id,
      bookingId: newEntry.bookingId,
      date: newEntry.date,
      sourceRef: newEntry.sourceRef,
      bookingSource: newEntry.bookingSource,
      supplier: newEntry.supplier,
      clientName: newEntry.clientName,
      driverName: newEntry.driverName,
      carType: newEntry.carType,
      parkingLocation: newEntry.parkingLocation,
      pickupPoint: newEntry.pickupPoint,
      dropoffPoint: newEntry.dropoffPoint,
      supervisorName: newEntry.supervisorName,
      supervisorRating: newEntry.supervisorRating,
      supervisorNotes: newEntry.supervisorNotes,
      passengerFeedback: newEntry.passengerFeedback,
      checklist,
      status,
      createdBy: user?.id,
      syncSource: navigator.onLine ? 'web' : 'offline-cache',
      offline: !navigator.onLine,
    };

    const attachmentsPayload: TripPhotoAttachment[] = selectedPhotos.map(
      (photo) => ({
        id: photo.id,
        name: photo.name,
        mimeType: photo.mimeType,
        size: photo.size,
        base64: photo.base64,
      })
    );

    let updatedEntries = [...trips, newEntry];
    setTrips(updatedEntries);
    persistTripsSection(updatedEntries, queue.length);
    updateNextBookingSequence(updatedEntries, queue);

    const offlineRecord: OfflineTripRecord = {
      id: newEntry.id,
      payload: tripPayload,
      attachments: attachmentsPayload,
      createdAt,
      status: 'pending',
    };

    const handleQueueUpdate = (records: OfflineTripRecord[]) => {
      setQueue(records);
      persistTripsSection(updatedEntries, records.length);
      updateNextBookingSequence(updatedEntries, records);
    };

    if (!navigator.onLine) {
      const records = TripService.enqueue(offlineRecord);
      handleQueueUpdate(records);
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
      newEntry.syncStatus = 'synced';
      if (response.photos?.length) {
        newEntry.attachments = newEntry.attachments.map((attachment) => {
          const remote = response.photos?.find(
            (photo) => photo.file_name === attachment.name || photo.trip_id === response.tripId
          );
          return remote
            ? { ...attachment, storagePath: remote.storage_path }
            : attachment;
        });
      }

      updatedEntries = updatedEntries.map((entry) =>
        entry.id === newEntry.id ? newEntry : entry
      );
      setTrips(updatedEntries);
      persistTripsSection(updatedEntries, queue.length);
      updateNextBookingSequence(updatedEntries, queue);

      toast({
        title: 'تم الإرسال',
        description: ARABIC_TRIPS_MESSAGES.FORM_SUCCESS_ONLINE,
      });

      addNotification({
        type: 'success',
        title: 'رحلة جديدة مسجلة',
        message: `تم اعتماد رحلة رقم ${newEntry.bookingId} بنجاح.`,
      });
    } catch (error) {
      const updatedQueue = TripService.enqueue({
        ...offlineRecord,
        status: 'failed',
        error: error instanceof Error ? error.message : 'unknown_error',
      });
      handleQueueUpdate(updatedQueue);

      updatedEntries = updatedEntries.map((entry) =>
        entry.id === newEntry.id ? { ...entry, syncStatus: 'failed' } : entry
      );
      setTrips(updatedEntries);
      persistTripsSection(updatedEntries, updatedQueue.length);
      updateNextBookingSequence(updatedEntries, updatedQueue);

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
    const syncedEntries = trips.map((entry) =>
      records.some((record) => record.id === entry.id)
        ? entry
        : { ...entry, syncStatus: 'synced' }
    );
    setTrips(syncedEntries);
    persistTripsSection(syncedEntries, records.length);
    updateNextBookingSequence(syncedEntries, records);

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
      </div>

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
                      variant={selectedRating === rating.value ? 'default' : 'outline'}
                      className={cn(
                        'min-w-[110px] border text-sm',
                        rating.className,
                        selectedRating === rating.value &&
                          'ring-2 ring-offset-2 ring-primary text-white'
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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
            <Button
              className="flex-1 md:flex-none"
              onClick={handleSubmit}
              disabled={submitting}
            >
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
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{trip.bookingId}</p>
                        <p className="text-sm text-muted-foreground">
                          {trip.clientName} • {trip.driverName}
                        </p>
                      </div>
                      {statusBadge(trip.syncStatus)}
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
                      {formatDateTime(trip.createdAt)}
                    </p>
                  </div>
                ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Trips;

