function escapeRegExp(str: string) {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default escapeRegExp;
