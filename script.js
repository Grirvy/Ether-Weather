async function searchWeather(apiKey) {
    const cityInput = document.getElementById('cityInput').value;

    if (cityInput.trim() === '') {
        alert('Please enter a city name');
        return;
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityInput}&appid=${apiKey}&units=imperial`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cityInput}&appid=${apiKey}&units=imperial`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Network response was not ok');

        }

        const data = await response.json();
        const forecastResponse = await fetch(forecastUrl);

        if (!forecastResponse.ok) {
            throw new Error('Network response for forecast was not ok');

        }

        const forecastData = await forecastResponse.json();

        const currentWeatherData = {
            city: data.name,
            country: data.sys.country,
            date: new Date(data.dt * 1000).toLocaleDateString(),
            temperature: data.main.temp,
            humidity: data.main.humidity,
            windSpeed: data.wind.speed,
        };
        const fiveDayForecast = getFiveDayForecast(forecastData);

        displayCurrentWeather(currentWeatherData);
        displayFiveDayForecast(fiveDayForecast);

        addToSearchHistory(currentWeatherData.city);

    } catch (error) {
        console.error('Error fetching data:', error);
        alert('An error occurred while fetching data. Please try again.');
    }
};

// function to get 5 day forecast
function getFiveDayForecast(forecastData) {
    const fiveDayForecast = forecastData.list.slice(0, 5).map(item => {
        const date = new Date(item.dt * 1000); // Convert time to milliseconds
        return {
            date: date.toLocaleDateString(),
            temperature: item.main.temp,
            humidity: item.main.humidity,
            windSpeed: item.wind.speed,
        };
    });

    return fiveDayForecast;
};

// function to display 5 day forecast
function displayFiveDayForecast(fiveDayForecast) {
    const forecastContainer = document.getElementById('forecast');
    forecastContainer.innerHTML = ''; // Clear the container

    // Get the current date
    let currentDate = new Date();

    fiveDayForecast.forEach((day, index) => {
        const dayElement = document.createElement('div');
        dayElement.classList.add('forecast-day');

        // Increment the date by 1 for each forecast
        currentDate.setDate(currentDate.getDate() + 1);

        // Format the date to display as "MM/DD/YYYY"
        const updatedDate = `${currentDate.getMonth() + 1}/${currentDate.getDate()}/${currentDate.getFullYear()}`;

        dayElement.innerHTML = `
            <h3 class="date">${updatedDate}</h3>
            <p>Temperature: <span class="temperature">${day.temperature}°F</span></p>
            <p>Wind Speed: <span class="wind-speed">${day.windSpeed} mph</span></p>
            <p>Humidity: <span class="humidity">${day.humidity}%</span></p>
        `;

        forecastContainer.appendChild(dayElement);

        if (index < fiveDayForecast.length - 1) {
            const seperator = document.createElement('div');
            seperator.classList.add('forecast-seperator');
            forecastContainer.appendChild(seperator);
    
        }
    });
};
// function to display current weather
function displayCurrentWeather(data) {
    const weatherInfo = document.getElementById('weatherInfo');
    weatherInfo.innerHTML = `
    <h2>${data.city} (${data.date})</h2>
    <p>Temperature: ${data.temperature}°F</p>
    <p>Wind Speed: ${data.windSpeed} mph</p>
    <p>Humidity: ${data.humidity}%</p>
    `;

};
// function to add city to search history
function addToSearchHistory(city) {
    const searchHistoryContainer = document.getElementById('searchHistoryContainer');
    const existingCityNames = Array.from(searchHistoryContainer.children).map(item => item.textContent);
    const storedSearchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

    if (!existingCityNames.includes(city) && !storedSearchHistory.includes(city)) {
        // City does not exist in the search history, create a new history item
        const historyItem = document.createElement('div');
        historyItem.classList.add('history-item');
        historyItem.textContent = city;
        historyItem.addEventListener('click', () => {
            fetchWeatherData(city);
        });
        searchHistoryContainer.insertBefore(historyItem, searchHistoryContainer.firstChild);

        // Save the updated search history to local storage only if it's not a duplicate
        saveSearchHistoryToLocalStorage();

        console.log(`Added city to search history: ${city}`);
    } else {
        console.log(`City already exists in search history: ${city}`);
    }
};

function saveSearchHistoryToLocalStorage() {
    const searchHistoryItems = Array.from(document.querySelectorAll('.history-item')).map(item => item.textContent);
    localStorage.setItem('searchHistory', JSON.stringify(searchHistoryItems));

};

function loadSearchHistory() {
    const searchHistoryContainer = document.getElementById('searchHistory');
    const searchHistoryItems = JSON.parse(localStorage.getItem('searchHistory')) || [];
  
    searchHistoryItems.forEach(city => {
      const historyItem = document.createElement('div');
      historyItem.classList.add('history-item');
      historyItem.textContent = city;
      historyItem.addEventListener('click', () => {
        fetchWeatherData(city);
      });
      searchHistoryContainer.appendChild(historyItem);
    });
};

function clearSearchHistory() {
    const searchHistoryContainer = document.getElementById('searchHistory');

    // Clear the content of the search history container
    searchHistoryContainer.innerHTML = '';

    // Clear the search history from local storage
    localStorage.removeItem('searchHistory');
}

// Assign the clearSearchHistory function to the clear button
document.getElementById('clearHistoryButton').addEventListener('click', clearSearchHistory);

document.addEventListener('DOMContentLoaded', loadSearchHistory);

async function fetchWeatherData(city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        if (data.cod === '404') {
            alert('City not found. Please enter a valid city name.');
            return;
        }

        const currentWeatherData = {
            city: data.name,
            date: new Date(data.dt * 1000).toLocaleDateString(),
            temperature: data.main.temp,
            humidity: data.main.humidity,
            windSpeed: data.wind.speed,
        };

        // Display current weather conditions for the selected city
        displayCurrentWeather(currentWeatherData);
    } catch (error) {
        console.error('Error fetching data:', error);
        alert('An error occurred while fetching data for the selected city. Please try again.');
    }
};