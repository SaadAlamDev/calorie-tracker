import { useState } from 'react';
import Icon from './Icon';

export default function ResultsList({ results, onLog, onEdit, onDelete }) {
  const [visibleCount, setVisibleCount] = useState(12);
  return <><div className="food-results">{results.slice(0, visibleCount).map(food => <div className="food-result" key={food.id}>
    <span className="food-emoji">{food.emoji || '🍽️'}</span><div className="food-result-name"><strong>{food.description}</strong><span>{food.portion} <span className="dot">·</span> {food.calories} kcal</span></div>
    {onEdit && <button className="icon-button" onClick={() => onEdit(food)} aria-label={`Edit ${food.description}`}><Icon name="edit" size={17} /></button>}
    {onDelete && <button className="icon-button danger" onClick={() => onDelete(food)} aria-label={`Delete ${food.description}`}><Icon name="trash" size={17} /></button>}
    <button className="add-food-button" onClick={() => onLog(food)} aria-label={`Log ${food.description}`}><Icon name="plus" size={18} /></button>
  </div>)}</div>{visibleCount < results.length && <button className="button secondary load-more" onClick={() => setVisibleCount(count => count + 12)}>Show more foods</button>}</>;
}
