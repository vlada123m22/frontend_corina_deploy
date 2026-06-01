import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { applicationAPI, projectAPI } from '../services/apiClient';

export default function ApplicationForm() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [formMeta, setFormMeta] = useState(null);   // { teamsPreformed, formQuestions, roleOptions, backgroundOptions }
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    answers: [],
  });

  // Type B team state
  const [hasTeam, setHasTeam] = useState(null);              // null | 'yes' | 'no'
  const [teamName, setTeamName] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);   // null | { exists, members }
  const [teamConfirmed, setTeamConfirmed] = useState(null); // null | true | false

  // Load project + application form in parallel
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [projectData, formData] = await Promise.all([
          projectAPI.getProjectById(projectId),
          applicationAPI.getApplicationForm(projectId),
        ]);
        setProject(projectData);
        setFormMeta(formData);

        const initialAnswers = (formData.formQuestions || []).map((q) => ({
          questionNumber: q.questionNumber,
          questionType: q.questionType,
          question: q.question,
          options: q.checkboxOptions ? q.checkboxOptions.split('|') : [],
          answer: q.questionType === 'CHECKBOX' ? [] : '',
        }));
        setFormData((prev) => ({ ...prev, answers: initialAnswers }));
        setError(null);
      } catch (err) {
        console.error('Error loading form:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [projectId]);

  const isTypeB = !!project?.teamsPreformed;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAnswerChange = (questionNumber, value) => {
    setFormData((prev) => ({
      ...prev,
      answers: prev.answers.map((a) =>
        a.questionNumber === questionNumber ? { ...a, answer: value } : a
      ),
    }));
  };

  const handleCheckboxChange = (questionNumber, option) => {
    setFormData((prev) => ({
      ...prev,
      answers: prev.answers.map((a) => {
        if (a.questionNumber !== questionNumber) return a;
        const current = Array.isArray(a.answer) ? a.answer : [];
        return {
          ...a,
          answer: current.includes(option)
            ? current.filter((x) => x !== option)
            : [...current, option],
        };
      }),
    }));
  };

  // Verify a team name against the backend
  const verifyTeam = async () => {
    const trimmed = teamName.trim();
    if (!trimmed) {
      setError('Please enter a team name first.');
      return;
    }
    setError(null);
    setVerifying(true);
    setTeamConfirmed(null);
    try {
      const members = await applicationAPI.getTeamMembers(projectId, trimmed);
      const list = Array.isArray(members) ? members : [];
      setVerifyResult({ exists: list.length > 0, members: list });
    } catch (err) {
      // Treat any error as "no such team exists yet" — user is free to create it
      console.warn('Team lookup failed, treating as new team:', err.message);
      setVerifyResult({ exists: false, members: [] });
    } finally {
      setVerifying(false);
    }
  };

  // Reset team verification when name changes
  const onTeamNameChange = (e) => {
    setTeamName(e.target.value);
    setVerifyResult(null);
    setTeamConfirmed(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Type B validation
    if (isTypeB) {
      if (hasTeam === null) {
        setError('Please indicate whether you already have a team.');
        return;
      }
      if (hasTeam === 'yes') {
        if (!verifyResult) {
          setError('Please verify your team name first.');
          return;
        }
        if (verifyResult.exists && teamConfirmed !== true) {
          setError('Please confirm whether those are your teammates, or change the team name.');
          return;
        }
      }
    }

    setSubmitting(true);
    try {
      const questionsAnswers = formData.answers.map((a) => ({
        questionNumber: a.questionNumber,
        questionType: a.questionType,
        question: a.question,
        answer: Array.isArray(a.answer) ? a.answer.join('|') : (a.answer ?? ''),
      }));

      const applicationData = {
        projectId: Number(projectId),
        firstName: formData.firstName,
        lastName: formData.lastName,
        joinExistentTeam: isTypeB && hasTeam === 'yes' && verifyResult?.exists === true,
        questionsAnswers,
      };

      if (isTypeB && hasTeam === 'yes') {
        applicationData.teamName = teamName.trim();
      }

      await applicationAPI.submitApplication(applicationData);
      navigate('/my-applications');
    } catch (err) {
      console.error('Error submitting application:', err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading application form...</div>;
  if (!project || !formMeta) return <div className="error-message">Could not load project: {error}</div>;

  return (
    <main className="section">
      <div className="container">
        <div className="application-header">
          <h1 className="title-1">Apply to {project.projectName}</h1>
          <p>Type: {isTypeB ? 'B — Team Registration' : 'A — Individual Registration'}</p>
        </div>

        <form onSubmit={handleSubmit} className="application-form">

          {/* Personal info */}
          <div className="form-section">
            <h2 className="title-2">Personal Information</h2>
            <div className="form-row">
              <div className="form-group">
                <label>First Name *</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
              </div>
            </div>
          </div>

          {/* Type B: team question */}
          {isTypeB && (
            <div className="form-section">
              <h2 className="title-2">Team Registration</h2>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '8px' }}>Do you already have a team? *</label>
                <label style={{ marginRight: '20px' }}>
                  <input type="radio" name="hasTeam" checked={hasTeam === 'yes'}
                         onChange={() => { setHasTeam('yes'); setVerifyResult(null); setTeamConfirmed(null); }} />
                  {' '}Yes, I'm registering with my team
                </label>
                <label>
                  <input type="radio" name="hasTeam" checked={hasTeam === 'no'}
                         onChange={() => { setHasTeam('no'); setTeamName(''); setVerifyResult(null); setTeamConfirmed(null); }} />
                  {' '}No, I'll be solo
                </label>
              </div>

              {hasTeam === 'yes' && (
                <>
                  <div className="form-group">
                    <label>Team Name *</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input type="text" value={teamName} onChange={onTeamNameChange}
                             placeholder="Enter your team name" style={{ flex: 1 }} required />
                      <button type="button" className="btn-outline" onClick={verifyTeam}
                              disabled={verifying || !teamName.trim()}>
                        {verifying ? 'Checking...' : 'Verify Team'}
                      </button>
                    </div>
                  </div>

                  {verifyResult?.exists && (
                    <div style={{ padding: '15px', background: '#f5f5f5', borderRadius: '6px', margin: '15px 0' }}>
                      <p style={{ marginTop: 0 }}>
                        We found an existing team named <strong>{teamName.trim()}</strong>. Members:
                      </p>
                      <ul style={{ marginBottom: '15px' }}>
                        {verifyResult.members.map((m, i) => (
                          <li key={i}>{m.firstName} {m.lastName}</li>
                        ))}
                      </ul>
                      <p><strong>Are these your teammates?</strong></p>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="button"
                                className={`btn-outline ${teamConfirmed === true ? 'selected' : ''}`}
                                onClick={() => setTeamConfirmed(true)}>Yes, register me with them</button>
                        <button type="button"
                                className={`btn-outline ${teamConfirmed === false ? 'selected' : ''}`}
                                onClick={() => setTeamConfirmed(false)}>No, this is a different team</button>
                      </div>
                      {teamConfirmed === false && (
                        <p style={{ color: '#c00', marginTop: '10px', marginBottom: 0 }}>
                          Please choose a different team name to avoid confusion with this existing team.
                        </p>
                      )}
                    </div>
                  )}

                  {verifyResult && !verifyResult.exists && (
                    <p style={{ color: '#2e7d32', margin: '10px 0' }}>
                      No team named <strong>{teamName.trim()}</strong> exists yet. You'll be creating a new team with this name.
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {/* Questions from the project's form */}
          <div className="form-section">
            <h2 className="title-2">Application Questions</h2>
            {formData.answers.length === 0 && <p style={{ color: '#666' }}>This project has no extra questions.</p>}

            {formData.answers.map((q) => (
              <div key={q.questionNumber} className="question-item" style={{ marginBottom: '20px' }}>
                <label className="question-label" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  {q.question}
                </label>

                {q.questionType === 'TEXT' && (
                  <input type="text" className="form-input" value={q.answer}
                         onChange={(e) => handleAnswerChange(q.questionNumber, e.target.value)} />
                )}

                {q.questionType === 'CHECKBOX' && (
                  <div className="checkbox-group">
                    {q.options.length === 0 ? (
                      <p style={{ color: '#999', fontStyle: 'italic' }}>No options configured.</p>
                    ) : q.options.map((option) => (
                      <label key={option} className="checkbox-label" style={{ display: 'block' }}>
                        <input type="checkbox"
                               checked={Array.isArray(q.answer) && q.answer.includes(option)}
                               onChange={() => handleCheckboxChange(q.questionNumber, option)} />
                        {' '}{option}
                      </label>
                    ))}
                  </div>
                )}

                {q.questionType === 'FILE' && (
                  <input type="file"
                         onChange={(e) => handleAnswerChange(q.questionNumber, e.target.files[0])} />
                )}
              </div>
            ))}
          </div>

          {error && <p className="error-message" style={{ marginBottom: '20px' }}>{error}</p>}

          <button type="submit" className="btn" style={{ marginTop: '40px', width: '100%' }}
                  disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>const isTypeB = !!formMeta?.teamsPreformed;
      </div>
    </main>
  );
}