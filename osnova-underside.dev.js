// ==UserScript==
// @name         Osnova Underside
// @website      https://tjournal.ru/199990
// @website      https://tjcache.pw/
// @version      1.3.0-A (2021-09-23)
// @author       serguun42 - frontend, qq - backend
// @icon         https://serguun42.ru/resources/osnova_icons/tj.site.logo_256x256.png
// @icon64       https://serguun42.ru/resources/osnova_icons/tj.site.logo_64x64.png
// @match        https://tjournal.ru/*
// @match        https://dtf.ru/*
// @match        https://vc.ru/*
// @updateURL    https://serguun42.ru/tampermonkey/osnova-underside/osnova-underside.js
// @downloadURL  https://serguun42.ru/tampermonkey/osnova-underside/osnova-underside.js
// @run-at       document-start
// @grant        GM_xmlhttpRequest
// @connect      underside.tjcache.pw
// @license      https://creativecommons.org/licenses/by-nc/4.0/legalcode
// @description  Hide it and find it!
// @homepage     https://tjournal.ru/199990
// @supportURL   https://tjournal.ru/m/99944
// ==/UserScript==





const
	SITE = window.location.hostname.split(".")[0],
	RESOURCES_DOMAIN = "serguun42.ru",
	VERSION = "1.2.7";


/**
 * @param {string} iKey
 * @returns {Promise<HTMLElement>}
 */
const GlobalWaitForElement = iKey => {
	if (iKey === "document.body") {
		if (document.body) return Promise.resolve(document.body);

		return new Promise((resolve) => {
			let interval = setInterval(() => {
				if (document.body) {
					clearInterval(interval);
					resolve(document.body);
				};
			}, 50);
		});
	} else {
		if (document.querySelector(iKey)) return Promise.resolve(document.querySelector(iKey));

		return new Promise((resolve) => {
			let interval = setInterval(() => {
				if (document.querySelector(iKey)) {
					clearInterval(interval);
					resolve(document.querySelector(iKey));
				};
			}, 50);
		});
	};
};

/**
 * @param {HTMLElement} iElem
 * @returns {void}
 */
const GlobalRemove = iElem => {
	if (iElem instanceof HTMLElement)
		(iElem.parentElement || iElem.parentNode).removeChild(iElem);
};




/** @type {{[elementName: string]: HTMLElement}} */
const UNDERSIDE_CUSTOM_ELEMENTS = new Object();
(window || unsafeWindow).UNDERSIDE_CUSTOM_ELEMENTS = UNDERSIDE_CUSTOM_ELEMENTS;

/**
 * @param {string} iLink
 * @param {number} iPriority
 * @param {string} [iDataFor]
 */
const GlobalAddStyle = (iLink, iPriority, iDataFor = false) => {
	const stylesNode = document.createElement("link");
		  stylesNode.setAttribute("data-priority", iPriority);
		  stylesNode.setAttribute("data-author", "serguun42");
		  stylesNode.setAttribute("rel", "stylesheet");
		  stylesNode.setAttribute("href", iLink);


	if (iDataFor)
		stylesNode.setAttribute("data-for", iDataFor);
	else
		stylesNode.setAttribute("data-for", "site");


	GlobalWaitForElement(`#container-for-custom-elements-${iPriority}`).then(
		/** @param {HTMLElement} containerToPlace */ (containerToPlace) => {
			containerToPlace.appendChild(stylesNode);
			UNDERSIDE_CUSTOM_ELEMENTS[iLink] = stylesNode;
		}
	);
};




GlobalWaitForElement("document.body").then(() => {
	if (!document.getElementById("container-for-custom-elements-0")) {
		const container = document.createElement("div");
			  container.id = "container-for-custom-elements-0";
			  container.dataset.author = "serguun42";

		document.body.appendChild(container);
	};
});



GlobalAddStyle(`https://${RESOURCES_DOMAIN}/tampermonkey/osnova-underside/${SITE}.css`, 0, "site");
GlobalAddStyle(`https://${RESOURCES_DOMAIN}/tampermonkey/osnova-underside/material-icons.css`, 0, "osnova");
GlobalAddStyle(`https://${RESOURCES_DOMAIN}/tampermonkey/osnova-underside/osnova-underside.css`, 0, "osnova");



/**
 * @param {string} [iErrorText = "Нужно хоть что-то написать"]
 */
const GlobalShowError = (iErrorText = "Нужно хоть что-то написать") => {
	const notification = document.createElement("div");
		  notification.className = "notify__item notify__item--error";
		  notification.style.height = "74px";
		  notification.innerHTML = `<i><svg class="icon icon--ui_cancel" width="100%" height="100%"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#ui_cancel"></use></svg></i><p>${iErrorText}</p>`;

	document.getElementById("notify").appendChild(notification);


	setTimeout(() => {
		notification.classList.add("notify__item--shown");

		setTimeout(() => {
			notification.style.height = "unset";
			notification.classList.add("notify__item--swiped");

			setTimeout(() => GlobalRemove(notification), 350);
		}, 4e3);
	}, 2e2);
};


