# secure-app
# 🔐 RSA 공개키 암호화를 이용한 React & Spring Boot 예제

이 프로젝트는 React와 Spring Boot를 이용하여 **공개키 암호화를 사용한 데이터 전송**을 구현한 예제입니다.  
클라이언트는 서버에서 제공하는 **공개키**를 사용해 데이터를 암호화한 후, 서버로 전송하고,  
서버는 **개인키**를 이용해 복호화하는 방식으로 동작합니다.

## 📁 프로젝트 구조
```plaintext
rsa-encryption-example/
│── client/         # React 프론트엔드 코드
│── server/         # Spring Boot 백엔드 코드
│── README.md       # 프로젝트 설명 문서
