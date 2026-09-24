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
      const response = await fetch(`http://localhost:3000/api/foods?search=${searchTerm}`);

      const matches = await response.json();

      if (matches.length === 0) {
        setWarning('No matches found');
        setSearchResults([]);
      } else {
        setWarning('');
        setSearchResults(matches);
      }
    } catch(error){
      console.log('Error fetching search results:', error);
      setWarning('Server Error. Please try again later.');
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

      <AddFoodForm/>

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