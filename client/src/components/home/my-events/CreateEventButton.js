'use client';

import React, { useState } from 'react';
import CreateEventModal from '@/components/home/my-events/CreateEventModal';
import { getUserLangFromCookie } from '@/lib/helpers/getUserLang';

const CreateEventButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const userLang = getUserLangFromCookie();
  const translations = require(`@/locales/${userLang}/home/my-events`).default;

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