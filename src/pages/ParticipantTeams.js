import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { downloadParticipantsExcel } from '../utils/downloadParticipantsExcel';
import { dashboardAPI } from '../services/apiClient';

export default function ParticipantTeams() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [teams, setTeams] = useState([]);
  const [noTeamParticipants, setNoTeamParticipants] = useState([]);
  const [allParticipantsData, setAllParticipantsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        setLoading(true);
        const data = await dashboardAPI.getParticipants(projectId);
        
        // Parse response based on backend structure
        const participants = data.participantsWithTeams || Array.isArray(data) ? data : [];
        
        // Group participants by team
        const teamsMap = {};
        const noTeam = [];
        
        participants.forEach(p => {
          if (p.team && p.team.trim() !== '') {
            if (!teamsMap[p.team]) {
              teamsMap[p.team] = [];
            }
            teamsMap[p.team].push(`${p.name}${p.surname ? ' ' + p.surname : ''}`);
          } else {
            noTeam.push(p.name);
          }
        });
        
        // Convert to team format
        const formattedTeams = Object.entries(teamsMap).map((entry, idx) => ({
          id: idx + 1,
          name: entry[0],
          members: entry[1],
        }));
        
        setTeams(formattedTeams);
        setNoTeamParticipants(noTeam);
        setAllParticipantsData(participants);
        setError(null);
      } catch (err) {
        console.error('Error fetching participants:', err);
        setError(err.message);
        // Fallback to mock data
        setTeams([
          { id: 1, name: "Quantum Builders", members: ["Anna Popescu", "Ion Rusu", "Maria Ionescu"] },
          { id: 2, name: "Code Horizon", members: ["Alexandru Munteanu", "Elena Dumitru"] },
        ]);
        setNoTeamParticipants([
          "Andrei Vasile",
          "Cristina Marin",
          "Mihai Popa",
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [projectId]);

  const handleDownloadExcel = () => {
    if (allParticipantsData.length === 0) {
      alert('No participants to download');
      return;
    }
    downloadParticipantsExcel(allParticipantsData, projectId);
  };

  return (
    <main className="section">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 className="title-1">Project Participants</h1>
          <button
            onClick={handleDownloadExcel}
            disabled={loading || allParticipantsData.length === 0}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: loading || allParticipantsData.length === 0 ? 'not-allowed' : 'pointer',
              opacity: loading || allParticipantsData.length === 0 ? 0.5 : 1,
              fontSize: '14px',
            }}
          >
            {loading ? 'Loading...' : 'Download Excel'}
          </button>
        </div>

        <div className="tabs-row">
          <button className="tab-btn active">Teams</button>
          <button
            className="tab-btn"
            onClick={() => navigate(`/participants/${projectId}/list`)}
          >
            Participants
          </button>
          <button
            className="tab-btn"
            onClick={() => navigate(`/create-teams/${projectId}?returnTo=teams`)}
          >
            Create Teams
          </button>
        </div>

        {error && <div style={{ color: 'red', margin: '10px 0' }}>Error: {error}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>Loading participants...</div>
        ) : (
          <div className="teams-grid">
            {teams.map((team, index) => (
              <div key={team.id} className="team-card">
                <div className="team-number">#{index + 1}</div>
                <h3 className="team-name">{team.name}</h3>
                <div className="team-members">
                  {team.members.map((member, i) => (
                    <div key={i} className="team-member">{member}</div>
                  ))}
                </div>
              </div>
            ))}

            <div className="team-card no-team">
              <div className="team-name no-team-title">Participants without team</div>
              <div className="team-members">
                {noTeamParticipants.map((p, i) => (
                  <div key={i} className="team-member no-team-member">{p}</div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}