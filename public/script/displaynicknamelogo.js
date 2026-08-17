
//----------------Nickname------------------------/
function loadNames() {
    const names = JSON.parse(localStorage.getItem("names")) || [];
    for (let i = 1; i <= 14; i++) {
        document.getElementById(`name-box-${i}`).textContent = names[i - 1] || "";
    }
}

loadNames();
setInterval(loadNames, 1000);

//--------------------logo

function loadImages() {
    document.getElementById('displayImage1').src = localStorage.getItem('logo1') || "";
    document.getElementById('displayImage1').alt = localStorage.getItem('logo1') ? "Logo 1" : "Logo 1 Tidak Ada";

    document.getElementById('displayImage2').src = localStorage.getItem('logo2') || "";
    document.getElementById('displayImage2').alt = localStorage.getItem('logo2') ? "Logo 2" : "Logo 2 Tidak Ada";
}

// Load gambar pertama kali
loadImages();

// Real-time update menggunakan event Storage
window.addEventListener('storage', function(event) {
    if (event.key === 'updateTime') {
        loadImages();
    }
});