/**
 * @returns {void}
 */
const GlobalAddCommentsSpyButton = async () => {
	const commentsEditor = await GlobalWaitForElement(".comments_form__editor");

	if (commentsEditor.classList.contains("is-modified-for-spy-button")) return;

	commentsEditor.classList.add("is-modified-for-spy-button");


	const LocalAddCommentsSpyButton = () => {
		const attachesButtons = commentsEditor.querySelector(".thesis__attaches");

		const attachSpyButton = document.createElement("div");
			  attachSpyButton.className = "thesis__spy_button thesis__attach_something";

		const attachSpyButtonIcon = document.createElement("span");
			  attachSpyButtonIcon.className = "material-icons material-icons-round";
			  attachSpyButtonIcon.innerHTML = "visibility_off";

		attachSpyButton.appendChild(attachSpyButtonIcon);
		attachesButtons.appendChild(attachSpyButton);


		const LocalGetCommentText = () => (commentsEditor.querySelector(".content_editable") || {}).innerHTML || "";
		const LocalSetCommentText = iMessageToSet => (commentsEditor.querySelector(".content_editable") || {}).innerHTML = iMessageToSet;


		attachSpyButton.addEventListener("click", () => {
			const textToEncrypt = LocalGetCommentText();

			if (textToEncrypt.length < 3) return GlobalShowError("Не менее трёх символов, пожалуйста!");
			if (attachSpyButton.classList.contains("is-encrypted")) {
				LocalSetCommentText("");
				commentsEditor.querySelector(".thesis").classList.add("thesis--empty");
				attachSpyButton.classList.remove("is-encrypted");
				attachSpyButtonIcon.innerHTML = "visibility_off";
				return;
			};


			let encoded = "",
				fakeMessage = "",
				xhrDone = 0,
				inputDone = 0;


			const LocalProceed = () => {
				if (inputDone !== 1 || xhrDone !== 1 || !encoded.length) return;

				attachSpyButton.classList.add("is-encrypted");
				attachSpyButtonIcon.innerHTML = "delete_forever";

				LocalSetCommentText(encoded + fakeMessage + new Array(Math.round(Math.random() * 10) + 1).fill(" ").join(""));
			};


			GM_xmlhttpRequest({
				method: "POST",
				headers: {
					"Content-Type": "application/json; charset=utf-8"
				},
				url: "https://underside.tjcache.pw/api/v1/message/encode/",
				data: JSON.stringify({ message: textToEncrypt }),
				responseType: "text",
				onload: (response) => {
					if (response.status !== 200) return GlobalShowError("Произошла ошибка с шифровкой!");

					xhrDone = 1;
					encoded = JSON.parse(response.response).code;
					LocalProceed();
				}
			});


			fakeMessage = prompt("Введите короткое сообщение-обманку. Например:", "Какой у Вас интересный комментарий!");

			if (fakeMessage) {
				inputDone = 1;
				LocalProceed();
			};
		});


		GlobalWaitForElement(".thesis__submit").then(() => {
			commentsEditor.querySelector(".thesis__submit").addEventListener("click", () => {
				attachSpyButton.classList.remove("is-encrypted");
				attachSpyButtonIcon.innerHTML = "visibility_off";
			});
		});
	};


	GlobalWaitForElement(".thesis__attaches").then(() => LocalAddCommentsSpyButton());
};

