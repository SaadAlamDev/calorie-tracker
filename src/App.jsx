import { useEffect, useState } from 'react';
import Icon from './components/Icon';
import FoodLibrary from './components/FoodLibrary';
import GoalsForm from './components/GoalsForm';
import MealPlanner from './components/MealPlanner';
import useSavedState from './lib/useSavedState';
import { DEFAULT_GOALS, MEALS, MEAL_ICONS, STARTER_FOODS, dateKey, shiftDate, sumNutrition, downloadFile } from './lib/nutrition';
import './App.css';

const NAV = [{ id: 'overview', label: 'Overview', icon: 'grid' }, { id: 'diary', label: 'Food diary', icon: 'book' }, { id: 'planner', label: 'Meal planner', icon: 'sparkles' }, { id: 'insights', label: 'My progress', icon: 'chart' }];

function App() {
  const [page, setPage] = useState('overview');
  const [date, setDate] = useState(dateKey);
  const [goals, setGoals, goalStorageError] = useSavedState('nourish-goals', DEFAULT_GOALS);
  const [diary, setDiary, diaryStorageError] = useSavedState('nourish-diary', {});
  const [water, setWater, waterStorageError] = useSavedState('nourish-water', {});
  const [customFoods, setCustomFoods, foodStorageError] = useSavedState('nourish-foods', []);
  const [plan, setPlan, planStorageError] = useSavedState('nourish-plan', null);
  const [foodModal, setFoodModal] = useState(null);
  const [showGoals, setShowGoals] = useState(false);
  const [toast, setToast] = useState('');
  const entries = diary[date] || [];
  const totals = sumNutrition(entries);
  const glasses = water[date] || 0;
  const today = dateKey();
  const isToday = date === today;
  const dateLabel = new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  const missingMacros = entries.some(entry => ['protein', 'carbs', 'fat'].some(key => entry[key] == null));
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  function logFood(food, meal = 'Lunch', servings = 1) {
    const entry = { ...food, id: crypto.randomUUID(), foodId: food.id, meal, servings, portion: food.portion, ...Object.fromEntries(['calories', 'protein', 'carbs', 'fat'].map(key => [key, food[key] == null ? null : Math.round(Number(food[key]) * servings * 10) / 10])) };
    setDiary(previous => ({ ...previous, [date]: [...(previous[date] || []), entry] }));
    setToast(`Added ${food.description} to ${meal.toLowerCase()}`);
  }
  function logPlanDay(savedPlan, day) {
    const existing = diary[date] || [];
    const additions = day.meals.filter(meal => !existing.some(entry => entry.sourceKey === `${savedPlan.createdAt}-${day.day}-${meal.type}`)).map(meal => ({ ...meal, id: crypto.randomUUID(), description: meal.name, meal: meal.type, servings: 1, emoji: '🍽️', sourceKey: `${savedPlan.createdAt}-${day.day}-${meal.type}` }));
    setDiary(previous => ({ ...previous, [date]: [...(previous[date] || []), ...additions] }));
    setToast(additions.length ? `${additions.length} meals added to your ${dateLabel} diary` : 'These meals are already in this day’s diary');
  }
  function removeEntry(id) {
    setDiary(previous => ({ ...previous, [date]: (previous[date] || []).filter(entry => entry.id !== id) }));
    setToast('Food removed from your diary');
  }
  function updateWater(amount) { setWater(previous => ({ ...previous, [date]: Math.max(0, Math.min(40, (previous[date] || 0) + amount)) })); }
  function exportData() { downloadFile('nourish-data.json', JSON.stringify({ goals, diary, water, customFoods, plan, exportedAt: new Date().toISOString() }, null, 2), 'application/json'); }
  const storageError = goalStorageError || diaryStorageError || waterStorageError || foodStorageError || planStorageError;

  const diaryCard = <section className="card diary-card"><div className="card-heading"><div><h2>{isToday ? 'On the menu today' : 'On the menu'}</h2><p>A little balance in every bite.</p></div><span className="small-tag">{entries.length} {entries.length === 1 ? 'food' : 'foods'} logged</span></div><div className="meal-list">{MEALS.map(meal => {
    const items = entries.filter(entry => entry.meal === meal);
    return <div className="meal-group" key={meal}><div className="meal-group-header"><span className={`meal-symbol ${meal.toLowerCase()}`}><Icon name={MEAL_ICONS[meal]} size={20} /></span><div className="meal-title"><h3>{meal}</h3><span>{items.length ? `${Math.round(sumNutrition(items).calories)} kcal` : 'A fresh start awaits'}</span></div><button className="add-meal" onClick={() => setFoodModal(meal)} aria-label={`Add food to ${meal}`}><Icon name="plus" size={17} /><span>Add food</span></button></div>{items.map(entry => <div className="diary-entry" key={entry.id}><span>{entry.emoji || '🍽️'}</span><div><strong>{entry.description}</strong><small>{entry.servings !== 1 ? `${entry.servings} × ` : ''}{entry.portion}</small></div><span className="entry-calories">{Math.round(entry.calories)} <small>kcal</small></span><button className="icon-button" onClick={() => removeEntry(entry.id)} aria-label={`Remove ${entry.description}`}><Icon name="close" size={15} /></button></div>)}</div>;
  })}</div><div className="diary-bottom"><Icon name="leaf" size={16} /><span>Consistency is a habit. Every meal is a new beginning.</span></div></section>;

  const waterCard = <section className="card water-card"><div className="card-heading"><div className="heading-with-icon"><span className="water-symbol"><Icon name="drop" /></span><h2>A sip in the right direction</h2></div><span className="small-tag blue">{Math.round(glasses / goals.water * 100)}%</span></div><div className="water-count"><strong>{glasses}</strong><span>/ {goals.water} glasses</span><small>{(glasses * 0.25).toFixed(2).replace(/0$/, '')} L of {(goals.water * 0.25).toFixed(2).replace(/0$/, '')} L</small></div><div className="water-glasses" aria-label={`${glasses} of ${goals.water} glasses consumed`}>{Array.from({ length: Math.min(goals.water, 12) }, (_, i) => <span key={i} className={`glass ${i < glasses ? 'filled' : ''}`}><svg viewBox="0 0 24 30" aria-hidden="true"><path d="m3 2 3 25h12l3-25Z"/><path className="glass-water" d="m5 12 2 13h10l2-13c-5-3-9 3-14 0Z"/></svg></span>)}</div><div className="water-actions"><span>Keep the good things flowing.</span><button className="icon-button" onClick={() => updateWater(-1)} disabled={glasses === 0} aria-label="Remove a glass of water"><Icon name="minus" size={16} /></button><button className="water-add" onClick={() => updateWater(1)} aria-label="Add a glass of water"><Icon name="plus" size={17} /></button></div></section>;

  return <div className="app-shell"><a className="skip-link" href="#main-content">Skip to content</a>
    <aside className="sidebar"><a className="brand" href="#" onClick={e => { e.preventDefault(); setPage('overview'); }}><span className="brand-icon"><Icon name="leaf" size={26} /></span>nourish<span className="brand-period">.</span></a><div className="sidebar-main"><span className="nav-caption">YOUR DAILY BALANCE</span><nav aria-label="Main navigation">{NAV.map(item => <button key={item.id} className={`nav-link ${page === item.id ? 'active' : ''}`} onClick={() => setPage(item.id)} aria-current={page === item.id ? 'page' : undefined}><Icon name={item.icon} size={20} /><span>{item.label}</span>{item.id === 'planner' && <span className="ai-tag">AI</span>}</button>)}</nav><div className="sidebar-note"><div className="note-drawing">✳</div><h3>Little steps.<br />A healthier you.</h3><p>Good habits grow one day at a time. You’ve got this.</p><button onClick={() => setShowGoals(true)}>Make it personal <Icon name="arrow" size={15} /></button></div></div><div className="sidebar-bottom"><button className="nav-link" onClick={() => setShowGoals(true)}><Icon name="settings" size={19} /><span>My goals</span></button><div className="profile"><span className="avatar">Y</span><div><strong>Your space</strong><span>Growing at your own pace</span></div><Icon name="leaf" size={17} /></div></div></aside>
    <div className="main-shell"><header className="topbar"><div className="breadcrumb">My workspace <Icon name="chevron" size={12} /><strong>{NAV.find(item => item.id === page).label}</strong></div><div className="topbar-right"><span className="local-indicator"><i />Saved on this device</span><button className="top-avatar" aria-label="Edit my goals" onClick={() => setShowGoals(true)}>Y</button></div></header>
      <main id="main-content"><div className="page-heading"><div><div className="section-eyebrow"><span className="tiny-sun">✳</span>{page === 'planner' ? 'A LITTLE INSPIRATION, JUST FOR YOU' : page === 'insights' ? 'EVERY LITTLE STEP ADDS UP' : 'YOUR DAILY DOSE OF BALANCE'}</div><h1>{page === 'planner' ? <>Good food. <em>Made for you.</em></> : page === 'insights' ? <>Look how far <em>you’ve come.</em></> : page === 'diary' ? <>Your day, <em>on a plate.</em></> : <>A fresh day. <em>A fresh start.</em></>}</h1><p>{page === 'planner' ? 'Meet your goals with meals you’ll actually look forward to.' : page === 'insights' ? 'Get to know your habits, one nourishing day at a time.' : 'Nourish your body. Build your balance. Feel a little better.'}</p></div><button className="button primary heading-add" onClick={() => setFoodModal('Lunch')}><Icon name="plus" size={18} />Log a meal</button></div>
        {storageError && <p className="error-message" role="alert">Your browser could not save changes. Export your data before closing this page.</p>}
        <div className="date-toolbar"><div className="date-select"><button className="icon-button" onClick={() => setDate(shiftDate(date, -1))} aria-label="Previous day"><Icon name="chevronLeft" size={16} /></button><label className="date-label"><span>{isToday ? 'Today' : dateLabel}</span><input type="date" aria-label="Diary date" value={date} max={today} onChange={e => { if (e.target.value && e.target.value <= today) setDate(e.target.value); }} /></label><button className="icon-button" onClick={() => setDate(shiftDate(date, 1))} disabled={date >= today} aria-label="Next day"><Icon name="chevron" size={16} /></button><span className="full-date">{isToday ? dateLabel : <button className="text-button" onClick={() => setDate(today)}>Back to today</button>}</span></div><button className="text-button edit-goals" onClick={() => setShowGoals(true)}><Icon name="target" size={16} />My daily goals<Icon name="chevron" size={13} /></button></div>
        {page === 'planner' ? <MealPlanner goals={goals} plan={plan} setPlan={setPlan} onLogDay={logPlanDay} diaryDate={date} /> : page === 'insights' ? <Progress diary={diary} water={water} goals={goals} date={date} onExport={exportData} /> : <>
          {page === 'overview' && <section className="hero-banner"><div className="hero-copy"><span className="hero-eyebrow"><span /> SMALL CHOICES. BIG FEELINGS.</span><h2>Feel good.<br />From the <em>inside out.</em></h2><p>Your goals, your pace. Let’s make healthy<br className="desktop-break" /> living a little more delicious.</p><button className="button hero-button" onClick={() => setPage('planner')}>Find your perfect plate<Icon name="arrow" size={17} /></button></div><div className="hero-image" role="img" aria-label="A colorful bowl of fresh vegetables" /><div className="hero-image-label"><Icon name="leaf" size={15} />A little more color. A little more life.</div><div className="hero-sparkle">✳</div></section>}
          <div className="summary-grid"><section className="card calorie-card"><div className="card-heading"><span className="summary-label"><Icon name="flame" size={17} />Daily energy</span><span className="small-tag">{Math.round(totals.calories / goals.calories * 100)}% of goal</span></div><div className="calorie-body"><div className="calorie-ring" style={{ '--progress': `${Math.min(100, totals.calories / goals.calories * 100)}%` }}><div><Icon name="flame" size={19} /><strong>{Math.round(totals.calories).toLocaleString()}</strong><span>kcal eaten</span></div></div><div className="calorie-details"><div><span className="legend-dot green-dot" /><span>Daily goal</span><strong>{goals.calories.toLocaleString()} <small>kcal</small></strong></div><div><span className="legend-dot pale-dot" /><span>{totals.calories > goals.calories ? 'Above goal' : 'Remaining'}</span><strong>{Math.round(Math.abs(goals.calories - totals.calories)).toLocaleString()} <small>kcal</small></strong></div><p>{entries.length ? 'Every bite is part of your story.' : 'Your day is a blank canvas.'}</p></div></div></section>
          <section className="card macros-card"><div className="card-heading"><span className="summary-label"><Icon name="chart" size={17} />A little bit of everything</span><span className="small-tag">Macronutrients</span></div><div className="macro-bars">{[['protein', 'Protein', 'Build & repair'], ['carbs', 'Carbs', 'Fuel your day'], ['fat', 'Healthy fats', 'Keep you going']].map(([key, label, caption]) => <div className={`macro macro-${key}`} key={key}><div className="macro-top"><span className="macro-dot" /><strong>{label}</strong><span>{Math.round(totals[key])}<small> / {goals[key]} g</small></span></div><div className="progress-track" role="progressbar" aria-label={label} aria-valuenow={Math.min(goals[key], Math.round(totals[key]))} aria-valuemin={0} aria-valuemax={goals[key]}><div style={{ width: `${Math.min(100, totals[key] / goals[key] * 100)}%` }} /></div><p>{caption}</p></div>)}</div>{missingMacros && <p className="helper-text">Some foods have no macro data. Totals include known values only.</p>}</section></div>
          <div className="dashboard-grid">{diaryCard}<div className="right-column">{waterCard}<section className="planner-promo"><div className="promo-top"><span className="pill"><Icon name="sparkles" size={13} />A LITTLE HELP FROM AI</span><span className="promo-leaf">✧</span></div><h2>Less planning.<br /><em>More nourishing.</em></h2><p>A meal plan that gets you. Your goals,<br />your favorites, your kind of food.</p><button className="button primary" onClick={() => setPage('planner')}>Make it mine<Icon name="arrow" size={17} /></button><span className="promo-bottom"><Icon name="leaf" size={13} />Thoughtfully planned. Just for you.</span></section></div></div>
          {page === 'overview' && <section className="quick-picks"><div className="card-heading"><div><h2>A little inspiration for your plate</h2><p>Simple favorites to help you get started.</p></div><button className="text-button" onClick={() => setFoodModal('Lunch')}>Explore foods<Icon name="arrow" size={16} /></button></div><div className="quick-pick-grid">{[STARTER_FOODS[1], STARTER_FOODS[2], STARTER_FOODS[8]].map((food, i) => <button className={`quick-pick pick-${i}`} key={food.id} onClick={() => { logFood(food, i === 0 ? 'Breakfast' : 'Lunch'); }}><span className="pick-emoji">{food.emoji}</span><div><strong>{food.description}</strong><span>{food.calories} kcal <span className="dot">·</span> {food.protein}g protein</span></div><span className="pick-plus"><Icon name="plus" size={17} /></span></button>)}</div><p className="helper-text">Tap a favorite to log one serving. Nutrition values are estimates.</p></section>}
        </>}
        <footer className="page-footer"><span><Icon name="leaf" size={14} /> A little more balance, every day.</span><button onClick={exportData}>Export my data<Icon name="download" size={13} /></button></footer>
      </main>
    </div>
    {foodModal && <FoodLibrary onClose={() => setFoodModal(null)} onLog={logFood} initialMeal={foodModal} customFoods={customFoods} setCustomFoods={setCustomFoods} />}
    {showGoals && <GoalsForm goals={goals} onSave={setGoals} onClose={() => setShowGoals(false)} />}
    {toast && <div className="toast" role="status"><Icon name="check" size={18} />{toast}</div>}
  </div>;
}

