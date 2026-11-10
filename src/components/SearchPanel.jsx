import Icon from './Icon';

export default function SearchPanel({ searchTerm, setSearchTerm, onSearch }) {
  return <form className="search-panel" onSubmit={event => { event.preventDefault(); onSearch(); }}><Icon name="search" /><input type="search" aria-label="Search foods" placeholder="Search for a food, ingredient, or meal…" value={searchTerm} onChange={event => setSearchTerm(event.target.value)} /><button className="button primary" type="submit">Search</button></form>;
}
