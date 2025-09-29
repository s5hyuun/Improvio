import React, { useState } from "react";

export default function SignupStep5({ onComplete }) {
  const [formData, setFormData] = useState({
    name: "",
    employeeId: "",
    password: "",
    confirmPassword: "",
    department: "",
  });

  const [employeeIdError, setEmployeeIdError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const toggleShowPassword = () => setShowPassword((prev) => !prev);
  const toggleShowConfirmPassword = () =>
    setShowConfirmPassword((prev) => !prev);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  const handleEmployeeIdChange = (e) => {
    const value = e.target.value;
    const onlyNums = value.replace(/[^0-9]/g, "");

    if (value !== onlyNums) {
      setEmployeeIdError("이 칸에는 숫자만 입력할 수 있습니다.");
    } else {
      setEmployeeIdError("");
    }

    setFormData((prev) => ({ ...prev, employeeId: onlyNums }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!/^\d+$/.test(formData.employeeId)) {
      alert("사원번호는 숫자만 입력할 수 있습니다.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setConfirmPasswordError("비밀번호가 일치하지 않습니다.");
      return;
    } else {
      setConfirmPasswordError("");
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          username: formData.employeeId, // 사원번호를 username으로
          password: formData.password,
          role: "manager", // 관리자 가입이므로 admin
          department_id: parseInt(formData.department, 10) || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "회원가입 실패");
        return;
      }

      alert("회원가입 성공! 승인을 기다려주세요.");
      onComplete(); // 다음 단계로 진행
    } catch (err) {
      console.error("회원가입 오류:", err);
      alert("서버 오류가 발생했습니다.");
    }
  };

  return (
    <section className="content flex justify-center items-center min-h-screen bg-gray-100">
      <div className="big-block">
        <h2 className="signup-title">회원 정보 입력</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-1 font-medium">이름</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-md"
              placeholder="이름을 입력하세요"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">사원번호</label>
            <input
              type="text"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleEmployeeIdChange}
              className="w-full border px-3 py-2 rounded-md"
              placeholder="사원번호를 입력하세요"
              required
            />
            {employeeIdError && (
              <p className="text-red-600 mt-1 text-sm">{employeeIdError}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 font-medium">비밀번호</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-md"
                placeholder="비밀번호를 입력하세요"
                required
              />
              <button
                type="button"
                onClick={toggleShowPassword}
                className="absolute inset-y-0 right-3 flex items-center"
              >
                <img
                  src={
                    showPassword
                      ? "/public/close-eye.png"
                      : "/public/open-eye.png"
                  }
                  alt="비밀번호 보기 토글"
                  style={{ width: "15px", height: "15px" }}
                />
              </button>
            </div>
          </div>

          <div>
            <label className="block mb-1 font-medium">비밀번호 확인</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-md"
                placeholder="비밀번호를 다시 입력하세요"
                required
              />
              <button
                type="button"
                onClick={toggleShowConfirmPassword}
                className="absolute inset-y-0 right-3 flex items-center bg-white rounded px-2"
              >
                <img
                  src={
                    showConfirmPassword
                      ? "/public/close-eye.png"
                      : "/public/open-eye.png"
                  }
                  alt="비밀번호 확인 보기 토글"
                  style={{ width: "15px", height: "15px" }}
                />
              </button>
            </div>
            {confirmPasswordError && (
              <p className="text-red-600 mt-1 text-sm">
                {confirmPasswordError}
              </p>
            )}
          </div>

          <div>
            <label className="block mb-1 font-medium">부서 선택</label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-md"
              required
            >
              <option value="">부서를 선택하세요</option>
              <option value="1">R&D</option>
              <option value="2">해외영업</option>
              <option value="3">기본설계</option>
              <option value="4">미래사업개발</option>
              <option value="5">조선설계</option>
              <option value="6">해양설계</option>
              <option value="7">PM</option>
              <option value="8">구매</option>
              <option value="9">경영지원</option>
              <option value="10">안전</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            가입신청
          </button>
        </form>
      </div>
    </section>
  );
}
