FROM python:3.11-slim

RUN apt-get update && apt-get install -y \
    bash \
    nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY mvp_app/ ./mvp_app/
COPY toolkit/ ./toolkit/

RUN mkdir -p logs uploads

ENV PYTHONUNBUFFERED=1

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--timeout", "120", "--workers", "2", "mvp_app.app:app"]
