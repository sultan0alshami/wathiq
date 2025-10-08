import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, Trash2, Save, Info } from 'lucide-react';

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'destructive' | 'default' | 'warning';
  icon?: React.ReactNode;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  onCancel,
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  variant = 'default',
  icon
}) => {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const getIcon = () => {
    if (icon) return icon;
    
    switch (variant) {
      case 'destructive':
        return <AlertTriangle className="w-6 h-6 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-warning" />;
      default:
        return <Info className="w-6 h-6 text-primary" />;
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            {getIcon()}
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-right">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
      <AlertDialogFooter className="flex gap-2">
          <AlertDialogCancel onClick={handleCancel} aria-label={cancelText} title={cancelText}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            aria-label={confirmText}
            title={confirmText}
            className={
              variant === 'destructive'
                ? 'bg-destructive hover:bg-destructive/90'
                : variant === 'warning'
                ? 'bg-warning hover:bg-warning/90'
                : 'bg-primary hover:bg-primary/90'
            }
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// Specialized confirmation dialogs
export const DeleteConfirmationDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  itemName?: string;
}> = ({ open, onOpenChange, onConfirm, itemName = 'العنصر' }) => (
  <ConfirmationDialog
    open={open}
    onOpenChange={onOpenChange}
    title="تأكيد الحذف"
    description={`هل أنت متأكد من حذف ${itemName}؟ لا يمكن التراجع عن هذا الإجراء.`}
    onConfirm={onConfirm}
    confirmText="حذف"
    variant="destructive"
    icon={<Trash2 className="w-6 h-6 text-destructive" />}
  />
);

export const SaveConfirmationDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  hasUnsavedChanges?: boolean;
}> = ({ open, onOpenChange, onConfirm, hasUnsavedChanges = true }) => (
  <ConfirmationDialog
    open={open}
    onOpenChange={onOpenChange}
    title="حفظ التغييرات"
    description={
      hasUnsavedChanges
        ? "لديك تغييرات غير محفوظة. هل تريد حفظها؟"
        : "هل تريد حفظ البيانات الحالية؟"
    }
    onConfirm={onConfirm}
    confirmText="حفظ"
    icon={<Save className="w-6 h-6 text-primary" />}
  />
);