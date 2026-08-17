// Objek untuk melacak waktu perubahan terakhir per slot
        let lastPlayed = {};

        // Fungsi untuk memutar suara hero
        function playVoice(voiceSrc) {
            let audio = document.getElementById("hero-voice");
            audio.pause(); // Hentikan pemutaran sebelumnya
            audio.currentTime = 0; // Reset waktu audio
            audio.src = voiceSrc;
            audio.play().catch(error => console.error('Error playing audio:', error));
        }

        // Fungsi untuk memperbarui tampilan dropdown dan gambar
        function updateDisplay() {
            for (let i = 1; i <= 20; i++) {
                let imgSrc = localStorage.getItem(`selectedHero${i}`);
                let voiceSrc = localStorage.getItem(`selectedVoice${i}`);
                let heroChanged = localStorage.getItem(`heroChanged${i}`);
                
                let imgElement = document.getElementById(`image-display-${i}`);
                let boxElement = document.getElementById(`image-box-${i}`);

                let cloneImgElement = document.getElementById(`clone-image-display-${i}`);
                let cloneBoxElement = document.getElementById(`clone-image-box-${i}`);

                if (imgSrc) {
                    // Update gambar asli
                    imgElement.src = imgSrc;
                    imgElement.style.opacity = "1";
                    boxElement.classList.add("show");

                    // Update gambar clone
                    if (cloneImgElement && cloneBoxElement) {
                        cloneImgElement.src = imgSrc;
                        cloneImgElement.style.opacity = "1";
                        cloneBoxElement.classList.add("show");
                    }

                    // Putar suara hanya jika hero baru dipilih
                    if (voiceSrc && heroChanged && (!lastPlayed[i] || lastPlayed[i] !== heroChanged)) {
                        playVoice(voiceSrc);
                        lastPlayed[i] = heroChanged; // Simpan waktu perubahan
                    }
                } else {
                    // Hapus gambar asli jika kosong
                    imgElement.src = "";
                    imgElement.style.opacity = "0";
                    boxElement.classList.remove("show");

                    // Hapus gambar clone jika kosong
                    if (cloneImgElement && cloneBoxElement) {
                        cloneImgElement.src = "";
                        cloneImgElement.style.opacity = "0";
                        cloneBoxElement.classList.remove("show");
                    }
                    lastPlayed[i] = null; // Reset jejak jika tidak ada hero
                }
            }
        }

        window.addEventListener("storage", updateDisplay);
        updateDisplay();

// Array fase untuk timer dan arah panah
const phases = [
    { type: "", direction: "/Assets/Other/LeftBanning.gif" },
    { type: "", direction: "/Assets/Other/RightBanning.gif" },
    { type: "", direction: "/Assets/Other/LeftBanning.gif" },
    { type: "", direction: "/Assets/Other/RightBanning.gif" },
    { type: "", direction: "/Assets/Other/LeftPicking.gif" },
    { type: "", direction: "/Assets/Other/RightPicking.gif" },
    { type: "", direction: "/Assets/Other/LeftPicking.gif" },
    { type: "", direction: "/Assets/Other/RightPicking.gif" },
    { type: "", direction: "/Assets/Other/RightBanning.gif" },
    { type: "", direction: "/Assets/Other/LeftBanning.gif" },
    { type: "", direction: "/Assets/Other/RightPicking.gif" },
    { type: "", direction: "/Assets/Other/LeftPicking.gif" },
    { type: "", direction: "/Assets/Other/RightPicking.gif" },
    { type: "", direction: "/Assets/Other/Adjustment.gif" }
];

// Array fase untuk menyalakan box di display
const phases2 = [
    ["ban-left-1"],
    ["ban-right-1"],
    ["ban-left-2"],
    ["ban-right-2"],
    ["pick-left-1"],
    ["pick-right-1", "pick-right-2"],
    ["pick-left-2", "pick-left-3"],
    ["pick-right-3"],
    ["ban-right-3"],
    ["ban-left-3"],
    ["pick-right-4"],
    ["pick-left-4", "pick-left-5"],
    ["pick-right-5"],
    []
];

        let timerInterval;
        let lastUpdate = parseInt(localStorage.getItem("updateTime")) || 0;

        const phaseElement = document.getElementById('phase');
        const arrowElement = document.getElementById('arrow');
        const timerElement = document.getElementById('timer');
        const timerBar = document.getElementById('timer-bar');

        function updateUI() {
            let currentPhaseIndex = parseInt(localStorage.getItem("currentPhaseIndex")) || 0;
            let timer = parseInt(localStorage.getItem("timer")) || 60;
            let timerRunning = localStorage.getItem("timerRunning") === "true";
            let resetTimerBar = localStorage.getItem("resetTimerBar") === "true";

            if (resetTimerBar) {
                timerBar.style.transition = "none";  
                timerBar.style.transform = "translateX(-50%) scaleX(1)"; 
                localStorage.setItem("resetTimerBar", "false"); 
            }

            if (currentPhaseIndex < phases.length) {
                const currentPhase = phases[currentPhaseIndex];
                phaseElement.textContent = currentPhase.type;
                arrowElement.src = currentPhase.direction;
                timerElement.textContent = timer;
            } else {
                phaseElement.textContent = "All Phases Completed";
                arrowElement.src = "";
                timerElement.textContent = "";
                timerBar.style.width = "0%";
            }

            if (timerRunning) {
                startTimer(timer);
            } else {
                clearInterval(timerInterval);
                timerBar.style.transition = "none";
            }
        }

        function startTimer(timeLeft) {
            clearInterval(timerInterval);
            timerBar.style.transition = "transform 0s";  
            timerBar.style.transform = "translateX(-50%) scaleX(1)"; 

            setTimeout(() => {
                timerBar.style.transition = `transform ${timeLeft}s linear`;
                timerBar.style.transform = "translateX(-50%) scaleX(0)";
            }, 100);

            timerInterval = setInterval(() => {
                let timer = parseInt(localStorage.getItem("timer")) || 0;
                if (timer > 0) {
                    timer--;
                    timerElement.textContent = timer;
                    localStorage.setItem("timer", timer);
                } else {
                    clearInterval(timerInterval);
                    timerElement.textContent = "0";
                    localStorage.setItem("timerRunning", "false");
                }
            }, 1000);
        }

        function checkLocalStorageChanges() {
            let newUpdateTime = parseInt(localStorage.getItem("updateTime")) || 0;
            if (newUpdateTime !== lastUpdate) {
                lastUpdate = newUpdateTime;
                updateUI();
            }
        }

        function updateDisplay2() {
            let currentPhaseIndex = parseInt(localStorage.getItem("currentPhaseIndex")) || 0;
            document.querySelectorAll(".box").forEach(box => {
                box.classList.remove("active-ban", "active-pick");
            });

            if (currentPhaseIndex < phases2.length) {
                phases2[currentPhaseIndex].forEach(phase2 => {
                    const phaseBox = document.getElementById(phase2);
                    if (phaseBox) {
                        phaseBox.classList.add(currentPhaseIndex < 4 || (currentPhaseIndex >= 8 && currentPhaseIndex <= 9) ? "active-ban" : "active-pick");
                    }
                });
            }
        }

        setInterval(checkLocalStorageChanges, 500);
        setInterval(updateDisplay2, 500);
        updateUI();
        updateDisplay2();