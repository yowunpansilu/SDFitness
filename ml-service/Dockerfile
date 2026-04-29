# ML Service Docker Image (Dev)
FROM python:3.11-slim-bookworm

WORKDIR /app

# Install basic system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies during build
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the app
COPY . .



HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD python -c "import os, urllib.request; urllib.request.urlopen(f'http://localhost:{os.environ.get(\"PORT\", 5001)}/health')"

# Start the application, training the model first if it doesn't exist
CMD ["sh", "-c", "if [ ! -f model/diet_model.pkl ]; then python model/train.py; fi && python app.py"]
