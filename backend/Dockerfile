# Dockerfile for app.py (central API)
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY app.py .

# Expose port 5000
EXPOSE 5000

# Run app.py
CMD ["python", "app.py"]