import { useState } from 'react';

function AddFoodForm() {
    const [description, setDescription] = useState('');
    const [portion, setPortion] = useState('');
    const [calories, setCalories] = useState('');
    const [message, setMessage] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();
        const newFood = {
            description: description,
            portion: portion,
            calories: Number(calories)
        };

        try {
            console.log("Sending this payload:", newFood);
            const response = await fetch('https://calorie-tracker-api-0ppo.onrender.com/api/foods', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newFood)
            });
            const data = await response.json();
            if (response.ok) {
                console.log("Success:", data);
                setMessage('Food successfully added to database!');
                setDescription('');
                setPortion('');
                setCalories('');
            } else {
                console.error("Backend rejected it. Reason:", data);
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