import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectAPI } from '../services/apiClient';

export default function EditProject() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    projectId: id,
    projectName: '',
    projectDescription: '',
    startDate: '',
    endDate: '',
    minNrParticipants: '',
    maxNrParticipants: '',
    teamsPreformed: null,   // null = not loaded yet, false = Type A, true = Type B
    formQuestions: [],
  });

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await projectAPI.getProjectById(id);

        setForm({
          projectId: id,
          projectName: data.projectName || '',
          projectDescription: data.projectDescription || '',
          startDate: data.startDate ? data.startDate.split('T')[0] : '',
          endDate: data.endDate ? data.endDate.split('T')[0] : '',
          minNrParticipants: data.minNrParticipants || '',
          maxNrParticipants: data.maxNrParticipants || '',
          teamsPreformed: typeof data.teamsPreformed === 'boolean' ? data.teamsPreformed : null,
          formQuestions: data.formQuestions || [],
        });
      } catch (err) {
        console.error('Error fetching project:', err);
        setError(err.message);
        // Fallback mock data
        setForm((prev) => ({
          ...prev,
          projectName: `Sample Project ${id}`,
          projectDescription: 'This is a sample project description that can be edited.',
          startDate: '2026-04-15',
          endDate: '2026-07-20',
          minNrParticipants: '3',
          maxNrParticipants: '8',
          teamsPreformed: false,
          formQuestions: [
            { questionNumber: 1, questionType: 'TEXT', question: 'Why do you want to join this project?' },
            { questionNumber: 2, questionType: 'FILE', question: 'Upload your CV or portfolio' },
          ],
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const addQuestion = () => {
    setForm((prev) => ({
      ...prev,
      formQuestions: [
        ...prev.formQuestions,
        {
          questionNumber: prev.formQuestions.length + 1,
          questionType: 'TEXT',
          question: '',
        },
      ],
    }));
  };

  const updateQuestion = (index, field, value) => {
    setForm((prev) => {
      const qs = [...prev.formQuestions];
      qs[index] = { ...qs[index], [field]: value };
      return { ...prev, formQuestions: qs };
    });
  };

  const addOptionToQuestion = (index, option) => {
    setForm((prev) => {
      const qs = [...prev.formQuestions];
      if (!qs[index].possibleAnswers) qs[index].possibleAnswers = [];
      if (option.trim()) {
        qs[index].possibleAnswers = [...qs[index].possibleAnswers, option.trim()];
      }
      return { ...prev, formQuestions: qs };
    });
  };

  const removeOptionFromQuestion = (index, optionIndex) => {
    setForm((prev) => {
      const qs = [...prev.formQuestions];
      qs[index].possibleAnswers = qs[index].possibleAnswers.filter((_, i) => i !== optionIndex);
      return { ...prev, formQuestions: qs };
    });
  };

  const removeQuestion = (index) => {
    setForm((prev) => ({
      ...prev,
      formQuestions: prev.formQuestions
        .filter((_, i) => i !== index)
        .map((q, i) => ({ ...q, questionNumber: i + 1 })),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.teamsPreformed === null) {
      setError('Please select a project type (A or B).');
      return;
    }

    setSaving(true);

    try {
      const projectData = {
        projectId: id,
        projectName: form.projectName,
        projectDescription: form.projectDescription,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
        endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
        minNrParticipants: parseInt(form.minNrParticipants) || 1,
        maxNrParticipants: parseInt(form.maxNrParticipants) || 10,
        teamsPreformed: form.teamsPreformed,   // already a boolean
        formQuestions: form.formQuestions,
      };

      await projectAPI.updateProject(projectData);
      navigate('/projects');
    } catch (err) {
      console.error('Error updating project:', err);
      setError(err.message || 'Failed to update project. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="section">
        <div className="container">
          <p className="loading">Loading project data...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="section">
      <div className="container">
        <h1 className="title-1">Edit Project</h1>

        <form onSubmit={handleSubmit} className="form-new-project">
          <div className="form-group">
            <label>Project Name *</label>
            <input
              type="text"
              value={form.projectName}
              onChange={(e) => setForm({ ...form, projectName: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              rows="4"
              value={form.projectDescription}
              onChange={(e) => setForm({ ...form, projectDescription: e.target.value })}
              placeholder="Brief description of the project..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Min Participants</label>
              <input
                type="number"
                min="1"
                value={form.minNrParticipants}
                onChange={(e) => setForm({ ...form, minNrParticipants: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Max Participants</label>
              <input
                type="number"
                min="1"
                value={form.maxNrParticipants}
                onChange={(e) => setForm({ ...form, maxNrParticipants: e.target.value })}
              />
            </div>
          </div>

          {/* Project Type - bound directly to teamsPreformed */}
          <div className="form-group">
            <label style={{ marginBottom: '12px', display: 'block' }}>
              Project Type *
            </label>
            <div className="registration-options">
              <label className={`reg-option ${form.teamsPreformed === false ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="teamsPreformed"
                  checked={form.teamsPreformed === false}
                  onChange={() => setForm({ ...form, teamsPreformed: false })}
                />
                <span>
                  <strong>Type A — Idea-based.</strong> Participants register individually;
                  teams are formed at the event by joining or creating ideas.
                </span>
              </label>

              <label className={`reg-option ${form.teamsPreformed === true ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="teamsPreformed"
                  checked={form.teamsPreformed === true}
                  onChange={() => setForm({ ...form, teamsPreformed: true })}
                />
                <span>
                  <strong>Type B — Team-based.</strong> Participants register with their
                  pre-formed teams through the application form.
                </span>
              </label>
            </div>
          </div>

          <h2 className="title-2" style={{ margin: '48px 0 24px' }}>
            Application Form Questions
          </h2>

          {form.formQuestions.map((q, idx) => (
            <div key={idx} className="question-item">
              <div className="question-header">
                <span>Question {q.questionNumber}</span>
                <button
                  type="button"
                  className="btn-outline small"
                  onClick={() => removeQuestion(idx)}
                >
                  Remove
                </button>
              </div>

              <div className="form-group">
                <label>Question text *</label>
                <input
                  type="text"
                  value={q.question}
                  onChange={(e) => updateQuestion(idx, 'question', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Type *</label>
                <select
                  value={q.questionType}
                  onChange={(e) => updateQuestion(idx, 'questionType', e.target.value)}
                >
                  <option value="TEXT">Text</option>
                  <option value="TEXTAREA">Long text</option>
                  <option value="CHECKBOX">Checkbox</option>
                  <option value="RADIO">Radio button</option>
                  <option value="DROPDOWN">Dropdown</option>
                  <option value="FILE">File upload</option>
                </select>
              </div>

              {/* Show options input for CHECKBOX, RADIO, and DROPDOWN */}
              {(q.questionType === 'CHECKBOX' || q.questionType === 'RADIO' || q.questionType === 'DROPDOWN') && (
                <div className="form-group">
                  <label>Possible Answers *</label>
                  <div style={{ marginBottom: '15px' }}>
                    {q.possibleAnswers && q.possibleAnswers.length > 0 && (
                      <div style={{ marginBottom: '15px' }}>
                        {q.possibleAnswers.map((option, optIdx) => (
                          <div
                            key={optIdx}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '8px 12px',
                              backgroundColor: '#f5f5f5',
                              borderRadius: '4px',
                              marginBottom: '8px',
                            }}
                          >
                            <span>{option}</span>
                            <button
                              type="button"
                              onClick={() => removeOptionFromQuestion(idx, optIdx)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#d32f2f',
                                cursor: 'pointer',
                                fontSize: '18px',
                                padding: 0,
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="add-skill-row">
                      <input
                        type="text"
                        placeholder={`Add a ${q.questionType === 'CHECKBOX' ? 'checkbox' : q.questionType === 'RADIO' ? 'radio' : 'dropdown'} option`}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addOptionToQuestion(idx, e.target.value);
                            e.target.value = '';
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          <button
            type="button"
            className="btn-outline"
            onClick={addQuestion}
            style={{ margin: '24px 0 40px' }}
          >
            + Add question
          </button>

          {error && <p className="error-message" style={{ marginBottom: '20px' }}>{error}</p>}

          <button type="submit" className="btn" disabled={saving}>
            {saving ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </main>
  );
}