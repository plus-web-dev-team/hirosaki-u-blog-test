const apiKey = "AX3ShqnvRhW0AwUc7Bl0LpnFajMG8HKMhnhW"; // MicroCMSのAPIキー
const endpoint = "https://tkrizbapte.microcms.io/api/v1/blogs"; // エンドポイントURL
const limit = 10; // 1ページあたりの記事数
let offset = 0; // 取得開始位置
let totalCount = 0; // 全記事数

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOMContentLoaded: ページの読み込み完了");

  const contentContainer = document.getElementById("content");
  const paginationContainer = document.getElementById("pagination");

  // APIから記事を取得
  async function fetchArticles(offset) {
    const cacheKey = `microcms_blog_page_${offset}`;
    const cachedData = sessionStorage.getItem(cacheKey);

    if (cachedData) {
      console.log("キャッシュからデータを取得");
      renderArticles(JSON.parse(cachedData));
      return;
    }

    try {
      const response = await fetch(
        `${endpoint}?limit=${limit}&offset=${offset}`,
        {
          headers: { "X-API-KEY": apiKey },
          mode: "cors", // CORS対策
        },
      );

      console.log("APIレスポンスステータス:", response.status);

      if (!response.ok) {
        throw new Error(`HTTPエラー: ${response.status}`);
      }

      const data = await response.json();

      if (!data.contents || !Array.isArray(data.contents)) {
        throw new Error("データフォーマットが不正");
      }

      console.log("APIから取得したデータ:", data);
      totalCount = data.totalCount;
      sessionStorage.setItem(cacheKey, JSON.stringify(data)); // キャッシュ保存
      renderArticles(data);
    } catch (error) {
      console.error("APIエラー:", error);
      contentContainer.innerHTML = `<p>データの取得に失敗しました。エラー: ${error.message}</p>`;
    }
  }

  // 記事を表示
  function renderArticles(data) {
    contentContainer.innerHTML = "";
    data.contents.forEach((item, index) => {
      console.log(`記事${index + 1}:`, item);

      const createdAt = new Date(item.createdAt);
      const formattedDate = createdAt.toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });

      const article = document.createElement("div");
      article.classList.add("article");

      article.innerHTML = `
        <h2 class="article-title" style="cursor: pointer;">${item.title}</h2>
        <p class="article-date">${formattedDate}</p>
        <div class="article-content" style="display: none;"></div>
      `;
      contentContainer.appendChild(article);

      const title = article.querySelector(".article-title");
      const content = article.querySelector(".article-content");

      title.addEventListener("click", () => {
        if (!content.innerHTML) {
          console.log(`記事${index + 1}の本文をロード: ${item.title}`);
          content.innerHTML = item.content || "説明文がありません";
        }
        content.style.display =
          content.style.display === "block" ? "none" : "block";
      });
    });

    renderPagination();
  }

  // ページネーション
  function renderPagination() {
    paginationContainer.innerHTML = "";

    const totalPages = Math.ceil(totalCount / limit);
    const currentPage = Math.floor(offset / limit) + 1;

    if (currentPage > 1) {
      const prevButton = document.createElement("button");
      prevButton.innerText = "前のページ";
      prevButton.addEventListener("click", () => {
        offset -= limit;
        fetchArticles(offset);
      });
      paginationContainer.appendChild(prevButton);
    }

    if (currentPage < totalPages) {
      const nextButton = document.createElement("button");
      nextButton.innerText = "次のページ";
      nextButton.addEventListener("click", () => {
        offset += limit;
        fetchArticles(offset);
      });
      paginationContainer.appendChild(nextButton);
    }
  }

  // 初回ロード
  fetchArticles(offset);
});
