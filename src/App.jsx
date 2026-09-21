import { useState, useEffect } from 'react';
import SearchPanel from './components/SearchPanel.jsx';
import ResultList from './components/ResultsList.jsx';
import './App.css';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [foodData, setFoodData] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [warning, setWarning] = useState('');

  useEffect(() => {
    fetch('http://localhost:3000/api/foods')
    .then(response => response.json())
    .then(data =>{
      console.log('Fetched from backend!', data);
      setFoodData(data);
    })
    .catch(error => console.error('Error fetching data:', error));
  },[]);

  function handleSearch() {
    if (searchTerm.trim() === '') {
      setWarning('Please enter a search term');
      setSearchResults([]);
      return;
    }

    // Vanilla JS to filter matching seatch terms
    const matches = foodData.filter(food =>
      food.description.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (matches.length === 0) {
      setWarning('No matches found');
      setSearchResults([]);
    } else {
      setWarning('');
      setSearchResults(matches.slice(0, 25));
    }
  }

  function handleClear() {
    setSearchResults([]);
    setSearchTerm('');
    setWarning('');
  }
  return (
    <div>
      <h1>Calorie Tracker</h1>

      <SearchPanel
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      onSearch={handleSearch}
      onClear={handleClear}
      />

      <ResultList
      results={searchResults}
      warning={warning}
      />
    </div>
  )
}

export default App