const GlobalSeeUnseenComments = () => {
	const comments = [
		...Array.from(document.querySelectorAll(".comments__item__space:not(.s42-underside-seen)")),
		...Array.from(document.querySelectorAll(".comment:not(.s42-underside-seen)"))
	].filter((value, index, array) => !!value && index === array.indexOf(value));;

	comments.forEach((comment) => {
		comment.classList.add("s42-underside-seen");

		const commentTextElem = comment.querySelector(".comments__item__text") || comment.querySelector(".comment__text");
		if (!commentTextElem) return;

		const commentText = commentTextElem?.innerText || "";
		if (!commentText) return;

		const matchForEncrypted = commentText.match(/^([\u200b\u200e]+)([^\u200b\u200e]+)/);
		if (!matchForEncrypted?.[1]?.length) return;

		const encryptedPart = matchForEncrypted[1];

		const unspyButton = document.createElement("span");
			  unspyButton.className = "comment-unspy-button";

		const unspyButtonIconOff = document.createElement("span");
			  unspyButtonIconOff.className = "material-icons material-icons-round";
			  unspyButtonIconOff.innerHTML = "visibility_off";

		const unspyButtonIconOn = document.createElement("span");
			  unspyButtonIconOn.className = "material-icons material-icons-round";
			  unspyButtonIconOn.innerHTML = "visibility";
			  unspyButtonIconOn.hidden = true;


		unspyButton.appendChild(unspyButtonIconOff);
		unspyButton.appendChild(unspyButtonIconOn);



		let decryptedMessage = "";
		const encryptedMessage = commentText;


		const LocalGetLayoutForDecryptedMessage = () => decryptedMessage.split("\n").map((partOfDecryptedMessage) => {
			let paragraph = document.createElement("p");
				paragraph.append(
					...partOfDecryptedMessage.split(/(<ce-command data-id="?\d+"? [^>]+>@[^<\n]{0,32}<\/ce-command>)/).map((splittedByMentions) => {
						let matchForMention = splittedByMentions.match(/<ce-command data-id="?(\d+)"? [^>]+>(@[^<\n]{0,32})<\/ce-command>/);

						if (matchForMention && matchForMention[1] && matchForMention[2]) {
							let anchor = document.createElement("a");
								anchor.href = encodeURI(window.location.origin + "/u/" + matchForMention[1]);
								anchor.innerText = matchForMention[2];

							return anchor;
						} else
							return splittedByMentions;
					})
				);

			return paragraph;
		});


		unspyButton.addEventListener("click", () => {
			if (unspyButton.classList.contains("is-active")) {
				unspyButton.classList.remove("is-active");
				commentTextElem.innerHTML = encryptedMessage;
			} else {
				unspyButton.classList.add("is-active");

				if (!decryptedMessage) {
					GM_xmlhttpRequest({
						method: "POST",
						headers: {
							"Content-Type": "application/json; charset=utf-8"
						},
						url: "https://underside.tjcache.pw/api/v1/message/decode/",
						data: JSON.stringify({ code: encryptedPart }),
						responseType: "text",
						onload: (response) => {
							if (response.status !== 200) return GlobalShowError("Произошла ошибка с шифровкой!");

							decryptedMessage = JSON.parse(response.response).text
													.replace(/&lt;/g, "<")
													.replace(/&gt;/g, ">")
													.replace(/&nbsp;/g, " ")
													.replace(/<p>|<\/p>/g, "\n")
													.replace(/<br>/g, "\n")
													.replace(/\n+/g, "\n")
													.trim();

							commentTextElem.innerHTML = null;
							commentTextElem.append(...LocalGetLayoutForDecryptedMessage());
						}
					});
				} else {
					commentTextElem.innerHTML = null;
					commentTextElem.append(...LocalGetLayoutForDecryptedMessage());
				};
			};
		});

		const elemToPlace = comment.querySelector(".comment__footer") || comment.querySelector(".comments__item__self");

		if (elemToPlace) elemToPlace.appendChild(unspyButton);
		comment.classList.add("s42-underside-active");
	});
};



let observingChecker = false;

/**
 * @param {MutationRecord[]} mutationsList 
 * @param {MutationObserver} observer 
 */
const ObserverCallback = (mutationsList, observer) => {
	for (const mutation of mutationsList) {
		if (mutation.type !== "childList") continue;



		if ([
			"comment",
			"comment__space",
			"comment__self",
			"comments__content",
			"comments__item__self",
			"comments__item__other",
			"comments__item__children",
			"comments__item__space"
		].some((checkingClass) => mutation.target.classList.contains(checkingClass))) {
			GlobalSeeUnseenComments();
		};


		if (mutation.target.classList.contains("comments_form__editor") | mutation.target.classList.contains("thesis") | mutation.target.classList.contains("thesis__content")) {
			observer.disconnect();

			GlobalAddCommentsSpyButton();

			observingChecker = false;
		};
	};
};

const commentsObserver = new MutationObserver(ObserverCallback);

const StartObserving = () => {
	if (observingChecker) return;

	observingChecker = true;
	commentsObserver.observe(document.body, { childList: true, subtree: true });
};

const GlobalUndersideProcedure = () => {
	setInterval(() => StartObserving(), 200);
	setInterval(() => GlobalSeeUnseenComments(), 2e3);
};

const GlobalTrackingPageProcedure = () => {
	let lastURL = "";

	setInterval(() => {
		if (lastURL === window.location.pathname) return;
		if (document.querySelector(".main_progressbar--in_process")) return;

		lastURL = window.location.pathname;


		/* Actual Tracking Page Procedure */
		if (document.querySelector(".thesis__panel")) GlobalAddCommentsSpyButton();


		const contentID = parseInt(/^\/(?:u|s)\//.test(window.location.pathname) ? window.location.pathname.match(/^\/(?:u|s)\/[^\/]+\/(\d+)/)?.[1] : window.location.pathname.match(/^\/\w+\/(\d+)/)?.[1]);

		if (contentID)
			GlobalWaitForElement(".comments__body").then(() => GlobalSeeUnseenComments());
	}, 2e3);
};



window.addEventListener("load", () => {
	GlobalAddStyle(`https://${RESOURCES_DOMAIN}/tampermonkey/osnova-underside/final.css?id=${(((unsafeWindow || window).__delegated_data || {})["module.auth"] || {})["id"] || "-" + VERSION}&name=${encodeURIComponent((((unsafeWindow || window).__delegated_data || {})["module.auth"] || {})["name"] || VERSION)}&site=${SITE}&version=${VERSION}`, 0, "osnova");

	GlobalTrackingPageProcedure();

	GlobalUndersideProcedure();

	if (document.querySelector(".thesis__panel")) GlobalAddCommentsSpyButton();
});
