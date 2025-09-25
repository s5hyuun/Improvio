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

  const handleSubmit = (e) => {
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

    console.log("회원가입 정보:", formData);
    onComplete();
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
              <option value="basic-design">기본설계</option>
              <option value="ship-design">조선설계</option>
              <option value="offshore-design">해양설계</option>
              <option value="process-management">공정관리</option>
              <option value="purchasing">구매</option>
              <option value="project-management">PM</option>
              <option value="automation">자동화</option>
              <option value="overseas-sales">해외영업</option>
              <option value="management-support">경영지원</option>
              <option value="qulity-planning-inspection">
                품질관리/기획/검사
              </option>
              <option value="safety-environment-health">안전/환경/보건</option>
              <option value="research-development">연구개발</option>
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
