import React from 'react';
import { DataBackupPanel } from '@/components/ui/data-backup-panel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Shield, Clock, HardDrive } from 'lucide-react';
import { ARABIC_DATA_MANAGEMENT_MESSAGES } from '@/lib/arabicDataManagementMessages';

export const DataManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary">{ARABIC_DATA_MANAGEMENT_MESSAGES.PAGE_TITLE}</h1>
        <p className="text-muted-foreground mt-2">
          {ARABIC_DATA_MANAGEMENT_MESSAGES.PAGE_DESCRIPTION}
        </p>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <CardContent>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium">{ARABIC_DATA_MANAGEMENT_MESSAGES.FEATURE_OVERVIEW_BACKUPS_TITLE}</p>
                <p className="text-xs text-muted-foreground">{ARABIC_DATA_MANAGEMENT_MESSAGES.FEATURE_OVERVIEW_BACKUPS_DESCRIPTION}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardContent>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium">{ARABIC_DATA_MANAGEMENT_MESSAGES.FEATURE_OVERVIEW_SECURITY_TITLE}</p>
                <p className="text-xs text-muted-foreground">{ARABIC_DATA_MANAGEMENT_MESSAGES.FEATURE_OVERVIEW_SECURITY_DESCRIPTION}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium">{ARABIC_DATA_MANAGEMENT_MESSAGES.FEATURE_OVERVIEW_CLEANUP_TITLE}</p>
                <p className="text-xs text-muted-foreground">{ARABIC_DATA_MANAGEMENT_MESSAGES.FEATURE_OVERVIEW_CLEANUP_DESCRIPTION}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardContent>
            <div className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium">{ARABIC_DATA_MANAGEMENT_MESSAGES.FEATURE_OVERVIEW_MONITORING_TITLE}</p>
                <p className="text-xs text-muted-foreground">{ARABIC_DATA_MANAGEMENT_MESSAGES.FEATURE_OVERVIEW_MONITORING_DESCRIPTION}</p>
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