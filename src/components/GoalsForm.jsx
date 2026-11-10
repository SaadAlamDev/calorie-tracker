import { useState } from 'react';
import Modal from './Modal';

export default function GoalsForm({ goals, onSave, onClose }) {
  const [values, setValues] = useState(goals);
  return <Modal title="Small goals. Good things." subtitle="Set daily targets that work for you." onClose={onClose}><form className="food-form" onSubmit={e => { e.preventDefault(); onSave(values); onClose(); }}>
    <label>My focus<select value={values.goal} onChange={e => setValues({ ...values, goal: e.target.value })}>{['Feel healthier', 'Lose weight', 'Maintain weight', 'Build muscle'].map(goal => <option key={goal}>{goal}</option>)}</select></label>
    <div className="form-grid">{[['calories', 'Calories (kcal)', 1200, 4500], ['protein', 'Protein (g)', 10, 400], ['carbs', 'Carbs (g)', 10, 700], ['fat', 'Fat (g)', 10, 200], ['water', 'Water (glasses)', 1, 20]].map(([key, label, min, max]) => <label key={key}>{label}<input required type="number" min={min} max={max} value={values[key]} onChange={e => setValues({ ...values, [key]: Number(e.target.value) })} /></label>)}</div>
    <p className="helper-text">These are personal tracking targets, not a prescribed diet. Each glass is 250 ml.</p><div className="form-actions"><button type="button" className="button secondary" onClick={onClose}>Cancel</button><button className="button primary">Save my goals</button></div>
  </form></Modal>;
}
