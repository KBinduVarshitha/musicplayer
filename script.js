console.log("Music Player Started");

let currentSong = new Audio();
let songs = [];
let currFolder;
let play = document.getElementById("play");

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return String(minutes).padStart(2, "0") + ":" + String(remainingSeconds).padStart(2, "0");
}

async function getSongs(folder) {

    currFolder = folder;

    let a = await fetch(`/${folder}/`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;

    let as = div.getElementsByTagName("a");

    songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];

        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    let songUL = document.querySelector(".songlist ul");

    songUL.innerHTML = "";

    for (const song of songs) {
        songUL.innerHTML += `
        <li>
            <img class="invert" width="34" src="img/music.svg">
            <div class="info">
                <div>${song.replaceAll("%20", " ")}</div>
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
            playmusic(e.querySelector(".info div").innerText.trim());
        });
    });

    return songs;
}

const playmusic = (track, pause = false) => {

    currentSong.src = `/${currFolder}/` + track;

    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

// async function displayAlbums() {
//     console.log("displaying albums")
//     let a = await fetch(`/songs/`)
//     let response = await a.text();
//     let div = document.createElement("div")
//     div.innerHTML = response;
//     let anchors = div.getElementsByTagName("a")
//     let cardContainer = document.querySelector(".cardcontainer")
//     let array = Array.from(anchors)
//     for (let index = 0; index < array.length; index++) {
//         const e = array[index];
//         if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
//             let parts = e.href.split("/").filter(p => p);
//             let folder = parts[parts.length - 1];            // Get the metadata of the folder
//             let a = await fetch(`/songs/${folder}/info.json`)
//             let response = await a.json();
//             cardContainer.innerHTML += ` <div data-folder="${folder}" class="card">
//             <div class="play">
//                             <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24">
//                                 <defs>
//                                     <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
//                                         <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-opacity="0.3" />
//                                     </filter>
//                                 </defs>
//                                 <circle cx="12" cy="12" r="11" fill="#ff8c00" filter="url(#shadow)" />
//                                 <path d="M9 7.5L17 12L9 16.5Z" fill="black" />
//                             </svg>
//                         </div>

//             <img src="/songs/${folder}/cover.jpg" alt="">
//             <h2>${response.title}</h2>
//             <p>${response.description}</p>
//         </div>`
//         }
//     }

//     // Load the playlist whenever card is clicked
//     Array.from(document.getElementsByClassName("card")).forEach(e => { 
//         e.addEventListener("click", async item => {
//             console.log("Fetching Songs")
//             songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)  
//             playmusic(songs[0])

//         })
//     })
// }

async function displayAlbums() {
    console.log("displaying albums");

    const a = await fetch(`/songs/`);
    const response = await a.text();

    const div = document.createElement("div");
    div.innerHTML = response;

    const anchors = div.getElementsByTagName("a");
    const cardContainer = document.querySelector(".cardcontainer");

    for (let e of anchors) {
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            const parts = e.href.split("/").filter(p => p);
            const folder = parts[parts.length - 1]; // get folder name

            try {
                const infoResp = await fetch(`/songs/${folder}/info.json`);
                const info = await infoResp.json();

                cardContainer.innerHTML += `
                <div data-folder="${folder}" class="card">
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
                    <img src="/songs/${folder}/cover.jpg" alt="">
                    <h2>${info.title}</h2>
                    <p>${info.description}</p>
                </div>`;
            } catch(err) {
                console.log("No info.json for", folder);
            }
        }
    }

    // Add click listeners AFTER all cards are added
    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async () => {
            const folder = card.dataset.folder; // e.g., "telugu"
            songs = await getSongs(`songs/${folder}`);
            playmusic(songs[0]);
        });
    });
}

async function main() {

    await getSongs("songs/telugu");
    playmusic(songs[0], true);

    await displayAlbums();

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        }
        else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    })

    currentSong.addEventListener("timeupdate", () => {

        document.querySelector(".songtime").innerHTML =
            `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;

        if (!isNaN(currentSong.duration)) {
            document.querySelector(".circle").style.left =
                (currentSong.currentTime / currentSong.duration) * 100 + "%";
        }
    })

    document.querySelector(".seekbar").addEventListener("click", e => {

        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;

        document.querySelector(".circle").style.left = percent + "%";

        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    })

    // document.getElementById("prev").addEventListener("click", () => {

    //     let current = decodeURIComponent(currentSong.src.split("/").pop());

    //     let index = songs.indexOf(current);

    //     let prev = (index - 1 + songs.length) % songs.length;

    //     playmusic(songs[prev]);
    // })

    // document.getElementById("next").addEventListener("click", () => {

    //     let current = decodeURIComponent(currentSong.src.split("/").pop());

    //     let index = songs.indexOf(current);

    //     playmusic(songs[(index + 1) % songs.length]);
    // })

    document.getElementById("next").addEventListener("click", () => {

    let current = decodeURIComponent(currentSong.src.split("/").pop());

    // decode all song names for comparison
    let decodedSongs = songs.map(s => decodeURIComponent(s));
    let index = decodedSongs.indexOf(current);

    if(index === -1) return; // safety check

    playmusic(songs[(index + 1) % songs.length]);
});

document.getElementById("prev").addEventListener("click", () => {

    let current = decodeURIComponent(currentSong.src.split("/").pop());

    let decodedSongs = songs.map(s => decodeURIComponent(s));
    let index = decodedSongs.indexOf(current);

    if(index === -1) return;

    let prev = (index - 1 + songs.length) % songs.length;
    playmusic(songs[prev]);
});

    document.querySelector(".range input").addEventListener("input", (e) => {

        currentSong.volume = parseInt(e.target.value) / 100;

        if (currentSong.volume > 0) {
            document.querySelector(".volume img").src = "img/volume.svg";
        }
    })

    document.querySelector(".volume img").addEventListener("click", e => {

        if (e.target.src.includes("volume.svg")) {
            e.target.src = "img/mute.svg";
            currentSong.volume = 0;
            document.querySelector(".range input").value = 0;
        }
        else {
            e.target.src = "img/volume.svg";
            currentSong.volume = 0.1;
            document.querySelector(".range input").value = 10;
        }
    })

}

main();