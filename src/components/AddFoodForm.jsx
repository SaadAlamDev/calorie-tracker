import { useState } from 'react';

export default function AddFoodForm({ onSave, initialFood, onCancel }) {
  const [food, setFood] = useState(initialFood || { description: '', portion: '', calories: '', protein: '', carbs: '', fat: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault();
    if (!food.description.trim() || !food.portion.trim()) { setError('Enter a food name and serving size.'); return; }
    setBusy(true);
    setError('');
    try {
      await onSave({ ...food, description: food.description.trim(), portion: food.portion.trim(), calories: Number(food.calories), ...Object.fromEntries(['protein', 'carbs', 'fat'].map(key => [key, food[key] === '' || food[key] == null ? null : Number(food[key])])) });
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  function field(key, value) { setFood(previous => ({ ...previous, [key]: value })); }
  return <form className="food-form" onSubmit={submit}>
    <label>Food name<input required maxLength={180} value={food.description} onChange={e => field('description', e.target.value)} placeholder="e.g. Homemade chicken wrap" /></label>
    <label>Serving size<input required maxLength={100} value={food.portion} onChange={e => field('portion', e.target.value)} placeholder="e.g. 1 wrap (220g)" /></label>
    <div className="form-grid"><label>Calories (kcal)<input required type="number" min="0" max="10000" step="1" value={food.calories} onChange={e => field('calories', e.target.value)} placeholder="350" /></label>{['protein', 'carbs', 'fat'].map(key => <label key={key}>{key[0].toUpperCase() + key.slice(1)} (g)<input type="number" min="0" max="1000" step="0.1" placeholder="Optional" value={food[key] ?? ''} onChange={e => field(key, e.target.value)} /></label>)}</div>
    {error && <p className="error-message" role="alert">{error}</p>}
    <div className="form-actions"><button type="button" className="button secondary" onClick={onCancel}>Cancel</button><button className="button primary" disabled={busy}>{busy ? 'Saving…' : 'Save food'}</button></div>
  </form>;
}
