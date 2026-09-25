import { useState, useEffect } from 'react';
import SearchPanel from './components/SearchPanel.jsx';
import ResultList from './components/ResultsList.jsx';
import AddFoodForm from './components/AddFoodForm';
import './App.css';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [foodData, setFoodData] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [warning, setWarning] = useState('');

  async function handleSearch() {
    if (searchTerm.trim() === '') {
      setWarning('Please enter a search term');
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`https://calorie-tracker-api-0ppo.onrender.com/api/foods?search=${searchTerm}`);

      const matches = await response.json();

      if (matches.length === 0) {
        setWarning('No matches found');
        setSearchResults([]);
      } else {
        setWarning('');
        setSearchResults(matches);
      }
    } catch (error) {
      console.log('Error fetching search results:', error);
      setWarning('Server Error. Please try again later.');
    }

  }

  async function handleDelete(id) {
    try {
      const response = await fetch(`https://calorie-tracker-api-0ppo.onrender.com/api/foods/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setSearchResults((prevResults) => prevResults.filter((food) => food.id !== id));
      } else {
        console.error("Failed to delete from database");
      }
    } catch (error) {
      console.error("Network error:", error);
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

      <AddFoodForm />

      <SearchPanel
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onSearch={handleSearch}
        onClear={handleClear}
      />

      <ResultList
        results={searchResults}
        warning={warning}
        handleDelete={handleDelete}
      />
    </div>
  )
}

export default App