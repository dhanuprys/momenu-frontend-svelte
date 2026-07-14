import { api } from '../utils/api';
import type { FieldGroup, EventType } from '../types';

export const EventTypeService = {
	async getSchema(eventType: EventType) {
		const res = await api.get<FieldGroup[]>(`/event-types/${eventType}/schema`);
		return res.data;
	}
};
