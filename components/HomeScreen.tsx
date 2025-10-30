import React, { useState, useEffect, useCallback } from 'react';
import { User, Attendance, AttendanceState, Reimbursement, LeaveApplication, OvertimeApplication, Payslip, LeaveStatus, ReimbursementStatus, LeaveType, OvertimeStatus, CorrectionStatus } from '../types';
import { odooService } from '../services/odooService';
import { locationService } from '../services/locationService';
import { useNotification } from '../contexts/NotificationContext';

import LivenessCamera from './LivenessCamera';
import ReimbursementScreen from './ReimbursementScreen';
import LeaveApplicationScreen from './LeaveApplicationScreen';
import OvertimeScreen from './OvertimeScreen';
import AttendanceCorrectionScreen from './AttendanceCorrectionScreen';
import PayslipScreen from './PayslipScreen'; // Import the new screen
import Card from './common/Card';
import Button from './common/Button';
import Spinner from './common/Spinner';

import UserIcon from './icons/UserIcon';
import ClockIcon from './icons/ClockIcon';
import HistoryIcon from './icons/HistoryIcon';
import CameraIcon from './icons/CameraIcon';
import LocationIcon from './icons/LocationIcon';
import PlusIcon from './icons/PlusIcon';
import ReimbursementIcon from './icons/ReimbursementIcon';
import LeaveIcon from './icons/LeaveIcon';
import OvertimeIcon from './icons/OvertimeIcon';
import EditIcon from './icons/EditIcon';
import PayslipIcon from './icons/PayslipIcon';


interface LocationData {
  address: string;
}

