const intro = document.querySelector('.intro-images');
const textSection = document.querySelector('.intro-text');
const artistsWrapper = document.querySelector('.artists-wrapper');
const sections = document.querySelectorAll('.fullscreen-section');
const dotsContainer = document.getElementById('dots-container');
const instagramLinks = document.querySelectorAll('.instagram-link');
const scrollArrow = document.querySelector('.scroll-arrow');

let currentVertical = 0;   // 0 = intro, 1 = text, 2 = artists
let currentHorizontal = 0; // artists only
let isScrolling = false;

/* ================= SCROLL BAR HANDLING ================= */

function updateScrollbarVisibility() {
    if (currentVertical === 0) {
        document.body.classList.add('on-intro-images');
    } else {
        document.body.classList.remove('on-intro-images');
    }
}

function updateDotsVisibility() {
    if (currentVertical === 2) {
        dotsContainer.classList.add('visible');
    } else {
        dotsContainer.classList.remove('visible');
    }
}

updateScrollbarVisibility();
updateDotsVisibility();

/* ================= SCROLL ARROW CLICK ================= */

if (scrollArrow) {
    scrollArrow.addEventListener('click', () => {
        goVertical(1);
    });
}

/* ================= INSTAGRAM LINKS ================= */

instagramLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.stopPropagation(); // Verhindert Scroll-Trigger
    });
});

/* ================= RANDOM INTRO BILDER ================= */

// Dynamically detect numbered images in images/start_page and rotate them.
const startPageFormats = ['jpg', 'jpeg', 'png', 'JPG', 'JPEG', 'PNG'];
const maxIntroChecks = 50; // try up to N numbered files (1..N)
let availableIntroImages = [];
let currentImageIndex = 0; // index into availableIntroImages

function setIntroBackgroundByPath(path) {
    intro.style.backgroundImage = `url('${path}')`;
    intro.style.backgroundSize = 'cover';
    intro.style.backgroundPosition = 'center';
    intro.style.transition = 'background-image 1s ease-in-out';
}

function startRotation() {
    if (availableIntroImages.length <= 1) return;
    setInterval(() => {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * availableIntroImages.length);
        } while (newIndex === currentImageIndex && availableIntroImages.length > 1);
        currentImageIndex = newIndex;
        setIntroBackgroundByPath(availableIntroImages[currentImageIndex]);
    }, 5000);
}

function detectIntroImages() {
    const checks = [];
    for (let i = 1; i <= maxIntroChecks; i++) {
        startPageFormats.forEach(format => {
            checks.push(new Promise(resolve => {
                const img = new Image();
                const path = `images/start_page/${i}.${format}`;
                img.onload = () => resolve(path);
                img.onerror = () => resolve(null);
                img.src = path;
            }));
        });
    }

    return Promise.all(checks).then(results => {
        // keep unique successful paths
        const set = new Set(results.filter(Boolean));
        availableIntroImages = Array.from(set);

        // sort numerically by the numbered filename (1,2,3...)
        availableIntroImages.sort((a, b) => {
            const num = p => {
                const m = p.match(/\/start_page\/(\d+)\./);
                return m ? parseInt(m[1], 10) : Infinity;
            };
            return num(a) - num(b);
        });

        // fallback to the original single image if nothing found
        if (availableIntroImages.length === 0) {
            availableIntroImages = ['images/start_page/1.jpeg'];
        }

        // ensure that the first shown image is number 1 if it exists
        const idx1 = availableIntroImages.findIndex(p => /\/start_page\/1\./.test(p));
        currentImageIndex = idx1 >= 0 ? idx1 : 0;
        setIntroBackgroundByPath(availableIntroImages[currentImageIndex]);
        startRotation();
    });
}

// kick off detection and rotation
detectIntroImages();

/* ================= KÜNSTLER HINTERGRUNDBILDER SETZEN ================= */

