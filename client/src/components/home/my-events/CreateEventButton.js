'use client';

import React, { useState } from 'react';
import { useTranslations } from '@/lib/hooks/useTranslations';
import LoadingIndicator from '@/components/home/LoadingIndicator';
import CreateEventModal from '@/components/home/my-events/CreateEventModal';

const CreateEventButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const translations = useTranslations('home/my-events');
  
  if (!translations) {
    return <LoadingIndicator />;
  }
  
  return (
    <>
      <button
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        onClick={openModal}
      >
        {translations.createEvent}
      </button>
      {isModalOpen && <CreateEventModal onClose={closeModal} />}
    </>
  );
};

export default CreateEventButton;