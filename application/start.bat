git pull http://SkyPOS:SkyZone123@gitlab.com/skyzone/skypos-flask.git dev
TaskKill /F /IM chrome.exe
start env\Scripts\python server.py
start chrome http://localhost:5000 --kiosk --disable-cache