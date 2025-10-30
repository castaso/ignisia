// FIX: Corrected the import path for types to navigate up from the 'services' directory.
import { User, Attendance, AttendanceState, Reimbursement, ReimbursementStatus, LeaveApplication, LeaveStatus, LeaveType, OvertimeApplication, OvertimeStatus, AttendanceCorrection, CorrectionStatus, Payslip } from '../types';

// Mock user for development
export const mockUser: User = {
  uid: 1,
  name: 'Demo User',
  email: 'demo@odoo.com',
  company_id: 1,
  company_name: 'Odoo Inc.',
  employee_id: 1,
};

// Mock data
let mockAttendances: Attendance[] = [
    { 
        id: 1, 
        check_in: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), 
        check_out: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), 
        worked_hours: 7.0,
        check_in_location: 'Office A',
        check_out_location: 'Office A',
    },
    { 
        id: 2, 
        check_in: new Date(Date.now() - 32 * 60 * 60 * 1000).toISOString(), 
        check_out: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), 
        worked_hours: 7.0,
        check_in_location: 'Remote',
        check_out_location: 'Remote',
    },
];
let nextAttendanceId = 3;

let mockAttendanceCorrections: AttendanceCorrection[] = [
    {
        id: 1,
        attendance_id: 2,
        original_check_in: new Date(Date.now() - 32 * 60 * 60 * 1000).toISOString(),
        original_check_out: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
        corrected_check_in: new Date(Date.now() - 32 * 60 * 60 * 1000).toISOString(),
        corrected_check_out: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        reason: 'Forgot to check out on time.',
        status: CorrectionStatus.PENDING,
    }
];
let nextCorrectionId = 2;


