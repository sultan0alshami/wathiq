export const ARABIC_MESSAGES = {
  BACKUP_FILE_INVALID: 'ملف النسخة الاحتياطية غير صالح',
  IMPORT_SUCCESS_PARTIAL: (importedCount: number, errorCount: number) => `تم استيراد ${importedCount} يوم بنجاح، فشل في ${errorCount} يوم`,
  IMPORT_SUCCESS_FULL: (importedCount: number) => `تم استيراد ${importedCount} يوم بنجاح`,
  IMPORT_FAILED_GENERIC: 'فشل في استيراد النسخة الاحتياطية',
  IMPORT_FAILED_JSON_INVALID: 'تنسيق ملف النسخة الاحتياطية غير صالح (JSON غير صحيح)',
  IMPORT_FAILED_FILE_READ: 'خطأ في قراءة ملف النسخة الاحتياطية: ',
  CONFIRM_DELETE_ALL_DATA: 'هل أنت متأكد من حذف جميع البيانات؟ هذا الإجراء لا يمكن التراجع عنه.',
};
