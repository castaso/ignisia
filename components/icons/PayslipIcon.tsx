import React from 'react';

const PayslipIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.5h-8.021a1.125 1.125 0 01-1.125-1.125v-6.632c0-.66.54-1.125 1.209-1.125h3.604a1.125 1.125 0 011.125 1.125v6.632z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 10.5h.008v.008h-.008V10.5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12H18.75m.375 0h.375M18.375 12a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
);

export default PayslipIcon;
