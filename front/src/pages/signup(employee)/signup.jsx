import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import SignupStep2 from "./signup2";
import SignupStep3 from "./signup3";
import "../../styles/signup.css";

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
                    <h3>[이용약관]</h3>
                    <br></br>본 약관은 회사(이하 "회사")가 제공하는 직원용
                    온라인 시스템 및 서비스(이하 "서비스")의 이용과 관련하여
                    회사와 직원 간의 권리, 의무 및 책임 사항을 규정함을 목적으로
                    합니다.<br></br>
                    <br></br>
                    제1조 (목적)<br></br>본 약관은 회사에 소속된 직원이 사내
                    포털 및 전산 시스템을 이용함에 있어 필요한 이용 조건, 절차
                    및 관리 사항을 명확히 규정하는 것을 목적으로 합니다.
                    <br></br>
                    <br></br>
                    제2조 (약관의 효력 및 변경)<br></br>① 본 약관은 서비스
                    화면에 게시하거나 사내 공지 등을 통해 고지함으로써 효력을
                    발생합니다.<br></br>② 회사는 관련 법령 및 내부 규정에 따라
                    필요 시 약관을 변경할 수 있으며, 변경된 약관은 동일한
                    방법으로 공지함으로써 효력을 가집니다.<br></br>
                    <br></br>
                    제3조 (회원가입 및 자격)<br></br>① 본 서비스의 회원은 회사에
                    재직 중인 직원에 한정됩니다.<br></br>② 직원은 본 약관 및
                    개인정보 수집·이용에 동의해야 회원가입이 가능합니다.
                    <br></br>③ 퇴직 또는 인사 이동 등으로 자격이 상실될 경우,
                    회사는 해당 계정을 자동으로 해지하거나 이용을 제한할 수
                    있습니다.<br></br>
                    <br></br>
                    제4조 (서비스의 제공)<br></br>① 회사는 직원의 원활한 업무
                    수행을 위해 전자결재, 근태관리, 자료 공유, 공지사항 열람
                    등의 서비스를 제공합니다.<br></br>② 회사는 업무 효율 개선을
                    위해 서비스 내용을 변경하거나 새로운 기능을 추가할 수
                    있습니다.<br></br>③ 시스템 점검, 보안 강화, 불가피한 사유로
                    서비스 제공이 일시적으로 중단될 수 있으며, 사전에 이를
                    공지합니다.<br></br>
                    <br></br>
                    제5조 (직원의 의무)<br></br>① 직원은 회사의 규정 및 보안
                    수칙을 준수해야 하며, 타인의 계정을 도용하거나 부정
                    사용해서는 안 됩니다.<br></br>② 직원은 업무 수행과 무관한
                    목적으로 서비스를 이용해서는 안 됩니다.<br></br>③ 직원은
                    시스템 이용 과정에서 알게 된 기밀 정보를 외부에 유출해서는
                    안 되며, 퇴직 후에도 동일하게 적용됩니다.<br></br>
                    <br></br>
                    제6조 (회사의 의무)<br></br>① 회사는 직원이 안정적으로
                    서비스를 이용할 수 있도록 최선을 다해 관리 및 유지보수를
                    합니다.<br></br>② 회사는 직원의 개인정보를 법령에 따라
                    안전하게 보호하고, 동의 없이 외부에 제공하지 않습니다.
                    <br></br>③ 회사는 서비스 개선 및 보안 강화를 위해 필요한
                    조치를 취할 수 있습니다.<br></br>
                    <br></br>
                    제7조 (계정 관리)<br></br>① 직원은 본인의 계정 및 비밀번호를
                    안전하게 관리할 책임이 있습니다.<br></br>② 계정 도용,
                    비밀번호 유출 등으로 인해 발생하는 문제는 직원 본인에게
                    책임이 있습니다.<br></br>
                    <br></br>
                    제8조 (서비스 이용 제한)<br></br>① 직원이 본 약관 또는 회사
                    규정을 위반할 경우, 회사는 사전 통보 없이 서비스 이용을
                    제한하거나 계정을 정지할 수 있습니다.<br></br>② 법령을
                    위반하는 행위 또는 회사의 업무에 중대한 지장을 초래하는
                    경우, 즉시 이용이 제한됩니다.<br></br>
                    <br></br>
                    제9조 (손해배상)<br></br>① 직원이 본 약관을 위반하거나
                    부정한 방법으로 서비스를 이용하여 회사에 손해를 끼친 경우,
                    해당 직원은 손해를 배상해야 합니다.<br></br>② 회사는 서비스
                    제공과 관련하여 고의 또는 중대한 과실이 없는 한 직원에게
                    발생한 손해에 대해 책임을 지지 않습니다.<br></br>
                    <br></br>
                    제10조 (분쟁 해결)<br></br>① 본 약관에 규정되지 않은 사항은
                    관련 법령 및 회사 규정을 따릅니다.<br></br>② 회사와 직원 간
                    발생한 분쟁은 상호 협의하여 원만히 해결함을 원칙으로 합니다.
                    <br></br>③ 협의가 이루어지지 않을 경우, 회사 본사 소재지를
                    관할하는 법원을 관할 법원으로 합니다.<br></br>
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
                    회사는 직원 회원가입 및 서비스 제공을 위해 아래와 같이
                    개인정보를 수집 및 이용합니다.<br></br>
                    <br></br>
                    1. 수집하는 개인정보 항목<br></br>- 필수 항목: 이름, 사번,
                    부서, 직책, 연락처, 이메일, 계정 ID<br></br>- 선택 항목:
                    사진, 직무 관련 추가 정보<br></br>
                    <br></br>
                    2. 개인정보 수집 목적<br></br>- 직원 본인 확인 및 시스템
                    로그인 인증<br></br>- 인사 및 근태 관리, 전자결재 및 사내
                    커뮤니케이션 제공<br></br>- 공지사항 전달, 업무 관련 알림
                    제공<br></br>- 보안 관리 및 내부 감사 대응<br></br>
                    <br></br>
                    3. 개인정보 보유 및 이용 기간<br></br>- 재직 기간 동안
                    보관하며, 퇴직 시 즉시 파기합니다.<br></br>- 단, 관련 법령에
                    따라 일정 기간 보관이 필요한 경우 해당 기간 동안 보관합니다.
                    <br></br>
                    <br></br>
                    4. 개인정보 제3자 제공 및 위탁<br></br>- 회사는 직원의 동의
                    없이 개인정보를 외부에 제공하지 않습니다.<br></br>- 다만,
                    서비스 운영 및 유지보수를 위해 일부 업무를 외부 업체에
                    위탁할 수 있으며, 이 경우 법령에 따라 개인정보를 안전하게
                    관리합니다.<br></br>
                    <br></br>
                    5. 동의 거부 권리 및 불이익<br></br>- 직원은 개인정보 수집
                    및 이용에 동의하지 않을 권리가 있습니다.<br></br>- 다만,
                    동의하지 않을 경우 회원가입 및 시스템 이용이 제한될 수
                    있습니다.<br></br>
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

        {step === 2 && <SignupStep2 onComplete={() => setStep(3)} />}

        {step === 3 && <SignupStep3 />}
      </main>
    </div>
  );
}
