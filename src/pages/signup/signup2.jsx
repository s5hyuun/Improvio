import React, { useState } from "react";

export default function SignupStep2() {
  const [formData, setFormData] = useState({
    name: "",
    employeeId: "",
    password: "",
    department: "",
  });

  // 숫자만 입력 허용 + 안내문구 표시용 상태 추가
  const [employeeIdError, setEmployeeIdError] = useState("");

  // 기존 handleChange는 그대로 유지
  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  // 사원번호 전용 핸들러 (숫자 외 입력시 안내문구 띄움)
  const handleEmployeeIdChange = (e) => {
    const value = e.target.value;
    // 숫자만 추출
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

    alert("가입 신청이 완료되었습니다! 🚀");
    console.log("회원가입 정보:", formData);
  };

  return (
    <section className="content flex justify-center items-center min-h-screen bg-gray-100">
      <div className="big-block">
        <h2 className="signup-title">회원 정보 입력</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* 이름 */}
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

          {/* 사원번호 */}
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
            {/* 안내 멘트 */}
            {employeeIdError && (
              <p className="text-red-600 mt-1 text-sm">{employeeIdError}</p>
            )}
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="block mb-1 font-medium">비밀번호</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-md"
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>

          {/* 부서 선택 */}
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

          {/* 가입신청 버튼 */}
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
