import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const lightbox = new SimpleLightbox('.gallery a');

let imagesLoaded = true;
let pageNum = 1;
let searchQuery = '';
let totalHits = 0;

// Consultar la API de Pixabay
async function getPhotos(query, page) {
  const apiKey = '34211460-a83c7ce03bca96928d95fb98a';
  const apiUrl = `https://pixabay.com/api/?key=${apiKey}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=40`;

  try {
    const response = await axios.get(apiUrl);
    if (response.data.hits.length === 0) {
      Notify.failure('No results found. Please try again.');
    }
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

// Función de búsqueda de fotos
async function searchPhotos(query, page) {
  try {
    const data = await getPhotos(query, page);
    if (page === 1) {
      totalHits = data.totalHits;
      Notify.success(`Hooray! We found ${totalHits} images.`);
    }

    loadImages(data.hits);
  } catch (error) {
    console.error(error);
  }
}

// Función para cargar las imágenes en el DOM
function loadImages(photos) {
  const galleryEl = document.querySelector('.gallery');
  let galleryHtml = '';

  photos.forEach((photo) => {
    galleryHtml += `
      <a href="${photo.largeImageURL}">
        <div class="photo-card">
          <img src="${photo.webformatURL}&q=low" alt="${photo.tags}" loading="lazy">
          <div class="info">
            <p class="info-item"><b>Likes:</b> ${photo.likes}</p>
            <p class="info-item"><b>Views:</b> ${photo.views}</p>
            <p class="info-item"><b>Comments:</b> ${photo.comments}</p>
            <p class="info-item"><b>Downloads:</b> ${photo.downloads}</p>
          </div>
        </div>
      </a>
    `;
  });

  galleryEl.insertAdjacentHTML('beforeend', galleryHtml);
  lightbox.refresh();
  imagesLoaded = true;

  // Mostrar mensaje cuando se llegue al final de la búsqueda
  if (pageNum * 40 >= totalHits) {
    Notify.info('We´re sorry, but you´ve reached the end of search results.');
  }
}

// Cargar imágenes al hacer scroll en la página
window.addEventListener('scroll', () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

  if (scrollTop + clientHeight >= scrollHeight - 10 && imagesLoaded) {
    imagesLoaded = false;
    pageNum += 1;
    searchPhotos(searchQuery, pageNum);
  }
});

// Función para cargar las imágenes al inicio
function init() {
  const form = document.getElementById('search-form');
  const searchInput = form.querySelector('input');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    searchQuery = searchInput.value.trim();
    if (searchQuery !== '') {
      pageNum = 1;
      document.querySelector('.gallery').innerHTML = '';
      searchPhotos(searchQuery, pageNum);
    }
  });

  // Cargar las imágenes al inicio
  searchQuery = '';
  pageNum = 1;
  document.querySelector('.gallery').innerHTML = '';
  searchPhotos(searchQuery, pageNum).then(data => {
    Notify.success(`Hooray! We found ${data.totalHits} images`);
    if (data.totalHits === 0) {
      Notify.failure('No results found. Please try again.');
    }
  });
}

init();
