// ui/canvasEditor/SharingModal.tsx
import React, { useState } from 'react';
import Modal from '@/ui/Modal/Modal';

interface SharingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (emails: string[]) => void;
}

const SharingModal: React.FC<SharingModalProps> = ({
  isOpen,
  onClose,
  onShare
}) => {
  const [emails, setEmails] = useState<string[]>([]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const emailList = value.split(',').map((email) => email.trim());
    setEmails(emailList);
  };

  const handleShare = () => {
    onShare(emails);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share Canvas"
      onSubmit={handleShare}
    >
      <div>
        <label htmlFor="emails" className="block mb-2 font-bold">
          Enter email addresses (comma-separated):
        </label>
        <input
          type="text"
          id="emails"
          onChange={handleEmailChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div className="mt-4">
        <button
          onClick={handleShare}
          className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
        >
          Share
        </button>
      </div>
    </Modal>
  );
};

export default SharingModal;
