TaskKill /F /IM chrome.exe
start env\Scripts\python server.py
start chrome http://localhost:5000 --kiosk --disable-cache