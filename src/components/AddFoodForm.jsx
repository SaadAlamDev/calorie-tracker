import { useState } from 'react';

function AddFoodForm() {
    const [description, setDescription] = useState('');
    const [portion, setPortion] = useState('');
    const [calories, setCalories] = useState('');
    const [message, setMessage] = useState('');

    async function handleSubmit(e) {
        e.preventDefault;
        const newFood = {
            description: description,
            portion: portion,
            calories: Number(calories)
        };

        try {
            const response = await fetch('http://localhost:3000/api/foods', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newFood)
            });

            if (response.ok) {
                setMessage('Food successfully added to database!');
                setDescription('');
                setPortion('');
                setCalories('');
            } else {
                setMessage('Error adding food.');
            }
        } catch (error) {
            console.error('Network error:', error);
            setMessage('Failed to connect to server.');
        }
    }

    return (
        <div className='add-food-container'>
            <h2>Add a New Food</h2>
            <form onSubmit={handleSubmit} className="add-food-form">
                <input
                    type="text"
                    placeholder="Description (e.g., Watermelon)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Portion (e.g., 1 slice)"
                    value={portion}
                    onChange={(e) => setPortion(e.target.value)}
                    required
                />
                <input
                    type="number"
                    placeholder="Calories (e.g., 85)"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    required
                />
                <button type="submit">Save to Database</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
}
export default AddFoodForm;