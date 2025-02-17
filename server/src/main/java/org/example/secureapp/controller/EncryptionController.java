package org.example.secureapp.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Cipher;
import javax.crypto.spec.OAEPParameterSpec;
import javax.crypto.spec.PSource;
import java.nio.charset.StandardCharsets;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.PrivateKey;
import java.security.spec.MGF1ParameterSpec;
import java.util.Base64;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/")
public class EncryptionController {

    private static final KeyPair keyPair = generateRSAKeyPair();

    // 1️⃣ RSA 키 쌍 생성 (2048비트)
    private static KeyPair generateRSAKeyPair() {
        try {
            KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
            keyPairGenerator.initialize(2048);
            return keyPairGenerator.generateKeyPair();
        } catch (Exception e) {
            throw new RuntimeException("RSA 키 생성 실패", e);
        }
    }

    // 2️⃣ RSA 공개 키 제공 (Base64 인코딩)
    @GetMapping("/public-key")
    public ResponseEntity<Map<String, String>> getPublicKey() {
        String publicKeyBase64 = Base64.getEncoder().encodeToString(keyPair.getPublic().getEncoded());
        return ResponseEntity.ok(Map.of("publicKey", publicKeyBase64));
    }

    // 3️⃣ RSA 개인 키로 복호화
    @PostMapping("/decrypt-data")
    public ResponseEntity<String> decryptData(@RequestBody Map<String, String> requestData) {
        try {
            String encryptedData = requestData.get("encryptedData");
            if (encryptedData == null || encryptedData.isEmpty()) {
                return ResponseEntity.badRequest().body("암호화된 데이터가 없습니다.");
            }

            String decryptedText = decryptRSA(encryptedData, keyPair.getPrivate());
            return ResponseEntity.ok(decryptedText);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("복호화 실패: " + e.getMessage());
        }
    }

    // 4️⃣ RSA 복호화 로직
    private String decryptRSA(String encryptedData, PrivateKey privateKey) throws Exception {
        // 클라이언트(Web Crypto API)에서 **RSA-OAEP 및 SHA-256**을 사용하여 데이터를 암호화하는 경우,
        // 서버(Spring Boot)에서도 **RSA/ECB/OAEPWithSHA-256AndMGF1Padding**을 설정해야 정상적으로 복호화할 수 있다.
        Cipher cipher = Cipher.getInstance("RSA/ECB/OAEPWithSHA-256AndMGF1Padding"); // ✅ 패딩 일치

        //cipher 초기화 하는 경우 3번째 인자로 OAEPParameterSpec를 넣어줘야 한다.
        //OAEPParameterSpec는 RSA-OAEP 암호화에서 패딩 방식을 세부적으로 설정하는 역할을 하는 클래스라고 한다.
        cipher.init(Cipher.DECRYPT_MODE, privateKey,
                new OAEPParameterSpec("SHA-256", "MGF1", MGF1ParameterSpec.SHA256, PSource.PSpecified.DEFAULT));

        byte[] encryptedBytes = Base64.getDecoder().decode(encryptedData); // ✅ Base64 디코딩
        byte[] decryptedBytes = cipher.doFinal(encryptedBytes);

        return new String(decryptedBytes, StandardCharsets.UTF_8);
    }
}
