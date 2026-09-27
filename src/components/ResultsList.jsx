import { useState } from 'react';

function FoodItem({ food, handleDelete, handleUpdate }) {
    const [isEditing, setIsEditing] = useState(false);
    const [description, setDescription] = useState(food.description);
    const [portion, setPortion] = useState(food.portion);
    const [calories, setCalories] = useState(food.calories);

    async function handleSave() {
        await handleUpdate(food.id, {
            description: description,
            portion: portion,
            calories: Number(calories)
        });
        setIsEditing(false);
    }

    // 1. EDIT MODE: If the user clicked Edit, show the input boxes
    if (isEditing) {
        return (
            <div className="result-item">
                <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <input
                    type="text"
                    value={portion}
                    onChange={(e) => setPortion(e.target.value)}
                />
                <input
                    type="number"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                />
                <button onClick={handleSave}>Save</button>
                <button onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
        );
    }

    // 2. NORMAL MODE: Otherwise, show the regular food text
    return (
        <div className="result-item">
            <p><strong>{food.description}</strong></p>
            <p>Portion: {food.portion} | Calories: {food.calories}</p>
            <button onClick={() => setIsEditing(true)}>Edit</button>
            <button onClick={() => handleDelete(food.id)}>Delete</button>
        </div>
    );
}

export default function ResultList({ results, warning, handleDelete, handleUpdate }) {
    return (
        <>
            {warning !== '' && <p className="error-text">{warning}</p>}

            <div className="results-panel">
                {results.map((food) => (
                    <FoodItem
                        key={food.id}
                        food={food}
                        handleDelete={handleDelete}
                        handleUpdate={handleUpdate}
                    />
                ))}
            </div>
        </>
    );
}