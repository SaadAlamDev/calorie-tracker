export default function ResultList({ results, warning, handleDelete}) {
    return (
        <>
            {warning !== '' && (
                <p className="error-text">{warning}</p>
            )}

            <div className="results-panel">
                {results.map((food) => (
                    <div key={food.id} className="result-item">
                        <p><strong>{food.description}</strong></p>
                        <p>Portion: {food.portion} | Calories: {food.calories}</p>
                        <button onClick={()=> handleDelete(food.id)}
                            style={{ marginLeft: '15px', backgroundColor: '#ff4d4d', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                            Delete
                        </button>
                    </div>
                ))}
            </div>
        </>
    );
}