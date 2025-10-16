import { supabase } from '@/lib/supabase';
import { STORAGE_KEYS } from '@/lib/storageKeys';
import { format } from 'date-fns';
import { 
  DailyData, 
  FinanceEntry, 
  SalesEntry, 
  OperationsEntry, 
  MarketingTask, 
  MarketingCampaign, 
  Customer, 
  Supplier 
} from '@/lib/mockData';

export interface MigrationResult {
  success: boolean;
  message: string;
  migratedRecords: number;
  errors: string[];
}

export interface MigrationProgress {
  currentStep: string;
  progress: number;
  totalSteps: number;
  currentRecords: number;
  totalRecords: number;
}

export class DataMigrationService {
  private onProgress?: (progress: MigrationProgress) => void;

  constructor(onProgress?: (progress: MigrationProgress) => void) {
    this.onProgress = onProgress;
  }

  /**
   * Migrate all localStorage data to Supabase
   */
  async migrateAllData(): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: false,
      message: '',
      migratedRecords: 0,
      errors: []
    };

    try {
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      // Get all localStorage keys for wathiq data
      const dataKeys = this.getAllDataKeys();
      
      if (dataKeys.length === 0) {
        result.success = true;
        result.message = 'No data found to migrate';
        return result;
      }

      let totalMigrated = 0;
      const totalSteps = 6; // finance, sales, operations, marketing, customers, suppliers
      let currentStep = 0;

      // Step 1: Migrate Finance Data
      currentStep++;
      this.updateProgress('Migrating Finance Data...', currentStep, totalSteps, 0, dataKeys.length);
      const financeResult = await this.migrateFinanceData(dataKeys, user.id);
      totalMigrated += financeResult.migratedRecords;
      result.errors.push(...financeResult.errors);

      // Step 2: Migrate Sales Data
      currentStep++;
      this.updateProgress('Migrating Sales Data...', currentStep, totalSteps, 0, dataKeys.length);
      const salesResult = await this.migrateSalesData(dataKeys, user.id);
      totalMigrated += salesResult.migratedRecords;
      result.errors.push(...salesResult.errors);

      // Step 3: Migrate Operations Data
      currentStep++;
      this.updateProgress('Migrating Operations Data...', currentStep, totalSteps, 0, dataKeys.length);
      const operationsResult = await this.migrateOperationsData(dataKeys, user.id);
      totalMigrated += operationsResult.migratedRecords;
      result.errors.push(...operationsResult.errors);

      // Step 4: Migrate Marketing Data
      currentStep++;
      this.updateProgress('Migrating Marketing Data...', currentStep, totalSteps, 0, dataKeys.length);
      const marketingResult = await this.migrateMarketingData(dataKeys, user.id);
      totalMigrated += marketingResult.migratedRecords;
      result.errors.push(...marketingResult.errors);

      // Step 5: Migrate Customers Data
      currentStep++;
      this.updateProgress('Migrating Customers Data...', currentStep, totalSteps, 0, dataKeys.length);
      const customersResult = await this.migrateCustomersData(dataKeys, user.id);
      totalMigrated += customersResult.migratedRecords;
      result.errors.push(...customersResult.errors);

      // Step 6: Migrate Suppliers Data
      currentStep++;
      this.updateProgress('Migrating Suppliers Data...', currentStep, totalSteps, 0, dataKeys.length);
      const suppliersResult = await this.migrateSuppliersData(dataKeys, user.id);
      totalMigrated += suppliersResult.migratedRecords;
      result.errors.push(...suppliersResult.errors);

      // Final step
      this.updateProgress('Migration Complete!', totalSteps, totalSteps, totalMigrated, totalMigrated);

      result.success = true;
      result.migratedRecords = totalMigrated;
      result.message = `Successfully migrated ${totalMigrated} records to Supabase database`;

    } catch (error) {
      result.success = false;
      result.message = `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      result.errors.push(result.message);
    }

    return result;
  }

  /**
   * Get all localStorage keys that contain wathiq data
   */
  private getAllDataKeys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEYS.DATA_PREFIX)) {
        keys.push(key);
      }
    }
    return keys;
  }

  /**
   * Migrate finance data to Supabase
   */
  private async migrateFinanceData(dataKeys: string[], userId: string): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: false,
      message: '',
      migratedRecords: 0,
      errors: []
    };

    try {
      const financeEntries: any[] = [];

      for (const key of dataKeys) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}') as DailyData;
          const dateStr = key.replace(STORAGE_KEYS.DATA_PREFIX, '');
          const date = new Date(dateStr);

          if (data.finance?.entries) {
            for (const entry of data.finance.entries) {
              financeEntries.push({
                user_id: userId,
                date: format(date, 'yyyy-MM-dd'),
                type: entry.type,
                category: entry.category,
                amount: entry.amount,
                description: entry.description,
                payment_method: entry.paymentMethod,
                reference_number: entry.referenceNumber,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
            }
          }
        } catch (error) {
          result.errors.push(`Error processing ${key}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      if (financeEntries.length > 0) {
        const { error } = await supabase
          .from('finance_entries')
          .insert(financeEntries);

        if (error) {
          throw error;
        }
      }

      result.success = true;
      result.migratedRecords = financeEntries.length;
      result.message = `Migrated ${financeEntries.length} finance entries`;

    } catch (error) {
      result.success = false;
      result.message = `Finance migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      result.errors.push(result.message);
    }

    return result;
  }

  /**
   * Migrate sales data to Supabase
   */
  private async migrateSalesData(dataKeys: string[], userId: string): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: false,
      message: '',
      migratedRecords: 0,
      errors: []
    };

    try {
      const salesEntries: any[] = [];

      for (const key of dataKeys) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}') as DailyData;
          const dateStr = key.replace(STORAGE_KEYS.DATA_PREFIX, '');
          const date = new Date(dateStr);

          if (data.sales?.entries) {
            for (const entry of data.sales.entries) {
              salesEntries.push({
                user_id: userId,
                date: format(date, 'yyyy-MM-dd'),
                customer_name: entry.customerName,
                contact_person: entry.contactPerson,
                phone_number: entry.phoneNumber,
                meeting_time: entry.meetingDate.toISOString(),
                outcome: entry.outcome,
                notes: entry.notes,
                follow_up_date: entry.followUpDate ? format(entry.followUpDate, 'yyyy-MM-dd') : null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
            }
          }
        } catch (error) {
          result.errors.push(`Error processing ${key}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      if (salesEntries.length > 0) {
        const { error } = await supabase
          .from('sales_meetings')
          .insert(salesEntries);

        if (error) {
          throw error;
        }
      }

      result.success = true;
      result.migratedRecords = salesEntries.length;
      result.message = `Migrated ${salesEntries.length} sales entries`;

    } catch (error) {
      result.success = false;
      result.message = `Sales migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      result.errors.push(result.message);
    }

    return result;
  }

  /**
   * Migrate operations data to Supabase
   */
  private async migrateOperationsData(dataKeys: string[], userId: string): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: false,
      message: '',
      migratedRecords: 0,
      errors: []
    };

    try {
      const operationsEntries: any[] = [];

      for (const key of dataKeys) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}') as DailyData;
          const dateStr = key.replace(STORAGE_KEYS.DATA_PREFIX, '');
          const date = new Date(dateStr);

          if (data.operations?.entries) {
            for (const entry of data.operations.entries) {
              operationsEntries.push({
                user_id: userId,
                date: format(date, 'yyyy-MM-dd'),
                type: entry.type,
                description: entry.description,
                status: entry.status,
                priority: entry.priority,
                assigned_to: entry.assignedTo,
                notes: entry.notes,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
            }
          }
        } catch (error) {
          result.errors.push(`Error processing ${key}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      if (operationsEntries.length > 0) {
        const { error } = await supabase
          .from('operations_entries')
          .insert(operationsEntries);

        if (error) {
          throw error;
        }
      }

      result.success = true;
      result.migratedRecords = operationsEntries.length;
      result.message = `Migrated ${operationsEntries.length} operations entries`;

    } catch (error) {
      result.success = false;
      result.message = `Operations migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      result.errors.push(result.message);
    }

    return result;
  }

  /**
   * Migrate marketing data to Supabase
   */
  private async migrateMarketingData(dataKeys: string[], userId: string): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: false,
      message: '',
      migratedRecords: 0,
      errors: []
    };

    try {
      const marketingTasks: any[] = [];
      const marketingCampaigns: any[] = [];
      const customerInteractions: any[] = [];

      for (const key of dataKeys) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}') as DailyData;
          const dateStr = key.replace(STORAGE_KEYS.DATA_PREFIX, '');
          const date = new Date(dateStr);

          // Migrate marketing tasks
          if (data.marketing?.tasks) {
            for (const task of data.marketing.tasks) {
              marketingTasks.push({
                user_id: userId,
                date: format(date, 'yyyy-MM-dd'),
                title: task.title,
                description: task.description,
                due_date: format(task.dueDate, 'yyyy-MM-dd'),
                status: task.status,
                priority: task.priority,
                assigned_to: task.assignedTo,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
            }
          }

          // Migrate marketing campaigns
          if (data.marketing?.campaigns) {
            for (const campaign of data.marketing.campaigns) {
              marketingCampaigns.push({
                user_id: userId,
                date: format(date, 'yyyy-MM-dd'),
                name: campaign.name,
                type: campaign.type,
                budget: campaign.budget,
                status: campaign.status,
                target_audience: campaign.targetAudience,
                description: campaign.description,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
            }
          }

          // Migrate customer interactions
          if (data.marketing?.customerInteractions) {
            for (const interaction of data.marketing.customerInteractions) {
              customerInteractions.push({
                user_id: userId,
                date: format(date, 'yyyy-MM-dd'),
                customer_name: interaction.customerName,
                interaction_type: interaction.interactionType,
                channel: interaction.channel,
                outcome: interaction.outcome,
                notes: interaction.notes,
                created_at: new Date().toISOString()
              });
            }
          }
        } catch (error) {
          result.errors.push(`Error processing ${key}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Insert all marketing data
      if (marketingTasks.length > 0) {
        const { error } = await supabase.from('marketing_tasks').insert(marketingTasks);
        if (error) throw error;
      }

      if (marketingCampaigns.length > 0) {
        const { error } = await supabase.from('marketing_campaigns').insert(marketingCampaigns);
        if (error) throw error;
      }

      if (customerInteractions.length > 0) {
        const { error } = await supabase.from('marketing_customer_interactions').insert(customerInteractions);
        if (error) throw error;
      }

      result.success = true;
      result.migratedRecords = marketingTasks.length + marketingCampaigns.length + customerInteractions.length;
      result.message = `Migrated ${marketingTasks.length} tasks, ${marketingCampaigns.length} campaigns, ${customerInteractions.length} interactions`;

    } catch (error) {
      result.success = false;
      result.message = `Marketing migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      result.errors.push(result.message);
    }

    return result;
  }

  /**
   * Migrate customers data to Supabase
   */
  private async migrateCustomersData(dataKeys: string[], userId: string): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: false,
      message: '',
      migratedRecords: 0,
      errors: []
    };

    try {
      const customers: any[] = [];

      for (const key of dataKeys) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}') as DailyData;
          const dateStr = key.replace(STORAGE_KEYS.DATA_PREFIX, '');
          const date = new Date(dateStr);

          if (data.customers) {
            for (const customer of data.customers) {
              customers.push({
                user_id: userId,
                date: format(date, 'yyyy-MM-dd'),
                name: customer.name,
                phone: customer.phone,
                email: customer.email,
                address: customer.address,
                arrival_date: format(customer.arrivalDate, 'yyyy-MM-dd'),
                departure_date: customer.departureDate ? format(customer.departureDate, 'yyyy-MM-dd') : null,
                service_type: customer.serviceType,
                status: customer.status,
                notes: customer.notes,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
            }
          }
        } catch (error) {
          result.errors.push(`Error processing ${key}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      if (customers.length > 0) {
        const { error } = await supabase
          .from('customers')
          .insert(customers);

        if (error) {
          throw error;
        }
      }

      result.success = true;
      result.migratedRecords = customers.length;
      result.message = `Migrated ${customers.length} customers`;

    } catch (error) {
      result.success = false;
      result.message = `Customers migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      result.errors.push(result.message);
    }

    return result;
  }

  /**
   * Migrate suppliers data to Supabase
   */
  private async migrateSuppliersData(dataKeys: string[], userId: string): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: false,
      message: '',
      migratedRecords: 0,
      errors: []
    };

    try {
      const suppliers: any[] = [];
      const supplierDocuments: any[] = [];

      for (const key of dataKeys) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}') as DailyData;
          const dateStr = key.replace(STORAGE_KEYS.DATA_PREFIX, '');
          const date = new Date(dateStr);

          if (data.suppliers) {
            for (const supplier of data.suppliers) {
              const supplierId = crypto.randomUUID();
              
              suppliers.push({
                id: supplierId,
                user_id: userId,
                date: format(date, 'yyyy-MM-dd'),
                name: supplier.name,
                contact_person: supplier.contactPerson,
                phone: supplier.phone,
                email: supplier.email,
                address: supplier.address,
                category: supplier.category,
                status: supplier.status,
                notes: supplier.notes,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });

              // Migrate supplier documents
              if (supplier.documents) {
                for (const doc of supplier.documents) {
                  supplierDocuments.push({
                    supplier_id: supplierId,
                    name: doc.name,
                    type: doc.type,
                    file_url: doc.fileUrl,
                    file_size: doc.fileSize,
                    upload_date: format(doc.uploadDate, 'yyyy-MM-dd'),
                    created_at: new Date().toISOString()
                  });
                }
              }
            }
          }
        } catch (error) {
          result.errors.push(`Error processing ${key}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Insert suppliers first
      if (suppliers.length > 0) {
        const { error } = await supabase
          .from('suppliers')
          .insert(suppliers);

        if (error) {
          throw error;
        }
      }

      // Then insert supplier documents
      if (supplierDocuments.length > 0) {
        const { error } = await supabase
          .from('supplier_documents')
          .insert(supplierDocuments);

        if (error) {
          throw error;
        }
      }

      result.success = true;
      result.migratedRecords = suppliers.length + supplierDocuments.length;
      result.message = `Migrated ${suppliers.length} suppliers and ${supplierDocuments.length} documents`;

    } catch (error) {
      result.success = false;
      result.message = `Suppliers migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      result.errors.push(result.message);
    }

    return result;
  }

  /**
   * Update migration progress
   */
  private updateProgress(
    currentStep: string, 
    step: number, 
    totalSteps: number, 
    currentRecords: number, 
    totalRecords: number
  ) {
    if (this.onProgress) {
      this.onProgress({
        currentStep,
        progress: Math.round((step / totalSteps) * 100),
        totalSteps,
        currentRecords,
        totalRecords
      });
    }
  }

  /**
   * Clear all localStorage data after successful migration
   */
  async clearLocalStorageData(): Promise<void> {
    const dataKeys = this.getAllDataKeys();
    for (const key of dataKeys) {
      localStorage.removeItem(key);
    }
  }

  /**
   * Check if migration is needed
   */
  async isMigrationNeeded(): Promise<boolean> {
    const dataKeys = this.getAllDataKeys();
    return dataKeys.length > 0;
  }
}
