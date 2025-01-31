# 빌드 스테이지
FROM gradle:8.11.1-jdk21 AS build
WORKDIR /app
COPY . .
RUN gradle build --no-daemon -x test

# 실행 스테이지
FROM eclipse-temurin:21-jdk

# 기본 작업 디렉토리 설정
WORKDIR /app

# 빌드 스테이지에서 생성된 JAR 파일을 복사
COPY --from=build /app/build/libs/*.jar app.jar

# 환경 변수 설정
ENV TZ=Asia/Seoul
RUN apt-get update && apt-get install -y \
    mysql-client \
    iputils-ping \
    net-tools \
    && apt-get clean

# 포트 설정
EXPOSE 8095

# 실행 명령
# 기본적으로 bash로 실행되며, 필요에 따라 주석을 제거하여 애플리케이션 실행
CMD ["java", "-jar", "app.jar"] 

#CMD ["/bin/bash"]
