console.log("Music Player Started");

let currentSong = new Audio();
let songs = [];
let currFolder;
let playBtn = document.getElementById("play");

// Convert seconds to MM:SS format
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return String(minutes).padStart(2, "0") + ":" + String(remainingSeconds).padStart(2, "0");
}

// Load songs from songs.json
// async function getSongs(folder) {
//     currFolder = folder;
//     try {
//         const res = await fetch(`/songs/${folder}/info.json`);
//         const data = await res.json();
//         songs = data.songs;
//     } catch(err) {
//         console.error("Could not load songs.json for", folder, err);
//         songs = [];
//     }

//     // Display song list
//     const songUL = document.querySelector(".songlist ul");
//     songUL.innerHTML = "";
//     for (const song of songs) {
//         songUL.innerHTML += `
//         <li>
//             <img class="invert" width="34" src="img/music.svg">
//             <div class="info">
//                 <div>${decodeURIComponent(song)}</div>
//                 <div>Music</div>
//             </div>
//             <div class="playnow">
//                 <span>Play Now</span>
//                 <img src="img/play.svg">
//             </div>
//         </li>`;
//     }

//     // Click on song to play
//     Array.from(document.querySelectorAll(".songlist li")).forEach(e => {
//         e.addEventListener("click", () => {
//             playmusic(e.querySelector(".info div").innerText.trim());
//         });
//     });

//     return songs;
// }

async function getSongs(folder) {

    currFolder = folder;

    try {
        const res = await fetch(`/songs/${folder}/info.json`);
        const data = await res.json();

        songs = data.songs;

    } catch (error) {
        console.error("Error loading songs:", error);
        songs = [];
    }

    let songUL = document.querySelector(".songlist ul");
    songUL.innerHTML = "";

    for (const song of songs) {

        songUL.innerHTML += `
        <li>
            <img class="invert" width="34" src="img/music.svg">
            <div class="info">
                <div>${decodeURIComponent(song)}</div>
                <div>Music</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img src="img/play.svg">
            </div>
        </li>`;
    }

    Array.from(document.querySelectorAll(".songlist li")).forEach(e => {
        e.addEventListener("click", () => {

            let track = e.querySelector(".info div").innerText.trim();
            playmusic(track);

        });
    });

    return songs;
}

// Play a song
const playmusic = (track, pause = false) => {
    currentSong.src = `/songs/${currFolder}/${track}`;

    if (!pause) {
        currentSong.play();
        playBtn.src = "img/pause.svg";
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

// Display albums dynamically
async function displayAlbums() {
    const cardContainer = document.querySelector(".cardcontainer");
    try {
        const res = await fetch("/songs/albums.json");
        const albums = await res.json();

        albums.forEach(album => {
            cardContainer.innerHTML += `
            <div data-folder="${album.folder}" class="card">
                <div class="play">
                    <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24">
                        <defs>
                            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                                <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-opacity="0.3"/>
                            </filter>
                        </defs>
                        <circle cx="12" cy="12" r="11" fill="#ff8c00" filter="url(#shadow)" />
                        <path d="M9 7.5L17 12L9 16.5Z" fill="black"/>
                    </svg>
                </div>
                <img src="/songs/${album.folder}/${album.cover}" alt="">
                <h2>${album.title}</h2>
                <p>${album.description}</p>
            </div>`;
        });

        // Album click loads songs
        Array.from(document.getElementsByClassName("card")).forEach(card => {
    card.addEventListener("click", async () => {

        const folder = card.dataset.folder;

        // Load songs and update left playlist
        await getSongs(folder);

        // Play first song of album
        playmusic(songs[0]);

    });
});

    } catch(err) {
        console.error("Failed to load albums:", err);
    }
}

// Main function
async function main() {
    // Load default album
    await getSongs("telugu");
    playmusic(songs[0], true);

    await displayAlbums();

    // Play/pause button
    playBtn.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            playBtn.src = "img/pause.svg";
        } else {
            currentSong.pause();
            playBtn.src = "img/play.svg";
        }
    });

    // Update time & seekbar
    currentSong.addEventListener("timeupdate", () => {
        const circle = document.querySelector(".circle");
        document.querySelector(".songtime").innerHTML =
            `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        if (!isNaN(currentSong.duration)) {
            circle.style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
        }
    });

    // Seekbar click
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });

    // Hamburger menu
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    // Next song
    document.getElementById("next").addEventListener("click", () => {
        let current = decodeURIComponent(currentSong.src.split("/").pop());
        let decodedSongs = songs.map(s => decodeURIComponent(s));
        let index = decodedSongs.indexOf(current);
        if (index === -1) return;
        playmusic(songs[(index + 1) % songs.length]);
    });

    // Previous song
    document.getElementById("prev").addEventListener("click", () => {
        let current = decodeURIComponent(currentSong.src.split("/").pop());
        let decodedSongs = songs.map(s => decodeURIComponent(s));
        let index = decodedSongs.indexOf(current);
        if (index === -1) return;
        let prev = (index - 1 + songs.length) % songs.length;
        playmusic(songs[prev]);
    });

    // Volume control
    document.querySelector(".range input").addEventListener("input", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
        if (currentSong.volume > 0) {
            document.querySelector(".volume img").src = "img/volume.svg";
        }
    });

    document.querySelector(".volume img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = "img/mute.svg";
            currentSong.volume = 0;
            document.querySelector(".range input").value = 0;
        } else {
            e.target.src = "img/volume.svg";
            currentSong.volume = 0.1;
            document.querySelector(".range input").value = 10;
        }
    });
}

main();