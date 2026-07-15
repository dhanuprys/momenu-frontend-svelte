import type { EventType, FieldGroup } from '../types';
import { api } from '../utils/api';

export const EventTypeService = {
	async getSchema(eventType: EventType) {
		const res = await api.get<FieldGroup[]>(`/event-types/${eventType}/schema`);
		return res.data;
	}
};
