// Initialize the map
let map = L.map('map').setView([28.63417814284452, 77.44696140289308], 15);

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

document.getElementById('locate').addEventListener('click', function () {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            let lat = position.coords.latitude;
            let lng = position.coords.longitude;

            // Create a marker at the current location
            L.marker([lat, lng]).addTo(map)
                .bindPopup('You are here!')
                .openPopup();

            // Center the map on the current location
            map.setView([lat, lng], 13);
        }, function (error) {
            console.error('Error getting location:', error);
            alert('Unable to retrieve your location.');
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
});


// Create a feature group to hold editable layers
let editableLayers = new L.FeatureGroup();
map.addLayer(editableLayers);

// Initialize Leaflet Draw control
let drawControl = new L.Control.Draw({
    draw: {
        polygon: false,
        rectangle: false,
        marker: false,
        circlemarker: false,
        polyline: false

    },
    edit: {
        featureGroup: editableLayers,
        remove: true // Allows deleting shapes
    }
});
map.addControl(drawControl);

// Function to get user location and check if it's inside the shape
// function checkLocation() {
//     if (navigator.geolocation) {
//         navigator.geolocation.getCurrentPosition(position => {
//             let userLatLng = L.latLng(position.coords.latitude, position.coords.longitude);
//             console.log(userLatLng);
//             let layers = editableLayers.getLayers();

//             let isInside = false;
//             layers.forEach(layer => {
//                 if (layer instanceof L.Circle) {
//                     isInside = layer.getLatLng().distanceTo(userLatLng) <= layer.getRadius();
//                 }
//                 // You can extend this to other shape types if needed
//             });

//             if (isInside) {
//                 alert('You are inside the geofenced area!');
//             } else {
//                 alert('You are outside the geofenced area!');
//             }
//         }, () => {
//             alert('Geolocation is not supported or permission denied.');
//         });
//     } else {
//         alert('Geolocation is not supported by this browser.');
//     }
// }

let count = parseInt(localStorage.getItem('circleCount')) || 0;

// Event handler for when a shape is created
map.on(L.Draw.Event.CREATED, function (event) {
    let layer = event.layer;
    editableLayers.addLayer(layer);

    if (layer instanceof L.Circle) {
        // Extract circle data
        let circleData = {
            id: count++,
            lat: layer.getLatLng().lat,
            lng: layer.getLatLng().lng,
            radius: layer.getRadius()
        };
        layer.options.id = circleData.id;
        // Save circle data
        saveCircleData(circleData);
        localStorage.setItem('circleCount', count);
    }
});


// Event handler for when a shape is edited
map.on(L.Draw.Event.EDITED, function (event) {
    event.layers.eachLayer(function (layer) {
        if (layer instanceof L.Circle) {
            // Extract updated circle data
            console.log(layer.options.id);
            let updatedCircleData = {
                id: layer.options.id,
                lat: layer.getLatLng().lat,
                lng: layer.getLatLng().lng,
                radius: layer.getRadius()
            };

            // Update the circle data in localStorage
            updateCircleData(updatedCircleData);
        }
    });
});


// Event handler for when a shape is deleted
map.on(L.Draw.Event.DELETED, function (event) {
    event.layers.eachLayer(function (layer) {
        if (layer instanceof L.Circle) {
            // Extract circle data
            let circleData = {
                lat: layer.getLatLng().lat,
                lng: layer.getLatLng().lng,
                radius: layer.getRadius()
            };

            // Remove the circle data from localStorage
            deleteCircleData(circleData);
        }
    });
});

// Function to save circle data
function saveCircleData(circleData) {
    let savedCircles = JSON.parse(localStorage.getItem('circles')) || [];
    // Check if the circle already exists
    let index = savedCircles.findIndex(circle =>
        circle.lat === circleData.lat &&
        circle.lng === circleData.lng &&
        circle.radius === circleData.radius
    );
    console.log(index);

    if (index === -1) {
        savedCircles.push(circleData);
        localStorage.setItem('circles', JSON.stringify(savedCircles));
        console.log(savedCircles);
    }
}
// Function to update circle data
function updateCircleData(updatedCircleData) {
    let savedCircles = JSON.parse(localStorage.getItem('circles')) || [];
    console.log(updatedCircleData);
    for (let i = 0; i < savedCircles.length; i++) {
        if (updatedCircleData.id === savedCircles[i].id) {
            console.log("match found")
            savedCircles[i] = updatedCircleData;
            localStorage.setItem('circles', JSON.stringify(savedCircles));
            console.log(savedCircles);
        }
        // console.log("saved circles :" + savedCircles[i].lat);

    }

    // console.log(savedCircles);

    // Find index of the existing circle to update
    // let index = savedCircles.findIndex(circle =>
    //     circle.lat === updatedCircleData.lat &&
    //     circle.lng === updatCircleData.lng &&
    //     circle.radius === updatedCircleData.radius
    // );

    // // Update the existing circle data
    // if (index === -1) {
    //     savedCircles[0] = updatedCircleData;
    //     localStorage.setItem('circles', JSON.stringify(savedCircles));
    //     console.log(savedCircles);
    // }

}


// Function to delete circle data
function deleteCircleData(circleData) {
    let savedCircles = JSON.parse(localStorage.getItem('circles')) || [];
    savedCircles = savedCircles.filter(circle =>
        !(circle.lat === circleData.lat &&
            circle.lng === circleData.lng &&
            circle.radius === circleData.radius)
    );
    localStorage.setItem('circles', JSON.stringify(savedCircles));
}


// Function to load previously saved circles
function loadSavedCircles() {
    let savedCircles = JSON.parse(localStorage.getItem('circles')) || [];
    savedCircles.forEach(circleData => {
        let circle = L.circle([circleData.lat, circleData.lng], circleData.radius).addTo(editableLayers);
    });
}

// Call to load saved circles on initialization
loadSavedCircles();
