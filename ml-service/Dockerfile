# ML Service Docker Image (Dev)
FROM python:3.11-slim

WORKDIR /app

# Install system deps.
# - gcc: used by some Python deps
# - curl: handy for debugging in-container
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# No pip install during build — deps install at runtime via entrypoint
EXPOSE 5001

HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:5001/health')"

# Entrypoint: install deps, ensure Playwright browser exists, train model if needed, then start
CMD sh -c "pip install --no-cache-dir -r requirements.txt && \
    if [ ! -d \"/root/.cache/ms-playwright\" ] || [ -z \"$(ls -A /root/.cache/ms-playwright)\" ]; then \
        python -m playwright install --with-deps chromium; \
    fi && \
    (python model/train.py || true) && \
    python app.py"
