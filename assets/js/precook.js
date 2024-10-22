document.addEventListener('DOMContentLoaded', function() {
    restoreFormValues();
    document.getElementById('precookForm').addEventListener('submit', function(e) {
        e.preventDefault();
        calculatePrecook();
    });

    // Ensure the result div is hidden initially
    document.getElementById('result').classList.remove('show');
});

// Helper function to parse various time formats into decimal hours
function parseTimeToDecimalHours(timeStr) {
    // Remove any whitespace
    timeStr = timeStr.trim();
    
    // Initialize values
    let hours = 0;
    let minutes = 0;
    let seconds = 0;
    
    // Match different parts of the time string
    // This regex handles formats like:
    // 6h30m10s, 6h30min10sec, 6h30m, 6h, 6hours30minutes, etc.
    const hourMatch = timeStr.match(/(\d+)\s*h(?:ours?)?/);
    const minuteMatch = timeStr.match(/(\d+)\s*m(?:in(?:utes?)?)?/);
    const secondMatch = timeStr.match(/(\d+)\s*s(?:ec(?:onds?)?)?/);
    
    if (!hourMatch && !minuteMatch && !secondMatch) {
        throw new Error('Invalid time format');
    }
    
    // Extract values if they exist
    if (hourMatch) hours = parseInt(hourMatch[1]);
    if (minuteMatch) minutes = parseInt(minuteMatch[1]);
    if (secondMatch) seconds = parseInt(secondMatch[1]);
    
    // Convert to decimal hours
    return hours + minutes / 60 + seconds / 3600;
}

function calculatePrecook() {
    const soulSpeed = document.getElementById('soulSpeed').value;
    const dorbSpeed = document.getElementById('dorbSpeed').value;
    const dorbQty = parseInt(document.getElementById('dorbQty').value);
    const mahakalaQty = parseInt(document.getElementById('mahakalaQty').value);
    
    saveFormValues();
    
    if (dorbQty + mahakalaQty > 4) {
        alert('Invalid quantity. The combined total of Dragon Orbs and Mahakalas must be between 0 and 4.');
        return;
    }
    
    try {
        const soulDecimalHours = parseTimeToDecimalHours(soulSpeed);
        const dOrbDecimalHours = parseTimeToDecimalHours(dorbSpeed);
        
        const qtySouls = 9 - (dorbQty + mahakalaQty);
        const totalHours = (soulDecimalHours * qtySouls) + (dOrbDecimalHours * dorbQty) + (48 * mahakalaQty);
        
        const initialDate = new Date(2024, 2, 1, 9, 0, 0); // March 1, 2024, 09:00:00 UTC
        const weeksCycle = 3;
        
        // Rest of the calculation remains the same...
        const now = new Date();
        const daysDifference = Math.floor((now - initialDate) / (1000 * 60 * 60 * 24));
        const weeksDifference = Math.floor(daysDifference / 7) + (daysDifference % 7 !== 0 ? 1 : 0);
        
        const targetDate = new Date(initialDate.getTime() + (Math.floor((weeksDifference + 2) / weeksCycle) * weeksCycle * 7 * 24 * 60 * 60 * 1000));
        const newDateTime = new Date(targetDate.getTime() - (totalHours * 60 * 60 * 1000));
        
        const formattedDate = formatDate(newDateTime);
        const relativeTime = formatRelativeTime(newDateTime);
        
        const weekType = totalHours > 168 ? 'Lotto' : 'Wish';
        
        const resultText = `You need to begin pre-cooking by <b>${formattedDate}</b> local time of ${weekType} week. (<b>${relativeTime}</b>)`;
        
        const resultElement = document.getElementById('result');
        resultElement.innerHTML = resultText;
        
        // Reset and show animation
        resultElement.classList.remove('show');
        void resultElement.offsetWidth;
        resultElement.classList.add('show');
    } catch (error) {
        alert('Invalid time format. Please use formats like:\n- 6h30m10s\n- 6h30min10sec\n- 6hours30minutes10seconds\n- 6h30m\n- 6h');
    }
}

function formatDate(date) {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const dayOfWeek = daysOfWeek[date.getDay()];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;

    return `${dayOfWeek}, ${month} ${day}, ${year} at ${formattedHours}:${formattedMinutes} ${ampm}`;
}

function formatRelativeTime(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((date - now) / 1000);

    if (diffInSeconds < 0) {
        return "in the past";
    }

    const intervals = [
        { label: 'year', seconds: 31536000 },
        { label: 'month', seconds: 2592000 },
        { label: 'day', seconds: 86400 },
        { label: 'hour', seconds: 3600 },
        { label: 'minute', seconds: 60 }
    ];

    for (let i = 0; i < intervals.length; i++) {
        const interval = intervals[i];
        const count = Math.floor(diffInSeconds / interval.seconds);
        if (count >= 1) {
            return `in ${count} ${interval.label}${count > 1 ? 's' : ''}`;
        }
    }

    return "just now";
}

function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = name + '=' + value + ';expires=' + expires.toUTCString() + ';path=/';
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function saveFormValues() {
    setCookie('soulSpeed', document.getElementById('soulSpeed').value, 30);
    setCookie('dorbSpeed', document.getElementById('dorbSpeed').value, 30);
    setCookie('dorbQty', document.getElementById('dorbQty').value, 30);
    setCookie('mahakalaQty', document.getElementById('mahakalaQty').value, 30);
}

function restoreFormValues() {
    const soulSpeed = getCookie('soulSpeed');
    const dorbSpeed = getCookie('dorbSpeed');
    const dorbQty = getCookie('dorbQty');
    const mahakalaQty = getCookie('mahakalaQty');

    if (soulSpeed) document.getElementById('soulSpeed').value = soulSpeed;
    if (dorbSpeed) document.getElementById('dorbSpeed').value = dorbSpeed;
    if (dorbQty) document.getElementById('dorbQty').value = dorbQty;
    if (mahakalaQty) document.getElementById('mahakalaQty').value = mahakalaQty;
}