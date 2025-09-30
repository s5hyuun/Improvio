// BoardPage.jsx 입니다.

import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Header, { SuggestionSearch } from "../../components/Header";
import styles from "../../styles/Board.module.css";
import BoardContent from "./components/BoardContent";
import BoardDetail from "./BoardDetail";
import BoardWrite from "./components/BoardWrite";

function BoardPage() {
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [write, setWrite] = useState(false);
  const [dept, setDept] = useState("");

  // 검색 상태
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/api/suggestions")
      .then((res) => res.json())
      .then((data) => setSuggestions(data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    function handler(e) {
      setDept(e.detail.dept);
    }
    window.addEventListener("dept:changed", handler);
    return () => window.removeEventListener("dept:changed", handler);
  }, []);

  // 검색 결과 vs 전체
  const dataSource = isSearching ? searchResults : suggestions;

  const filtered = dept
    ? dataSource.filter((s) => s.department_name === dept)
    : dataSource;

  const proposals = filtered.filter((s) => s.status === "pending");
  const inProgress = filtered.filter((s) => s.status === "approved");
  const completed = filtered.filter((s) => s.status === "completed");

  const cleanText = (text) => text.replace(/<\/?mark>/g, "");

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        {/* Header에 onSearch 연결 */}
        <Header
          isLoggedIn={true}
          setIsLoggedIn={() => {}}
          onSearch={(results, active) => {
            setSearchResults(results);
            setIsSearching(active);
          }}
        />

        <div className={styles.boardContainer}>
          <div className={styles.boardTitle}>
            <div>
              <p>개선 제안 시스템</p>
              <p>현장 직원들의 불편사항 및 개선 아이디어를 공유해주세요</p>
            </div>
            <button onClick={() => setWrite(true)}>+ 글쓰기</button>
            {write && (
              <BoardWrite
                user={JSON.parse(localStorage.getItem("auth_user"))} // 👈 여기 추가
                onClose={() => setWrite(false)}
                onSubmit={async (formData) => {
                  try {
                    // 이미 user_id, department_id가 formData에 들어있는지 확인
                    const user = JSON.parse(localStorage.getItem("auth_user"));
                    if (user) {
                      formData.append("user_id", user.user_id);
                      formData.append("department_id", user.department_id);
                    }

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
                      suggestion={{
                        ...s,
                        title: cleanText(s.title),
                        description: cleanText(s.description),
                      }}
                      onClick={() => setSelected(s)}
                    />
                  ))
                ) : (
                  <div className={styles.noContent}>
                    {isSearching
                      ? "검색 결과가 없습니다."
                      : "등록된 제안이 없습니다."}
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
                      suggestion={{
                        ...s,
                        title: cleanText(s.title),
                        description: cleanText(s.description),
                      }}
                      onClick={() => setSelected(s)}
                    />
                  ))
                ) : (
                  <div className={styles.noContent}>
                    {isSearching
                      ? "검색 결과가 없습니다."
                      : "진행 중인 제안이 없습니다."}
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
                      suggestion={{
                        ...s,
                        title: cleanText(s.title),
                        description: cleanText(s.description),
                      }}
                      onClick={() => setSelected(s)}
                    />
                  ))
                ) : (
                  <div className={styles.noContent}>
                    {isSearching
                      ? "검색 결과가 없습니다."
                      : "완료된 제안이 없습니다."}
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
