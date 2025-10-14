-- Create Test Notifications for Wathiq
-- Run this in Supabase SQL Editor

-- First, let's make sure the notifications table exists
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  title text NOT NULL,
  message text,
  is_broadcast boolean DEFAULT false NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  read_at timestamp with time zone
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications (user_id);
CREATE INDEX IF NOT EXISTS notifications_is_broadcast_idx ON public.notifications (is_broadcast);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON public.notifications (created_at DESC);

-- Drop old policies if they exist
DROP POLICY IF EXISTS "notifications_select_policy" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_policy" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert_self" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert_broadcast" ON public.notifications;

-- Create RLS policies
-- Allow authenticated users to SELECT their own notifications + broadcasts
CREATE POLICY "notifications_select_policy"
ON public.notifications FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR is_broadcast = true
);

-- Allow authenticated users to UPDATE their own notifications (mark as read)
CREATE POLICY "notifications_update_policy"
ON public.notifications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to INSERT notifications for themselves
CREATE POLICY "notifications_insert_self"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR is_broadcast = true);

-- Allow service role to INSERT broadcast notifications (for backend)
CREATE POLICY "notifications_insert_broadcast"
ON public.notifications FOR INSERT
TO service_role
WITH CHECK (is_broadcast = true);

-- Now create test notifications
-- Replace YOUR_USER_ID with your actual user ID (7b601100-e2ab-41eb-85b5-765d2e3107fc)
DO $$
DECLARE
  user_uuid uuid := '7b601100-e2ab-41eb-85b5-765d2e3107fc'; -- Your user ID
BEGIN
  -- Delete old test notifications (optional, comment out if you want to keep them)
  -- DELETE FROM public.notifications WHERE title LIKE '%تجريبي%' OR title LIKE '%اختبار%';

  -- Insert broadcast notifications (visible to all users)
  INSERT INTO public.notifications (type, title, message, is_broadcast, created_at) VALUES
    ('success', 'مرحباً بك في واثق', 'تم تفعيل نظام الإشعارات بنجاح. ستتلقى تحديثات فورية عن جميع العمليات المهمة.', true, NOW() - INTERVAL '2 hours'),
    ('info', 'تحديث النظام', 'تم إضافة ميزات جديدة للتقارير اليومية. تحقق من صفحة التقارير للمزيد من التفاصيل.', true, NOW() - INTERVAL '1 hour'),
    ('warning', 'تنبيه مالي', 'انتبه: السيولة المالية أقل من المستوى الموصى به. يرجى مراجعة الحسابات.', true, NOW() - INTERVAL '30 minutes'),
    ('error', 'خطأ في النظام', 'حدث خطأ مؤقت في خدمة الإشعارات. تم حل المشكلة الآن.', true, NOW() - INTERVAL '15 minutes'),
    ('success', 'تقرير PDF جاهز', 'تم إنشاء تقرير PDF اليومي بنجاح. يمكنك تحميله من صفحة التقارير.', true, NOW() - INTERVAL '5 minutes');

  -- Insert user-specific notifications (only for the specified user)
  INSERT INTO public.notifications (user_id, type, title, message, is_broadcast, created_at) VALUES
    (user_uuid, 'success', 'إشعار خاص بك', 'هذا إشعار خاص بحسابك فقط. تم تسجيل دخولك بنجاح.', false, NOW() - INTERVAL '10 minutes'),
    (user_uuid, 'info', 'تذكير', 'لا تنسى مراجعة العمليات اليومية قبل نهاية اليوم.', false, NOW() - INTERVAL '3 minutes'),
    (user_uuid, 'warning', 'انتباه', 'لديك 3 مهام تسويقية معلقة. يرجى إكمالها في أقرب وقت.', false, NOW() - INTERVAL '1 minute');

  RAISE NOTICE 'تم إنشاء % إشعارات بنجاح', (SELECT COUNT(*) FROM public.notifications);
END $$;

-- Verify the notifications were created
SELECT 
  id,
  type,
  title,
  CASE 
    WHEN is_broadcast THEN 'عام'
    ELSE 'خاص'
  END as نوع_الإشعار,
  created_at,
  CASE 
    WHEN read_at IS NOT NULL THEN 'مقروء'
    ELSE 'غير مقروء'
  END as الحالة
FROM public.notifications
ORDER BY created_at DESC
LIMIT 10;

-- Check total count
SELECT 
  COUNT(*) as total_notifications,
  COUNT(*) FILTER (WHERE is_broadcast = true) as broadcast_count,
  COUNT(*) FILTER (WHERE user_id = '7b601100-e2ab-41eb-85b5-765d2e3107fc') as user_specific_count,
  COUNT(*) FILTER (WHERE read_at IS NULL) as unread_count
FROM public.notifications;

