const video = document.getElementById('webcam');
const canvas = document.getElementById('detection-overlay');
const ctx = canvas.getContext('2d');
const videoContainer = document.getElementById('video-container');
const placeholder = document.getElementById('video-placeholder');
const startBtn = document.getElementById('start-btn');
const logsContainer = document.getElementById('logs-container');
const presentVal = document.getElementById('present-count');
const absentVal = document.getElementById('absent-count');
const timeDisplay = document.getElementById('current-time');

let isDetecting = false;
let presentCount = 0;
const totalEnrolled = 42;
let detectionInterval;
let renderAnimation;

// Fake Student Database
const students = [
    { name: 'Alice Smith', id: 'CS101' },
    { name: 'Bob Johnson', id: 'CS102' },
    { name: 'Charlie Davis', id: 'CS103' },
    { name: 'Diana Prince', id: 'CS104' },
    { name: 'Ethan Hunt', id: 'CS105' },
    { name: 'Fiona Gallagher', id: 'CS106' },
    { name: 'George Miller', id: 'CS107' },
    { name: 'Hannah Abbott', id: 'CS108' }
];

const detectedStudents = new Set();

// Update Time
function updateTime() {
    const now = new Date();
    timeDisplay.innerText = now.toLocaleString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
}
setInterval(updateTime, 1000);
updateTime();

// Resize Canvas
function resizeCanvas() {
    if(!video.videoWidth) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
}

startBtn.addEventListener('click', async () => {
    if (isDetecting) {
        stopDetection();
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "user" } 
        });
        video.srcObject = stream;
        video.style.display = 'block';
        placeholder.style.display = 'none';
        
        video.onloadeddata = () => {
            isDetecting = true;
            resizeCanvas();
            startBtn.innerHTML = '<span class="material-icons-round">stop</span> Stop Detection';
            startBtn.classList.replace('btn-primary', 'btn-danger');
            videoContainer.classList.add('detecting');
            
            // clear empty log message
            if(detectedStudents.size === 0) {
                logsContainer.innerHTML = '';
            }

            simulateAIProcessing();
            animateBoundingBoxes();
        };
    } catch (err) {
        console.error("Camera error:", err);
        alert("Unable to access camera. Please check permissions or connect a webcam.");
    }
});

function stopDetection() {
    isDetecting = false;
    const stream = video.srcObject;
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    video.srcObject = null;
    video.style.display = 'none';
    placeholder.style.display = 'flex';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    startBtn.innerHTML = '<span class="material-icons-round">play_arrow</span> Start Detection';
    startBtn.classList.replace('btn-danger', 'btn-primary');
    videoContainer.classList.remove('detecting');
    
    clearInterval(detectionInterval);
    cancelAnimationFrame(renderAnimation);
}

// Bounding box simulation state
let boxes = [];

function generateRandomBox() {
    const w = 120 + Math.random() * 60;
    const h = w * 1.2;
    const x = Math.random() * (canvas.width - w - 40) + 20;
    const y = Math.random() * (canvas.height - h - 40) + 20;
    return { 
        x, y, w, h, 
        vx: (Math.random() - 0.5) * 2, 
        vy: (Math.random() - 0.5) * 2,
        prob: (0.85 + Math.random() * 0.14).toFixed(2)
    };
}

function animateBoundingBoxes() {
    if (!isDetecting) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw OpenCV typical drawing ops
    ctx.strokeStyle = '#3fb950'; // Green accent
    ctx.lineWidth = 2;
    ctx.font = '14px monospace';

    boxes.forEach(box => {
        // Update position (simple wandering)
        box.x += box.vx;
        box.y += box.vy;
        
        // Bounce off edges
        if (box.x < 0 || box.x + box.w > canvas.width) box.vx *= -1;
        if (box.y < 0 || box.y + box.h > canvas.height) box.vy *= -1;

        // Draw Box outline
        ctx.strokeRect(box.x, box.y, box.w, box.h);
        
        // Draw corners distinctively to look like CV
        const cornerLen = 15;
        ctx.beginPath();
        // Top Left
        ctx.moveTo(box.x, box.y + cornerLen); ctx.lineTo(box.x, box.y); ctx.lineTo(box.x + cornerLen, box.y);
        // Top Right
        ctx.moveTo(box.x + box.w - cornerLen, box.y); ctx.lineTo(box.x + box.w, box.y); ctx.lineTo(box.x + box.w, box.y + cornerLen);
        // Bottom Right
        ctx.moveTo(box.x + box.w, box.y + box.h - cornerLen); ctx.lineTo(box.x + box.w, box.y + box.h); ctx.lineTo(box.x + box.w - cornerLen, box.y + box.h);
        // Bottom Left
        ctx.moveTo(box.x + cornerLen, box.y + box.h); ctx.lineTo(box.x, box.y + box.h); ctx.lineTo(box.x, box.y + box.h - cornerLen);
        
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#58a6ff'; // Blue corners
        ctx.stroke();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#3fb950'; // Reset main color
        
        // Label background
        ctx.fillStyle = 'rgba(22, 27, 34, 0.8)';
        ctx.fillRect(box.x, box.y - 25, box.w, 25);
        ctx.strokeStyle = '#58a6ff';
        ctx.strokeRect(box.x, box.y - 25, box.w, 25);
        
        // Label text
        ctx.fillStyle = '#c9d1d9';
        ctx.fillText(`ID_Match: ${box.prob}`, box.x + 5, box.y - 8);
    });

    // Subtly overlay grid or scanning line
    ctx.fillStyle = 'rgba(88, 166, 255, 0.05)';
    ctx.fillRect(0, (Date.now() / 15) % canvas.height, canvas.width, 4);

    renderAnimation = requestAnimationFrame(animateBoundingBoxes);
}

function addLogEntry(student) {
    const log = document.createElement('div');
    log.className = 'log-item';
    
    // Extact initial logs
    const initial = student.name.charAt(0);
    const color = `hsl(${Math.random() * 360}, 70%, 60%)`;

    log.innerHTML = `
        <div class="log-avatar" style="background: ${color}">${initial}</div>
        <div class="log-details">
            <div class="log-name">${student.name} (${student.id})</div>
            <div class="log-time">
                <span class="material-icons-round" style="font-size:12px;">schedule</span> 
                ${new Date().toLocaleTimeString()}
            </div>
        </div>
        <div class="log-status">Marked Present</div>
    `;

    logsContainer.prepend(log);
}

function simulateAIProcessing() {
    // Determine initial box
    boxes = [generateRandomBox()];

    // Periodically detect new person
    detectionInterval = setInterval(() => {
        if(!isDetecting) return;
        
        // Add random box to simulate face finding
        if (boxes.length < 3 && Math.random() > 0.4) {
            boxes.push(generateRandomBox());
        }
        
        // Randomly remove a box to simulate face lost
        if (boxes.length > 1 && Math.random() > 0.7) {
            boxes.shift();
        }

        // Pick un-logged student
        const available = students.filter(s => !detectedStudents.has(s.id));
        if (available.length > 0 && Math.random() > 0.3) {
            const student = available[Math.floor(Math.random() * available.length)];
            detectedStudents.add(student.id);
            presentCount++;
            
            // Update stats
            presentVal.innerText = presentCount;
            absentVal.innerText = totalEnrolled - presentCount;

            addLogEntry(student);
        }
    }, 2500);
}
