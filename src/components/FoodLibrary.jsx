import { useEffect, useState } from 'react';
import Modal from './Modal';
import SearchPanel from './SearchPanel';
import ResultsList from './ResultsList';
import AddFoodForm from './AddFoodForm';
import Icon from './Icon';
import { api } from '../lib/api';
import { STARTER_FOODS, MEALS } from '../lib/nutrition';

export default function FoodLibrary({ onClose, onLog, initialMeal, customFoods, setCustomFoods }) {
  const [search, setSearch] = useState('');
  const [remoteFoods, setRemoteFoods] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [meal, setMeal] = useState(initialMeal || 'Breakfast');
  const [servings, setServings] = useState(1);
  const [tab, setTab] = useState('search');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [logged, setLogged] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    api('/foods', { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(10000)]) })
      .then(foods => { if (!Array.isArray(foods)) throw new Error('Invalid food library'); setRemoteFoods(foods); setStatus('connected'); })
      .catch(() => { if (!controller.signal.aborted) setStatus('offline'); });
    return () => controller.abort();
  }, []);

  const foods = tab === 'custom' ? customFoods : [...STARTER_FOODS, ...customFoods, ...remoteFoods];
  const matches = foods.filter(food => food.description.toLowerCase().includes(search.toLowerCase().trim()));
  const remote = food => !String(food.id).startsWith('local-') && !String(food.id).startsWith('starter-');

  async function save(food) {
    if (editing?.id && remote(editing)) {
      const saved = await api(`/foods/${editing.id}`, { method: 'PUT', body: JSON.stringify(food) });
      setRemoteFoods(previous => previous.map(item => item.id === saved.id ? saved : item));
    } else if (editing?.id) {
      setCustomFoods(previous => previous.map(item => item.id === editing.id ? { ...food, id: editing.id } : item));
    } else {
      setCustomFoods(previous => [...previous, { ...food, id: `local-${crypto.randomUUID()}`, emoji: '🍽️' }]);
    }
    setEditing(null);
    setTab(editing?.id && remote(editing) ? 'search' : 'custom');
  }
  async function remove(food) {
    setError('');
    try {
      if (remote(food)) {
        await api(`/foods/${food.id}`, { method: 'DELETE' });
        setRemoteFoods(previous => previous.filter(item => item.id !== food.id));
      } else { setCustomFoods(previous => previous.filter(item => item.id !== food.id)); }
      setConfirmDelete(null);
    } catch (err) { setError(err.message); }
  }
  return <Modal title={editing ? (editing.id ? 'Edit food' : 'Create a food') : 'A little of what you love.'} subtitle={editing ? 'Nutrition per serving. Add macros if you know them.' : 'Find your food and add it to your day.'} onClose={onClose} wide>
    {editing ? <AddFoodForm initialFood={editing.description != null ? editing : undefined} onSave={save} onCancel={() => setEditing(null)} /> : <>
      <div className="library-tabs"><div className="segmented"><button className={tab === 'search' ? 'active' : ''} onClick={() => setTab('search')}>All foods</button><button className={tab === 'custom' ? 'active' : ''} onClick={() => setTab('custom')}>My foods</button></div><button className="text-button" onClick={() => setEditing({})}><Icon name="plus" size={16} />Create food</button></div>
      <SearchPanel searchTerm={search} setSearchTerm={setSearch} onSearch={() => setLogged('')} />
      <div className="log-options"><label>Add to<select value={meal} onChange={e => setMeal(e.target.value)}>{MEALS.map(item => <option key={item}>{item}</option>)}</select></label><label>Servings<input type="number" min="0.25" max="20" step="0.25" value={servings} onChange={e => setServings(e.target.value)} /></label></div>
      {status === 'offline' && <p className="helper-text">Food database unavailable. Starter foods and your saved foods are available.</p>}
      {status === 'loading' && <p className="helper-text">Connecting to your food database…</p>}
      {error && <p className="error-message" role="alert">{error}</p>}
      {logged && <p className="success-message" role="status"><Icon name="check" size={16} />{logged}</p>}
      {confirmDelete && <div className="inline-confirm"><p>Delete “{confirmDelete.description}” from the food library?</p><button className="button secondary" onClick={() => setConfirmDelete(null)}>Keep food</button><button className="button danger-button" onClick={() => remove(confirmDelete)}>Delete</button></div>}
      <ResultsList key={tab + search} results={matches} onLog={food => {
        const amount = Number(servings);
        if (!Number.isFinite(amount) || amount < 0.25 || amount > 20) { setError('Choose between 0.25 and 20 servings.'); return; }
        onLog(food, meal, amount); setError(''); setLogged(`${food.description} added to ${meal.toLowerCase()}.`);
      }} onEdit={food => { if (String(food.id).startsWith('starter-')) { setEditing({ ...food, id: undefined }); } else setEditing(food); }} onDelete={food => { if (String(food.id).startsWith('starter-')) { setError('Starter foods are built in. Edit a copy to save your own version.'); } else setConfirmDelete(food); }} />
      {!matches.length && <div className="empty-state"><Icon name="search" size={30} /><h3>No foods found</h3><p>Try another search or create your own food.</p><button className="button secondary" onClick={() => setEditing({})}>Create a food</button></div>}
      <p className="helper-text library-footer">Starter nutrition is estimated. Custom foods are saved on this device.</p>
    </>}
  </Modal>;
}
