'use client';

import React, { useState } from 'react';
import { useTranslations } from '@/lib/hooks/useTranslations';
import LoadingIndicator from '@/components/home/LoadingIndicator';
import CreateEventModal from '@/components/home/my-events/CreateEventModal';

const CreateEventButton = () => {
  const translations = useTranslations('home/my-events');

  const [isModalOpen, setIsModalOpen] = useState(false);
  
  if (!translations) {
    return <LoadingIndicator />;
  }
  
  return (
    <>
      <button
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        onClick={() => setIsModalOpen(true)}
      >
        {translations.createEvent}
      </button>
      {isModalOpen && <CreateEventModal onClose={() => setIsModalOpen(false)} />}
    </>
  );
};

export default CreateEventButton;