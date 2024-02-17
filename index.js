if (window.appended === undefined) {
	window.appended = {};
}

const append = (renderParent, htmlStr, renderType ) => {
	let parentSelector = (typeof renderParent === 'string') ? document.querySelector(renderParent) : renderParent;
				
	if (renderType == 'update') {
		parentSelector.innerHTML = '';
	}

	let parentAttr = 'bb-parent-label';
	let groupAttr = 'bb-group';
	let labelAttr = 'bb-label';

	let appendedObj = appended;
	let parsedHTML = new DOMParser().parseFromString(htmlStr, 'text/html');
	let parsedBody = parsedHTML.querySelector('body');
	let setParsedElements = [...parsedBody.children];

	let addAppendedElements = rootEl => {
		let groupAttrNames = () => rootEl.getAttribute(groupAttr).split(' ');

		let setGroupNameValue = (name, value) => {
			if (appendedObj[name] === undefined || (appendedObj[name] && renderType == 'update')) {
				appendedObj[name] = value;
			}
		}

		if (rootEl.hasAttribute(labelAttr)) {
			if (rootEl.hasAttribute(groupAttr)) {
				groupAttrNames().forEach(groupName => {
					setGroupNameValue(groupName, {});

					appendedObj[groupName][rootEl.getAttribute(labelAttr)] = rootEl;
				})

			} else {
				appendedObj[rootEl.getAttribute(labelAttr)] = rootEl;
			}
		} else if (rootEl.hasAttribute(groupAttr)) {
			groupAttrNames().forEach(groupName => {
				setGroupNameValue(groupName, []);

				appendedObj[groupName].push(rootEl);
			})
		}
	}

	if (parsedBody.innerText !== '' && !setParsedElements.length) {
		setParsedElements = parsedBody.innerText;

		if (renderType == 'update') {
			parentSelector.innerText = setParsedElements; 
		} else {
			parentSelector.innerText += setParsedElements;
		}
	} else {
		setParsedElements.forEach((el, index) => {
			if (el.hasAttribute(parentAttr)) {
				let parentAttrName = el.getAttribute(parentAttr);

				if (appendedObj[parentAttrName] === undefined) {
					appendedObj[parentAttrName] = {};	
				}

				appendedObj = appendedObj[parentAttrName];
			}

			addAppendedElements(el);

			let childLabels = [...el.querySelectorAll('[bb-group], [bb-label]')];

			childLabels.forEach(label => {
				addAppendedElements(label);
			});

			if (renderType === 'prepend') {
				if (index === 0) {
					parentSelector.prepend(el);
				} else {
					setParsedElements[index - 1].after(el);
				}
			} else {
				parentSelector.appendChild(el);
			}
		})
	}
}
