import { useNavigate } from "react-router-dom";

export default function SignupAll({ onBack }) {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 8 }}>
      <h2 style={{ margin: "4px 0 8px 0" }}>회원가입 선택</h2>
      <p style={{ margin: "0 0 16px 0", color: "#6b7280" }}>
        아래 버튼 중 하나를 선택해주세요.
      </p>

      {/* ✅ 가로 정렬 + 정사각형 버튼 */}
      <div style={{ display: "flex", gap: "20px", justifyContent: "center" }}>
        <button
          type="button"
          style={{
            width: "190px", // ✅ 크기 키움
            height: "190px",
            fontSize: "18px",
            borderRadius: "16px",
            border: "1px solid #93C5FD",
            background: "#BFDBFE",
            cursor: "pointer",
            fontWeight: "600",
            transition: "all 0.25s ease-in-out", // ✅ hover 부드럽게
          }}
          onClick={() => navigate("/signup4")}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "#93C5FD"; // hover 색상
            e.currentTarget.style.boxShadow = "0 6px 16px rgba(59,130,246,0.3)";
            e.currentTarget.style.transform = "translateY(-3px)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "#BFDBFE";
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          관리자
          <br />
          회원가입
        </button>

        <button
          type="button"
          style={{
            width: "190px",
            height: "190px",
            fontSize: "18px",
            borderRadius: "16px",
            border: "1px solid #93C5FD",
            background: "#BFDBFE",
            cursor: "pointer",
            fontWeight: "600",
            transition: "all 0.25s ease-in-out",
          }}
          onClick={() => navigate("/signup")}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "#93C5FD";
            e.currentTarget.style.boxShadow = "0 6px 16px rgba(59,130,246,0.3)";
            e.currentTarget.style.transform = "translateY(-3px)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "#BFDBFE";
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          직원
          <br />
          회원가입
        </button>
      </div>
    </div>
  );
}
