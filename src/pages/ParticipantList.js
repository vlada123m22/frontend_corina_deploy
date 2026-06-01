import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { downloadParticipantsExcel } from '../utils/downloadParticipantsExcel';
import { dashboardAPI } from '../services/apiClient';

export default function ParticipantList() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [noTeam, setNoTeam] = useState([]);
  const [withTeam, setWithTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        setLoading(true);
        const data = await dashboardAPI.getParticipants(projectId);
        
        // Parse response based on backend structure
        const participants = data.participantsWithTeams || Array.isArray(data) ? data : [];
        
        // Separate participants by team
        const withTeamParticipants = participants.filter(p => p.team && p.team.trim() !== '');
        const noTeamParticipants = participants.filter(p => !p.team || p.team.trim() === '');
        
        setNoTeam(noTeamParticipants);
        setWithTeam(withTeamParticipants);
        setError(null);
      } catch (err) {
        console.error('Error fetching participants:', err);
        setError(err.message);
        // Fallback to mock data if fetch fails
        setNoTeam([
          { name: "Andrei Vasile", surname: "", team: "" },
          { name: "Cristina Marin", surname: "", team: "" },
        ]);
        setWithTeam([
          { name: "Anna", surname: "Popescu", team: "Quantum Builders" },
          { name: "Ion", surname: "Rusu", team: "Quantum Builders" },
          { name: "Alexandru", surname: "Munteanu", team: "Code Horizon" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [projectId]);

  const allParticipants = [...noTeam, ...withTeam];

  const handleDownloadExcel = () => {
    downloadParticipantsExcel(allParticipants, projectId);
  };

  return (
    <main className="section">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 className="title-1">Project Participants</h1>
          <button
            onClick={handleDownloadExcel}
            disabled={loading || allParticipants.length === 0}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: loading || allParticipants.length === 0 ? 'not-allowed' : 'pointer',
              opacity: loading || allParticipants.length === 0 ? 0.5 : 1,
              fontSize: '14px',
            }}
          >
            {loading ? 'Loading...' : 'Download Excel'}
          </button>
        </div>

        <div className="tabs-row">
          <button
            className="tab-btn"
            onClick={() => navigate(`/participants/${projectId}`)}
          >
            Teams
          </button>
          <button className="tab-btn active">Participants</button>
          <button
            className="tab-btn"
            onClick={() => navigate(`/create-teams/${projectId}?returnTo=list`)}
          >
            Create Teams
          </button>
        </div>

        {error && <div style={{ color: 'red', margin: '10px 0' }}>Error: {error}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>Loading participants...</div>
        ) : (
          <div className="participants-table">
            <div className="table-header">
              <div>#</div>
              <div>Name</div>
              <div>Team</div>
            </div>

            {allParticipants.map((p, index) => (
              <div
                key={index}
                className={`table-row ${!p.team ? 'no-team-row' : ''}`}
              >
                <div>{index + 1}</div>
                <div>{p.name} {p.surname}</div>
                <div className={!p.team ? 'no-team-cell' : ''}>
                  {p.team || '—'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}