let mockReimbursements: Reimbursement[] = [
    {
        id: 1,
        amount: 25.50,
        description: 'Team Lunch',
        status: ReimbursementStatus.APPROVED,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 2,
        amount: 150.00,
        description: 'Client Travel (Taxi)',
        status: ReimbursementStatus.PENDING,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
     {
        id: 3,
        amount: 12.75,
        description: 'Coffee with client',
        status: ReimbursementStatus.REJECTED,
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    }
];
let nextReimbursementId = 4;

let mockLeaveApplications: LeaveApplication[] = [
    {
        id: 1,
        startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        leaveType: LeaveType.ANNUAL,
        reason: 'Family vacation',
        status: LeaveStatus.APPROVED,
    },
    {
        id: 2,
        startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        leaveType: LeaveType.SICK,
        reason: 'Doctor\'s appointment',
        status: LeaveStatus.PENDING,
    },
];
let nextLeaveId = 3;

let mockOvertimeApplications: OvertimeApplication[] = [
    {
        id: 1,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        hours: 2,
        reason: 'Finish critical project report.',
        status: OvertimeStatus.APPROVED,
    },
    {
        id: 2,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        hours: 3.5,
        reason: 'Support weekend deployment.',
        status: OvertimeStatus.PENDING,
    },
];
let nextOvertimeId = 3;

const mockPayslips: Payslip[] = [
    {
        id: 1,
        payPeriod: 'August 2024',
        grossPay: 5500,
        netPay: 4200,
        earnings: [
            { description: 'Basic Salary', amount: 5000 },
            { description: 'Overtime Pay', amount: 500 },
        ],
        deductions: [
            { description: 'Federal Tax', amount: 1000 },
            { description: 'Health Insurance', amount: 300 },
        ],
    },
    {
        id: 2,
        payPeriod: 'July 2024',
        grossPay: 5150,
        netPay: 3950,
        earnings: [
            { description: 'Basic Salary', amount: 5000 },
            { description: 'Bonus', amount: 150 },
        ],
        deductions: [
            { description: 'Federal Tax', amount: 900 },
            { description: 'Health Insurance', amount: 300 },
        ],
    },
    {
        id: 3,
        payPeriod: 'June 2024',
        grossPay: 5000,
        netPay: 3800,
        earnings: [
            { description: 'Basic Salary', amount: 5000 },
        ],
        deductions: [
            { description: 'Federal Tax', amount: 900 },
            { description: 'Health Insurance', amount: 300 },
        ],
    },
];


const odooService = {
  login: (email: string, password: string): Promise<User> => {
    console.log(`Attempting login with email: ${email}`);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email === 'demo@odoo.com' && password === 'password') {
          resolve(mockUser);
        } else {
          reject(new Error('Invalid credentials. Please try again.'));
        }
      }, 1000);
    });
  },

  getAttendanceState: (employeeId: number): Promise<AttendanceState> => {
     console.log(`Getting attendance state for employee ${employeeId}`);
     return new Promise((resolve) => {
        setTimeout(() => {
            const lastAttendance = mockAttendances
                .sort((a, b) => new Date(b.check_in).getTime() - new Date(a.check_in).getTime())[0];
            
            if (lastAttendance && !lastAttendance.check_out) {
                resolve({
                    isCheckedIn: true,
                    lastCheckIn: lastAttendance.check_in,
                    lastAttendance: lastAttendance,
                });
            } else {
                resolve({ isCheckedIn: false });
            }
        }, 500);
     });
  },

  checkIn: (employeeId: number, location: string): Promise<Attendance> => {
    console.log(`Checking in employee ${employeeId} at ${location}`);
    return new Promise((resolve) => {
        setTimeout(() => {
            const newAttendance: Attendance = {
                id: nextAttendanceId++,
                check_in: new Date().toISOString(),
                check_out: null,
                worked_hours: 0,
                check_in_location: location,
            };
            mockAttendances.unshift(newAttendance);
            resolve(newAttendance);
        }, 1000);
    });
  },

  checkOut: (attendanceId: number, location: string): Promise<Attendance> => {
    console.log(`Checking out attendance ${attendanceId} at ${location}`);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const attendance = mockAttendances.find(a => a.id === attendanceId);
            if (attendance && !attendance.check_out) {
                attendance.check_out = new Date().toISOString();
                const checkInTime = new Date(attendance.check_in).getTime();
                const checkOutTime = new Date(attendance.check_out).getTime();
                attendance.worked_hours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
                attendance.check_out_location = location;
                resolve({ ...attendance });
            } else {
                reject(new Error('Could not find active check-in to check out.'));
            }
        }, 1000);
    });
  },
  
  getAttendanceHistory: (employeeId: number): Promise<Attendance[]> => {
      console.log(`Fetching history for employee ${employeeId}`);
      return new Promise((resolve) => {
        setTimeout(() => {
            const historyWithCorrections = mockAttendances.map(att => {
                const correction = mockAttendanceCorrections.find(c => c.attendance_id === att.id);
                return { ...att, correctionStatus: correction?.status };
            });
            resolve(historyWithCorrections.sort((a, b) => new Date(b.check_in).getTime() - new Date(a.check_in).getTime()));
        }, 1000);
      });
  },

  submitAttendanceCorrection: (
    employeeId: number, 
    attendanceId: number, 
    correctedCheckIn: string, 
    correctedCheckOut: string | null, 
    reason: string
  ): Promise<AttendanceCorrection> => {
      console.log(`Submitting correction for attendance ${attendanceId}`);
      return new Promise((resolve, reject) => {
          setTimeout(() => {
              const originalAttendance = mockAttendances.find(a => a.id === attendanceId);
              if (!originalAttendance) {
                  return reject(new Error('Original attendance record not found.'));
              }

              const newCorrection: AttendanceCorrection = {
                  id: nextCorrectionId++,
                  attendance_id: attendanceId,
                  original_check_in: originalAttendance.check_in,
                  original_check_out: originalAttendance.check_out,
                  corrected_check_in: correctedCheckIn,
                  corrected_check_out: correctedCheckOut,
                  reason,
                  status: CorrectionStatus.PENDING,
              };
              mockAttendanceCorrections.unshift(newCorrection);
              resolve(newCorrection);
          }, 1200);
      });
  },

  getReimbursements: (employeeId: number): Promise<Reimbursement[]> => {
      console.log(`Fetching reimbursements for employee ${employeeId}`);
      return new Promise((resolve) => {
          setTimeout(() => {
              resolve([...mockReimbursements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
          }, 700);
      });
  },

  submitReimbursement: (employeeId: number, amount: number, description: string, receiptImageUrl: string): Promise<Reimbursement> => {
      console.log(`Submitting reimbursement for employee ${employeeId}`);
      return new Promise((resolve) => {
          setTimeout(() => {
              const newReimbursement: Reimbursement = {
                  id: nextReimbursementId++,
                  amount,
                  description,
                  receiptImageUrl,
                  status: ReimbursementStatus.PENDING,
                  date: new Date().toISOString(),
              };
              mockReimbursements.unshift(newReimbursement);
              resolve(newReimbursement);
          }, 1200);
      });
  },

  getLeaveApplications: (employeeId: number): Promise<LeaveApplication[]> => {
      console.log(`Fetching leave applications for employee ${employeeId}`);
      return new Promise((resolve) => {
          setTimeout(() => {
              resolve([...mockLeaveApplications].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()));
          }, 800);
      });
  },

  submitLeaveApplication: (employeeId: number, startDate: string, endDate: string, leaveType: LeaveType, reason: string): Promise<LeaveApplication> => {
      console.log(`Submitting leave application for employee ${employeeId}`);
      return new Promise((resolve) => {
          setTimeout(() => {
              const newLeaveApplication: LeaveApplication = {
                  id: nextLeaveId++,
                  startDate,
                  endDate,
                  leaveType,
                  reason,
                  status: LeaveStatus.PENDING,
              };
              mockLeaveApplications.unshift(newLeaveApplication);
              resolve(newLeaveApplication);
          }, 1000);
      });
  },

  getOvertimeApplications: (employeeId: number): Promise<OvertimeApplication[]> => {
      console.log(`Fetching overtime applications for employee ${employeeId}`);
      return new Promise((resolve) => {
          setTimeout(() => {
              resolve([...mockOvertimeApplications].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
          }, 900);
      });
  },

  submitOvertimeApplication: (employeeId: number, date: string, hours: number, reason: string): Promise<OvertimeApplication> => {
      console.log(`Submitting overtime application for employee ${employeeId}`);
      return new Promise((resolve) => {
          setTimeout(() => {
              const newOvertimeApplication: OvertimeApplication = {
                  id: nextOvertimeId++,
                  date,
                  hours,
                  reason,
                  status: OvertimeStatus.PENDING,
              };
              mockOvertimeApplications.unshift(newOvertimeApplication);
              resolve(newOvertimeApplication);
          }, 1000);
      });
  },
  
  getPayslips: (employeeId: number): Promise<Payslip[]> => {
      console.log(`Fetching payslips for employee ${employeeId}`);
      return new Promise((resolve) => {
          setTimeout(() => {
              resolve([...mockPayslips]);
          }, 1100);
      });
  },
};

export { odooService };