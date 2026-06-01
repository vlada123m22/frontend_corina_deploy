import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { dashboardAPI, teamAPI } from '../services/apiClient';

export default function CreateTeams() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('view'); // 'view', 'manual', 'auto'

  // Determine return page from query params
  const queryParams = new URLSearchParams(location.search);
  const returnTo = queryParams.get('returnTo') || 'teams'; // default to teams

  const [participants, setParticipants] = useState([]);
  const [existingTeams, setExistingTeams] = useState([]);
  const [unassignedParticipants, setUnassignedParticipants] = useState([]);

  const [teamSize, setTeamSize] = useState(3);
  const [manualTeams, setManualTeams] = useState([]);
  const [selectedParticipants, setSelectedParticipants] = useState({});
  const [currentTeamBuild, setCurrentTeamBuild] = useState([]);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [participantsData, teamsData] = await Promise.all([
        dashboardAPI.getParticipants(projectId),
        dashboardAPI.getTeams(projectId),
      ]);

      setParticipants(participantsData || []);
      setExistingTeams(teamsData || []);

      // Calculate unassigned participants
      const assignedIds = new Set();
      (teamsData || []).forEach(team => {
        (team.members || []).forEach(member => {
          assignedIds.add(member.id || member.applicantId);
        });
      });

      const unassigned = (participantsData || []).filter(
        p => !assignedIds.has(p.id || p.applicantId)
      );
      setUnassignedParticipants(unassigned);
      setManualTeams([]);
      setSelectedParticipants({});
    } catch (err) {
      console.error('Error loading teams data:', err);
      setError(err.message || 'Failed to load participants and teams');
    } finally {
      setLoading(false);
    }
  };

  const toggleParticipantSelection = (participantId) => {
    setSelectedParticipants(prev => ({
      ...prev,
      [participantId]: !prev[participantId],
    }));
  };

  const addParticipantToCurrentTeam = (participantId) => {
    if (!currentTeamBuild.includes(participantId)) {
      setCurrentTeamBuild([...currentTeamBuild, participantId]);
    }
  };

  const removeParticipantFromCurrentTeam = (participantId) => {
    setCurrentTeamBuild(currentTeamBuild.filter(id => id !== participantId));
  };

  const completeTeamFormation = () => {
    if (currentTeamBuild.length === 0) {
      setError('Please select at least one participant for the team');
      return;
    }

    const newTeam = {
      id: Date.now(),
      members: currentTeamBuild.map(id => {
        const p = unassignedParticipants.find(participant => 
          (participant.id || participant.applicantId) === id
        );
        return p;
      }).filter(Boolean),
    };

    setManualTeams([...manualTeams, newTeam]);
    setCurrentTeamBuild([]);
    setError(null);
  };

  const removeTeamFromManualList = (teamId) => {
    setManualTeams(manualTeams.filter(team => team.id !== teamId));
  };

  const handleAutoCreateTeams = async () => {
    try {
      setSubmitting(true);
      setError(null);
      await dashboardAPI.autoCreateTeams(projectId);
      await loadData();
      setMode('view');
    } catch (err) {
      console.error('Error auto-creating teams:', err);
      setError(err.message || 'Failed to auto-create teams');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateManualTeams = async () => {
    try {
      setSubmitting(true);
      setError(null);

      for (const team of manualTeams) {
        await teamAPI.createTeam(projectId, {
          projectId: projectId,
          ideaTitle: `Team ${new Date().getTime()}`,
          roles: [],
          members: team.members.map(m => ({
            id: m.id || m.applicantId,
            firstName: m.firstName,
            lastName: m.lastName,
          })),
        });
      }

      await loadData();
      setMode('view');
      setManualTeams([]);
    } catch (err) {
      console.error('Error creating manual teams:', err);
      setError(err.message || 'Failed to create teams');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="section">
        <div className="container">
          <p className="loading">Loading teams data...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="section">
      <div className="container">
        <div className="teams-header">
          <h1 className="title-1">Manage Teams</h1>
          <p>Create and organize teams for your project</p>
        </div>

        {error && (
          <div className="error-message" style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#fee', borderRadius: '4px', color: '#c00' }}>
            {error}
          </div>
        )}

        {/* Existing Pre-formed Teams */}
        {existingTeams.length > 0 && (
          <div className="teams-section" style={{ marginBottom: '40px' }}>
            <h2 className="title-2">Pre-formed Teams (From Applications)</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              These teams were automatically created when participants selected each other during the application process.
            </p>
            <div className="teams-grid">
              {existingTeams.map((team, idx) => (
                <div key={team.id || idx} className="team-card" style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
                  <h3 style={{ marginTop: 0 }}>{team.ideaTitle || `Team ${idx + 1}`}</h3>
                  <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
                    {(team.members || []).map((member, midx) => (
                      <li key={midx}>
                        {member.firstName} {member.lastName}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mode Selection */}
        {mode === 'view' && (
          <div className="mode-selection">
            <div style={{ marginBottom: '30px' }}>
              <h2 className="title-2">Unassigned Participants: {unassignedParticipants.length}</h2>
              {unassignedParticipants.length > 0 ? (
                <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                  <button
                    className="btn"
                    onClick={() => setMode('manual')}
                    style={{ flex: 1 }}
                  >
                    Manually Group Participants
                  </button>
                  <button
                    className="btn"
                    onClick={() => setMode('auto')}
                    style={{ flex: 1, backgroundColor: '#4CAF50' }}
                  >
                    Auto-Create Teams
                  </button>
                </div>
              ) : (
                <p style={{ color: '#666', marginTop: '10px' }}>
                  All participants are already assigned to teams.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Manual Team Creation */}
        {mode === 'manual' && unassignedParticipants.length > 0 && (
          <div className="manual-teams-section">
            <h2 className="title-2">Manually Create Teams</h2>

            {/* Current Team Building */}
            <div className="current-team-builder" style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
              <h3 style={{ marginTop: 0 }}>Build a Team ({currentTeamBuild.length} member{currentTeamBuild.length !== 1 ? 's' : ''})</h3>
              {currentTeamBuild.length > 0 && (
                <div style={{ marginBottom: '15px' }}>
                  <p style={{ marginBottom: '10px', fontWeight: 'bold' }}>Selected Members:</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {currentTeamBuild.map(participantId => {
                      const p = unassignedParticipants.find(
                        participant => (participant.id || participant.applicantId) === participantId
                      );
                      return (
                        <div
                          key={participantId}
                          style={{
                            backgroundColor: '#e3f2fd',
                            padding: '8px 12px',
                            borderRadius: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}
                        >
                          <span>{p?.firstName} {p?.lastName}</span>
                          <button
                            onClick={() => removeParticipantFromCurrentTeam(participantId)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '18px',
                              color: '#d32f2f',
                            }}
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <button
                className="btn"
                onClick={completeTeamFormation}
                disabled={currentTeamBuild.length === 0}
                style={{
                  backgroundColor: currentTeamBuild.length === 0 ? '#ccc' : '#4CAF50',
                  marginTop: '15px',
                }}
              >
                Complete Team
              </button>
            </div>

            {/* Available Participants */}
            <div style={{ marginBottom: '30px' }}>
              <h3>Available Participants</h3>
              <div className="participants-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                {unassignedParticipants.map(participant => {
                  const id = participant.id || participant.applicantId;
                  const isInCurrentTeam = currentTeamBuild.includes(id);
                  const isInExistingTeam = manualTeams.some(team =>
                    team.members.some(m => (m.id || m.applicantId) === id)
                  );

                  if (isInExistingTeam) return null;

                  return (
                    <div
                      key={id}
                      onClick={() => addParticipantToCurrentTeam(id)}
                      style={{
                        padding: '15px',
                        border: isInCurrentTeam ? '2px solid #1976d2' : '1px solid #ddd',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        backgroundColor: isInCurrentTeam ? '#f0f8ff' : '#fff',
                        transition: 'all 0.2s',
                      }}
                    >
                      <p style={{ margin: 0, fontWeight: 'bold' }}>
                        {participant.firstName} {participant.lastName}
                      </p>
                      {participant.email && (
                        <p style={{ margin: '5px 0 0 0', fontSize: '0.9em', color: '#666' }}>
                          {participant.email}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Preview of Teams to be Created */}
            {manualTeams.length > 0 && (
              <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                <h3 style={{ marginTop: 0 }}>Teams to Create ({manualTeams.length})</h3>
                {manualTeams.map((team, idx) => (
                  <div key={team.id} style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#fff', borderRadius: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>Team {idx + 1} ({team.members.length} members)</p>
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                          {team.members.map((member, midx) => (
                            <li key={midx}>
                              {member.firstName} {member.lastName}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <button
                        onClick={() => removeTeamFromManualList(team.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '24px',
                          color: '#d32f2f',
                        }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn"
                onClick={handleCreateManualTeams}
                disabled={manualTeams.length === 0 || submitting}
                style={{ flex: 1, backgroundColor: manualTeams.length === 0 ? '#ccc' : '#4CAF50' }}
              >
                {submitting ? 'Creating...' : `Create ${manualTeams.length} Team${manualTeams.length !== 1 ? 's' : ''}`}
              </button>
              <button
                onClick={() => {
                  setMode('view');
                  setManualTeams([]);
                  setCurrentTeamBuild([]);
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Back Button */}
        {mode === 'view' && (
          <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
            <button
              onClick={() => navigate(`/participants/${projectId}${returnTo === 'list' ? '/list' : ''}`)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#666',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Back to {returnTo === 'list' ? 'Participant List' : 'Teams View'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
