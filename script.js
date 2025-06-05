const API_KEY = '676bbd90cc93d8.26423498'; 
const BASE_URL = 'https://www.alphavantage.co/query';
let stockChart; 
let stockna ;

document.getElementById('search-btn').addEventListener('click', fetchStockData);
document.getElementById('trending-stocks').addEventListener('change', handleTrendingStock);


async function fetchStockData() {
  const symbol = document.getElementById('stock-symbol').value.toUpperCase();
  if (!symbol) return alert('Please enter a stock symbol.');

  try {
    const url = `${BASE_URL}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data['Error Message'] || !data['Time Series (Daily)']) {
      throw new Error('Invalid stock symbol or no data available.');
    }

    const latestDate = Object.keys(data['Time Series (Daily)'])[0];
    const latestData = data['Time Series (Daily)'][latestDate];

    displayStockInfo(symbol, data);
    displayGraph(data);
    updateComparisonTable(symbol, latestData);
    document.getElementById('stock-symbol').value = ''; // Clear input
  } catch (error) {
    console.error(error);
    alert(error.message || 'An error occurred while fetching stock data.');
  }
}


function displayStockInfo(symbol, data) {
  const timeSeries = data['Time Series (Daily)'];
  const latestDate = Object.keys(timeSeries)[0];
  const latestData = timeSeries[latestDate];

  const info = `
    Symbol: ${symbol}<br>
    Date: ${latestDate}<br>
    Price: $${parseFloat(latestData['4. close']).toFixed(2)}<br>
    Volume: ${latestData['5. volume']}
  `;
  document.getElementById('stock-info').innerHTML = info;
}


function displayGraph(data) {
  const labels = Object.keys(data['Time Series (Daily)']).reverse();
  const prices = labels.map(date => parseFloat(data['Time Series (Daily)'][date]['4. close']));

  const ctx = document.getElementById('stockChart').getContext('2d');

  // Destroy existing chart instance if it exists
  if (stockChart) {
    stockChart.destroy();
  }


  stockChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Stock Price',
        data: prices,
        borderColor: 'rgba(75, 192, 192, 1)',
        fill: false,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      }
    }
  });
}


function updateComparisonTable(symbol, latestData) {
  const tbody = document.getElementById('comparison-data');


  if (document.querySelector(`#row-${symbol}`)) {
    alert('This stock is already being compared.');
    return;
  }

  const row = document.createElement('tr');
  row.id = `row-${symbol}`;
  row.innerHTML = `
    <td>${symbol}</td>
    <td>$${parseFloat(latestData['4. close']).toFixed(2)}</td>
    <td>N/A</td>
    <td>${latestData['5. volume']}</td>
    <td><button onclick="removeStock('${symbol}')">Remove</button></td>
  `;
  tbody.appendChild(row);
}


function removeStock(symbol) {
  const row = document.getElementById(`row-${symbol}`);
  if (row) {
    row.remove();
  }
}



function handleTrendingStock() {
  const symbol = this.value;
  if (symbol) {
    document.getElementById('stock-symbol').value = symbol;
    fetchStockData();
  }
}

// Populate trending stocks dropdown
(function populateTrendingStocks() {
  const trendingStocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'ADBE', 'ORCL'];
  const dropdown = document.getElementById('trending-stocks');
  trendingStocks.forEach(stock => {
    const option = document.createElement('option');
    option.value = stock;
    option.textContent = stock;
    dropdown.appendChild(option);
  });
})();
