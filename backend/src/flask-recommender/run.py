# backend/src/flask-recommender/run.py
#!/usr/bin/env python3
from app import app
from config import Config
import os

if __name__ == '__main__':
    print(f"""
╔════════════════════════════════════════════════════╗
║  🎯 TalentSphere Recommender (Live DB)             ║
║  ------------------------------------------------  ║
║  📍 Local:  http://localhost:{Config.PORT}                  ║
║  🔗 API:    http://localhost:{Config.PORT}/api/recommend    ║
║  💚 Health: http://localhost:{Config.PORT}/api/health       ║
╚════════════════════════════════════════════════════╝
    """)
    app.run(
        host='0.0.0.0',
        port=Config.PORT,
        debug=Config.DEBUG,
        use_reloader=False
    )