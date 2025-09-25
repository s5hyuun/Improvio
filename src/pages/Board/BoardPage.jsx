import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import styles from "../../styles/Board.module.css";
import BoardContent from "./components/BoardContent";
import BoardDetail from "./BoardDetail";
import BoardWrite from "./components/BoardWrite";

function BoardPage() {
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [write, setWrite] = useState(false);
  const [dept, setDept] = useState(""); // 선택된 부서 ("" = 전체)

  useEffect(() => {
    fetch("http://localhost:5000/api/suggestions")
      .then((res) => res.json())
      .then((data) => setSuggestions(data))
      .catch((err) => console.error(err));
  }, []);

  // dept 이벤트 구독
  useEffect(() => {
    function handler(e) {
      setDept(e.detail.dept); // ""이면 전체 부서
    }
    window.addEventListener("dept:changed", handler);
    return () => window.removeEventListener("dept:changed", handler);
  }, []);

  // 부서별 필터링
  const filtered = dept
    ? suggestions.filter((s) => s.department_name === dept)
    : suggestions;

  // status별 필터링
  const proposals = filtered.filter((s) => s.status === "pending");
  const inProgress = filtered.filter((s) => s.status === "approved");
  const completed = filtered.filter((s) => s.status === "completed");

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Header />
        <div className={styles.boardContainer}>
          <div className={styles.boardTitle}>
            <div>
              <p>개선 제안 시스템</p>
              <p>현장 직원들의 불편사항 및 개선 아이디어를 공유해주세요</p>
            </div>
            <button onClick={() => setWrite(true)}>+ 글쓰기</button>
            {write && (
              <BoardWrite
                onClose={() => setWrite(false)}
                onSubmit={async (formData) => {
                  try {
                    await fetch("http://localhost:5000/api/suggestions", {
                      method: "POST",
                      body: formData,
                    });

                    const res = await fetch(
                      "http://localhost:5000/api/suggestions"
                    );
                    const data = await res.json();
                    setSuggestions(data);
                    setWrite(false);
                  } catch (err) {
                    console.error(err);
                    alert("저장 중 오류가 발생했습니다.");
                  }
                }}
              />
            )}
          </div>

          <div className={styles.boardContents}>
            <div className={styles.boardColumn}>
              <div>Proposal</div>
              <div className={styles.cardRow}>
                {proposals.length > 0 ? (
                  proposals.map((s) => (
                    <BoardContent
                      key={s.suggestion_id}
                      suggestion={s}
                      onClick={() => setSelected(s)}
                    />
                  ))
                ) : (
                  <div className={styles.noContent}>
                    등록된 제안이 없습니다.
                  </div>
                )}
              </div>
            </div>

            <div className={styles.boardColumn}>
              <div>In Progress</div>
              <div className={styles.cardRow}>
                {inProgress.length > 0 ? (
                  inProgress.map((s) => (
                    <BoardContent
                      key={s.suggestion_id}
                      suggestion={s}
                      onClick={() => setSelected(s)}
                    />
                  ))
                ) : (
                  <div className={styles.noContent}>
                    진행 중인 제안이 없습니다.
                  </div>
                )}
              </div>
            </div>

            <div className={styles.boardColumn}>
              <div>Complete</div>
              <div className={styles.cardRow}>
                {completed.length > 0 ? (
                  completed.map((s) => (
                    <BoardContent
                      key={s.suggestion_id}
                      suggestion={s}
                      onClick={() => setSelected(s)}
                    />
                  ))
                ) : (
                  <div className={styles.noContent}>
                    완료된 제안이 없습니다.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {selected && (
        <BoardDetail suggestion={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

export default BoardPage;
