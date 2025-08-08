# LaTeX Document Generation Service
FROM texlive/texlive:latest

# Set working directory
WORKDIR /app

# Install Python and required system packages
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create and activate virtual environment
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY src/ ./src/
COPY templates/ ./templates/

# Create necessary directories
RUN mkdir -p /tmp/latex-work && \
    mkdir -p /app/logs

# Set environment variables
ENV PORT=8080
ENV PYTHONPATH=/app/src
ENV LATEX_WORK_DIR=/tmp/latex-work

# Expose the port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Run the application
CMD ["python3", "src/app.py"]
