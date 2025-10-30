import React, { useState } from 'react';
import Button from './common/Button';
import Spinner from './common/Spinner';

interface OvertimeScreenProps {
  onSubmit: (date: string, hours: number, reason: string) => void;
  onCancel: () => void;
}

const OvertimeScreen: React.FC<OvertimeScreenProps> = ({ onSubmit, onCancel }) => {
  const [date, setDate] = useState('');
  const [hours, setHours] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !hours || !reason) {
        setError('All fields are required.');
        return;
    }
    const numericHours = parseFloat(hours);
    if (isNaN(numericHours) || numericHours <= 0) {
        setError('Please enter a valid number of hours.');
        return;
    }
    setError(null);
    setIsSubmitting(true);
    onSubmit(date, numericHours, reason);
  };
  
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md transform transition-all">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Request Overtime</h2>
            <div className="space-y-4">
               <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    name="date"
                    id="date"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    max={today}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="hours" className="block text-sm font-medium text-gray-700">Hours</label>
                  <input
                    type="number"
                    name="hours"
                    id="hours"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="e.g., 2.5"
                    step="0.1"
                    min="0.1"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    required
                  />
                </div>
              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason</label>
                <textarea
                  name="reason"
                  id="reason"
                  rows={4}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="e.g., Urgent project deadline"
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
            <Button type="submit" disabled={isSubmitting || !date || !hours || !reason}>
              {isSubmitting ? <Spinner /> : 'Submit Request'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OvertimeScreen;