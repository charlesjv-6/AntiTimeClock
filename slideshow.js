var imageViewer = document.getElementById('image-viewer');
var timeElement = document.querySelector('.time');
var dateElement = document.querySelector('.date');
var dateTimeElement = document.querySelector('.date-time');
var optionWindow = document.querySelector('.option-window');
var optionsForm = document.querySelector('.options');

const path = './images/';
const numberOfImages = 80;

let isOpen = false;
let imageIndex = 1;
let changeInterval;

function updateTime() {
    var now = new Date();
    
    var hours = now.getHours().toString().padStart(2, '0');
    var minutes = now.getMinutes().toString().padStart(2, '0');
    var timeString = hours + ':' + minutes;

    var month = (now.getMonth() + 1).toString().padStart(2, '0');
    var day = now.getDate().toString().padStart(2, '0');
    var year = now.getFullYear();
    var dateString = month + '/' + day + '/' + year;

    timeElement.textContent = timeString;
    dateElement.textContent = dateString;
}

function toggleOptionWindow() {
    isOpen = !isOpen;
    isOpen ? optionWindow.style.display = 'block' : optionWindow.style.display = 'none';
}

function handleSubmit(event) {
    event.preventDefault(); 

    const interval = document.getElementById('interval-input').value;
    const bottomPos = document.getElementById('bottom-pos-input').value || 12.5;
    const rightPos = document.getElementById('right-pos-input').value || 54;
    const bgColor = document.getElementById('bg-color-input').value || '#1f1f1f';
    const fontColor = document.getElementById('font-color-input').value || '#fff';
    const fontSize = document.getElementById('font-size-input').value || 12;
    const visibility = document.getElementById('visibility').checked;

    update(parseInt(interval), parseFloat(rightPos), parseFloat(bottomPos), bgColor, parseFloat(fontSize), fontColor, visibility);
}

function update(interval, x, y, bgColor, fontSize, fontColor, visibility) {
    visibility ? dateTimeElement.style.display = 'flex' : dateTimeElement.style.display = 'none';
    if(fontSize) {
        timeElement.style.fontSize = `${fontSize}px`;
        dateElement.style.fontSize = `${fontSize}px`;
    }
    if(bgColor) {
        timeElement.style.background = bgColor;
        dateElement.style.background = bgColor;
    }
    if(fontColor) {
        timeElement.style.color = fontColor;
        dateElement.style.color = fontColor;
    }
    if(x) {
        timeElement.style.marginRight = `${x}px`;
        dateElement.style.marginRight = `${x}px`;
    }
    if(y) {
        dateTimeElement.style.marginBottom = `${y}px`;
    }
    clearInterval(changeInterval);
    changeInterval = setInterval(()=> {
        imageIndex = (imageIndex % numberOfImages) + 1;
        imageViewer.src = path + `Screenshot (${imageIndex}).png`;
    }, (interval * 1000));
}

this.addEventListener('load', ()=> {
    imageViewer.src = path + `Screenshot (${imageIndex}).png`;
    optionWindow.style.display = 'none';

    optionsForm.addEventListener('submit', handleSubmit);
    setInterval(updateTime, 1000);
    updateTime();
    update(60);
});

this.addEventListener('keydown', event => {
    if (event.key === 'x') toggleOptionWindow();
});
