import React, { useState, useMemo } from 'react';
import Button from './common/Button';
import Spinner from './common/Spinner';
import { Attendance } from '../types';

interface AttendanceCorrectionScreenProps {
  attendanceRecord: Attendance;
  onSubmit: (attendanceId: number, correctedCheckIn: string, correctedCheckOut: string | null, reason: string) => void;
  onCancel: () => void;
}

const AttendanceCorrectionScreen: React.FC<AttendanceCorrectionScreenProps> = ({ attendanceRecord, onSubmit, onCancel }) => {
  const formatForInput = (isoString: string | null) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    // Adjust for timezone offset to display local time in the input
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - timezoneOffset);
    return localDate.toISOString().slice(0, 16);
  };
  
  const [correctedCheckIn, setCorrectedCheckIn] = useState(formatForInput(attendanceRecord.check_in));
  const [correctedCheckOut, setCorrectedCheckOut] = useState(formatForInput(attendanceRecord.check_out));
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctedCheckIn || !reason) {
        setError('Corrected Check-In time and reason are required.');
        return;
    }
    
    const checkInDate = new Date(correctedCheckIn);
    const checkOutDate = correctedCheckOut ? new Date(correctedCheckOut) : null;

    if (checkOutDate && checkOutDate < checkInDate) {
        setError('Corrected Check-Out time cannot be before Check-In time.');
        return;
    }

    setError(null);
    setIsSubmitting(true);
    
    // Convert local input time back to ISO string (UTC)
    const checkInISO = checkInDate.toISOString();
    const checkOutISO = checkOutDate ? checkOutDate.toISOString() : null;

    onSubmit(attendanceRecord.id, checkInISO, checkOutISO, reason);
  };
  
  const originalTimes = useMemo(() => {
    return {
        checkIn: new Date(attendanceRecord.check_in).toLocaleString(),
        checkOut: attendanceRecord.check_out ? new Date(attendanceRecord.check_out).toLocaleString() : 'N/A'
    }
  }, [attendanceRecord]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg transform transition-all">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Attendance Correction</h2>
            <p className="text-sm text-gray-500 mb-6">You are editing the record for a check-in on {new Date(attendanceRecord.check_in).toLocaleDateString()}.</p>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="corrected-check-in" className="block text-sm font-medium text-gray-700">Corrected Check-In</label>
                  <input
                    type="datetime-local"
                    id="corrected-check-in"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={correctedCheckIn}
                    onChange={(e) => setCorrectedCheckIn(e.target.value)}
                    required
                  />
                   <p className="mt-1 text-xs text-gray-500">Original: {originalTimes.checkIn}</p>
                </div>
                <div>
                  <label htmlFor="corrected-check-out" className="block text-sm font-medium text-gray-700">Corrected Check-Out</label>
                  <input
                    type="datetime-local"
                    id="corrected-check-out"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={correctedCheckOut}
                    onChange={(e) => setCorrectedCheckOut(e.target.value)}
                    min={correctedCheckIn}
                  />
                   <p className="mt-1 text-xs text-gray-500">Original: {originalTimes.checkOut}</p>
                </div>
              </div>
              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason for Correction</label>
                <textarea
                  id="reason"
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="e.g., Forgot to check out, incorrect check-in time."
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
            <Button type="submit" disabled={isSubmitting || !reason}>
              {isSubmitting ? <Spinner /> : 'Submit Correction'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AttendanceCorrectionScreen;