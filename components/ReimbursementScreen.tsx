import React, { useState, useRef } from 'react';
import Button from './common/Button';
import Spinner from './common/Spinner';
import UploadIcon from './icons/UploadIcon';
import ReceiptCamera from './ReceiptCamera'; // Import the new camera component
import CameraIcon from './icons/CameraIcon'; // Import camera icon

interface ReimbursementScreenProps {
  onSubmit: (amount: number, description: string, receiptImageUrl: string) => void;
  onCancel: () => void;
}

// Helper function to convert a data URL to a File object
const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) {
        throw new Error('Invalid data URL');
    }
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}


const ReimbursementScreen: React.FC<ReimbursementScreenProps> = ({ onSubmit, onCancel }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReceiptCameraOpen, setIsReceiptCameraOpen] = useState(false); // State for camera modal
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setError('File is too large. Maximum size is 2MB.');
        return;
      }
      setError(null);
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (imageDataUrl: string) => {
    setIsReceiptCameraOpen(false);
    setReceiptPreview(imageDataUrl);
    try {
        const file = dataURLtoFile(imageDataUrl, `receipt-${Date.now()}.jpg`);
        setReceiptFile(file);
        setError(null);
    } catch (err) {
        setError('Could not process captured image.');
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !receiptFile) {
        setError('All fields including a receipt are required.');
        return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
        const receiptImageUrl = await fileToBase64(receiptFile);
        onSubmit(parseFloat(amount), description, receiptImageUrl);
    } catch (err) {
        setError('Failed to process receipt image.');
        setIsSubmitting(false);
    }
  };

  return (
    <>
      {isReceiptCameraOpen && (
        <ReceiptCamera
          onCapture={handleCameraCapture}
          onCancel={() => setIsReceiptCameraOpen(false)}
        />
      )}
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md transform transition-all">
          <form onSubmit={handleSubmit}>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">New Reimbursement</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount (USD)</label>
                  <input
                    type="number"
                    name="amount"
                    id="amount"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    id="description"
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="e.g., Client lunch meeting"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Receipt</label>
                   <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                            {receiptPreview ? (
                                <img src={receiptPreview} alt="Receipt Preview" className="mx-auto h-24 max-h-24 w-auto rounded-md" />
                            ) : (
                                <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                            )}
                            <p className="text-sm text-gray-600">{receiptFile ? receiptFile.name : 'No receipt selected'}</p>
                             <p className="text-xs text-gray-500">PNG, JPG, GIF up to 2MB</p>
                        </div>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                        <Button type="button" onClick={() => fileInputRef.current?.click()} className="!text-sm !py-2 w-full justify-center bg-white !text-gray-700 border border-gray-300 hover:bg-gray-50">
                            Select File
                        </Button>
                        <Button type="button" onClick={() => setIsReceiptCameraOpen(true)} className="!text-sm !py-2 w-full justify-center bg-white !text-gray-700 border border-gray-300 hover:bg-gray-50">
                           <CameraIcon className="mr-2 h-4 w-4"/> Use Camera
                        </Button>
                    </div>

                  <input
                    ref={fileInputRef}
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept="image/png, image/jpeg, image/gif"
                    onChange={handleFileChange}
                  />
                </div>
                {error && <p className="text-sm text-red-600 text-center">{error}</p>}
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3 rounded-b-2xl">
              <Button type="button" onClick={onCancel} className="bg-white !text-gray-700 border border-gray-300 hover:bg-gray-50" disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !amount || !description || !receiptFile}>
                {isSubmitting ? <Spinner /> : 'Submit'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ReimbursementScreen;