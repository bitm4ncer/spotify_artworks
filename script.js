document.getElementById('searchButton').addEventListener('click', searchArtist);

async function searchArtist() {
    const artistName = document.getElementById('searchInput').value;
    if (!artistName) return;

    const token = await getToken();
    const artistId = await getArtistId(artistName, token);
    const albums = await getAllArtistAlbums(artistId, token);

    displayAlbums(albums);
}

async function getToken() {
    const clientId = '83c80f7e76fe4e1090012033aee78013';
    const clientSecret = '5bf1988349e24c8a88422513fb12437e';

    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`)
        },
        body: 'grant_type=client_credentials'
    });

    const data = await response.json();
    return data.access_token;
}

async function getArtistId(artistName, token) {
    const response = await fetch(`https://api.spotify.com/v1/search?q=${artistName}&type=artist`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const data = await response.json();
    return data.artists.items[0].id;
}

async function getAllArtistAlbums(artistId, token) {
    let albums = [];
    let offset = 0;
    const limit = 50; // Max limit allowed by Spotify API

    while (true) {
        const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}/albums?offset=${offset}&limit=${limit}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        albums = albums.concat(data.items);

        if (data.items.length < limit) {
            break;
        }

        offset += limit;
    }

    return albums;
}

function displayAlbums(albums) {
    const results = document.getElementById('results');
    results.innerHTML = '';

    albums.forEach(album => {
        const albumDiv = document.createElement('div');
        albumDiv.className = 'album';

        const link = document.createElement('a');
        link.href = album.images[0].url;
        link.setAttribute('data-lightbox', 'album');
        link.setAttribute('data-title', album.name);

        const img = document.createElement('img');
        img.src = album.images[0].url;
        img.alt = album.name;
        img.width = 200;

        link.appendChild(img);
        albumDiv.appendChild(link);

        const title = document.createElement('div');
        title.className = 'album-title';
        title.textContent = album.name;

        albumDiv.appendChild(title);
        results.appendChild(albumDiv);
    });
}
