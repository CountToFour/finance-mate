# ==============================
# 1️⃣ Wybór obrazu bazowego
# ==============================
FROM python:3.11-slim

# ==============================
# 2️⃣ Ustawienie katalogu roboczego
# ==============================
WORKDIR /app

# ==============================
# 3️⃣ Kopiowanie plików
# ==============================
COPY requirements.txt .
COPY app.py .

# ==============================
# 4️⃣ Instalacja zależności
# ==============================
RUN pip install --no-cache-dir -r requirements.txt

# ==============================
# 5️⃣ Zmienna środowiskowa (dla Flask)
# ==============================
ENV FLASK_APP=app.py
ENV FLASK_ENV=production
ENV PYTHONUNBUFFERED=1

# ==============================
# 6️⃣ Port, na którym działa aplikacja
# ==============================
EXPOSE 5000

# ==============================
# 7️⃣ Komenda startowa
# ==============================
CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]

