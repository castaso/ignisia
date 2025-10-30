import React, { useState } from 'react';
import { Payslip } from '../types';
import Button from './common/Button';
import PayslipIcon from './icons/PayslipIcon';

interface PayslipScreenProps {
  payslips: Payslip[];
  onCancel: () => void;
}

const PayslipScreen: React.FC<PayslipScreenProps> = ({ payslips, onCancel }) => {
  const [expandedPayslipId, setExpandedPayslipId] = useState<number | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const toggleDetails = (payslipId: number) => {
    setExpandedPayslipId(expandedPayslipId === payslipId ? null : payslipId);
  };
  
  const totalDeductions = (payslip: Payslip) => payslip.deductions.reduce((acc, d) => acc + d.amount, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl transform transition-all flex flex-col" style={{maxHeight: '90vh'}}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
             <PayslipIcon className="h-6 w-6 text-gray-500 mr-3" />
             <h2 className="text-2xl font-bold text-gray-900">Your Payslips</h2>
          </div>
        </div>
        
        <div className="p-6 space-y-4 overflow-y-auto">
          {payslips.length > 0 ? payslips.map((p) => (
            <div key={p.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div 
                    className="flex items-center justify-between p-4 cursor-pointer bg-gray-50 hover:bg-gray-100"
                    onClick={() => toggleDetails(p.id)}
                >
                    <div>
                        <p className="font-semibold text-gray-800">{p.payPeriod}</p>
                        <p className="text-sm text-gray-500">Net Pay: <span className="font-bold text-green-600">{formatCurrency(p.netPay)}</span></p>
                    </div>
                    <Button className="!py-1 !px-3 !text-sm">
                        {expandedPayslipId === p.id ? 'Hide Details' : 'View Details'}
                    </Button>
                </div>

                {expandedPayslipId === p.id && (
                    <div className="p-4 border-t border-gray-200 bg-white animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Earnings */}
                            <div>
                                <h4 className="font-semibold text-gray-700 mb-2 border-b pb-1">Earnings</h4>
                                <ul className="space-y-1 text-sm">
                                    {p.earnings.map((e, index) => (
                                        <li key={index} className="flex justify-between">
                                            <span>{e.description}</span>
                                            <span className="font-mono">{formatCurrency(e.amount)}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="flex justify-between font-bold text-sm mt-2 pt-2 border-t">
                                    <span>Gross Pay</span>
                                    <span className="font-mono">{formatCurrency(p.grossPay)}</span>
                                </div>
                            </div>
                             {/* Deductions */}
                            <div>
                                <h4 className="font-semibold text-gray-700 mb-2 border-b pb-1">Deductions</h4>
                                <ul className="space-y-1 text-sm">
                                     {p.deductions.map((d, index) => (
                                        <li key={index} className="flex justify-between">
                                            <span>{d.description}</span>
                                            <span className="font-mono text-red-600">({formatCurrency(d.amount)})</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="flex justify-between font-bold text-sm mt-2 pt-2 border-t">
                                    <span>Total Deductions</span>
                                    <span className="font-mono text-red-600">({formatCurrency(totalDeductions(p))})</span>
                                </div>
                            </div>
                        </div>
                         <div className="mt-6 pt-4 border-t-2 border-gray-300 border-dashed flex justify-between items-center">
                            <h4 className="text-lg font-bold text-gray-900">Net Pay</h4>
                            <p className="text-xl font-bold text-green-700 font-mono">{formatCurrency(p.netPay)}</p>
                        </div>
                    </div>
                )}
            </div>
          )) : (
            <p className="text-center text-gray-500 py-8">No payslip records found.</p>
          )}
        </div>
        
        <div className="bg-gray-50 px-6 py-3 flex justify-end rounded-b-2xl border-t border-gray-200">
          <Button type="button" onClick={onCancel} className="bg-white !text-gray-700 border border-gray-300 hover:bg-gray-50">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PayslipScreen;
