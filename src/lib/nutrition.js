export const DEFAULT_GOALS = { calories: 2000, protein: 120, carbs: 250, fat: 65, water: 8, goal: 'Feel healthier' };
export const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
export const MEAL_ICONS = { Breakfast: 'sun', Lunch: 'sunset', Dinner: 'moon', Snacks: 'apple' };
export const STARTER_FOODS = [
  { id: 'starter-1', description: 'Greek yogurt & berry bowl', portion: '1 bowl (250g)', calories: 285, protein: 20, carbs: 38, fat: 6, emoji: '🫐' },
  { id: 'starter-2', description: 'Avocado toast with egg', portion: '2 slices + 1 egg', calories: 380, protein: 16, carbs: 34, fat: 20, emoji: '🥑' },
  { id: 'starter-3', description: 'Grilled chicken quinoa bowl', portion: '1 bowl (350g)', calories: 520, protein: 42, carbs: 48, fat: 18, emoji: '🥗' },
  { id: 'starter-4', description: 'Salmon & roasted vegetables', portion: '1 plate (300g)', calories: 485, protein: 35, carbs: 28, fat: 26, emoji: '🍣' },
  { id: 'starter-5', description: 'Apple, raw', portion: '1 medium (182g)', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, emoji: '🍎' },
  { id: 'starter-6', description: 'Banana', portion: '1 medium (118g)', calories: 105, protein: 1.3, carbs: 27, fat: 0.4, emoji: '🍌' },
  { id: 'starter-7', description: 'Brown rice, cooked', portion: '1 cup (195g)', calories: 216, protein: 5, carbs: 45, fat: 1.8, emoji: '🍚' },
  { id: 'starter-8', description: 'Peanut butter, smooth', portion: '2 tbsp (32g)', calories: 188, protein: 8, carbs: 6, fat: 16, emoji: '🥜' },
  { id: 'starter-9', description: 'Lentil & vegetable soup', portion: '1 bowl (300g)', calories: 280, protein: 16, carbs: 44, fat: 5, emoji: '🥣' },
  { id: 'starter-10', description: 'Tofu & vegetable stir-fry', portion: '1 plate (300g)', calories: 365, protein: 24, carbs: 32, fat: 17, emoji: '🥦' },
];

export function dateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function shiftDate(value, amount) {
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate() + amount);
  return dateKey(date);
}

export function sumNutrition(entries) {
  return entries.reduce((total, entry) => {
    for (const key of ['calories', 'protein', 'carbs', 'fat']) total[key] += Number(entry[key]) || 0;
    return total;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
}

export function readSaved(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}

export function downloadFile(name, content, type = 'text/plain') {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
