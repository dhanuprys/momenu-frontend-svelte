import { getContext, setContext } from 'svelte';
import type { InvitationData } from '../types';

const INVITATION_KEY = Symbol('invitation');

export function setInvitationContext(data: () => InvitationData): void {
	setContext(INVITATION_KEY, data);
}

export function getInvitationContext(): InvitationData {
	const context = getContext<() => InvitationData>(INVITATION_KEY);
	if (!context) {
		throw new Error('getInvitationContext must be used within an InvitationProvider');
	}
	return context();
}

export function getPernikahanContext(): InvitationData<'pernikahan'> {
	return getInvitationContext() as InvitationData<'pernikahan'>;
}

export function getUlangTahunContext(): InvitationData<'ulang_tahun'> {
	return getInvitationContext() as InvitationData<'ulang_tahun'>;
}

export function getMetatahContext(): InvitationData<'metatah'> {
	return getInvitationContext() as InvitationData<'metatah'>;
}

export function getTigangSasihContext(): InvitationData<'tigang_sasih'> {
	return getInvitationContext() as InvitationData<'tigang_sasih'>;
}

export function getSeminarContext(): InvitationData<'seminar'> {
	return getInvitationContext() as InvitationData<'seminar'>;
}
