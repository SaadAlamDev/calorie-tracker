export default function ResultList({
    results, warning
}) {
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
                    </div>
                ))}
            </div>
        </>
    );
}