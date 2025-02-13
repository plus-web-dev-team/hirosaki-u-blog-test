const apiKey = "AX3ShqnvRhW0AwUc7Bl0LpnFajMG8HKMhnhW"; // MicroCMSのAPIキー
const endpoint = "https://tkrizbapte.microcms.io/api/v1/blogs"; // エンドポイントURL
const limit = 10; // 1ページあたりの記事数
let offset = 0; // 取得開始位置
let totalCount = 0; // 全記事数

document.addEventListener("DOMContentLoaded", () => {
	console.log("DOMContentLoaded: ページの読み込み完了");
	const contentContainer = document.getElementById("content");
	const paginationContainer = document.getElementById("pagination");

	// APIから記事を取得する関数
	async function fetchArticles(offset) {
		// ローディング表示
		contentContainer.innerHTML =
			'<div class="loading">記事を読み込んでいます...</div>';

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
					headers: {
						"X-API-KEY": apiKey,
						"Content-Type": "application/json",
					},
					mode: "cors",
				},
			);

			if (!response.ok) {
				throw new Error(`HTTPエラー: ${response.status}`);
			}

			const data = await response.json();

			if (!data.contents || !Array.isArray(data.contents)) {
				throw new Error("データフォーマットが不正です");
			}

			console.log("APIからデータを取得しました:", data);
			totalCount = data.totalCount;
			sessionStorage.setItem(cacheKey, JSON.stringify(data));
			renderArticles(data);
		} catch (error) {
			console.error("APIエラー:", error);
			contentContainer.innerHTML = `
				<div class="error">
					<p>データの取得に失敗しました。</p>
					<p>${error.message}</p>
					<button onclick="location.reload()">再読み込み</button>
				</div>`;
		}
	}

	// 記事を表示する関数
	function renderArticles(data) {
		contentContainer.innerHTML = "";

		data.contents.forEach((item, index) => {
			const createdAt = new Date(item.createdAt);
			const formattedDate = createdAt.toLocaleDateString("ja-JP", {
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
			});

			const article = document.createElement("article");
			article.classList.add("article");

			article.innerHTML = `
        <h2 class="article-title">${item.title}</h2>
        <time class="article-date" datetime="${item.createdAt}">${formattedDate}</time>
        <div class="article-content"></div>
      `;

			contentContainer.appendChild(article);

			const title = article.querySelector(".article-title");
			const content = article.querySelector(".article-content");

			title.addEventListener("click", () => {
				if (!content.innerHTML) {
					content.innerHTML = item.content || "コンテンツがありません";
				}
				content.style.display =
					content.style.display === "none" || !content.style.display
						? "block"
						: "none";
			});
		});

		renderPagination();
	}

	// ページネーションを表示する関数
	function renderPagination() {
		paginationContainer.innerHTML = "";

		const totalPages = Math.ceil(totalCount / limit);
		const currentPage = Math.floor(offset / limit) + 1;

		const nav = document.createElement("nav");
		nav.setAttribute("aria-label", "ページナビゲーション");

		if (currentPage > 1) {
			const prevButton = document.createElement("button");
			prevButton.classList.add("pagination-button", "prev");
			prevButton.innerText = "前のページ";
			prevButton.addEventListener("click", () => {
				offset -= limit;
				fetchArticles(offset);
				window.scrollTo(0, 0);
			});
			nav.appendChild(prevButton);
		}

		if (currentPage < totalPages) {
			const nextButton = document.createElement("button");
			nextButton.classList.add("pagination-button", "next");
			nextButton.innerText = "次のページ";
			nextButton.addEventListener("click", () => {
				offset += limit;
				fetchArticles(offset);
				window.scrollTo(0, 0);
			});
			nav.appendChild(nextButton);
		}

		paginationContainer.appendChild(nav);
	}

	// 初回ロード
	fetchArticles(offset);
});
