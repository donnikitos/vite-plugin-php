function makeID() {
	return Date.now().toString(36) + Math.random() * 100;
}

export default makeID;
