import React, { useState, useEffect } from "react";

export default function SignupStep2({ onComplete }) {
  const [formData, setFormData] = useState({
    name: "",
    employeeId: "",
    password: "",
    confirmPassword: "",
    department: "",
  });

  const [departments, setDepartments] = useState([]); // 🔥 DB에서 부서 목록 불러오기
  const [employeeIdError, setEmployeeIdError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const toggleShowPassword = () => setShowPassword((prev) => !prev);
  const toggleShowConfirmPassword = () =>
    setShowConfirmPassword((prev) => !prev);

  // 🔥 컴포넌트 로드 시 부서 목록 API 호출
  useEffect(() => {
    fetch("http://localhost:5000/api/departments")
      .then((res) => res.json())
      .then((data) => setDepartments(data))
      .catch((err) => console.error("부서 불러오기 실패:", err));
  }, []);

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
          username: formData.employeeId, // 사원번호를 username으로 사용
          password: formData.password,
          role: "employee", // 직원용 회원가입이므로 employee
          department_id: parseInt(formData.department, 10), // 선택한 부서의 id
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "회원가입 실패");
        return;
      }

      alert("회원가입 성공! 승인을 기다려주세요.");
      onComplete(); // ✅ step3로 이동
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
                className="absolute inset-y-0 right-3 flex items-center text-gray-500"
              >
                <img
                  src={
                    showPassword
                      ? "/close-eye.png"
                      : "/open-eye.png"
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
                      ? "/close-eye.png"
                      : "/open-eye.png"
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

          {/* 🔥 부서 선택 (DB 연동) */}
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
              {departments.map((dept) => (
                <option key={dept.department_id} value={dept.department_id}>
                  {dept.department_name}
                </option>
              ))}
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