const HomeScreen: React.FC<{ user: User }> = ({ user }) => {
  const [attendanceState, setAttendanceState] = useState<AttendanceState>({ isCheckedIn: false });
  const [attendanceHistory, setAttendanceHistory] = useState<Attendance[]>([]);
  const [reimbursementHistory, setReimbursementHistory] = useState<Reimbursement[]>([]);
  const [leaveHistory, setLeaveHistory] = useState<LeaveApplication[]>([]);
  const [overtimeHistory, setOvertimeHistory] = useState<OvertimeApplication[]>([]);
  const [payslipHistory, setPayslipHistory] = useState<Payslip[]>([]); // New state for payslips
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isReimbursementFormOpen, setIsReimbursementFormOpen] = useState(false);
  const [isLeaveFormOpen, setIsLeaveFormOpen] = useState(false);
  const [isOvertimeFormOpen, setIsOvertimeFormOpen] = useState(false);
  const [isCorrectionFormOpen, setIsCorrectionFormOpen] = useState(false);
  const [isPayslipScreenOpen, setIsPayslipScreenOpen] = useState(false); // New state for payslip screen
  const [correctionTarget, setCorrectionTarget] = useState<Attendance | null>(null);
  const [locationForConfirmation, setLocationForConfirmation] = useState<LocationData | null>(null);
  
  const { showNotification } = useNotification();

  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [state, attHistory, reimHistory, leaveHist, overtimeHist, payslips] = await Promise.all([
        odooService.getAttendanceState(user.employee_id),
        odooService.getAttendanceHistory(user.employee_id),
        odooService.getReimbursements(user.employee_id),
        odooService.getLeaveApplications(user.employee_id),
        odooService.getOvertimeApplications(user.employee_id),
        odooService.getPayslips(user.employee_id), // Fetch payslips
      ]);
      setAttendanceState(state);
      setAttendanceHistory(attHistory);
      setReimbursementHistory(reimHistory);
      setLeaveHistory(leaveHist);
      setOvertimeHistory(overtimeHist);
      setPayslipHistory(payslips); // Set payslips
    } catch (error) {
      showNotification(error instanceof Error ? error.message : 'Failed to load data.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [user.employee_id, showNotification]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);
  
  const handleInitiateAttendanceAction = async () => {
    setIsActionLoading(true);
    try {
      const coords = await locationService.getCurrentLocation();
      const address = await locationService.getAddressFromCoordinates(coords.latitude, coords.longitude);
      setLocationForConfirmation({ address });
    } catch (error) {
       showNotification(error instanceof Error ? error.message : 'Could not get location.', 'error');
    } finally {
        setIsActionLoading(false);
    }
  };

  const handleAttendanceAction = async (imageDataUrl: string) => {
    setIsCameraOpen(false);
    
    if (!locationForConfirmation) {
        showNotification('Location data is missing. Please try again.', 'error');
        return;
    }

    setIsActionLoading(true);
    try {
      if (attendanceState.isCheckedIn) {
        if (!attendanceState.lastAttendance) {
            throw new Error("Cannot check out, no active attendance record found.");
        }
        await odooService.checkOut(attendanceState.lastAttendance.id, locationForConfirmation.address);
        showNotification('Successfully checked out!', 'success');
      } else {
        await odooService.checkIn(user.employee_id, locationForConfirmation.address);
        showNotification('Successfully checked in!', 'success');
      }
      await fetchInitialData();
    } catch (error) {
      showNotification(error instanceof Error ? error.message : 'An error occurred.', 'error');
    } finally {
      setIsActionLoading(false);
      setLocationForConfirmation(null);
    }
  };
  
  const handleCorrectionSubmit = async (attendanceId: number, correctedCheckIn: string, correctedCheckOut: string | null, reason: string) => {
    setIsCorrectionFormOpen(false);
    setIsActionLoading(true);
    try {
        await odooService.submitAttendanceCorrection(user.employee_id, attendanceId, correctedCheckIn, correctedCheckOut, reason);
        showNotification('Attendance correction submitted successfully!', 'success');
        await fetchInitialData();
    } catch (error) {
        showNotification(error instanceof Error ? error.message : 'Failed to submit correction.', 'error');
    } finally {
        setIsActionLoading(false);
        setCorrectionTarget(null);
    }
  };

  const handleReimbursementSubmit = async (amount: number, description: string, receiptImageUrl: string) => {
    setIsReimbursementFormOpen(false);
    setIsActionLoading(true);
    try {
        await odooService.submitReimbursement(user.employee_id, amount, description, receiptImageUrl);
        showNotification('Reimbursement submitted successfully!', 'success');
        await fetchInitialData();
    } catch (error) {
        showNotification(error instanceof Error ? error.message : 'Failed to submit reimbursement.', 'error');
    } finally {
        setIsActionLoading(false);
    }
  };

  const handleLeaveSubmit = async (startDate: string, endDate: string, leaveType: LeaveType, reason: string) => {
    setIsLeaveFormOpen(false);
    setIsActionLoading(true);
    try {
        await odooService.submitLeaveApplication(user.employee_id, startDate, endDate, leaveType, reason);
        showNotification('Leave application submitted successfully!', 'success');
        await fetchInitialData();
    } catch (error) {
        showNotification(error instanceof Error ? error.message : 'Failed to submit leave application.', 'error');
    } finally {
        setIsActionLoading(false);
    }
  };
  
  const handleOvertimeSubmit = async (date: string, hours: number, reason: string) => {
    setIsOvertimeFormOpen(false);
    setIsActionLoading(true);
    try {
        await odooService.submitOvertimeApplication(user.employee_id, date, hours, reason);
        showNotification('Overtime application submitted successfully!', 'success');
        await fetchInitialData();
    } catch (error) {
        showNotification(error instanceof Error ? error.message : 'Failed to submit overtime application.', 'error');
    } finally {
        setIsActionLoading(false);
    }
  };
  
  const openCorrectionForm = (attendance: Attendance) => {
    setCorrectionTarget(attendance);
    setIsCorrectionFormOpen(true);
  };

  const formatDateTime = (isoString: string | null | undefined) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleString();
  };
  
  const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
  }

  const formatHours = (hours: number) => {
    if (hours === undefined || hours === null) return 'N/A';
    return `${hours.toFixed(2)} hrs`;
  }
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }

  const getStatusBadge = (status: ReimbursementStatus | LeaveStatus | OvertimeStatus | CorrectionStatus) => {
      const baseClasses = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full";
      switch(status) {
          case ReimbursementStatus.APPROVED:
          case LeaveStatus.APPROVED:
          case OvertimeStatus.APPROVED:
          case CorrectionStatus.APPROVED:
              return `${baseClasses} bg-green-100 text-green-800`;
          case ReimbursementStatus.REJECTED:
          case LeaveStatus.REJECTED:
          case OvertimeStatus.REJECTED:
          case CorrectionStatus.REJECTED:
              return `${baseClasses} bg-red-100 text-red-800`;
          case ReimbursementStatus.PENDING:
          case LeaveStatus.PENDING:
          case OvertimeStatus.PENDING:
          case CorrectionStatus.PENDING:
          default:
              return `${baseClasses} bg-yellow-100 text-yellow-800`;
      }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Spinner />
        <span className="ml-4 text-gray-500">Loading your dashboard...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      {isCameraOpen && (
        <LivenessCamera
          onCapture={handleAttendanceAction}
          onCancel={() => setIsCameraOpen(false)}
        />
      )}
      {isReimbursementFormOpen && (
        <ReimbursementScreen
            onSubmit={handleReimbursementSubmit}
            onCancel={() => setIsReimbursementFormOpen(false)}
        />
      )}
      {isLeaveFormOpen && (
        <LeaveApplicationScreen
            onSubmit={handleLeaveSubmit}
            onCancel={() => setIsLeaveFormOpen(false)}
        />
      )}
      {isOvertimeFormOpen && (
        <OvertimeScreen
            onSubmit={handleOvertimeSubmit}
            onCancel={() => setIsOvertimeFormOpen(false)}
        />
      )}
      {isCorrectionFormOpen && correctionTarget && (
        <AttendanceCorrectionScreen
            attendanceRecord={correctionTarget}
            onSubmit={handleCorrectionSubmit}
            onCancel={() => setIsCorrectionFormOpen(false)}
        />
      )}
      {isPayslipScreenOpen && (
        <PayslipScreen
            payslips={payslipHistory}
            onCancel={() => setIsPayslipScreenOpen(false)}
        />
      )}
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.name}!</h1>
                <p className="text-md text-gray-600">{user.email}</p>
              </div>
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 text-indigo-600">
                <UserIcon />
              </div>
            </div>
          </Card>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Action Card */}
          <div className="lg:col-span-1 space-y-8">
            <Card className="flex flex-col items-center text-center">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 ${attendanceState.isCheckedIn ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                <ClockIcon className="w-12 h-12"/>
              </div>
              <h2 className="text-xl font-bold mb-1">{attendanceState.isCheckedIn ? 'You are Checked In' : 'You are Checked Out'}</h2>
              {attendanceState.isCheckedIn && attendanceState.lastCheckIn && (
                <p className="text-sm text-gray-500 mb-4">
                  Since: {formatDateTime(attendanceState.lastCheckIn)}
                </p>
              )}
              
              {locationForConfirmation ? (
                <div className="w-full animate-fade-in">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Your Location:</h3>
                    <div className="flex items-start text-left p-3 bg-gray-50 rounded-lg mb-4">
                        <LocationIcon className="h-5 w-5 text-gray-500 mr-2 mt-1 flex-shrink-0" />
                        <p className="text-sm text-gray-600">{locationForConfirmation.address}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <Button onClick={() => setLocationForConfirmation(null)} className="w-full justify-center bg-gray-500 hover:bg-gray-600 focus:ring-gray-400">Cancel</Button>
                        <Button onClick={() => setIsCameraOpen(true)} className="w-full justify-center">Confirm</Button>
                    </div>
                </div>
              ) : (
                <Button 
                  onClick={handleInitiateAttendanceAction} 
                  disabled={isActionLoading}
                  className={`w-full justify-center ${attendanceState.isCheckedIn ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'}`}
                >
                  {isActionLoading ? <Spinner/> : (
                    <>
                      <CameraIcon className="mr-2 h-5 w-5"/>
                      {attendanceState.isCheckedIn ? 'Check Out' : 'Check In'}
                    </>
                  )}
                </Button>
              )}
            </Card>

            <Card className="space-y-4">
                <Button onClick={() => setIsReimbursementFormOpen(true)} className="w-full justify-center" disabled={isActionLoading}>
                    <PlusIcon className="mr-2 h-5 w-5"/>
                    New Reimbursement
                </Button>
                 <Button onClick={() => setIsLeaveFormOpen(true)} className="w-full justify-center bg-teal-600 hover:bg-teal-700 focus:ring-teal-500" disabled={isActionLoading}>
                    <LeaveIcon className="mr-2 h-5 w-5"/>
                    Request Leave
                </Button>
                <Button onClick={() => setIsOvertimeFormOpen(true)} className="w-full justify-center bg-orange-600 hover:bg-orange-700 focus:ring-orange-500" disabled={isActionLoading}>
                    <OvertimeIcon className="mr-2 h-5 w-5"/>
                    Request Overtime
                </Button>
                <Button onClick={() => setIsPayslipScreenOpen(true)} className="w-full justify-center bg-blue-600 hover:bg-blue-700 focus:ring-blue-500" disabled={isActionLoading}>
                    <PayslipIcon className="mr-2 h-5 w-5"/>
                    View Payslips
                </Button>
            </Card>

          </div>

          {/* Right Column: Histories */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <div className="flex items-center mb-4">
                <HistoryIcon className="h-6 w-6 text-gray-500 mr-3" />
                <h2 className="text-xl font-bold text-gray-900">Attendance History</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3">Check In</th>
                      <th scope="col" className="px-6 py-3">Check Out</th>
                      <th scope="col" className="px-6 py-3">Hours</th>
                      <th scope="col" className="px-6 py-3">Status</th>
                      <th scope="col" className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceHistory.length > 0 ? attendanceHistory.map((att) => (
                      <tr key={att.id} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{formatDateTime(att.check_in)}</td>
                        <td className="px-6 py-4">{formatDateTime(att.check_out)}</td>
                        <td className="px-6 py-4">{formatHours(att.worked_hours)}</td>
                        <td className="px-6 py-4">
                            {att.correctionStatus ? <span className={getStatusBadge(att.correctionStatus)}>{att.correctionStatus}</span> : '—'}
                        </td>
                        <td className="px-6 py-4">
                            <button onClick={() => openCorrectionForm(att)} disabled={!!att.correctionStatus} className="font-medium text-indigo-600 hover:text-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed">
                                <EditIcon className="h-5 w-5"/>
                            </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-gray-500">No attendance records found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
            
             <Card>
              <div className="flex items-center mb-4">
                <OvertimeIcon className="h-6 w-6 text-gray-500 mr-3" />
                <h2 className="text-xl font-bold text-gray-900">Overtime History</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3">Date</th>
                      <th scope="col" className="px-6 py-3">Hours</th>
                      <th scope="col" className="px-6 py-3">Reason</th>
                      <th scope="col" className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overtimeHistory.length > 0 ? overtimeHistory.map((ot) => (
                      <tr key={ot.id} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{formatDate(ot.date)}</td>
                        <td className="px-6 py-4">{ot.hours}</td>
                        <td className="px-6 py-4">{ot.reason}</td>
                        <td className="px-6 py-4"><span className={getStatusBadge(ot.status)}>{ot.status}</span></td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="text-center py-8 text-gray-500">No overtime records found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card>
              <div className="flex items-center mb-4">
                <LeaveIcon className="h-6 w-6 text-gray-500 mr-3" />
                <h2 className="text-xl font-bold text-gray-900">Leave Application History</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3">From</th>
                      <th scope="col" className="px-6 py-3">To</th>
                      <th scope="col" className="px-6 py-3">Type</th>
                      <th scope="col" className="px-6 py-3">Reason</th>
                      <th scope="col" className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaveHistory.length > 0 ? leaveHistory.map((leave) => (
                      <tr key={leave.id} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{formatDate(leave.startDate)}</td>
                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{formatDate(leave.endDate)}</td>
                        <td className="px-6 py-4">{leave.leaveType}</td>
                        <td className="px-6 py-4">{leave.reason}</td>
                        <td className="px-6 py-4"><span className={getStatusBadge(leave.status)}>{leave.status}</span></td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-gray-500">No leave applications found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card>
              <div className="flex items-center mb-4">
                <ReimbursementIcon className="h-6 w-6 text-gray-500 mr-3" />
                <h2 className="text-xl font-bold text-gray-900">Reimbursement History</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3">Date</th>
                      <th scope="col" className="px-6 py-3">Description</th>
                      <th scope="col" className="px-6 py-3">Amount</th>
                      <th scope="col" className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reimbursementHistory.length > 0 ? reimbursementHistory.map((reim) => (
                      <tr key={reim.id} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{new Date(reim.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4">{reim.description}</td>
                        <td className="px-6 py-4">{formatCurrency(reim.amount)}</td>
                        <td className="px-6 py-4"><span className={getStatusBadge(reim.status)}>{reim.status}</span></td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="text-center py-8 text-gray-500">No reimbursement records found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

          </div>
        </main>
      </div>
    </div>
  );
};

export default HomeScreen;