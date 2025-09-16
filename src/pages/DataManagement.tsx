import React from 'react';
import { DataBackupPanel } from '@/components/ui/data-backup-panel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Shield, Clock, HardDrive } from 'lucide-react';

export const DataManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary">إدارة البيانات</h1>
        <p className="text-muted-foreground mt-2">
          إدارة النسخ الاحتياطية واستعادة البيانات
        </p>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium">النسخ الاحتياطية</p>
                <p className="text-xs text-muted-foreground">تصدير واستيراد البيانات</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium">الأمان</p>
                <p className="text-xs text-muted-foreground">حماية البيانات المحلية</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium">التنظيف التلقائي</p>
                <p className="text-xs text-muted-foreground">حذف البيانات القديمة</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium">مراقبة المساحة</p>
                <p className="text-xs text-muted-foreground">إحصائيات التخزين</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Backup Panel */}
      <DataBackupPanel />
    </div>
  );
};