import { useState, useEffect } from 'react';
import axios from 'axios';
import Login from '../components/Login';

export default function Home() {
  const [token, setToken] = useState(null);
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editNoteId, setEditNoteId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [pinnedNotes, setPinnedNotes] = useState([]);
  const [viewNote, setViewNote] = useState(null);
  const [usersById, setUsersById] = useState({});

  async function fetchUsers(token) {
    try {
      const res = await axios.get('/api/users', { headers: { Authorization: `Bearer ${token}` } });
      // Map users by id for quick lookup
      const map = {};
      res.data.forEach(u => { map[u.id] = u; });
      setUsersById(map);
    } catch (err) {
      // fallback: just show userId if fetch fails
      setUsersById({});
    }
  }

  useEffect(() => {
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser(payload);
      fetchNotes(token);
      fetchUsers(token);
    }
  }, [token]);

  async function fetchNotes(token) {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/notes', { headers: { Authorization: `Bearer ${token}` } });
      // For demo, use local pinned state
      const allNotes = res.data;
      setNotes(allNotes);
    } catch (err) {
      setError('Failed to load notes');
    }
    setLoading(false);
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    try {
      await axios.post('/api/notes', { title, content }, { headers: { Authorization: `Bearer ${token}` } });
      setTitle('');
      setContent('');
      setShowModal(false);
      fetchNotes(token);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create note');
    }
  }

  function handleEdit(note) {
    setEditNoteId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
    setShowModal(true);
  }

  async function handleEditSave(e) {
    e.preventDefault();
    setError('');
    try {
      await axios.put(`/api/notes/${editNoteId}`, { title: editTitle, content: editContent }, { headers: { Authorization: `Bearer ${token}` } });
      setEditNoteId(null);
      setEditTitle('');
      setEditContent('');
      setShowModal(false);
      fetchNotes(token);
    } catch (err) {
      setError('Failed to update note');
    }
  }

  async function handleDelete(id) {
    setError('');
    try {
      await axios.delete(`/api/notes/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchNotes(token);
    } catch (err) {
      setError('Failed to delete note');
    }
  }

  function handlePin(note) {
    setPinnedNotes((prev) => {
      if (prev.includes(note.id)) {
        return prev.filter((id) => id !== note.id);
      } else {
        return [note.id, ...prev];
      }
    });
  }

  async function handleUpgrade() {
    setError('');
    try {
      await axios.post(`/api/tenants/${user.tenantSlug}/upgrade`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setUser({ ...user, plan: 'pro' });
      fetchNotes(token);
    } catch (err) {
      setError('Upgrade failed');
    }
  }

  if (!token) return <Login setToken={setToken} />;
  if (!user) return <div>Loading...</div>;

  const atNoteLimit = user.plan === 'free' && notes.length >= 3;

  // Pinning is local for demo; in real app, this would be persisted
  const sortedNotes = [...notes].sort((a, b) => {
    const aPinned = pinnedNotes.includes(a.id);
    const bPinned = pinnedNotes.includes(b.id);
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    return b.id - a.id;
  });

  return (
    <div className="dashboard-bg">
      {/* Header Bar */}
      <header className="dashboard-header">
        <div className="brand-logo"><span className="brand-logo-icon">📝</span>SaaS Notes</div>
        <div>
          <span className="tenant-badge">{user.tenantSlug[0].toUpperCase()}</span>
          <span className="tenant-name">{user.tenantSlug} ({user.plan})</span>
        </div>
        <button className="logout-btn" onClick={() => setToken(null)}>Logout</button>
      </header>
      {/* Info banners */}
      {error && <div className="info-banner" style={{ background: '#fee2e2', color: '#991b1b' }}>{error}</div>}
      {atNoteLimit && user.role === 'admin' && (
        <div className="info-banner">You’ve hit the free plan limit. Upgrade to Pro for unlimited notes.</div>
      )}
      {atNoteLimit && user.role === 'member' && (
        <div className="info-banner">Your team has reached the free plan note limit. Ask an admin to upgrade.</div>
      )}
      {/* Notes grid */}
      <div className="notes-grid">
        {loading ? <div>Loading...</div> : (
          sortedNotes.map(n => (
            <div className="note-card" key={n.id}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div className="note-title">{n.title}</div>
                <div style={{display:'flex',gap:8}}>
                  <button title={pinnedNotes.includes(n.id) ? 'Unpin' : 'Pin'} style={{background:'none',boxShadow:'none',color:pinnedNotes.includes(n.id)?'#facc15':'#cbd5e1',fontSize:'1.3em',padding:'0 7px',border:'none',cursor:'pointer'}} onClick={() => handlePin(n)}>
                    {pinnedNotes.includes(n.id) ? '📌' : '📍'}
                  </button>
                  <button title="Edit" style={{background:'none',boxShadow:'none',color:'#6366f1',fontSize:'1.2em',padding:'0 7px',border:'none',cursor:'pointer'}} onClick={() => handleEdit(n)}>
                    ✏️
                  </button>
                  <button title="View" style={{background:'none',boxShadow:'none',color:'#6366f1',fontSize:'1.2em',padding:'0 7px',border:'none',cursor:'pointer'}} onClick={() => setViewNote(n)}>
                    👁️
                  </button>
                </div>
              </div>
              <div className="note-content">{n.content}</div>
              <button className="note-delete" onClick={() => handleDelete(n.id)}>Delete</button>
            </div>
          ))
        )}
      </div>
      {/* Floating add note button (admin/member, not at limit) */}
      {!atNoteLimit && !editNoteId && (
        <button className="add-note-btn" onClick={() => setShowModal(true)} title="Add Note">+</button>
      )}
      {/* Modal for note creation or edit */}
      {showModal && (
        <div className="modal-bg" onClick={() => { setShowModal(false); setEditNoteId(null); }}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h3>{editNoteId ? 'Edit Note' : 'New Note'}</h3>
            <form onSubmit={editNoteId ? handleEditSave : handleCreate}>
              <input
                className="modal-title-input"
                value={editNoteId ? editTitle : title}
                onChange={e => editNoteId ? setEditTitle(e.target.value) : setTitle(e.target.value)}
                placeholder="Title"
                required
              />
              <textarea
                value={editNoteId ? editContent : content}
                onChange={e => editNoteId ? setEditContent(e.target.value) : setContent(e.target.value)}
                placeholder="Content"
                rows={3}
                style={{width:'100%',margin:'8px 0 14px 0',borderRadius:8,padding:10,border:'1px solid #e2e8f0'}}
              />
              <button type="submit" style={{width:'100%'}}>{editNoteId ? 'Save Changes' : 'Create'}</button>
            </form>
            <button onClick={() => { setShowModal(false); setEditNoteId(null); }} style={{marginTop:8,width:'100%'}}>Cancel</button>
          </div>
        </div>
      )}
      {/* Modal for viewing note details */}
      {viewNote && (
        <div className="modal-bg" onClick={() => setViewNote(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h3 style={{marginBottom:12,display:'flex',alignItems:'center',gap:8}}>
              <span style={{fontSize:'1.3em'}}>👁️</span> {viewNote.title}
            </h3>
            <div style={{color:'#64748b',fontSize:'1.09rem',marginBottom:18}}>
              {viewNote.content.split('\n').map((line, idx) => (
                <span key={idx}>
                  {line}
                  <br />
                </span>
              ))}
            </div>
            <div style={{fontSize:14,color:'#6366f1',marginBottom:8}}>
              <b>Added by:</b> {usersById[viewNote.user_id]?.email || `User #${viewNote.user_id}`}
            </div>
            <button onClick={() => setViewNote(null)} style={{width:'100%',marginTop:8}}>Close</button>
          </div>
        </div>
      )}
      {/* Upgrade button for admin */}
      {user.plan === 'free' && notes.length >= 3 && user.role === 'admin' && (
        <button className="upgrade-btn" onClick={handleUpgrade}>Upgrade to Pro</button>
      )}
    </div>
  );
}
