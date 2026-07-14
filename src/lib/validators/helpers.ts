import { z } from 'zod';

export type ValidationResult<T> =
	{ success: true; data: T } | { success: false; errors: Record<string, string> };

/**
 * Validates data against a Zod schema and returns a flattened error map
 * suitable for binding to form inputs.
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> {
	const result = schema.safeParse(data);

	if (result.success) {
		return { success: true, data: result.data };
	}

	const errors: Record<string, string> = {};
	const formatted = result.error.format();

	// Flatten the errors to just field -> string map (taking the first error per field)
	for (const key of Object.keys(formatted)) {
		if (key !== '_errors') {
			const fieldError = formatted[key as keyof typeof formatted] as { _errors: string[] };
			if (fieldError && fieldError._errors && fieldError._errors.length > 0) {
				errors[key] = fieldError._errors[0];
			}
		}
	}

	return { success: false, errors };
}
