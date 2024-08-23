'use client';

import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_EVENT } from '@/lib/graphql/mutations';
import { CreateEventSchema } from '@/lib/validation-schemas';
import FormInput from '@/components/home/EventFormInput';

const CreateEventModal = ({ onClose, refetch }) => {
    const [validationErrors, setValidationErrors] = useState({});
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        location: '',
        date: '',
        capacity: '',
        fee: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [createEvent, { loading, error }] = useMutation(CREATE_EVENT, {
        onCompleted: () => {
            setIsSubmitting(false);
            onClose();
            refetch();
        },
        onError: (err) => {
            setIsSubmitting(false);
            console.error('Error creating event:', err);
        },
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await validateForm(formData);
            setIsSubmitting(true);
            await createEvent({
                variables: {
                    ...formData,
                    date: new Date(formData.date).toISOString(),
                    capacity: parseInt(formData.capacity, 10),
                    fee: parseFloat(formData.fee),
                },
            });
        } catch (validationError) {
            handleValidationErrors(validationError);
        }
    };

    const validateForm = async (data) => {
        await CreateEventSchema.validate(data, { abortEarly: false });
    };

    const handleValidationErrors = (validationError) => {
        if (validationError.name === 'ValidationError') {
            const formattedErrors = validationError.inner.reduce((acc, err) => {
                acc[err.path] = err.message;
                return acc;
            }, {});
            setValidationErrors(formattedErrors);
        } else {
            console.error('Unexpected error during validation:', validationError);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative">
                <h2 className="text-xl font-bold mb-4">Create Event</h2>
                <form onSubmit={handleSubmit}>
                    <FormInput
                        label="Name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        error={validationErrors.name}
                        required
                    />
                    <FormInput
                        label="Description"
                        type="text"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        error={validationErrors.description}
                        required
                    />
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <FormInput
                            label="Location"
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            error={validationErrors.location}
                            required
                        />
                        <FormInput
                            label="Date"
                            type="datetime-local"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            error={validationErrors.date}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <FormInput
                            label="Capacity"
                            type="number"
                            name="capacity"
                            value={formData.capacity}
                            onChange={handleChange}
                            error={validationErrors.capacity}
                            required
                        />
                        <FormInput
                            label="Fee"
                            type="number"
                            step="0.01"
                            name="fee"
                            value={formData.fee}
                            onChange={handleChange}
                            error={validationErrors.fee}
                            required
                        />
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-slate-100 hover:bg-slate-200 mr-2 px-4 py-2 rounded border"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:bg-slate-600"
                            disabled={loading || isSubmitting}
                        >
                            {isSubmitting ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </form>
                {error && <p className="text-red-500 mt-2">Error creating event: {error.message}</p>}
            </div>
        </div>
    );
};

export default CreateEventModal;
