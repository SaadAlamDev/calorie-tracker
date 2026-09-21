export default function SearchPanel({
    searchTerm, setSearchTerm, onSearch, onClear
}) {
    return (
        <div className='search-panel'>
            <input
                type='text'
                placeholder='Enter food description'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} />
            <button onClick={onSearch}>Search</button>
            <button onClick={onClear}>Clear</button>
        </div>
    );
}