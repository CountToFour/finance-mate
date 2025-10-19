# =========================
# STEP 1: build application
# =========================
FROM maven:3.9.5-eclipse-temurin-21 AS build

WORKDIR /app
COPY pom.xml .
COPY src ./src

# Zbuduj jar (pomijając testy, żeby było szybciej)
RUN mvn clean package -DskipTests

# =========================
# STEP 2: run the app
# =========================
FROM eclipse-temurin:21-jdk-jammy

WORKDIR /app

# Kopiujemy zbudowany plik .jar z etapu build
COPY --from=build /app/target/*.jar app.jar

# Ustawiamy zmienne środowiskowe
ENV SPRING_PROFILES_ACTIVE=docker
ENV JAVA_OPTS=""

EXPOSE 8080

# Uruchomienie aplikacji
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
