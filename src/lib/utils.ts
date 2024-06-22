import { MAX_ZOOM_STEP } from './constants';

/**
 * @reference https://stackoverflow.com/a/13650579
 * This function normalizes the wheel event delta values across different browsers.
 * @param event
 * @returns [deltaX, deltaY, deltaZ]
 */
export const normalizeWheel = (event: WheelEvent | TouchEvent) => {
	const { deltaX, deltaY } = getDelta(event);
	let deltaZ = 0;

	const signY = Math.sign(deltaY);
	const absDeltaY = Math.abs(deltaY);

	let dy = deltaY;

	if (absDeltaY > MAX_ZOOM_STEP) {
		dy = MAX_ZOOM_STEP * signY;
	}

	deltaZ = dy;

	return [deltaX, deltaY, deltaZ];
};

export const updateCSSVariables = ($c?: fabric.Canvas | null) => {
	document.body.style.setProperty('--zoom', $c?.getZoom().toFixed(3) || '1');
	document.body.style.setProperty('--posX', `${$c?.viewportTransform?.[4]}px`);
	document.body.style.setProperty('--posY', `${$c?.viewportTransform?.[5]}px`);
};

export const getDelta = (event: WheelEvent | TouchEvent) => {
	let deltaX = 0;
	let deltaY = 0;

	if (event instanceof TouchEvent) {
	} else {
		deltaX = event.deltaX;
		deltaY = event.deltaY;
	}
	return { deltaX, deltaY };
};
