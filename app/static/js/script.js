let map;
let marker;

function initMap(lat, lon, cityName = '') {
    if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
        console.error('Invalid coordinates');
        return;
    }

    if (!map) {
        map = L.map('map').setView([lat, lon], 10);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
    } else {
        map.setView([lat, lon], 10);
    }

    if (marker) {
        map.removeLayer(marker);
    }

    marker = L.marker([lat, lon]).addTo(map)
        .bindPopup(cityName || 'You are here')
        .openPopup();
}

async function geocodeCity(city) {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`);
    const data = await response.json();
    if (data.length > 0) {
        const { lat, lon } = data[0];
        return { lat: parseFloat(lat), lon: parseFloat(lon) };
    } else {
        throw new Error('City not found');
    }
}

window.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('cityForm');
    const forecastSection = document.getElementById('forecast');
    const recommendationBox = document.getElementById('recommendationBox');

    if (!form || !forecastSection || !recommendationBox) {
        console.error('Form, forecast section, or recommendation box not found');
        return;
    }

    // Navbar shrink function
    var navbarShrink = function () {
        const navbarCollapsible = document.body.querySelector('#mainNav');
        if (!navbarCollapsible) {
            return;
        }
        if (window.scrollY === 0) {
            navbarCollapsible.classList.remove('navbar-shrink');
        } else {
            navbarCollapsible.classList.add('navbar-shrink');
        }
    };

    // Shrink the navbar
    navbarShrink();

    // Shrink the navbar when page is scrolled
    document.addEventListener('scroll', navbarShrink);

    // Определяем геолокацию при загрузке
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async position => {
            const { latitude, longitude } = position.coords;
            initMap(latitude, longitude);
        }, () => {
            // fallback: Киев
            initMap(50.45, 30.52, "Kyiv");
        });
    } else {
        initMap(50.45, 30.52, "Kyiv");
    }

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const formData = new FormData(form);
        const city = formData.get('cityInput');

        if (!city || city.trim() === '') {
            alert('Введите название города.');
            return;
        }

        try {
            const response = await fetch('/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({ cityInput: city })
            });

            if (!response.ok) throw new Error('Ошибка при загрузке данных');

            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // Обновление прогноза погоды
            const newForecast = doc.getElementById('forecast');
            if (newForecast && forecastSection) {
                forecastSection.innerHTML = newForecast.innerHTML;
            }

            // Обновление блока с рекомендациями
            const newRecommendation = doc.getElementById('recommendationBox');
            if (newRecommendation && recommendationBox) {
                recommendationBox.innerHTML = newRecommendation.innerHTML;
            }

            // Обновляем карту с новыми координатами
            const { lat, lon } = await geocodeCity(city);
            initMap(lat, lon, city);
            form.reset(); // очищаем форму

        } catch (error) {
            console.error('Ошибка:', error);
            alert('Город не найден или произошла ошибка при загрузке данных.');
        }
    });
});

