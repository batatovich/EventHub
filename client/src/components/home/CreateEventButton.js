'use client';

import React, { useState } from 'react';
//import CreateEventModal from '@/components/createEventModal';
import Button from './Button';

export default function CreateEventButton({ refetch }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <Button
        text="Create Event"
        color="bg-blue-500 hover:bg-blue-600"
        onClick={openModal}
      />
    </>
  );
}
