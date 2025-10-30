export interface User {
  uid: number;
  name: string;
  email: string;
  company_id: number;
  company_name: string;
  employee_id: number;
}

export enum LivenessChallengeType {
  BLINK = 'BLINK',
  SMILE = 'SMILE',
}

export interface LivenessChallenge {
  type: LivenessChallengeType;
  instruction: string;
}

export enum CorrectionStatus {
    PENDING = 'Pending',
    APPROVED = 'Approved',
    REJECTED = 'Rejected',
}

export interface Attendance {
  id: number;
  check_in: string;
  check_out: string | null;
  worked_hours: number;
  check_in_location?: string;
  check_out_location?: string;
  correctionStatus?: CorrectionStatus;
}

export interface AttendanceCorrection {
    id: number;
    attendance_id: number;
    original_check_in: string;
    original_check_out: string | null;
    corrected_check_in: string;
    corrected_check_out: string | null;
    reason: string;
    status: CorrectionStatus;
}


export interface AttendanceState {
    isCheckedIn: boolean;
    lastCheckIn?: string;
    lastAttendance?: Attendance;
}

export enum ReimbursementStatus {
    PENDING = 'Pending',
    APPROVED = 'Approved',
    REJECTED = 'Rejected',
}

export interface Reimbursement {
    id: number;
    amount: number;
    description: string;
    status: ReimbursementStatus;
    date: string;
    receiptImageUrl?: string; // Stored as a data URL
}

export enum LeaveStatus {
    PENDING = 'Pending',
    APPROVED = 'Approved',
    REJECTED = 'Rejected',
}

export enum LeaveType {
    SICK = 'Sick Leave',
    ANNUAL = 'Annual Leave',
}

export interface LeaveApplication {
    id: number;
    startDate: string;
    endDate: string;
    leaveType: LeaveType;
    reason: string;
    status: LeaveStatus;
}

export enum OvertimeStatus {
    PENDING = 'Pending',
    APPROVED = 'Approved',
    REJECTED = 'Rejected',
}

export interface OvertimeApplication {
    id: number;
    date: string;
    hours: number;
    reason: string;
    status: OvertimeStatus;
}

// New types for Payslip feature
export interface Earning {
    description: string;
    amount: number;
}

export interface Deduction {
    description: string;
    amount: number;
}

export interface Payslip {
    id: number;
    payPeriod: string;
    grossPay: number;
    netPay: number;
    earnings: Earning[];
    deductions: Deduction[];
}