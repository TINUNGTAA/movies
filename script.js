const API_URL =
  "https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=3fd2be6f0c70a2a598f084ddfb75487c&page=1";

const IMG_PATH = "https://image.tmdb.org/t/p/w1280";

const SEARCH_API =
  "https://api.themoviedb.org/3/search/movie?api_key=3fd2be6f0c70a2a598f084ddfb75487c&query=";

const section = document.getElementById("section");
const search = document.getElementById("search");
const prevBtn = document.querySelector(".left");
const nextBtn = document.querySelector(".right");
const carouselTrack = document.getElementById("carousel-track");

let carouselInterval;
let slideIndex = 0;
let currentPage = 1;
let totalPages = 1;
let currentUrl = API_URL;
let debouncerTimer;

getMovies(API_URL);

// FETCH MOVIES 
async function getMovies(url) {
  currentUrl = url;

  try {
    const respond = await fetch(url);

    if (!respond.ok) {
      throw new Error("Failed to fetch movies");
    }

    const data = await respond.json();

    currentPage = data.page;
    totalPages = data.total_pages;

    showMovies(data.results);
    showCarousel(data.results);
    updateChevronState();
  } catch (error) {
    console.error("Error fetching movies:", error);
    showError("Something went wrong. Please try again.");
  }
}

//  SHOW MOVIES
function showMovies(movies) {
  section.innerHTML = "";

  if (movies.length === 0) {
    section.innerHTML = `
      <div class="not-found">
        No results found
      </div>
    `;
    return;
  }

  movies.forEach((movie) => {
    const { title, poster_path, vote_average, overview, release_date } = movie;

    const movieEl = document.createElement("div");
    movieEl.classList.add("movie");

    movieEl.innerHTML = `
      <div class="pic">
        <img src="${IMG_PATH + poster_path}" alt="${title}" />
        <i class="fas fa-heart heart" data-id="${movie.id}"></i>
      </div>

      <div class="movie-infor">
        <div class="title">
          <h2>${title} (${release_date?.split("-")[0] || "N/A"})</h2>
          <span class="rate ${getClassByRate(vote_average)}">
            ${vote_average}
          </span>
        </div>
      </div>

      <div class="overview">
        <h2>Overview</h2>
        <p>${overview || "No overview available."}</p>
      </div>
    `;

    section.appendChild(movieEl);

    // Restore liked state
    let likedMovies = JSON.parse(localStorage.getItem("likedMovies")) || [];

    if (likedMovies.includes(movie.id)) {
      movieEl.querySelector(".heart").classList.add("liked");
    }
  });
}

// RATING COLOR
function getClassByRate(vote) {
  if (vote >= 8) return "green";
  else if (vote >= 5) return "orange";
  else return "red";
}

// SEARCH
search.addEventListener("input", () => {
  clearTimeout(debouncerTimer);

  debouncerTimer = setTimeout(() => {
    const searchTerm = search.value.trim();

    if (searchTerm !== "") {
      getMovies(SEARCH_API + searchTerm);
    } else {
      getMovies(API_URL);
    }
  }, 500);
});

//  LIKE 
section.addEventListener("click", (e) => {
  if (e.target.classList.contains("heart")) {
    const movieId = Number(e.target.dataset.id);
    let likedMovies = JSON.parse(localStorage.getItem("likedMovies")) || [];

    if (likedMovies.includes(movieId)) {
      likedMovies = likedMovies.filter((id) => id !== movieId);
      e.target.classList.remove("liked");
    } else {
      likedMovies.push(movieId);
      e.target.classList.add("liked");
    }

    localStorage.setItem("likedMovies", JSON.stringify(likedMovies));
  }
});

//   PAGINATION 
prevBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    getMovies(currentUrl.split("&page=")[0] + "&page=" + (currentPage - 1));
  }
});

nextBtn.addEventListener("click", () => {
  if (currentPage < totalPages) {
    getMovies(currentUrl.split("&page=")[0] + "&page=" + (currentPage + 1));
  }
});

function updateChevronState() {
  prevBtn.style.pointerEvents = currentPage === 1 ? "none" : "auto";
  prevBtn.style.opacity = currentPage === 1 ? 0.5 : 1;

  nextBtn.style.pointerEvents = currentPage === totalPages ? "none" : "auto";
  nextBtn.style.opacity = currentPage === totalPages ? 0.5 : 1;
}

// ERROR HANDLER 
function showError(message) {
  section.innerHTML = `
    <div class="error">
      ${message}
    </div>
  `;
}

//  CAROUSEL 
function showCarousel(movies) {
  carouselTrack.innerHTML = "";

  const featuredMovies = movies.slice(0, 5);

  featuredMovies.forEach((movie) => {
    const img = document.createElement("img");
    img.src = IMG_PATH + movie.poster_path;
    img.alt = movie.title;
    carouselTrack.appendChild(img);
  });

  startCarousel(featuredMovies.length);
}

function startCarousel(totalSlides) {
  slideIndex = 0;

  clearInterval(carouselInterval);

  carouselInterval = setInterval(() => {
    slideIndex++;

    if (slideIndex >= totalSlides) {
      slideIndex = 0;
    }

    carouselTrack.style.transform = `translateX(-${slideIndex * 100}%)`;
  }, 3000);
}
