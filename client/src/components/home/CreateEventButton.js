'use client';

import React, { useState } from 'react';
import CreateEventModal from '@/components/home/CreateEventModal';

const CreateEventButton = ({ refetch }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <button
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        onClick={openModal}
      >
        Create Event
      </button>
      {isModalOpen && <CreateEventModal onClose={closeModal} refetch={refetch} />}
    </>
  );
};

export default CreateEventButton;