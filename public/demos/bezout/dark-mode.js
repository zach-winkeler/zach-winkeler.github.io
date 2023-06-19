localString = localStorage.getItem('darkMode');

if (localString === null) {
    darkModeEnabled = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
} else {
    darkModeEnabled = (localString === 'true');
}

if (darkModeEnabled) {
    darkMode();
} else {
    lightMode();
}

function darkMode() {
    document.body.classList.add('dark');
    document.getElementById("light-mode-button").classList.remove('invisible');
    document.getElementById("dark-mode-button").classList.add('invisible');
    localStorage.setItem('darkMode', true.toString());
}

function lightMode() {
    document.body.classList.remove('dark');
    document.getElementById("dark-mode-button").classList.remove('invisible');
    document.getElementById("light-mode-button").classList.add('invisible');
    localStorage.setItem('darkMode', false.toString());
}