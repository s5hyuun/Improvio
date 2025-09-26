import { useNavigate } from "react-router-dom";

export default function SignupAll({ onBack }) {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 8 }}>
      <h2 style={{ margin: "4px 0 8px 0" }}>회원가입 선택</h2>
      <p style={{ margin: "0 0 16px 0", color: "#6b7280" }}>
        아래 버튼 중 하나를 선택해주세요.
      </p>

      <div style={{ display: "grid", gap: 10 }}>
        <button
          type="button" /* ✅ 기본 submit 방지 */
          style={{
            padding: "12px 16px",
            fontSize: "16px",
            borderRadius: 8,
            border: "1px solid #bfdbfe",
            background: "#fff",
            cursor: "pointer",
          }}
          onClick={() => navigate("/signup4")}
        >
          관리자용 회원가입
        </button>

        <button
          type="button" /* ✅ 기본 submit 방지 */
          style={{
            padding: "12px 16px",
            fontSize: "16px",
            borderRadius: 8,
            border: "1px solid #bfdbfe",
            background: "#fff",
            cursor: "pointer",
          }}
          onClick={() => navigate("/signup")}
        >
          직원용 회원가입
        </button>

        <button
          type="button" /* ✅ 기본 submit 방지 */
          style={{
            padding: "10px 14px",
            fontSize: "14px",
            borderRadius: 8,
            background: "#f3f4f6",
            border: "1px solid #e5e7eb",
            color: "#374151",
            cursor: "pointer",
            marginTop: 6,
          }}
          onClick={onBack}
        >
          ← 돌아가기
        </button>
      </div>
    </div>
  );
}
