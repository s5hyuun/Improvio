import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import styles from "../../styles/Board.module.css";
import BoardContent from "./components/BoardContent";
import BoardDetail from "./BoardDetail";
import BoardWrite from "./components/BoardWrite";
import { useTranslation } from "react-i18next";

function BoardPage() {
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [write, setWrite] = useState(false);
  const [dept, setDept] = useState(""); 
  const { t, i18n } = useTranslation(); 

  // 번역 API 호출 함수
  async function translateText(text, lang) {
    try {
      const res = await fetch("http://localhost:4000/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, targetLang: lang.toUpperCase() }),
      });

      const data = await res.json();
      return data.translatedText || text; 
    } catch (err) {
      console.error("번역 실패:", err);
      return text; 
    }
  }

  // suggestions + 번역
  useEffect(() => {
    async function fetchAndTranslate() {
      try {
        const res = await fetch("http://localhost:4000/api/suggestions");
        const data = await res.json();

        const lang = i18n.language || "ko";

        
        if (lang === "ko") {
          setSuggestions(data);
          return;
        }

      
        const translatedData = await Promise.all(
          data.map(async (s) => {
            const title = await translateText(s.title, lang);
            const description = await translateText(s.description, lang);
            return { ...s, title, description }; // 번역된 값을 suggestions 배열에 반영
          })
        );

        setSuggestions(translatedData);
      } catch (err) {
        console.error(err);
      }
    }

    fetchAndTranslate();
  }, [i18n.language]); 

  // dept 이벤트 구독
  useEffect(() => {
    function handler(e) {
      setDept(e.detail.dept); 
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
              <p>{t("board.title")}</p>
              <p>{t("board.termsTitle")}</p>
            </div>
            <button onClick={() => setWrite(true)}>{t("board.writebtn")}</button>
            {write && (
              <BoardWrite
                onClose={() => setWrite(false)}
                onSubmit={async (formData) => {
                  try {
                    await fetch("http://localhost:4000/api/suggestions", {
                      method: "POST",
                      body: formData,
                    });

                    const res = await fetch(
                      "http://localhost:4000/api/suggestions"
                    );
                    const data = await res.json();
                    setSuggestions(data);
                    setWrite(false);
                  } catch (err) {
                    console.error(err);
                    alert(t("board.alert.saveError"));
                  }
                }}
              />
            )}
          </div>

          <div className={styles.boardContents}>
            <div className={styles.boardColumn}>
              <div>{t("board.column.proposal")}</div>
              <div className={styles.cardRow}>
                {proposals.length > 0 ? (
                  proposals.map((s) => (
                    <BoardContent
                      key={s.suggestion_id}
                      suggestion={s} // 번역된 title/description 포함
                      onClick={() => setSelected(s)}
                    />
                  ))
                ) : (
                  <div className={styles.noContent}>
                    {t("board.empty.proposal")}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.boardColumn}>
              <div>{t("board.column.inProgress")}</div>
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
                    {t("board.empty.inProgress")}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.boardColumn}>
              <div>{t("board.column.complete")}</div>
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
                    {t("board.empty.complete")}
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
