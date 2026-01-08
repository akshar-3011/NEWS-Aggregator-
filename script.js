const API_KEY = 'bcfe7b7ae55a413ea20d3ef934b473ce'; 
const BASE_URL = 'https://newsapi.org/v2/top-headlines';

const buttons = document.querySelectorAll('.cat-btn');
const newsGrid = document.getElementById('news-grid');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const searchInput = document.getElementById('searchInput');

let currentCategory = 'general';
let allArticles = []; 

document.addEventListener('DOMContentLoaded', () => {
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            fetchNews(currentCategory);
        });
    });

    document.querySelector('.logo').addEventListener('click', (e) => {
        e.preventDefault();
        location.reload();
    });

    let timeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(filterNews, 300);
    });

    fetchNews(currentCategory);
});

async function fetchNews(category) {
    loading.style.display = 'block';
    error.style.display = 'none';
    newsGrid.innerHTML = '';
    showSkeletons(9);

    try {
        const response = await fetch(
            `${BASE_URL}?country=us&category=${category}&pageSize=30&apiKey=${API_KEY}`
        );

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();

        if (data.status !== 'ok') throw new Error(data.message || 'API error');

        allArticles = data.articles;
        displayNews(allArticles);

    } catch (err) {
        console.error(err);
        error.style.display = 'block';
        newsGrid.innerHTML = '';
    } finally {
        loading.style.display = 'none';
    }
}

function displayNews(articles) {
    newsGrid.innerHTML = ''; 

    if (articles.length === 0) {
        newsGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; padding: 40px;">No articles found.</p>';
        return;
    }

    articles.forEach((article, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.animationDelay = `${index * 50}ms`;

        const img = document.createElement('img');
        img.src = article.urlToImage || 'https://via.placeholder.com/400x200?text=No+Image';
        img.alt = article.title;
        img.loading = 'lazy';
        img.onerror = () => img.src = 'https://via.placeholder.com/400x200?text=No+Image';

        const body = document.createElement('div');
        body.className = 'card-body';
        body.innerHTML = `
            <h3>${article.title || 'No title'}</h3>
            <p>${article.description || 'No description available.'}</p>
            <a href="${article.url}" target="_blank" rel="noopener" class="read-more">Read More</a>
        `;

        const footer = document.createElement('div');
        footer.className = 'card-footer';
        footer.innerHTML = `
            <span class="source">${article.source?.name || 'Unknown'}</span>
            <span>${formatDate(article.publishedAt)}</span>
        `;

        card.append(img, body, footer);
        newsGrid.appendChild(card);
    });

    filterNews();
}

function filterNews() {
    const query = searchInput.value.trim().toLowerCase();
    const cards = document.querySelectorAll('.card');

    cards.forEach(card => {
        const title = card.querySelector('h3').innerText.toLowerCase();
        const description = card.querySelector('p').innerText.toLowerCase();
        const matches = title.includes(query) || description.includes(query);
        card.classList.toggle('hidden', !matches);
    });
}

function formatDate(dateStr) {
    if (!dateStr) return 'Date unavailable';
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showSkeletons(count = 9) {
    for (let i = 0; i < count; i++) {
        const skel = document.createElement('div');
        skel.className = 'skeleton skeleton-card';
        newsGrid.appendChild(skel);
    }
}