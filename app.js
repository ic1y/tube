const searchBtn = document.getElementById("search");
const queryInput = document.getElementById("query");
const resultsDiv = document.getElementById("results");
const iframe = document.getElementById("iframe");
const urlParams = new URLSearchParams(window.location.search);
const titleDiv = document.getElementById("title");

const search = function (q) {
	if (!q) {
		if (queryInput.value.trim().length === 0) return;
		location.href = location.pathname + "?q=" + queryInput.value.trim();
		return;
	}
	queryInput.value = q;
	const query = q;
	fetch("https://imdb-api.icey-ggjt.workers.dev/search?query=" + query).then(
		(resp) => {
			resp.json().then((json) => {
				const results = json.results;
				if (results.length === 0) {
					resultsDiv.innerText = "No results found";
					return false;
				}
				for (result of results) {
					const resultDiv = document.createElement("a");
					resultDiv.href = location.pathname + "?id=" + result.id;
					resultDiv.classList.add("flex", "column", "result");
					const image = document.createElement("img");
					image.src = result.image;
					image.height = 240;
					image.width = 180;
					const title = document.createElement("span");
					title.innerText = result.title;
					title.style.overflowWrap = "break-word";
					resultDiv.append(image, title);
					resultsDiv.append(resultDiv);
					resultsDiv.classList.remove("hidden");
				}
			});
		}
	);
};

if (urlParams.has("id")) {
	const id = urlParams.get("id");
	fetch("https://imdb-api.icey-ggjt.workers.dev/title/" + id).then((resp) => {
		resp.json().then((title) => {
			titleDiv.classList.add("flex", "column");
			const titleEl = document.createElement("h1");
			titleEl.innerText = title.title;
			if (title.contentType === "movie") {
				iframe.src = "https://vidsrc.xyz/embed/movie/" + id;
				iframe.classList.remove("hidden");
				iframe.height = (window.innerWidth - 32) * (9 / 16);
				iframe.width = window.innerWidth - 32;
				titleDiv.append(titleEl);
			} else if (title.contentType === "tvSeries") {
				titleDiv.append(titleEl);
				for (let season of title.all_seasons) {
					fetch("https://imdb-api.icey-ggjt.workers.dev/title/" + id + "/season/" + season.id).then(res => res.json().then(json => {
						const season = json;
						const seasonTitle = document.createElement("h2");
						seasonTitle.innerText = "Season " + season.season_id;
						const episodesDiv = document.createElement("div");
						episodesDiv.classList.add("season");
						titleDiv.append(seasonTitle, episodesDiv);
						const episodes = json.episodes;
						for (let episode of episodes) {
							// console.log(episode.title);
							const episodeDiv = document.createElement("a");
							episodeDiv.href = episode.title;
							episodeDiv.addEventListener("click", (e) => {
								e.preventDefault();
								iframe.src = "https://vidsrc.xyz/embed/tv/" + id + "/" + season.season_id + "-" + episode.idx ;
								iframe.classList.remove("hidden");
								iframe.height = (window.innerWidth - 32) * (9 / 16);
								iframe.width = window.innerWidth - 32;
								titleEl.innerText = title.title + " S" + season.season_id + "E" + episode.idx + " " +  episode.title;
							})
							episodeDiv.classList.add("flex", "column", "episode");
							const image = document.createElement("img");
							image.src = episode.image;
							image.height = 240;
							image.width = 360;
							const epTitle = document.createElement("span");
							epTitle.innerText = episode.title;
							epTitle.style.overflowWrap = "break-word";
							episodeDiv.append(image, epTitle);
							episodesDiv.append(episodeDiv);
						}
					}));
				}
			}
			titleDiv.classList.remove("hidden");
		});
	});

} else if (urlParams.has("e")) { 
	
} else if (urlParams.has("q")) {
	search(urlParams.get("q"));
}

queryInput.addEventListener("keydown", (e) => {
	if (e.key === "Enter") search();
})

searchBtn.addEventListener("click", search);