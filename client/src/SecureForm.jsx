// SecureForm.jsx
import React, { useState } from 'react';
import { sendEncryptedData } from './CryptoService';

const SecureForm = () => {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null); // 상태 메시지 (성공/실패)

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        try {
            const response = await sendEncryptedData(message);
            console.log('Server response:', response);
            setStatus({ type: 'success', text: '✅ 메시지가 안전하게 전송되었습니다!' });
        } catch (error) {
            console.error('Error:', error);
            setStatus({ type: 'error', text: '❌ 전송 실패! 다시 시도해주세요.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold text-center mb-4 text-gray-700">🔒 안전한 메시지 전송</h2>

                <form onSubmit={handleSubmit} className="flex flex-col">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="암호화할 메시지를 입력하세요..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300"
                    >
                        {loading ? '🔄 전송 중...' : '📩 암호화 후 전송'}
                    </button>
                </form>

                {/* 상태 메시지 출력 */}
                {status && (
                    <p className={`mt-4 text-center text-sm font-medium ${status.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        {status.text}
                    </p>
                )}
            </div>
        </div>
    );
};

export default SecureForm;
