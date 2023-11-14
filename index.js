if (window.appended === undefined) {
	window.appended = {};
}

const append = props => {
	let svgElems = ['animate', 'animateMotion', 'animateTransform', 'circle', 'clipPath', 'color-profile', 'defs', 'desc', 'discard', 'ellipse', 'feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap', 'feDistantLight', 'feDropShadow', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR', 'feGaussianBlur', 'feImage', 'feMerge', 'feMergeNode', 'feMorphology', 'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile', 'feTurbulence', 'filter', 'foreignObject', 'g', 'hatch', 'hatchpath', 'image', 'line', 'linearGradient', 'marker', 'mask', 'mesh', 'meshgradient', 'meshpatch', 'meshrow', 'metadata', 'mpath', 'path', 'pattern', 'polygon', 'polyline', 'radialGradient', 'rect', 'set', 'solidcolor', 'stop', 'svg', 'switch', 'symbol', 'text', 'textPath', 'title', 'tspan', 'unknown', 'use', 'view'];
	let { parent, child, update, label } = props;
	let dataAttr = 'data-current-elem';
	let parentElems = [];
	let parentRender = false;

	if (typeof parent == 'object') {
		parentElems = Object.keys(parent).length > 1 ? [...parent] : [parent];
	} else {
		parentElems = [...document.querySelectorAll(parent)];
	}
	
	if ((label && appended[label] === undefined) || (label && appended[label] && update)) {
		appended[label] = {
			parent: false
		};
	}

	parentElems.forEach((parentEl, index) => {
		if (update) {
			parentElems[index].innerHTML = '';
			parentRender = {
				parent: parentElems[index]
			};

			if (child && 'elem' in child[0]) {
				child = [{ child: child }]
			}
		}
		
		if (child) {
			child.forEach(childEl => {
				let newElem = {};

				if (childEl.elem) {
					if (svgElems.includes(childEl.elem)) {
						newElem = document.createElementNS('http://www.w3.org/2000/svg', childEl.elem);
					} else {
						newElem = document.createElement(childEl.elem);
					}
				} else {
					newElem = document.createElement('div');
				}
				
				if (parentRender && !parentRender.child) {
					parentRender['child'] = newElem;
				}

				newElem.setAttribute(dataAttr, '');

				if (childEl.class) {
					newElem.setAttribute('class', childEl.class);
				}

				if (childEl.id) {
					newElem.id = childEl.id;
				}

				if (childEl.text) {
					newElem.innerHTML = childEl.text;
				}

				for (let attrKey in childEl.attrs) {
					newElem.setAttribute(attrKey, childEl.attrs[attrKey]);
				}

				parentEl.appendChild(newElem);
				parentEl.removeAttribute(dataAttr);
				
				if (appended[label] && !appended[label]['parent']) {
					appended[label]['parent'] = parentEl;
				}
				
				let groupUndefined = val => appended[label][val] === undefined;
				let labelError = prop => {
					if (childEl[prop] && !label) {
						throw new Error(`To use { ${prop}: '${childEl[prop]}' } you need to set a label prop at the parent level of the object.`);
					}
				}

				labelError('label');
				labelError('labelGroup');
				
				let splitLabel = null;
				
				if (childEl.labelGroup) {
					splitLabel = childEl.labelGroup.split(' ');
				}
				
				if (childEl.label) {
					if (childEl.labelGroup) {
						if (splitLabel.length > 1) {
							splitLabel.forEach(item => {
								if (groupUndefined(item)) {
									appended[label][item] = {};
								}

								appended[label][item][childEl.label] = newElem;
							})
						} else {
							if (groupUndefined(childEl.labelGroup)) {
								appended[label][childEl.labelGroup] = {};
							}

							appended[label][childEl.labelGroup][childEl.label] = newElem;
						}
					} else {
						appended[label][childEl.label] = newElem;
					}
				} else {
					if (childEl.labelGroup) {
						if (splitLabel.length > 1) {
							splitLabel.forEach(item => {
								if (groupUndefined(item)) {
									appended[label][item] = [];
								}

								appended[label][item].push(newElem);
							})
						} else {
							if (groupUndefined(childEl.labelGroup)) {
								appended[label][childEl.labelGroup] = [];
							}

							appended[label][childEl.labelGroup].push(newElem);
						}
					}
				}

				if (childEl['child'] && (typeof childEl['child'] === 'object')) {
					append({
						parent: `[${dataAttr}]`,
						child: childEl['child'],
						...({ label } || {})
					})
				} else {
					newElem.removeAttribute(dataAttr);
				}
			})
		}
		
		if (parentRender) {
		 [...parentRender['child'].childNodes].forEach(node => {
			parentRender['parent'].appendChild(node);
		 })

		 parentRender['parent'].childNodes[0].remove();
		}
	})  
}
