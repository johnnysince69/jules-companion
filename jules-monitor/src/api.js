const API_BASE_URL = 'https://jules.googleapis.com/v1alpha';

export const getSessions = async (apiKey) => {
  const response = await fetch(`${API_BASE_URL}/sessions?pageSize=10`, {
    method: 'GET',
    headers: {
      'x-goog-api-key': apiKey,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch sessions: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

export const getSessionActivities = async (apiKey, sessionId) => {
  const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/activities?pageSize=30`, {
    method: 'GET',
    headers: {
      'x-goog-api-key': apiKey,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch activities: ${response.status} ${response.statusText}`);
  }

  return response.json();
};
