const mapDiv = document.getElementById("map");

if (mapDiv) {
    const mapToken = mapDiv.dataset.token;
    const listingCoords = JSON.parse(mapDiv.dataset.coords);

    const map = new maplibregl.Map({
        container: "map",
        style: `https://api.maptiler.com/maps/streets/style.json?key=${mapToken}`,
        center: listingCoords, // [lng, lat]
        zoom: 9
    });

    const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
        <div class="popup-card">
            <div class="popup-title">${mapDiv.dataset.title}</div>
            <div class="popup-para">Exact Location will be provided after booking</div>
            <div class="popup-location">${mapDiv.dataset.location}</div>
        </div>
    `);



    new maplibregl.Marker({ color: "#fe424d"})
        .setLngLat(listingCoords)
        .setPopup(popup)
        .addTo(map);

    map.on("load", () => map.resize());
}