sections.forEach((sec) => {
    const artist = sec.getAttribute('data-artist');
    
    // Versuche verschiedene Bildformate
    const formats = ['jpg', 'jpeg', 'png', 'JPG', 'JPEG', 'PNG'];
    let imageFound = false;
    
    formats.forEach(format => {
        if (!imageFound) {
            const img = new Image();
            img.onload = () => {
                sec.style.backgroundImage = `url('images/artists/${artist}/background.${format}')`;
                sec.style.backgroundSize = 'cover';
                sec.style.backgroundPosition = 'center';
                imageFound = true;
            };
            img.src = `images/artists/${artist}/background.${format}`;
        }
    });
});

/* ================= DOTS DYNAMISCH GENERIEREN ================= */

sections.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    if (index === 0) dot.classList.add('active');
    dot.addEventListener('click', () => {
        goVertical(2);
        goHorizontal(index);
    });
    dotsContainer.appendChild(dot);
});

const dots = document.querySelectorAll('.dot');

/* ================= ARTISTS INITIAL ================= */

sections.forEach((sec, index) => {
    sec.style.transform = `translateX(${index * 100}vw)`;
});

/* ================= NAVIGATION ================= */

function goVertical(index) {
    if (index < 0) index = 0;
    if (index > 2) index = 2;

    currentVertical = index;

    if (currentVertical === 0) {
        intro.scrollIntoView({ behavior: 'smooth' });
    }

    if (currentVertical === 1) {
        textSection.scrollIntoView({ behavior: 'smooth' });
    }

    if (currentVertical === 2) {
        artistsWrapper.scrollIntoView({ behavior: 'smooth' });
        updateDots();
    }

    updateScrollbarVisibility();
    updateDotsVisibility();
}

function goHorizontal(index) {
    // Wrap around: if beyond last, go to first; if before first, go to last
    if (index >= sections.length) index = 0;
    if (index < 0) index = sections.length - 1;

    currentHorizontal = index;

    sections.forEach((sec, i) => {
        sec.style.transform = `translateX(${(i - currentHorizontal) * 100}vw)`;
    });

    updateDots();
}

function updateDots() {
    dots.forEach(dot => dot.classList.remove('active'));
    if (dots[currentHorizontal]) dots[currentHorizontal].classList.add('active');
}

/* ================= WHEEL ================= */

window.addEventListener('wheel', (e) => {
    if (isScrolling) return;

    if (currentVertical < 2) {
        if (e.deltaY > 0) goVertical(currentVertical + 1);
        else goVertical(currentVertical - 1);
    } else {
        if (e.deltaY > 0 || e.deltaX > 0) goHorizontal(currentHorizontal + 1);
        else goHorizontal(currentHorizontal - 1);
    }

    isScrolling = true;
    setTimeout(() => isScrolling = false, 700);
});

/* ================= KEYBOARD ================= */

window.addEventListener('keydown', (e) => {
    if (isScrolling) return;

    if (e.key === "ArrowDown") {
        e.preventDefault();
        goVertical(currentVertical + 1);
        isScrolling = true;
        setTimeout(() => isScrolling = false, 50);
    }

    if (e.key === "ArrowUp") {
        e.preventDefault();
        goVertical(currentVertical - 1);
        isScrolling = true;
        setTimeout(() => isScrolling = false, 50);
    }

    if (currentVertical === 2) {
        if (e.key === "ArrowRight") {
            e.preventDefault();
            goHorizontal(currentHorizontal + 1);
            isScrolling = true;
            setTimeout(() => isScrolling = false, 50);
        }
        if (e.key === "ArrowLeft") {
            e.preventDefault();
            goHorizontal(currentHorizontal - 1);
            isScrolling = true;
            setTimeout(() => isScrolling = false, 50);
        }
    }
});

/* ================= TOUCH / DRAG ================= */

let startX = 0;
let startY = 0;

window.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
});

window.addEventListener('touchend', e => {
    const diffX = e.changedTouches[0].clientX - startX;
    const diffY = e.changedTouches[0].clientY - startY;

    if (Math.abs(diffY) > Math.abs(diffX)) {
        if (diffY < -50) goVertical(currentVertical + 1);
        if (diffY > 50) goVertical(currentVertical - 1);
    } else if (currentVertical === 2) {
        if (diffX < -50) goHorizontal(currentHorizontal + 1);
        if (diffX > 50) goHorizontal(currentHorizontal - 1);
    }
});