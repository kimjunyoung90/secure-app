// CryptoService.js

export class RSAEncryption {
    // 1️⃣ 백엔드에서 RSA 공개 키 가져오기
    static async fetchPublicKey() {
        try {
            const response = await fetch("http://localhost:8080/public-key", {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch public key");
            }

            const { publicKey } = await response.json(); // JSON 형식으로 공개 키 받기
            return publicKey; // Base64 인코딩된 공개 키 반환
        } catch (error) {
            console.error("Error fetching public key:", error);
            throw error;
        }
    }

    // 2️⃣ Base64 디코딩 후 RSA 공개 키를 Web Crypto API에서 사용할 수 있는 형태로 변환
    static async importRSAPublicKey(base64Key) {
        const keyBuffer = RSAEncryption.base64ToArrayBuffer(base64Key);

        return await window.crypto.subtle.importKey(
            "spki",
            keyBuffer,
            { name: "RSA-OAEP", hash: "SHA-256" },
            false,
            ["encrypt"]
        );
    }

    // 3️⃣ 문자열을 Base64 디코딩 후 ArrayBuffer로 변환하는 함수
    static base64ToArrayBuffer(base64) {
        const binaryString = atob(base64);

        //디코딩된 바이너리 문자열을 아스키 숫자로 변환한 후 배열로 저장
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }

    // 4️⃣ RSA 공개 키를 사용하여 데이터 암호화 후 Base64 인코딩
    static async encryptWithRSA(plaintext) {
        try {
            const base64PublicKey = await RSAEncryption.fetchPublicKey();
            const publicKey = await RSAEncryption.importRSAPublicKey(base64PublicKey);

            const encoder = new TextEncoder();
            const encrypted = await window.crypto.subtle.encrypt(
                { name: "RSA-OAEP" },
                publicKey,
                encoder.encode(plaintext)
            );

            return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
        } catch (error) {
            console.error("RSA 암호화 실패:", error);
            throw error;
        }
    }
}

export async function sendEncryptedData(plaintext) {
    const encryptedData = await RSAEncryption.encryptWithRSA(plaintext);

    const response = await fetch("http://localhost:8080/decrypt-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ encryptedData }),
    });

    const decryptedText = await response.text();
    console.log("🔓 백엔드에서 복호화된 데이터:", decryptedText);
}
