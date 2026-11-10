import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import { api } from '../lib/api';
import useSavedState from '../lib/useSavedState';
import { downloadFile, sumNutrition, MEAL_ICONS } from '../lib/nutrition';

export default function MealPlanner({ goals, plan, setPlan, onLogDay, diaryDate }) {
  const [preferences, setPreferences] = useSavedState('nourish-planner-preferences', { goal: goals.goal, diet: 'Balanced', calories: goals.calories, days: 1, allergies: '', preferences: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [dayIndex, setDayIndex] = useState(0);
  const [status, setStatus] = useState('checking');
  const request = useRef(null);
  useEffect(() => {
    const controller = new AbortController();
    api('/meal-plans/status', { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(8000)]) })
      .then(result => setStatus(result.configured ? 'ready' : 'setup'))
      .catch(() => { if (!controller.signal.aborted) setStatus('unavailable'); });
    return () => { controller.abort(); request.current?.abort(); };
  }, []);
  function change(key, value) { setPreferences(previous => ({ ...previous, [key]: value })); }
  async function generate(event) {
    event.preventDefault();
    setBusy(true); setError('');
    request.current = new AbortController();
    try {
      const result = await api('/meal-plans', { method: 'POST', body: JSON.stringify(preferences), signal: AbortSignal.any([request.current.signal, AbortSignal.timeout(62000)]) });
      setPlan(result); setDayIndex(0); setStatus('ready');
    } catch (err) {
      if (!request.current.signal.aborted) setError(err.name === 'TimeoutError' ? 'Planning took too long. Try a shorter plan.' : err.message === 'Failed to fetch' ? 'Cannot reach the planner. Make sure the backend is running.' : err.message);
    } finally { setBusy(false); }
  }
  const currentDay = plan?.days[Math.min(dayIndex, plan.days.length - 1)];
  const totals = currentDay ? sumNutrition(currentDay.meals) : null;
  function exportGroceries() {
    const items = [...new Set(plan.days.flatMap(day => day.meals.flatMap(meal => meal.ingredients)))];
    downloadFile('nourish-grocery-list.txt', `${plan.title}\n${plan.days.length}-day grocery checklist\nCombine quantities for repeated ingredients as needed.\n\n${items.map(item => `[ ] ${item}`).join('\n')}\n\nNutrition is estimated. Check ingredient labels for allergens.\n`);
  }
  return <div className="planner-layout">
    <section className="card planner-preferences"><div className="section-eyebrow"><Icon name="settings" size={15} /> MADE FOR YOU</div><h2>Your plate. Your way.</h2><p className="section-copy">A few details. A whole lot of possibilities.</p>
      <form className="planner-form" onSubmit={generate}>
        <label>What are you working toward?<select value={preferences.goal} onChange={e => change('goal', e.target.value)}>{['Feel healthier', 'Lose weight', 'Maintain weight', 'Build muscle'].map(goal => <option key={goal}>{goal}</option>)}</select></label>
        <label>Your eating style<select value={preferences.diet} onChange={e => change('diet', e.target.value)}>{['Balanced', 'Vegetarian', 'Vegan', 'Pescatarian', 'High protein'].map(diet => <option key={diet}>{diet}</option>)}</select></label>
        <div className="form-grid"><label>Daily calories<input type="number" min="1200" max="4500" step="1" required value={preferences.calories} onChange={e => change('calories', Number(e.target.value))} /></label><label>Plan length<select value={preferences.days} onChange={e => change('days', Number(e.target.value))}><option value="1">1 day</option><option value="3">3 days</option><option value="7">7 days</option></select></label></div>
        <label>Allergies & foods to avoid<input maxLength={300} value={preferences.allergies} onChange={e => change('allergies', e.target.value)} placeholder="e.g. peanuts, shellfish, dairy" /></label>
        <label>What sounds good?<textarea maxLength={600} rows="3" value={preferences.preferences} onChange={e => change('preferences', e.target.value)} placeholder="Quick lunches, Pakistani dishes, budget-friendly ingredients…" /></label>
        <p className="helper-text">Your preferences are sent to OpenRouter to create your plan. Meals and nutrition are AI estimates; check ingredients for allergens.</p>
        {status === 'setup' && <div className="connection-note"><strong>One small setup step</strong><p>Connect a free OpenRouter API key on the server to bring your planner to life. See the README for setup.</p></div>}
        {status === 'unavailable' && <p className="helper-text">Planner service is offline. Start the backend to generate a plan.</p>}
        {error && <p className="error-message" role="alert">{error}</p>}
        <button className="button primary generate-button" disabled={busy}><Icon name="sparkles" size={18} />{busy ? 'Creating your plan…' : plan ? 'Generate a fresh plan' : 'Create my meal plan'}{!busy && <Icon name="arrow" size={17} />}</button>
        {busy && <p className="helper-text" role="status">Good things take a moment. This can take up to a minute.</p>}
      </form>
    </section>
    <section className="planner-output" aria-live="polite" aria-busy={busy}>
      {!plan ? <div className="planner-empty card"><div className="planner-art"><span className="orbit orbit-one">🥑</span><span className="orbit orbit-two">🥕</span><span className="orbit orbit-three">🍋</span><span className="plate-art">🥗</span><span className="art-sparkle">✦</span></div><span className="pill green"><Icon name="sparkles" size={14} /> YOUR PERSONAL MEAL PLANNER</span><h2>A plan that feels<br />like <em>you.</em></h2><p>Less “what’s for dinner?”<br />More meals that fit your life and your goals.</p><div className="planner-benefits"><span><Icon name="check" size={15} /> Tailored to your goals</span><span><Icon name="check" size={15} /> Everyday ingredients</span><span><Icon name="check" size={15} /> Ready-to-use grocery list</span></div></div> : <>
        <div className="card plan-intro"><span className="pill green"><Icon name="sparkles" size={13} /> AI-GENERATED FOR YOU</span><h2>{plan.title}</h2><p>{plan.summary}</p><div className="plan-toolbar"><div className="day-tabs" aria-label="Plan day">{plan.days.map((day, index) => <button key={day.day} onClick={() => setDayIndex(index)} className={index === dayIndex ? 'active' : ''}>Day {index + 1}</button>)}</div><button className="text-button" onClick={exportGroceries}><Icon name="download" size={16} />Grocery list</button></div><div className="plan-totals"><strong>{Math.round(totals.calories).toLocaleString()} <small>kcal</small></strong><span>{Math.round(totals.protein)}g protein</span><span>{Math.round(totals.carbs)}g carbs</span><span>{Math.round(totals.fat)}g fat</span></div></div>
        {currentDay.meals.map(meal => <article className="card planned-meal" key={meal.type}><div className="planned-meal-top"><span className="meal-label"><Icon name={MEAL_ICONS[meal.type]} size={17} />{meal.type}</span><span><Icon name="clock" size={14} />{meal.prepMinutes} min</span></div><h3>{meal.name}</h3><p className="meal-portion">{meal.portion} <span className="dot">·</span> {Math.round(meal.calories)} kcal</p><details><summary>Ingredients & how to make it</summary><ul>{meal.ingredients.map((ingredient, i) => <li key={i}>{ingredient}</li>)}</ul><p>{meal.instructions}</p></details></article>)}
        <div className="plan-log"><button className="button primary" onClick={() => onLogDay(plan, currentDay)}><Icon name="plus" size={17} />Add day {dayIndex + 1} to diary</button><span>For {new Date(`${diaryDate}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}. Adds planned meals as eaten.</span></div>
      </>}
    </section>
  </div>;
}
