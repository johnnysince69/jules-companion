import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { getSessions, getSessionActivities } from '../api';

const COLORS = {
  background: '#0b1326',
  surface: '#131b2e',
  surfaceHigh: '#222a3d',
  text: '#dae2fd',
  textMuted: '#8b90a0',
  primary: '#007aff', // Changed to match design request accent #007aff, original design system primary #adc6ff
  secondary: '#4edea3',
  tertiary: '#ffb95f',
  error: '#ffb4ab',
  border: '#414755',
};

export default function Dashboard() {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [activities, setActivities] = useState([]);

  const fetchData = async () => {
    if (!apiKey) {
      setError('Please enter your Jules API Key.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const sessionsData = await getSessions(apiKey);
      if (sessionsData.sessions && sessionsData.sessions.length > 0) {
        // Assume the first session is the most recent/active one
        const latestSession = sessionsData.sessions[0];
        setActiveSession(latestSession);

        // Fetch activities for the latest session
        // Extract session ID from the name (e.g., "sessions/123")
        const sessionId = latestSession.name.split('/')[1];
        const activitiesData = await getSessionActivities(apiKey, sessionId);

        // Ensure activities is always an array
        setActivities(activitiesData.activities || []);
      } else {
        setActiveSession(null);
        setActivities([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Optionally auto-fetch if API key is stored, but for now we require manual input/fetch
  }, []);

  const renderActivityItem = ({ item, index }) => {
    // Determine activity title based on type (simplified)
    let title = 'Activity';
    if (item.planGenerated) title = 'Plan generated';
    else if (item.planApproved) title = 'Plan approved';
    else if (item.userMessaged) title = 'User message received';
    else if (item.agentMessaged) title = 'Agent message sent';
    else if (item.progressUpdated) title = item.progressUpdated.title || 'Progress updated';
    else if (item.sessionCompleted) title = 'Session completed';
    else if (item.sessionFailed) title = 'Session failed';
    else if (item.description) title = item.description;

    // Simplified time formatting
    const timeString = new Date(item.createTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <View style={styles.activityItemContainer}>
        <View style={styles.timelineContainer}>
          <View style={styles.timelineDot} />
          {index !== activities.length - 1 && <View style={styles.timelineLine} />}
        </View>
        <View style={styles.activityCard}>
           <View style={styles.activityHeader}>
            <Text style={styles.activityTitle}>{title}</Text>
            <Text style={styles.activityTime}>{timeString}</Text>
          </View>
          {item.description && title !== item.description && (
             <Text style={styles.activityDescription}>{item.description}</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>JULES MONITOR</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter Jules API Key"
            placeholderTextColor={COLORS.textMuted}
            value={apiKey}
            onChangeText={setApiKey}
            secureTextEntry
          />
          <TouchableOpacity style={styles.button} onPress={fetchData} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Syncing...' : 'Monitor'}</Text>
          </TouchableOpacity>
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
        ) : activeSession ? (
          <>
            <View style={styles.statusCard}>
              <View style={styles.statusHeader}>
                <View style={styles.statusIndicatorContainer}>
                   <View style={[styles.statusIndicator, activeSession.state === 'IN_PROGRESS' || activeSession.state === 'PLANNING' ? styles.statusActive : {}]} />
                   <Text style={styles.statusText}>
                     {activeSession.state === 'IN_PROGRESS' ? 'Working on task' :
                      activeSession.state === 'PLANNING' ? 'Planning' :
                      activeSession.state === 'QUEUED' ? 'Queued' :
                      activeSession.state === 'COMPLETED' ? 'Completed' :
                      activeSession.state === 'FAILED' ? 'Failed' : 'Status unknown'}
                   </Text>
                </View>
              </View>
              <Text style={styles.activeTaskTitle} numberOfLines={2}>
                {activeSession.title || activeSession.prompt || 'Unknown Task'}
              </Text>
            </View>

            <Text style={styles.sectionTitle}>RECENT ACTIVITY</Text>
            {activities.length > 0 ? (
                <FlatList
                data={activities}
                keyExtractor={(item) => item.id || item.name}
                renderItem={renderActivityItem}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                />
            ) : (
                <Text style={styles.emptyText}>No recent activity found.</Text>
            )}
          </>
        ) : (
          !loading && apiKey ? <Text style={styles.emptyText}>No active sessions found.</Text> : null
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'monospace', // Fallback for JetBrains Mono
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    padding: 12,
    color: COLORS.text,
    fontFamily: 'monospace',
    marginRight: 8,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  errorText: {
    color: COLORS.error,
    marginBottom: 16,
    fontFamily: 'monospace',
  },
  loader: {
    marginTop: 40,
  },
  statusCard: {
    backgroundColor: COLORS.surfaceHigh,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textMuted,
    marginRight: 8,
  },
  statusActive: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  statusText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
  },
  activeTaskTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: 'monospace',
    letterSpacing: 1,
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  activityItemContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineContainer: {
    width: 24,
    alignItems: 'center',
    marginRight: 8,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginTop: 6,
  },
  timelineLine: {
    width: 1,
    flex: 1,
    backgroundColor: COLORS.border,
    marginTop: 4,
    marginBottom: -16, // Connect to next item
  },
  activityCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  activityTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  activityTime: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontFamily: 'monospace',
  },
  activityDescription: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  emptyText: {
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'monospace',
  },
});
