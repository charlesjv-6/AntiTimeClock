var imageViewer = document.getElementById('image-viewer');
var timeElement = document.querySelector('.time');
var dateElement = document.querySelector('.date');
var dateTimeElement = document.querySelector('.date-time');
var optionWindow = document.querySelector('.option-window');
var optionsForm = document.querySelector('.options');
var uploadPreviews = document.querySelector('.image-preview');
var showReadMeToggle = document.getElementById('dont-show-checkbox');
var readMe = document.querySelector('.info-window');

const path = './images/';
const numberOfImages = 80;

let isOpen = false;
let changeInterval;
let imageIndex = 0;
let imageArray = [];
let format24hr = false;
let isRandom = false;

function updateTime() {
    var now = new Date();
    
    var hours = now.getHours();
    var minutes = now.getMinutes().toString().padStart(2, '0');
    
    var timeString;
    if (format24hr) {
        var hours24 = hours.toString().padStart(2, '0');
        timeString = hours24 + ':' + minutes;
    } else {
        var period = hours >= 12 ? 'PM' : 'AM';
        var hours12 = (hours % 12 || 12).toString().padStart(2, '0');
        timeString = hours12 + ':' + minutes + ' ' + period;
    }

    var month = (now.getMonth() + 1).toString().padStart(2, '0');
    var day = now.getDate().toString().padStart(2, '0');
    var year = now.getFullYear();
    var dateString = month + '/' + day + '/' + year;

    timeElement.textContent = timeString;
    dateElement.textContent = dateString;
}

function showPreview() {
    if (imageArray.length > 0) {
        clearPreview(); 

        if (imageArray.length <= 7) {
            imageArray.forEach(image => {
                const imageElement = document.createElement('img');
                imageElement.src = image;
                uploadPreviews.appendChild(imageElement);
            });
        } else {
            for (let i = 0; i < 6; i++) {
                const imageElement = document.createElement('img');
                imageElement.src = imageArray[i];
                uploadPreviews.appendChild(imageElement);
            }
            const imageCountElement = document.createElement('span');
            imageCountElement.innerHTML = `+${imageArray.length - 6}`;
            uploadPreviews.appendChild(imageCountElement);
        }
    }
}

function clearPreview() {
    while (uploadPreviews.firstChild) {
        uploadPreviews.removeChild(uploadPreviews.firstChild);
    }
}

function uploadImages(event) {
    const files = event.target.files;
    imageArray = [];
    let fileReadPromises = [];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        const readPromise = new Promise((resolve, reject) => {
            reader.onload = function(e) {
                const imageData = e.target.result;
                imageArray.push(imageData);
                resolve();
            };
            reader.onerror = reject;
        });
        reader.readAsDataURL(file);
        fileReadPromises.push(readPromise);
    }

    Promise.all(fileReadPromises).then(() => {
        showPreview();
    }).catch(error => {
        console.error('Error reading files', error);
    });
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
    const format = document.getElementById('format').checked;
    const random = document.getElementById('randomize').checked;
    
    const data = {
        interval: parseInt(interval),
        y: parseFloat(bottomPos),
        x: parseFloat(rightPos),
        bgColor: bgColor,
        fontColor: fontColor,
        fontSize: parseFloat(fontSize),
        visibility: visibility,
        format: format,
        random: random,
    };

    localStorage.setItem('atcw_settings', JSON.stringify(data));

    isRandom = random;
    update(parseInt(interval), parseFloat(rightPos), parseFloat(bottomPos), bgColor, parseFloat(fontSize), fontColor, visibility, format);
}

function getFromLocalStorage() {
    const storedData = localStorage.getItem('atcw_settings');
    if (storedData) {
        return JSON.parse(storedData);
    } 
    return null;
}

function update(interval, x, y, bgColor, fontSize, fontColor, visibility, format) {
    visibility ? dateTimeElement.style.display = 'flex' : dateTimeElement.style.display = 'none';
    format24hr = format;
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
        imageViewer.src = getImage();
    }, (interval * 1000));
}

function getIndex() {
    const threshold = imageArray.length || numberOfImages; 

    return function() {
        let currentIndex;
        if (isRandom) {
            currentIndex = Math.floor(Math.random() * threshold); 
        } else {
            currentIndex = imageIndex;
            imageIndex++;
            if (imageIndex >= threshold) {
                imageIndex = 0;
            }
        }
        return currentIndex;
    };
}

function getImage() {
    const index = getIndex();
    const defaultImage = path + `Screenshot (${index()+1}).png`;

    return imageArray.length ? imageArray[index()] : defaultImage;
}

this.addEventListener('load', ()=> {
    imageViewer.src = path + "Screenshot (1).png";
    optionWindow.style.display = 'none';

    const localData = getFromLocalStorage();
    const showReadMe = ()=> {
        const data = localStorage.getItem('atcw_settings_readme');
        if (data) {
            return JSON.parse(data).show;
        } 
        return false;
    }

    optionsForm.addEventListener('submit', handleSubmit);
    setInterval(updateTime, 1000);
    updateTime();

    if(localData) {
        const {interval, x, y, bgColor, fontColor, fontSize, visibility, format, random} = localData;
        
        document.getElementById('interval-input').value = interval;
        document.getElementById('bottom-pos-input').value = parseFloat(y);
        document.getElementById('right-pos-input').value = parseFloat(x);
        document.getElementById('bg-color-input').value = bgColor;
        document.getElementById('font-color-input').value = fontColor;
        document.getElementById('font-size-input').value = parseFloat(fontSize);
        document.getElementById('visibility').checked = visibility;
        document.getElementById('format').checked = format;
        document.getElementById('randomize').checked = random;

        update(interval, x, y, bgColor, fontSize, fontColor, visibility, format);
        showReadMeToggle.checked = showReadMe();
        hideReadMe(showReadMe());
    } else {
        update(60);
    }
});

function hideReadMe(isHidden) {
    if(isHidden) {
        readMe.style.display = 'none';
    }
}

showReadMeToggle.addEventListener('change', function(event) {
    localStorage.setItem('atcw_settings_readme', JSON.stringify({ show: event.target.checked }));
});

this.addEventListener('keydown', event => {
    if (event.key === 'x') toggleOptionWindow();
});
