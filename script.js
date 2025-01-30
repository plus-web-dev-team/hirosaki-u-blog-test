const apiKey = "AX3ShqnvRhW0AwUc7Bl0LpnFajMG8HKMhnhW"; // MicroCMSのAPIキー
const endpoint = "https://tkrizbapte.microcms.io/api/v1/blogs"; // エンドポイントURL

document.addEventListener("DOMContentLoaded", () => {
	console.log("DOMContentLoaded: ページの読み込み完了");

	const contentContainer = document.getElementById("content");

	// APIリクエスト
	fetch(endpoint, {
		headers: {
			"X-API-KEY": apiKey,
		},
	})
		.then((response) => {
			console.log("APIレスポンスステータス:", response.status);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			return response.json();
		})
		.then((data) => {
			console.log("APIから取得したデータ:", data);

			contentContainer.innerHTML = "";
			data.contents.forEach((item, index) => {
				console.log(`記事${index + 1}:`, item);

				// 日付フォーマット
				const createdAt = new Date(item.createdAt);
				const formattedDate = createdAt.toLocaleDateString("ja-JP", {
					year: "numeric",
					month: "2-digit",
					day: "2-digit",
				});
				console.log(`記事${index + 1}の日付: ${formattedDate}`);

				const article = document.createElement("div");
				article.classList.add("article");

				// タイトル、日付、非表示のコンテンツ
				article.innerHTML = `
          <h2 class="article-title" style="cursor: pointer;">${item.title}</h2>
          <p class="article-date">${formattedDate}</p>
          <div class="article-content" style="display: none;">${item.content || "説明文がありません"}</div>
        `;
				contentContainer.appendChild(article);

				// タイトルクリックで開閉するイベント
				const title = article.querySelector(".article-title");
				const content = article.querySelector(".article-content");

				title.addEventListener("click", () => {
					console.log(`タイトルクリック: ${item.title}`);
					const isVisible = content.style.display === "block";
					content.style.display = isVisible ? "none" : "block";
					console.log(`コンテンツ表示状態: ${content.style.display}`);
				});
			});
		})
		.catch((error) => {
			console.error("APIエラー:", error);
			contentContainer.innerHTML = "<p>データの取得に失敗しました。</p>";
		});
});