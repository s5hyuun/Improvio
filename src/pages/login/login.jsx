// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:5000/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ employeeId: username, password }),
                // 서버에서 employeeId를 username으로 매핑하므로 그대로 사용
            });

            const data = await response.json();
            if (data.success) {
                alert("로그인 성공!");
                navigate("/dashboard"); // 로그인 성공시 이동
            } else {
                alert(data.message || "로그인 실패");
            }
        } catch (error) {
            console.error("로그인 에러:", error);
            alert("서버 오류 발생");
        }
    };

    const handleSignup = () => {
        navigate("/signup");
    };

    return (
        <div className="app">
            {/* 사이드바 */}
            <Sidebar />

            {/* 메인 영역 */}
            <main className="main">
                {/* 헤더 */}
                <Header />

                {/* 로그인 폼 영역 */}
                <section className="content flex justify-center items-center min-h-screen bg-gray-100">
                    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md">
                        <h2 className="text-2xl font-bold text-center mb-6">로그인</h2>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="아이디 입력"
                                className="w-full px-3 py-2 border rounded-lg"
                                required
                            />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="비밀번호 입력"
                                className="w-full px-3 py-2 border rounded-lg"
                                required
                            />
                            <button
                                type="submit"
                                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                로그인
                            </button>
                        </form>

                        <div className="mt-4 text-center">
                            <button
                                onClick={handleSignup}
                                className="text-blue-600 hover:underline"
                            >
                                회원가입
                            </button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}