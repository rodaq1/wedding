/* =========================
   STATE
========================= */

const gallery = document.getElementById("gallery");
const lightbox = document.getElementById("lightbox");
const lightboxContent = document.querySelector(".lightbox-content");

const closeLightboxBtn = document.getElementById("closeLightbox");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

let mediaList = [];
let currentIndex = 0;

/* =========================
   LOAD DATA
========================= */

fetch("photos.json")
    .then(res => res.json())
    .then(data => {
        mediaList = data;
        renderGallery();
        createDownloadAllButton();
    })
    .catch(err => console.error("photos.json error:", err));

/* =========================
   RENDER GALLERY
========================= */

function renderGallery() {
    gallery.innerHTML = "";

    mediaList.forEach((item, index) => {

        const file = typeof item === "string" ? item : item.filename;
        const ext = file.split(".").pop().toLowerCase();
        const isVideo = ["mp4", "mov", "webm", "m4v"].includes(ext);

        const div = document.createElement("div");
        div.classList.add("gallery-item");

        if (isVideo) {
            const video = document.createElement("video");
            video.src = "./static/uploads/" + file;
            video.muted = true;
            video.playsInline = true;
            div.appendChild(video);

            // video badge
            const badge = document.createElement("div");
            badge.innerText = "▶";
            badge.style.position = "absolute";
            badge.style.top = "8px";
            badge.style.right = "8px";
            badge.style.background = "rgba(0,0,0,0.6)";
            badge.style.color = "white";
            badge.style.padding = "4px 6px";
            badge.style.borderRadius = "6px";
            badge.style.fontSize = "12px";
            div.appendChild(badge);

        } else {
            const img = document.createElement("img");
            img.src = "./static/uploads/" + file;
            div.appendChild(img);
        }

        /* =========================
           CLICK OPEN LIGHTBOX
        ========================= */
        div.addEventListener("click", () => openLightbox(index));

        /* =========================
           INDIVIDUAL DOWNLOAD BUTTON
        ========================= */
        const downloadBtn = document.createElement("a");
        downloadBtn.innerText = "⬇";
        downloadBtn.href = "./static/uploads/" + file;
        downloadBtn.download = file;

        downloadBtn.style.position = "absolute";
        downloadBtn.style.bottom = "8px";
        downloadBtn.style.right = "8px";
        downloadBtn.style.background = "rgba(255,255,255,0.8)";
        downloadBtn.style.padding = "4px 6px";
        downloadBtn.style.borderRadius = "6px";
        downloadBtn.style.fontSize = "12px";
        downloadBtn.style.textDecoration = "none";
        downloadBtn.style.color = "#333";

        downloadBtn.addEventListener("click", (e) => {
            e.stopPropagation(); // don't open lightbox
        });

        div.appendChild(downloadBtn);

        gallery.appendChild(div);
    });
}

/* =========================
   LIGHTBOX
========================= */

function openLightbox(index) {
    currentIndex = index;
    lightbox.style.display = "flex";
    renderLightbox();
}

function renderLightbox() {

    const file = typeof mediaList[currentIndex] === "string"
        ? mediaList[currentIndex]
        : mediaList[currentIndex].filename;

    const ext = file.split(".").pop().toLowerCase();

    lightboxContent.innerHTML = "";

    if (["mp4", "mov", "webm", "m4v"].includes(ext)) {
        const video = document.createElement("video");
        video.src = "./static/uploads/" + file;
        video.controls = true;
        video.autoplay = true;
        lightboxContent.appendChild(video);
    } else {
        const img = document.createElement("img");
        img.src = "./static/uploads/" + file;
        lightboxContent.appendChild(img);
    }
}

/* =========================
   NAVIGATION
========================= */

function nextMedia() {
    currentIndex = (currentIndex + 1) % mediaList.length;
    renderLightbox();
}

function prevMedia() {
    currentIndex = (currentIndex - 1 + mediaList.length) % mediaList.length;
    renderLightbox();
}

/* =========================
   CLOSE LIGHTBOX
========================= */

closeLightboxBtn.addEventListener("click", () => {
    lightbox.style.display = "none";
});

nextBtn.addEventListener("click", nextMedia);
prevBtn.addEventListener("click", prevMedia);

/* =========================
   KEYBOARD
========================= */

document.addEventListener("keydown", (e) => {
    if (lightbox.style.display === "flex") {
        if (e.key === "ArrowRight") nextMedia();
        if (e.key === "ArrowLeft") prevMedia();
        if (e.key === "Escape") lightbox.style.display = "none";
    }
});

/* =========================
   DOWNLOAD ALL BUTTON
========================= */

function createDownloadAllButton() {
    const btn = document.createElement("button");
    btn.innerText = "⬇ Stiahnuť všetko";
    btn.style.display = "block";
    btn.style.margin = "20px auto";
    btn.style.padding = "12px 18px";
    btn.style.border = "none";
    btn.style.borderRadius = "10px";
    btn.style.background = "linear-gradient(135deg,#d88c9a,#b86b77)";
    btn.style.color = "white";
    btn.style.cursor = "pointer";
    btn.style.fontSize = "15px";

    btn.addEventListener("click", downloadAll);

    document.body.insertBefore(btn, gallery);
}

/* =========================
   DOWNLOAD ALL LOGIC
========================= */

function downloadAll() {
    mediaList.forEach((item, i) => {

        const file = typeof item === "string" ? item : item.filename;
        const url = "./static/uploads/" + file;

        setTimeout(() => {
            const a = document.createElement("a");
            a.href = url;
            a.download = file;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }, i * 200); // small delay to avoid browser blocking
    });
}