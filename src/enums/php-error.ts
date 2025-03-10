export const EPHPError = {
	ERROR: 1,
	WARNING: 2,
	PARSE: 4,
	NOTICE: 8,
	CORE_ERROR: 16,
	CORE_WARNING: 32,
	COMPILE_ERROR: 64,
	COMPILE_WARNING: 128,
	USER_ERROR: 256,
	USER_WARNING: 512,
	USER_NOTICE: 1024,
	STRICT: 2048,
	RECOVERABLE_ERROR: 4096,
	DEPRECATED: 8192,
	USER_DEPRECATED: 16384,
	ALL: 32767,
} as const;

export type EPHPError = (typeof EPHPError)[keyof typeof EPHPError];