function Progress({ diary, water, goals, date, onExport }) {
  const days = Array.from({ length: 7 }, (_, i) => shiftDate(date, i - 6));
  const loggedDays = days.filter(day => diary[day]?.length);
  const average = loggedDays.length ? Math.round(loggedDays.reduce((sum, day) => sum + sumNutrition(diary[day]).calories, 0) / loggedDays.length) : 0;
  const totalMeals = days.reduce((sum, day) => sum + (diary[day]?.length || 0), 0);
  const averageWater = (days.reduce((sum, day) => sum + (water[day] || 0), 0) / 7).toFixed(1);
  const max = Math.max(goals.calories * 1.2, ...days.map(day => sumNutrition(diary[day] || []).calories));
  return <div className="progress-page"><div className="stat-grid">{[[average.toLocaleString(), 'Average daily calories', 'Logged days only', 'flame'], [loggedDays.length, 'Days with food logged', 'In the last 7 days', 'book'], [averageWater, 'Glasses of water / day', 'Across all 7 days', 'drop']].map(([value, label, caption, icon]) => <section className="card stat-card" key={label}><Icon name={icon} size={23} /><strong>{value}</strong><h3>{label}</h3><p>{caption}</p></section>)}</div><section className="card weekly-chart"><div className="card-heading"><div><h2>Your week in balance</h2><p>{totalMeals} foods logged over the last seven days.</p></div><span className="small-tag">Goal: {goals.calories.toLocaleString()} kcal</span></div><div className="chart-area"><div className="chart-goal-line" style={{ bottom: `${goals.calories / max * 100}%` }} /><div className="chart-columns">{days.map(day => { const calories = Math.round(sumNutrition(diary[day] || []).calories); return <div className="chart-column" key={day}><span>{calories.toLocaleString()}</span><div className={`chart-bar ${day === date ? 'selected' : ''}`} style={{ height: `${Math.max(1, calories / max * 100)}%` }} /><small>{new Date(`${day}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short' })}</small></div>; })}</div></div><p className="helper-text">The dashed line is your current calorie target. Empty days mean no food has been logged.</p></section><div className="card progress-note"><Icon name="leaf" size={28} /><div><h2>Progress is personal.</h2><p>Your habits tell a story over time. Keep showing up, one meal at a time.</p></div><button className="button secondary" onClick={onExport}><Icon name="download" size={16} />Export my data</button></div></div>;
}

export default App;
