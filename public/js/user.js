// Initialize the map
let map = L.map('map').setView([28.634608, 77.447404], 16);

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);



// Create a feature group to hold editable layers
let editableLayers = new L.FeatureGroup();
map.addLayer(editableLayers);



// // Function to get user location and check if it's inside any shape
// function checkLocation() {
//     if (navigator.geolocation) {
//         navigator.geolocation.getCurrentPosition(position => {
//             let userLatLng = L.latLng(position.coords.latitude, position.coords.longitude);
//             console.log(userLatLng);
//             let layers = editableLayers.getLayers();

//             let isInside = false;
//             layers.forEach(layer => {
//                 if (layer instanceof L.Circle) {
//                     if (layer.getLatLng().distanceTo(userLatLng) <= layer.getRadius()) {
//                         isInside = true;
//                     }
//                 }
//                 // You can extend this to other shape types if needed
//             });

//             if (isInside) {
//                 alert('You are inside a geofenced area!');
//             } else {
//                 alert('You are outside all geofenced areas!');
//             }
//         }, () => {
//             alert('Geolocation is not supported or permission denied.');
//         });
//     } else {
//         alert('Geolocation is not supported by this browser.');
//     }
// }

// Function to check if the user is within the geofence
function isWithinGeofence(userLatLng) {
    let layers = editableLayers.getLayers();
    let isInside = false;

    layers.forEach(layer => {
        if (layer instanceof L.Circle) {
            // Check if the user's location is within the circle's radius
            if (layer.getLatLng().distanceTo(userLatLng) <= layer.getRadius()) {
                isInside = true;
            }else{
                isInside = false;
            }
        }
        // Extend this to other shape types if needed
    });

    return isInside;
}


function handleGeofenceEvent(isEntering, userLatLng) {
    const timestamp = new Date().toISOString();
    if (isEntering) {
        // Record check-in
        console.log(`Check-in at ${timestamp}, Location: ${userLatLng}`);
        localStorage.setItem('checkInTime', timestamp);
        localStorage.removeItem('checkOutTime'); // Clear previous check-out time
    } else {
        // Record check-out only if there is a check-in time and no existing check-out time
        const checkInTime = localStorage.getItem('checkInTime');
        const checkOutTime = localStorage.getItem('checkOutTime');
        if (checkInTime && !checkOutTime) {
            console.log(`Check-out at ${timestamp}, Location: ${userLatLng}`);
            localStorage.setItem('checkOutTime', timestamp);
            calculateWorkingHours();
        } else if (!checkInTime) {
            console.log('No check-in time found. Cannot record check-out.');
        } else {
            console.log('Check-out time already recorded.');
        }
    }
}



function calculateWorkingHours() {
    const checkInTime = new Date(localStorage.getItem('checkInTime'));
    const checkOutTime = new Date(localStorage.getItem('checkOutTime'));
    const diffMs = checkOutTime - checkInTime; // Difference in milliseconds
    const diffHrs = diffMs / (1000 * 60 * 60); // Convert to hours
    console.log(`Total working hours: ${diffHrs.toFixed(2)} hours`);
}



async function watchPositionAsync() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.watchPosition(resolve, reject, {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000
        });
    });
}

async function handleGeolocation() {
    try {
        const position = await watchPositionAsync();
        const userLatLng = L.latLng(position.coords.latitude, position.coords.longitude);
        const isInside = isWithinGeofence(userLatLng);

        console.log(userLatLng);
        // console.log(isInside);

        if (isInside) {
            handleGeofenceEvent(true, userLatLng); // Entering geofence
        } else {
            handleGeofenceEvent(false, userLatLng); // Exiting geofence
        }
    } catch (error) {
        console.error('Geolocation error:', error);
    }
}

// Call the function to start watching the position
handleGeolocation();
 




// Function to load previously saved circles
function loadSavedCircles() {
    let savedCircles;
    try {
        savedCircles = JSON.parse(localStorage.getItem('circles')) || [];
    } catch (e) {
        console.error('Error parsing saved circles:', e);
        savedCircles = [];
    }
    savedCircles.forEach(circleData => {
        let circle = L.circle([circleData.lat, circleData.lng], circleData.radius).addTo(editableLayers);
    });
}

// Call to load saved circles on initialization
loadSavedCircles();

// document.getElementById('locate').addEventListener('click', function () {
//     if (navigator.geolocation) {
//         navigator.geolocation.getCurrentPosition(function (position) {
//             let lat = position.coords.latitude;
//             let lng = position.coords.longitude;

//             // Create a marker at the current location
//             L.marker([lat, lng]).addTo(map)
//                 .bindPopup('You are here!')
//                 .openPopup();

//             // Center the map on the current location
//             map.setView([lat, lng], 13);
//         }, function (error) {
//             console.error('Error getting location:', error);
//             alert('Unable to retrieve your location.');
//         });
//     } else {
//         alert('Geolocation is not supported by this browser.');
//     }
// });

document.getElementById('locate').addEventListener('click', async function () {
    if (navigator.geolocation) {
        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, (error) => {
                    console.error('Error getting location:', error.code, error.message);
                    alert('Unable to retrieve your location.');
                    reject(error);
                }, { timeout: 60000 }); // 10 seconds timeout
            });

            let lat = position.coords.latitude;
            let lng = position.coords.longitude;

            // Create a marker at the current location
            L.marker([lat, lng]).addTo(map)
                .bindPopup('You are here!')
                .openPopup();

            // Center the map on the current location
            map.setView([lat, lng], 16);
        } catch (error) {
            console.error('Error getting location:', error);
            alert('Unable to retrieve your location.');
        }
    } else {
        alert('Geolocation is not supported by this browser.');
    }
});

function autoReload() {
    window.location.reload();
}
setInterval(autoReload, 60000); // 120000 milliseconds = 2 minutes

