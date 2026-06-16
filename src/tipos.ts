export type ToolStatus = 'available' | 'in-use' | 'maintenance' | 'broken';
export type ABCCategory = 'A' | 'B' | 'C';

export interface ToolFile {
  name: string;
  url: string;
  type: string;
}

export interface MaintenanceRecord {
  id: string;
  date: string;
  description: string;
  cost: number;
  technician: string;
}

export interface ToolComponent {
  id: string;
  orimec: string;
  name: string;
  serial: string;
  pnGE?: string;
  quantity: number;
  modalidad?: string;
  estado: string;
}

export interface ToolItem {
  id: string;
  name: string;
  category: string;
  serial: string;
  orimec?: string;
  status: ToolStatus;
  condition: string;
  imageUrl?: string;
  files?: ToolFile[];
  abcCategory?: ABCCategory;
  quantity: number;
  lastCalibration?: string;
  nextCalibration?: string;
  maintenanceHistory?: MaintenanceRecord[];
  components?: ToolComponent[];
  notes?: string;
}

export interface ConsumableItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minStock: number;
  unit: string;
}

export interface Engineer {
  id: string;
  name: string;
  department: string;
}

export type UserRole = 'admin' | 'bodeguero' | 'ingeniero';

export interface EditLogEntry {
  field: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
  changedAt: string;
}

export interface PartialReturn {
  tools: { id: string; name: string; serial: string }[];
  date: string;
  returnCondition: string;
  returnNotes: string;
  returnReceivedBy: string;
}

export interface Loan {
  id: string;
  tools: { id: string; name: string; serial: string }[];
  engineerId: string;
  dateOut: string;
  dateIn: string | null;
  purpose: string;
  project?: string;
  client?: string;
  toolId?: string;
  returnCondition?: string;
  returnedBy?: string;
  returnNotes?: string;
  returnReceivedBy?: string;
  partialReturns?: PartialReturn[];
}

export interface ConsumableLog {
  id: string;
  consumableId: string;
  consumableName: string;
  engineerId: string;
  engineerName: string;
  quantity: number;
  date: string;
}

export interface UserItem {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface LoanRequest {
  id: string;
  engineerUid: string;
  engineerName: string;
  tools: { id: string; name: string; serial: string }[];
  requestDate: string;
  targetDate: string;
  durationDays: number;
  destination: string;
  purpose: string;
  project?: string;
  client?: string;
  status: 'pending' | 'approved' | 'rejected';
  resolvedBy?: string;
  resolvedAt?: string;
  rejectionReason?: string;
}

