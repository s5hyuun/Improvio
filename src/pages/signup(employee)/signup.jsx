import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import SignupStep2 from "./signup2";
import SignupStep3 from "./signup3";
import "./signup.css";

export default function Signup() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    terms: false,
    privacy: false,
  });

  const handleChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleNext = () => {
    if (!formData.terms || !formData.privacy) {
      alert("모든 약관에 동의해야 다음 단계로 진행할 수 있습니다.");
      return;
    }
    setStep(2);
  };

  return (
    <div className="app">
      <Sidebar />
      <main className="main">
        <Header />

        {step === 1 && (
          <section className="content flex justify-center items-center min-h-screen bg-gray-100">
            <h1 className="signup-title">회원가입(직원용)</h1>

            <div className="big-block">
              <section className="signup-section">
                <h2>이용약관 동의</h2>
                <div className="signup-terms-box">
                  <p>
                    여기에 이용약관 내용이 들어갑니다. 스크롤해서 읽어보신 후
                    동의 체크박스를 선택해주세요.
                  </p>
                </div>
                <label className="signup-checkbox">
                  <input
                    type="checkbox"
                    name="terms"
                    checked={formData.terms}
                    onChange={handleChange}
                  />
                  이용약관에 동의합니다.
                </label>
              </section>

              <section className="signup-section">
                <h2>개인정보 수집 및 이용 동의</h2>
                <div className="signup-terms-box">
                  <p>
                    여기에 개인정보 수집 및 이용에 관한 안내문이 들어갑니다.
                    반드시 확인 후 동의해주세요.
                  </p>
                </div>
                <label className="signup-checkbox">
                  <input
                    type="checkbox"
                    name="privacy"
                    checked={formData.privacy}
                    onChange={handleChange}
                  />
                  개인정보 수집 및 이용에 동의합니다.
                </label>
              </section>
            </div>

            <button className="signup-btn" onClick={handleNext}>
              다음 단계
            </button>
          </section>
        )}

        {step === 2 && <SignupStep2 onComplete={() => setStep(3)} />}

        {step === 3 && <SignupStep3 />}
      </main>
    </div>
  );
}
