class PriorityQueue {
	constructor() {
		this.backingArray = [];
	}

	enqueue(data, id, priority) {
		this.backingArray.push([data, id, priority]);
		this.backingArray.sort((a, b) => {
			if (a[2] !== b[2]) {
				return a[2] - b[2];
			} else {
				if (Array.isArray(a[0])) {
					if (a[0][0] !== b[0][0]) {
						return a[0][0] - b[0][0];
					} else {
						return a[0][1] - b[0][1];
					}
				} else {
					return a[0] - b[0];
				}
			}
		});
	}

	dequeue() {
		const x = this.backingArray.shift();
		return [x[0], x[1]];
	}

	size() {
		return this.backingArray.length;
	}

	getIDs() {
		return this.backingArray.map(x => x[1]);
	}
}

export default PriorityQueue;
