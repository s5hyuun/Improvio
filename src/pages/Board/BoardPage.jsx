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

  useEffect(() => {
    fetch("http://localhost:5000/api/suggestions")
      .then((res) => res.json())
      .then((data) => setSuggestions(data))
      .catch((err) => console.error(err));
  }, []);

  // status별로 필터링
  const proposals = suggestions.filter((s) => s.status === "pending");
  const inProgress = suggestions.filter((s) => s.status === "approved");
  const completed = suggestions.filter((s) => s.status === "completed");

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
            <button
              onClick={() => {
                setWrite(true);
              }}
            >
              + 글쓰기
            </button>
            {write && (
              <BoardWrite
                onClose={() => setWrite(false)}
                onSubmit={async (form) => {
                  // 예시: 글 저장 후 목록 재조회
                  await fetch("http://localhost:5000/api/suggestions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(form),
                  });
                  // 새로고침 없이 목록 갱신
                  const res = await fetch(
                    "http://localhost:5000/api/suggestions"
                  );
                  const data = await res.json();
                  setSuggestions(data);
                  setWrite(false);
                }}
              />
            )}
          </div>

          <div className={styles.boardContents}>
            <div className={styles.boardColumn}>
              <div>Proposal</div>
              <div className={styles.cardRow}>
                {proposals.length > 0 ? (
                  <>
                    {proposals.map((s) => (
                      <BoardContent
                        key={s.suggestion_id}
                        suggestion={s}
                        onClick={() => {
                          setSelected(s);
                        }}
                      />
                    ))}
                  </>
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
                      onClick={() => {
                        setSelected(s);
                      }}
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
                      onClick={() => {
                        setSelected(s);
                      }}
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
        <BoardDetail
          suggestion={selected}
          onClose={() => {
            setSelected(false);
          }}
        />
      )}
    </div>
  );
}

export default BoardPage;
