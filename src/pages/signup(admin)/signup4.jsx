import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import SignupStep5 from "./signup5";
import SignupStep6 from "./signup6";
import "../../styles/signup4.css";

export default function Signup4() {
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
          /* 기존: <section className="content flex justify-center items-center min-h-screen bg-gray-100"> */
          <section className="content">
            <h1 className="signup-title">회원가입(관리자용)</h1>

            <div className="big-block">
              <section className="signup-section">
                <h2>이용약관 동의</h2>
                <div className="signup-terms-box">
                  <p>
                    <h3>[이용약관]</h3>
                    <br></br>본 이용약관(이하 "약관")은 회사(이하 "회사")가
                    제공하는 관리자 전용 서비스(이하 "서비스")의 이용조건 및
                    절차, 회사와 관리자의 권리·의무 및 책임사항, 기타 필요한
                    사항을 규정함을 목적으로 합니다.<br></br>
                    <br></br>
                    제1조 (목적)<br></br>본 약관은 관리자가 회사의 서비스를
                    이용함에 있어 회사와 관리자 간의 권리, 의무 및 책임사항,
                    이용조건과 절차 등 기본적인 사항을 명확히 함을 목적으로
                    합니다.<br></br>
                    <br></br>
                    제2조 (약관의 효력 및 변경)<br></br>① 본 약관은 서비스
                    화면에 게시하거나 기타 방법으로 공지함으로써 효력을
                    발생합니다.<br></br>② 회사는 필요하다고 인정되는 경우 관련
                    법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있습니다.
                    <br></br>③ 변경된 약관은 제1항과 같은 방법으로 공지함으로써
                    효력을 발생합니다.<br></br>
                    <br></br>
                    제3조 (회원가입 및 자격)<br></br>① 관리자는 회사가 승인한
                    경우에 한해 회원가입을 할 수 있습니다.<br></br>② 관리자는
                    반드시 본 약관에 동의해야 회원가입이 완료됩니다.<br></br>③
                    회사는 관리자의 자격을 심사할 권리를 가지며, 회사의 정책에
                    따라 가입이 제한될 수 있습니다.<br></br>
                    <br></br>
                    제4조 (서비스의 제공)<br></br>① 회사는 관리자가 원활히
                    업무를 수행할 수 있도록 다양한 관리자 기능과 정보를
                    제공합니다.<br></br>② 회사는 서비스의 품질 향상을 위해
                    서비스의 내용을 수시로 변경할 수 있으며, 그 변경 내용은 별도
                    공지를 통해 안내합니다.<br></br>③ 천재지변, 기술적 결함,
                    정기 점검 등의 사유로 서비스 제공이 일시 중단될 수 있습니다.
                    <br></br>
                    <br></br>
                    제5조 (서비스 이용 제한 및 해지)<br></br>① 관리자가 본
                    약관을 위반하거나 부정한 방법으로 서비스를 이용하는 경우,
                    회사는 사전 통지 없이 서비스 이용을 제한하거나 회원자격을
                    박탈할 수 있습니다.<br></br>② 관리자가 직접 탈퇴를 원할
                    경우, 회사에 탈퇴 요청을 하여 처리할 수 있습니다.<br></br>
                    <br></br>
                    제6조 (관리자의 의무)<br></br>① 관리자는 회사의 서비스를
                    이용함에 있어 선량한 관리자의 주의 의무를 다해야 합니다.
                    <br></br>② 관리자는 타인의 권리를 침해하거나 법령을 위반하는
                    행위를 해서는 안 됩니다.<br></br>③ 관리자는 본인의 계정 및
                    비밀번호를 철저히 관리할 책임이 있습니다.<br></br>
                    <br></br>
                    제7조 (회사의 의무)<br></br>① 회사는 관련 법령과 본 약관이
                    정하는 바에 따라 지속적이고 안정적인 서비스를 제공하기 위해
                    최선을 다합니다.<br></br>② 회사는 관리자의 개인정보를 관련
                    법령이 정하는 바에 따라 안전하게 보호합니다.<br></br>③
                    회사는 관리자의 정당한 불만이나 의견을 수렴하여 신속하게
                    처리하도록 노력합니다.<br></br>
                    <br></br>
                    제8조 (계정 관리)<br></br>① 관리자의 계정은 본인만 사용할 수
                    있으며, 제3자에게 양도·대여·공유할 수 없습니다.<br></br>②
                    관리자가 계정을 타인에게 공유함으로써 발생하는 모든 문제에
                    대한 책임은 관리자 본인에게 있습니다.<br></br>
                    <br></br>
                    제9조 (손해배상)<br></br>① 회사는 관리자가 서비스를 이용함에
                    있어 발생한 손해에 대해 고의 또는 중대한 과실이 없는 한
                    책임을 지지 않습니다.<br></br>② 관리자가 본 약관을 위반하여
                    회사에 손해를 끼친 경우, 관리자는 그 손해를 배상해야 합니다.
                    <br></br>
                    <br></br>
                    제10조 (분쟁 해결)<br></br>① 회사와 관리자 간에 발생하는
                    모든 분쟁은 상호 협의를 통해 원만히 해결함을 원칙으로
                    합니다.<br></br>② 협의가 이루어지지 않을 경우, 관할 법원은
                    회사 본점 소재지를 관할하는 법원으로 합니다.<br></br>
                    <br></br>
                    스크롤해서 전체 내용을 확인하신 후, 동의 체크박스를
                    선택해주세요.<br></br>
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
                    <br></br>
                    <h3>[개인정보 수집 및 이용 동의]</h3>
                    <br></br>
                    회사는 원활한 서비스 제공을 위해 아래와 같이 개인정보를 수집
                    및 이용합니다. 관리자는 내용을 충분히 숙지한 후 동의 여부를
                    결정할 수 있습니다.<br></br>
                    <br></br>
                    1. 수집하는 개인정보 항목<br></br>- 필수 항목: 이름, 이메일,
                    부서, 직책, 연락처, 계정 ID<br></br>- 선택 항목: 직무 관련
                    추가 정보, 시스템 사용 이력<br></br>
                    <br></br>
                    2. 개인정보 수집 목적<br></br>- 관리자 본인 확인 및 서비스
                    이용 자격 검증<br></br>- 시스템 접근 권한 관리 및 보안 유지
                    <br></br>- 서비스 관련 공지사항, 알림, 문의 응대 제공
                    <br></br>- 서비스 품질 개선 및 통계 분석<br></br>
                    <br></br>
                    3. 개인정보의 보유 및 이용 기간<br></br>- 회원 탈퇴 시 즉시
                    파기합니다.<br></br>- 단, 관계 법령에서 일정 기간 보관을
                    요구하는 경우 해당 기간 동안 보관합니다.<br></br>- 보존
                    예시: 전자상거래 등에서의 소비자 보호에 관한 법률,
                    통신비밀보호법 등<br></br>
                    <br></br>
                    4. 개인정보 제공 및 위탁<br></br>- 회사는 관리자의 동의 없이
                    개인정보를 제3자에게 제공하지 않습니다.<br></br>- 단, 서비스
                    운영에 필요한 경우 외부 업체에 위탁할 수 있으며, 이 경우
                    관련 법령에 따라 철저히 관리합니다.<br></br>
                    <br></br>
                    5. 동의 거부 권리 및 불이익<br></br>- 관리자는 개인정보 수집
                    및 이용에 동의하지 않을 권리가 있습니다.<br></br>- 다만,
                    동의하지 않을 경우 회원가입 및 관리자 서비스 이용이 제한될
                    수 있습니다.<br></br>
                    <br></br>
                    반드시 확인 후, 동의 체크박스를 선택해주세요.<br></br>
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

        {step === 2 && <SignupStep5 onComplete={() => setStep(3)} />}

        {step === 3 && <SignupStep6 onComplete={() => setStep(4)} />}
      </main>
    </div>
  );
}
