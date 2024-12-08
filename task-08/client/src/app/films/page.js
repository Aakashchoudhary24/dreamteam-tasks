'use client';
import Navbar from "../components/navbar";
import '../styles/films.css';
import '../styles/page.css';
import { useState, useEffect } from "react";

export default function Films() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('');
    const [selectedRating, setSelectedRating] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [movies, setMovies] = useState([]);
    const [genres, setGenres] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const TMDB_API_KEY = '538ba5fedf47c79f61f4055ec9f9841c';{/*I know the risk of this, but couldn't resolve as importing and 
        the .env method were showing error or not rendering the movies in site */}

    const years = Array.from(
        { length: new Date().getFullYear() - 1900 + 1 }, 
        (_, i) => new Date().getFullYear() - i
    );

    useEffect(() => {
        const fetchDefaultMovies = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(
                    `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1&include_adult=false`
                );
                const data = await response.json();
                setMovies(data.results || []);
            } catch (error) {
                console.error("Error fetching default movies:", error);
            } finally {
                setIsLoading(false);
            }
        };

        const fetchGenres = async () => {
            try {
                const response = await fetch(
                    `https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API_KEY}&language=en-US`
                );
                const data = await response.json();
                setGenres(data.genres || []);
            } catch (error) {
                console.error("Error fetching genres:", error);
            }
        };

        fetchDefaultMovies();
        fetchGenres();
    }, []);

    const handleSearch = async () => {
        if (!searchQuery.trim() && !selectedGenre && !selectedRating && !selectedYear) return;

        setIsLoading(true);
        try {
            let url;
            
            switch (selectedRating) {
                case 'top250':
                    url = `https://api.themoviedb.org/3/movie/top_rated?api_key=${TMDB_API_KEY}&language=en-US&page=1`;
                    break;
                case 'top250_documentaries':
                    url = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&language=en-US&with_genres=99&sort_by=vote_average.desc&page=1`;
                    break;
                default:
                    if (searchQuery.trim()) {
                        url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(searchQuery)}&page=1&include_adult=false`;
                    } 
                    else {
                        url = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&language=en-US&page=1`;
                    }
            }

            if (selectedGenre && selectedRating !== 'top250_documentaries') {
                url += `&with_genres=${selectedGenre}`;
            }

            if (selectedYear) {
                url += `&primary_release_year=${selectedYear}`;
            }

            if (selectedRating === 'highest') {
                url += '&sort_by=vote_average.desc';
            } else if (selectedRating === 'lowest') {
                url += '&sort_by=vote_average.asc';
            }

            const response = await fetch(url);
            const data = await response.json();
            
            let filteredMovies = data.results || [];

            if (selectedGenre) {
                filteredMovies = filteredMovies.filter(movie => 
                    movie.genre_ids.includes(parseInt(selectedGenre))
                );
            }
            if (selectedRating === 'highest') {
                filteredMovies.sort((a, b) => b.vote_average - a.vote_average);
            } else if (selectedRating === 'lowest') {
                filteredMovies.sort((a, b) => a.vote_average - b.vote_average);
            }

            setMovies(filteredMovies);
        } catch (error) {
            console.error("Error fetching movies:", error);
            setMovies([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            handleSearch();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchQuery, selectedGenre, selectedRating, selectedYear]);

    return (
        <div className="main">
            <Navbar />
            <div className="films-container">
                <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="search-form">
                    <label htmlFor="search">Browse By: </label>
                    <input
                        name="search"
                        type="text"
                        placeholder="Search for a movie..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-query"
                    />

                    <select
                        name="filters"
                        value={selectedGenre}
                        onChange={(e) => setSelectedGenre(e.target.value)}
                        className="search-query"
                    >
                        <option value="">Genre</option>
                        {genres.map((genre) => (
                            <option key={genre.id} value={genre.id}>
                                {genre.name}
                            </option>
                        ))}
                    </select>

                    <select
                        name="filters"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="search-query"
                    >
                        <option value="">Year</option>
                        {years.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>

                    <select
                        name="filters"
                        value={selectedRating}
                        onChange={(e) => setSelectedRating(e.target.value)}
                        className="search-query"
                    >
                        <option value="">Rating</option>
                        <option value="highest">Highest First</option>
                        <option value="lowest">Lowest First</option>
                        <option value="top250">Top 250 Movies</option>
                        <option value="top250_documentaries">Top 250 Documentaries</option>
                    </select>

                </form>

                <div className="movies-grid">
                    {isLoading ? (
                        <p>Loading movies...</p>
                    ) : movies.length > 0 ? (
                        movies.map((movie) => (
                            <div key={movie.id} className="movie-card">
                                <img
                                    src={
                                        movie.poster_path
                                            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                                            : 'https://via.placeholder.com/500x750?text=No+Image'
                                    }
                                    alt={movie.title}
                                    className="movie-poster"
                                />
                                <h3 className="movie-title">{movie.title}</h3>
                                <p className="movie-details">
                                    {movie.release_date?.split("-")[0]} | ⭐
                                    {movie.vote_average.toFixed(1) || "N/A"}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p>No movies found. Try another search.</p>
                    )}
                </div>
            </div>
        </div>
    );
}