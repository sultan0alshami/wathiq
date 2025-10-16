import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataMigrationService } from '@/services/DataMigrationService';
import { DataMigrationDialog } from '@/components/ui/data-migration-dialog';
import { Database, AlertTriangle, CheckCircle, Upload } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const MigrationStatus: React.FC = () => {
  const { user } = useAuth();
  const [migrationNeeded, setMigrationNeeded] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [migrationService] = useState(() => new DataMigrationService());

  useEffect(() => {
    const checkMigrationStatus = async () => {
      try {
        setIsChecking(true);
        const needed = await migrationService.isMigrationNeeded();
        setMigrationNeeded(needed);
      } catch (error) {
        console.error('Error checking migration status:', error);
        setMigrationNeeded(false);
      } finally {
        setIsChecking(false);
      }
    };

    if (user) {
      checkMigrationStatus();
    }
  }, [user, migrationService]);

  const handleMigrationComplete = () => {
    setMigrationNeeded(false);
  };

  if (!user || isChecking) {
    return null;
  }

  if (migrationNeeded === false) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="flex items-center justify-between">
          <span className="text-green-800">
            جميع البيانات محفوظة في قاعدة البيانات السحابية
          </span>
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            <Database className="w-3 h-3 mr-1" />
            متصل
          </Badge>
        </AlertDescription>
      </Alert>
    );
  }

  if (migrationNeeded === true) {
    return (
      <Alert className="border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="flex items-center justify-between">
          <div className="flex-1">
            <div className="text-orange-800 font-medium mb-1">
              ترحيل البيانات مطلوب
            </div>
            <div className="text-orange-700 text-sm">
              البيانات الحالية محفوظة محلياً فقط. قم بترحيلها إلى قاعدة البيانات للحفظ الدائم.
            </div>
          </div>
          <DataMigrationDialog onMigrationComplete={handleMigrationComplete}>
            <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
              <Upload className="w-4 h-4 mr-2" />
              ترحيل البيانات
            </Button>
          </DataMigrationDialog>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};
