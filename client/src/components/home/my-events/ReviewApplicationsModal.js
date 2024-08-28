import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_EVENT_APPLICATIONS } from '@/lib/graphql/queries';
import { UPDATE_APPLICATION_STATUS } from '@/lib/graphql/mutations';

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
  const otherApplications = applications.filter(app => app.status !== 'PENDING');

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Review Applications</h2>

        <div className="flex mb-4 space-x-2">
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`flex-1 py-2 text-center rounded-lg transition ${activeTab === 'PENDING' ? 'bg-blue-200 text-blue-900' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Pending
          </button>
          <button
            onClick={() => setActiveTab('OTHERS')}
            className={`flex-1 py-2 text-center rounded-lg transition ${activeTab === 'OTHERS' ? 'bg-blue-200 text-blue-900' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Accepted/Rejected
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <p className="text-lg font-medium text-blue-600 animate-pulse">
              Loading...
            </p>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-48">
            <p className="text-lg font-medium text-red-600">
              Error fetching applications: {error.message}
            </p>
          </div>
        ) : (
          <ul>
            {(activeTab === 'PENDING' ? pendingApplications : otherApplications).map(app => (
              <li key={app.id} className="mb-4">
                <div className="flex justify-between items-center">
                  <p className="text-lg">{app.user.email}</p>
                  <div className="space-x-2">
                    {activeTab === 'PENDING' && (
                      <>
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
                      </>
                    )}
                    {activeTab === 'OTHERS' && (
                      <span
                        className={`px-4 py-1.5 rounded border ${app.status === 'ACCEPTED'
                          ? 'bg-green-50 text-green-600 border-green-300'
                          : 'bg-red-50 text-red-600 border-red-300'
                          }`}
                      >
                        {app.status}
                      </span>
                    )}
                  </div>
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
