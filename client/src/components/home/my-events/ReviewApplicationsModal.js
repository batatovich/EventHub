import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_EVENT_APPLICATIONS } from '@/lib/graphql/queries';
import { UPDATE_APPLICATION_STATUS } from '@/lib/graphql/mutations';
import TabButton from './TabButton';
import LoadingIndicator from '../LoadingIndicator';
import ErrorMessage from '../ErrorMessage';

export default function ReviewApplicationsModal({ eventId, onClose }) {
  const { loading, error, data, refetch } = useQuery(GET_EVENT_APPLICATIONS, {
    variables: { eventId },
  });

  const [updateApplicationStatus] = useMutation(UPDATE_APPLICATION_STATUS, {
    onCompleted: () => refetch(),
  });

  const [activeTab, setActiveTab] = useState('PENDING');

  const handleStatusChange = (applicationId, status) => {
    updateApplicationStatus({ variables: { id: applicationId, status } });
  };

  const applications = data?.eventApplications || [];
  const pendingApplications = applications.filter(app => app.status === 'PENDING');
  const acceptedApplications = applications.filter(app => app.status === 'ACCEPTED');

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Review Applications</h2>

        <div className="flex mb-2">
          <TabButton
            isActive={activeTab === 'PENDING'}
            onClick={() => setActiveTab('PENDING')}
            label="Pending"
          />
          <TabButton
            isActive={activeTab === 'ACCEPTED'}
            onClick={() => setActiveTab('ACCEPTED')}
            label="Attendants"
          />
        </div>
        {loading ? (
          <LoadingIndicator message="Loading applications..." />
        ) : error ? (
          <ErrorMessage message="Error fetching applications:" details={error.message} />
        ) : (
          <ul>
            {(activeTab === 'PENDING' ? pendingApplications : acceptedApplications).map(app => (
              <li key={app.id} className="mb-4 border-b border-gray-200 last:border-none">
                <div className="flex justify-between items-center">
                  <p className="text-lg">{app.user.email}</p>
                  {activeTab === 'PENDING' && (
                    <div className="space-x-2">
                      <button
                        onClick={() => handleStatusChange(app.id, 'ACCEPTED')}
                        className="bg-green-100 text-green-700 px-4 py-1.5 rounded border border-green-300 hover:bg-green-200 transition"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleStatusChange(app.id, 'REJECTED')}
                        className="bg-red-100 text-red-700 px-4 py-1.5 rounded border border-red-300 hover:bg-red-200 transition"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
        <button
          onClick={onClose}
          className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}
