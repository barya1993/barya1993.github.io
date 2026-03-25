// Firebase Configuration with dynamic loading
const firebaseConfig = {
    apiKey: "AIzaSyB3QsvTwj5nPHLAdHLaPKyZIRxOVUwJwiY",
    authDomain: "portfolio-tracker-3d2c5.firebaseapp.com",
    projectId: "portfolio-tracker-3d2c5",
    storageBucket: "portfolio-tracker-3d2c5.firebasestorage.app",
    messagingSenderId: "913553997169",
    appId: "1:913553997169:web:1c86797332e26d3e7d0ad0",
    measurementId: "G-2FCRS7RNHM"
};

let db = null;

// Load Firebase SDKs using compat library (works with dynamic script injection)
function loadFirebase() {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://www.gstatic.com/firebasejs/10.7.0/firebase-compat.js';
        script.onload = () => {
            firebase.initializeApp(firebaseConfig);
            db = firebase.firestore();
            resolve(true);
        };
        script.onerror = () => {
            console.log('Firebase loading failed, visitor tracking disabled');
            resolve(false);
        };
        document.head.appendChild(script);
    });
}

// Country code to flag emoji and name mapping
const countryFlags = {
    'US': { flag: '🇺🇸', name: 'United States' },
    'GB': { flag: '🇬🇧', name: 'United Kingdom' },
    'IN': { flag: '🇮🇳', name: 'India' },
    'CA': { flag: '🇨🇦', name: 'Canada' },
    'AU': { flag: '🇦🇺', name: 'Australia' },
    'DE': { flag: '🇩🇪', name: 'Germany' },
    'FR': { flag: '🇫🇷', name: 'France' },
    'JP': { flag: '🇯🇵', name: 'Japan' },
    'CN': { flag: '🇨🇳', name: 'China' },
    'NL': { flag: '🇳🇱', name: 'Netherlands' },
    'SG': { flag: '🇸🇬', name: 'Singapore' },
    'BR': { flag: '🇧🇷', name: 'Brazil' },
    'MX': { flag: '🇲🇽', name: 'Mexico' },
    'ZA': { flag: '🇿🇦', name: 'South Africa' },
    'KR': { flag: '🇰🇷', name: 'South Korea' },
    'NZ': { flag: '🇳🇿', name: 'New Zealand' },
    'IT': { flag: '🇮🇹', name: 'Italy' },
    'ES': { flag: '🇪🇸', name: 'Spain' },
    'SE': { flag: '🇸🇪', name: 'Sweden' },
    'CH': { flag: '🇨🇭', name: 'Switzerland' },
    'IE': { flag: '🇮🇪', name: 'Ireland' },
    'UA': { flag: '🇺🇦', name: 'Ukraine' },
    'PL': { flag: '🇵🇱', name: 'Poland' },
    'RU': { flag: '🇷🇺', name: 'Russia' },
    'TW': { flag: '🇹🇼', name: 'Taiwan' },
    'MY': { flag: '🇲🇾', name: 'Malaysia' },
    'TH': { flag: '🇹🇭', name: 'Thailand' },
    'PH': { flag: '🇵🇭', name: 'Philippines' },
    'ID': { flag: '🇮🇩', name: 'Indonesia' },
    'VN': { flag: '🇻🇳', name: 'Vietnam' }
};

async function getCountry() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        return data.country_code;
    } catch (error) {
        console.error('Error getting country:', error);
        return null;
    }
}

async function trackVisitor() {
    if (!db) return;
    const countryCode = await getCountry();
    if (!countryCode) return;
    const today = new Date().toISOString().split('T')[0];
    const docId = `${countryCode}-${today}`;
    try {
        const docRef = db.collection('visitors').doc(docId);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
            await docRef.update({
                count: firebase.firestore.FieldValue.increment(1),
                lastSeen: firebase.firestore.Timestamp.now()
            });
        } else {
            await docRef.set({
                countryCode: countryCode,
                date: today,
                count: 1,
                firstSeen: firebase.firestore.Timestamp.now(),
                lastSeen: firebase.firestore.Timestamp.now()
            });
        }
    } catch (error) {
        console.error('Error tracking visitor:', error);
    }
}

async function displayVisitors() {
    if (!db) return;
    try {
        const snapshot = await db.collection('visitors').orderBy('count', 'desc').get();
        const countryData = {};
        snapshot.forEach(doc => {
            const data = doc.data();
            const code = data.countryCode;
            countryData[code] = (countryData[code] || 0) + data.count;
        });
        const container = document.getElementById('visitorFlags');
        if (Object.keys(countryData).length === 0) {
            container.innerHTML = '<p style="color: var(--color-light-blue);">Be the first visitor!</p>';
            return;
        }
        let html = '';
        Object.entries(countryData).sort((a, b) => b[1] - a[1]).forEach(([code, count]) => {
            const countryInfo = countryFlags[code] || { flag: '🌍', name: code };
            html += `<div class="flag-item" title="${countryInfo.name}"><div class="flag">${countryInfo.flag}</div><div class="flag-count">${count}</div><div class="flag-name">${countryInfo.name}</div></div>`;
        });
        container.innerHTML = html;
    } catch (error) {
        console.error('Error displaying visitors:', error);
    }
}

window.addEventListener('load', async () => {
    await loadFirebase();
    trackVisitor();
    displayVisitors();
});

AOS.init();

// Custom cursor
const cursorInner = document.getElementById('cursor-inner');
const cursorOuter = document.getElementById('cursor-outer');
const links = document.querySelectorAll('a, button, label');

// Add hover effects to links (outside mousemove)
links.forEach((link) => {
    link.addEventListener('mouseenter', () => {
        cursorInner.classList.add('hover');
        cursorOuter.classList.add('hover');
    });

    link.addEventListener('mouseleave', () => {
        cursorInner.classList.remove('hover');
        cursorOuter.classList.remove('hover');
    });
});

document.addEventListener('mousemove', function (e) {
    const posX = e.clientX;
    const posY = e.clientY;

    cursorInner.style.left = `${posX}px`;
    cursorInner.style.top = `${posY}px`;

    cursorOuter.animate({
        left: `${posX}px`,
        top: `${posY}px`,
    }, { duration: 500, fill: 'forwards' });
});

// Smooth scroll for navigation - only for internal anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});
