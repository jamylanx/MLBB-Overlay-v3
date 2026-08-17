async function getServerIp() {
  try {
    const response = await fetch('/serverip.txt', { cache: 'no-store' });
    if (!response.ok) throw new Error(`Failed to fetch serverip.txt: ${response.statusText}`);
    const ip = (await response.text()).trim();
    if (!ip || !/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) {
      throw new Error('Invalid or empty IP in serverip.txt');
    }
    return ip;
  } catch (error) {
    console.error('Error fetching server IP:', error);
    return 'localhost';
  }
}

(async () => {
  const serverIp = await getServerIp();
  console.log(`Attempting WebSocket connection to ws://${serverIp}:3000`);
  const ws = new WebSocket(`ws://${serverIp}:3000`);

  const timerKeys = ['timer', 'timerRunning', 'resetTimerBar', 'currentPhaseIndex', 'updateTime'];

  function triggerUpdateUI(changedData, isFullUpdate) {
    const isTimerUpdate = !isFullUpdate && Object.keys(changedData).some(key => timerKeys.includes(key));
    const isImageUpdate = !isFullUpdate && Object.keys(changedData).some(key => key === 'logo1' || key === 'logo2' || key.toLowerCase().includes('image'));

    if (isFullUpdate) {
      window.loadImages?.();
      window.updateDisplay?.();
      window.updateUI?.();
      console.log('Full UI update triggered');
      return;
    }

    if (isImageUpdate) {
      window.loadImages?.();
      console.log('Image update triggered:', { changedData });
    }
    if (isTimerUpdate) {
      window.updateUI?.();
      console.log('Timer update triggered:', { changedData });
    }
    if (!isTimerUpdate && !isImageUpdate) {
      window.updateDisplay?.();
      console.log('General display update triggered:', { changedData });
    }
  }

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      const changedData = {};

      if (msg.type === 'init') {
        // Perbarui hanya kunci yang diterima dari server, jangan kosongkan localStorage
        for (const [key, value] of Object.entries(msg.data)) {
          if (value !== null) {
            localStorage.setItem(key, value);
            changedData[key] = value;
          } else {
            localStorage.removeItem(key);
            changedData[key] = null;
          }
        }
        console.log('localStorage updated with init data:', { ...localStorage });
        triggerUpdateUI(changedData, true);
      } else if (msg.type === 'update') {
        for (const [key, value] of Object.entries(msg.data)) {
          if (value === null) {
            localStorage.removeItem(key);
          } else {
            localStorage.setItem(key, value);
          }
          changedData[key] = value;
        }
        console.log('localStorage updated with delta:', { ...localStorage });
        triggerUpdateUI(changedData, false);
      } else if (msg.type === 'clear') {
        localStorage.clear();
        console.log('localStorage cleared');
        triggerUpdateUI({}, true);
      }
    } catch (e) {
      console.error('Error processing message:', e);
    }
  };

  ws.onopen = () => {
    console.log(`Connected to WebSocket server at ws://${serverIp}:3000`);
    // Kirim data localStorage saat ini ke server untuk sinkronisasi
    const currentData = { ...localStorage };
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'init', data: currentData }));
      console.log('Sent current localStorage data to server:', currentData);
    }
  };

  ws.onerror = (error) => console.error('WebSocket error:', error);
  ws.onclose = () => console.log('WebSocket connection closed');
})();