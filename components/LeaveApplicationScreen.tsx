import React, { useState } from 'react';
import Button from './common/Button';
import Spinner from './common/Spinner';
import { LeaveType } from '../types';

interface LeaveApplicationScreenProps {
  onSubmit: (startDate: string, endDate: string, leaveType: LeaveType, reason: string) => void;
  onCancel: () => void;
}

const LeaveApplicationScreen: React.FC<LeaveApplicationScreenProps> = ({ onSubmit, onCancel }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [leaveType, setLeaveType] = useState<LeaveType>(LeaveType.ANNUAL);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason || !leaveType) {
        setError('All fields are required.');
        return;
    }
    if (new Date(endDate) < new Date(startDate)) {
        setError('End date cannot be before the start date.');
        return;
    }
    setError(null);
    setIsSubmitting(true);
    // The parent component will handle the async logic and closing the modal
    onSubmit(startDate, endDate, leaveType, reason);
  };
  
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md transform transition-all">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Request Leave</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">Start Date</label>
                  <input
                    type="date"
                    name="start-date"
                    id="start-date"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={today}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">End Date</label>
                  <input
                    type="date"
                    name="end-date"
                    id="end-date"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || today}
                    required
                  />
                </div>
              </div>
               <div>
                  <label htmlFor="leave-type" className="block text-sm font-medium text-gray-700">Leave Type</label>
                  <select
                    id="leave-type"
                    name="leave-type"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                    required
                  >
                    <option>{LeaveType.ANNUAL}</option>
                    <option>{LeaveType.SICK}</option>
                  </select>
                </div>
              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason</label>
                <textarea
                  name="reason"
                  id="reason"
                  rows={4}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="e.g., Family vacation, Personal appointment"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-sm text-red-600 text-center">{error}</p>}
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3 rounded-b-2xl">
            <Button type="button" onClick={onCancel} className="bg-white !text-gray-700 border border-gray-300 hover:bg-gray-50" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !startDate || !endDate || !reason}>
              {isSubmitting ? <Spinner /> : 'Submit Request'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeaveApplicationScreen;