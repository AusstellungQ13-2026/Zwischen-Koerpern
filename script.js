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

const totalImages = 5;
let currentImageIndex = Math.floor(Math.random() * totalImages) + 1;

function setIntroBackground(index) {
    intro.style.backgroundImage = `url('images/start_page/${index}.jpeg')`;
    intro.style.backgroundSize = 'cover';
    intro.style.backgroundPosition = 'center';
    intro.style.transition = 'background-image 1s ease-in-out';
}

setIntroBackground(currentImageIndex);

setInterval(() => {
    let newIndex;
    do {
        newIndex = Math.floor(Math.random() * totalImages) + 1;
    } while (newIndex === currentImageIndex);

    currentImageIndex = newIndex;
    setIntroBackground(currentImageIndex);
}, 5000);

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