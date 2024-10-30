// script.js

let villageData = []; // Array to store fetched data

function getCenterCoordinate(geometry) {
    switch (geometry.type) {
        case 'Point':
            return geometry.coordinates;

        case 'LineString':
            const lineCoordinates = geometry.coordinates;
            const lineLength = lineCoordinates.length;
            const midIndex = Math.floor(lineLength / 2);
            return lineCoordinates[midIndex];

        case 'Polygon':
            const polygonCoordinates = geometry.coordinates[0]; // Get the outer ring of the polygon
            const sumCoordinates = polygonCoordinates.reduce(
                (acc, coord) => {
                    acc[0] += coord[0]; // Longitude
                    acc[1] += coord[1]; // Latitude
                    return acc;
                },
                [0, 0]
            );
            const centerX = sumCoordinates[0] / polygonCoordinates.length;
            const centerY = sumCoordinates[1] / polygonCoordinates.length;
            return [centerY, centerX];

        default:
            console.warn('Unsupported geometry type:', geometry.type);
            return [-8.236436279372697, 115.09715438190644]; // Default coordinates
    }
}

// Function to show loading message
function showLoading() {
    const tableBody = document.querySelector("tbody");
    tableBody.innerHTML = `
        <tr>
            <td colspan="4" class="text-center">Loading...</td>
        </tr>
    `;
}

// Function to fetch data from the local JSON file
async function fetchData() {
    showLoading();
    try {
        const response = await fetch('/data-spatials/batas-desa-buleleng.json');
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const data = await response.json();
        villageData = data.features.map((feature) => ({
            name: feature.properties.NAMOBJ,
            district: feature.properties.WADMKC,
            center_coordinate: getCenterCoordinate(feature.geometry),
            area: feature.properties.LUASWH,
            geometry: JSON.stringify(feature.geometry)
        }));
        populateTable(villageData); // Populate table with initial data
    } catch (error) {
        console.error("Error fetching data:", error);
        showError("Failed to load data.");
    }
}

// Function to show error message
function showError(message) {
    const tableBody = document.querySelector("tbody");
    tableBody.innerHTML = `
        <tr>
            <td colspan="4" class="text-center text-danger">${message}</td>
        </tr>
    `;
}

// Function to populate the table with data
function populateTable(data) {
    const tableBody = document.querySelector("tbody");

    // Clear any existing rows in the table body
    tableBody.innerHTML = "";

    // Loop through data array and create table rows
    data.forEach((village, index) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <th scope="row">${index + 1}</th>
            <td>${village.name}</td>
            <td>${village.district}</td>
            <td style="width: 150px;">
                <textarea class="form-control" rows="2" readonly style="resize: vertical;">${village.area}</textarea>
            </td>
            <td style="width: 200px;">
                <textarea class="form-control" rows="3" readonly style="resize: vertical;">[${village.center_coordinate}]</textarea>
            </td>
            <td style="width: 900px;">
                <textarea class="form-control" rows="4" readonly style="resize: vertical;">${village.geometry}</textarea>
            </td>
        `;

        tableBody.appendChild(row);
    });
}


// Function to handle search on client-side data
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const filteredData = villageData.filter(village =>
        village.name.toLowerCase().includes(searchTerm)
    );
    populateTable(filteredData); // Populate table with filtered data
}

// Load data on page load
document.addEventListener("DOMContentLoaded", () => {
    fetchData();

    // Add event listener to the search input field
    const searchInput = document.querySelector(".form-control");
    searchInput.addEventListener("input", handleSearch);
});
