export interface WorkOrder {
  id?: number;
  workType: string;
  workSubType: string;
  customWorkType?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: Date;
  scheduledDate?: Date;
} 