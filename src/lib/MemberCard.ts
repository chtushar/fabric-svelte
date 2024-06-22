import { fabric } from 'fabric';
import type { Member } from './types';
import { CARD_HEIGHT, CARD_PADDING, CARD_WIDTH } from './constants';
import type { IEvent } from 'fabric/fabric-impl';

export type MemberCardOptions = fabric.IGroupOptions & {
	member: Member;
};

// https://github.com/fabricjs/fabric.js/issues/8849

class MemberCard extends fabric.Group {
	public member?: Member;
	private card: fabric.Rect;

	constructor(opts: MemberCardOptions) {
		const { member, ...rest } = opts;
		const card = new fabric.Rect({
			fill: 'white',
			width: CARD_WIDTH,
			height: CARD_HEIGHT,
			stroke: '#111111',
			strokeWidth: 1,
			rx: 12,
			ry: 12,
			padding: CARD_PADDING,
			hasControls: false,
			hasBorders: true
		});

		const stitch = new fabric.Rect({
			fill: 'transparent',
			stroke: '#4A4A4A',
			strokeDashArray: [5, 2],
			strokeWidth: 1,
			width: CARD_WIDTH - 6,
			height: CARD_HEIGHT - 6,
			rx: 10,
			ry: 10,
			left: 3,
			top: 3
		});

		const gradient = new fabric.Gradient({
			type: 'linear',
			gradientUnits: 'percentage',
			coords: { x1: 0, y1: 0, x2: 0, y2: 1 },
			colorStops: [
				{ offset: 0, color: '#6F6F6F' },
				{ offset: 1, color: '#3E3E3E' }
			]
		});

		card.set('fill', gradient);

		const usernameText = `@${member.login}`;
		const username = new fabric.Text(usernameText, {
			left: 20,
			top: 36,
			fill: '#bbbbbb',
			fontSize: 16,
			fontFamily: 'system-ui',
			selectable: false,
			stroke: '#000000',
			strokeWidth: 0.2
		});

		const name = new fabric.Text(member.name || usernameText, {
			left: 20,
			top: 12,
			fill: '#ffffff',
			fontSize: 20,
			fontFamily: 'system-ui',
			selectable: false,
			stroke: '#000000',
			strokeWidth: 0.2
		});

		username.set('text', usernameText);
		super([card, stitch, username, name], rest);

		this.card = card;

		fabric.Image.fromURL(
			member?.avatarUrl ?? '',
			(img) => {
				const size = 150;

				img.set('width', 500);
				img.set('height', 500);

				const scale = 1;

				img.set('scaleX', scale);
				img.set('scaleY', scale);

				img.set('originX', 'center');
				img.set('originY', 'center');
				img.set('left', 80);
				img.set('top', 0);

				img.set('selectable', false);
				img.set('evented', false);
				img.set('hasControls', false);

				img.scaleToWidth(size);
				img.scaleToHeight(size);

				img.clipPath = new fabric.Circle({
					radius: img.getScaledWidth(),
					originX: 'center',
					originY: 'center'
				});

				this.add(img);
				this.bringToFront();
			},
			{
				crossOrigin: 'anonymous'
			}
		);

		this.on('mouseover', this._onMouseOver);
		this.on('mouseout', this._onMouseOut);
		this.on('mouseup', this._onSelect);

		// @ts-expect-error - FabricJS types are incorrect
		this.on('touchend', this._onSelect);

		this.set('member', member);
	}

	private _onMouseOver() {
		this.card.set('stroke', '#0000ff');
		this.canvas?.renderAll();
	}

	private _onMouseOut() {
		this.card.set('stroke', '#111111');
		this.canvas?.renderAll();
	}

	private _onSelect(e: IEvent<MouseEvent | TouchEvent>) {
		let offsetX, offsetY;
		console.log(e);
		if (e.e.type === 'touchend') {
			const rect = this.canvas?.getElement().getBoundingClientRect();
			const touch = (e.e as TouchEvent).touches[0] || (e.e as TouchEvent).changedTouches[0];

			offsetX = touch.clientX - (rect?.left ?? 0);
			offsetY = touch.clientY - (rect?.top ?? 0);
		} else {
			offsetX = (e.e as MouseEvent).offsetX;
			offsetY = (e.e as MouseEvent).offsetY;
		}

		if (this.member?.url && !e.e.altKey) {
			// Open only if the keyup event is triggered within the boundary of the card
			const { top, left, width, height } = this.getBoundingRect();
			if (offsetX >= left && offsetX <= left + width && offsetY >= top && offsetY <= top + height) {
				window.open(this.member.url, '_blank');
			}
		}
	}
}

export default MemberCard;
