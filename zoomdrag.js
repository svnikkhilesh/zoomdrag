window.zoomdrag = (function(){
	let canvas = document.createElement('canvas');

	let main = function(img){
		if (!img || !img.nodeName || img.nodeName !== 'IMG') { return; }
		let	minZoom = 0.1, maxZoom = 10;
		let width, height, bgWidth, bgHeight, bgPosX, bgPosY, previousEvent, cachedDataUrl;

		function updateBgStyle() {
			if (bgPosX > 0) {
				bgPosX = 0;
			} else if (bgPosX < width - bgWidth) {
				bgPosX = width - bgWidth;
			}
			if (bgPosY > 0) {
				bgPosY = 0;
			} else if (bgPosY < height - bgHeight) {
				bgPosY = height - bgHeight;
			}
			img.style.backgroundSize = bgWidth+'px '+bgHeight+'px';
			img.style.backgroundPosition = bgPosX+'px '+bgPosY+'px';
		}

		function reset() {
			img.style.width = width+"px";
			bgWidth = width;
			bgHeight = height;
			bgPosX = bgPosY = 0;
			updateBgStyle();
		}

		img.doZoom = function(deltaY) {
			// zoom always at the center of the image
			let offsetX = img.width/12;
			let offsetY = img.height/12;
			// Record the offset between the bg edge and the center of the image:
			let bgCenterX = offsetX - bgPosX;
			let bgCenterY = offsetY - bgPosY;
			// Use the previous offset to get the percent offset between the bg edge and the center of the image:
			let bgRatioX = bgCenterX/bgWidth;
			let bgRatioY = bgCenterY/bgHeight;
			// Update the bg size:
			if (deltaY < 0) {
				if (maxZoom == -1 || (bgWidth + bgWidth*minZoom) / width <= maxZoom) {
					bgWidth += bgWidth*minZoom;
					bgHeight += bgHeight*minZoom;
				}
			} else {
				bgWidth -= bgWidth*minZoom;
				bgHeight -= bgHeight*minZoom;
			}
			// Take the percent offset and apply it to the new size:
			bgPosX = offsetX - (bgWidth * bgRatioX);
			bgPosY = offsetY - (bgHeight * bgRatioY);
			// Prevent zooming out beyond the starting size
			if (bgWidth <= width || bgHeight <= height) {
				reset()
			} else {
				img.style.width = bgWidth+"px";//full screen zoom
				updateBgStyle();
			}
		}

		function onwheel(e) {
			let deltaY = 0;
			e.preventDefault();
			if (e.deltaY) { 
				deltaY = e.deltaY;
			} else if (e.wheelDelta) {
				deltaY = -e.wheelDelta;
			}
			if (deltaY < 0) {
				img.doZoom(-100);
			} else {
				img.doZoom(100);
			}
		}

		function drag(e) {
			e.preventDefault();
			bgPosX += e.pageX - previousEvent.pageX;
			bgPosY += e.pageY - previousEvent.pageY;
			previousEvent = e;
			updateBgStyle();
		}

		function removeDrag() {
			document.removeEventListener('mouseup', removeDrag);
			document.removeEventListener('mousemove', drag);
		}

		// Make the background draggable
		function draggable(e) {
			e.preventDefault();
			previousEvent = e;
			document.addEventListener('mousemove', drag);
			document.addEventListener('mouseup', removeDrag);
		}

		function load() {
			if (img.src === cachedDataUrl) return;
			let computedStyle = window.getComputedStyle(img, null);
			width = parseInt(computedStyle.width, 10);
			height = parseInt(computedStyle.height, 10);
			bgWidth = width;
			bgHeight = height;
			bgPosX = bgPosY = initBgPosX = initBgPosY = 0;
			img.style.backgroundImage = 'url("'+img.src+'")';
			img.style.backgroundRepeat = 'no-repeat';
			canvas.width = img.naturalWidth;
			canvas.height = img.naturalHeight;
			cachedDataUrl = canvas.toDataURL();
			img.src = cachedDataUrl;
			img.style.backgroundSize =  width+'px '+height+'px';
			img.style.backgroundPosition = '0 0';
			img.addEventListener('wheel', onwheel);
			img.addEventListener('mousedown', draggable);
			$(img).parent().find('.zoom-in').click(()=>{img.doZoom(-100)});
			$(img).parent().find('.reset-zoom').click(()=>{reset()});
			$(img).parent().find('.zoom-out').click(()=>{img.doZoom(100)});
		}
		let t = setInterval(function(){
			if (img) {
				load();
			}
			clearInterval(t);
		}, 100);
	};

	return function(elements) {
		if (elements && elements.length) {
			for (var i=0;i<elements.length;i++) {
				main(elements[i]);
			}
		} else if (elements && elements.nodeName) {
			main(elements);
		}
		return elements;
	};

}());
