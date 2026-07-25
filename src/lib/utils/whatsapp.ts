export function sanitizePhone(phone: string | null | undefined): string {
	if (!phone) return '';
	let clean = phone.replace(/\D/g, '');
	if (clean.startsWith('0')) {
		clean = '62' + clean.slice(1);
	} else if (clean.startsWith('8')) {
		clean = '62' + clean;
	}
	return clean;
}

export function generateWaLink(
	guestName: string,
	guestPhone: string | null | undefined,
	projectSlug: string | undefined,
	whatsappTemplate: string | undefined | null,
	origin: string
): string {
	if (!guestPhone || !projectSlug) return '#';
	const cleanPhone = sanitizePhone(guestPhone);

	// Ensure we match the implementation in the project detail page
	const inviteLink = `${origin}/${projectSlug}?kepada=${encodeURIComponent(guestName)}`;

	// Fallback to default template if not provided by user
	const template =
		whatsappTemplate ||
		'Halo [Nama Tamu],\n\nBerikut adalah tautan undangan acara kami:\n[Link]\n\nKami sangat menantikan kehadiran Anda!';

	const message = template
		.replace(/\[Nama Tamu\]/gi, guestName)
		.replace(/\[NAMA_TAMU\]/gi, guestName)
		.replace(/\[Link\]/gi, inviteLink)
		.replace(/\[LINK_UNDANGAN\]/gi, inviteLink);

	return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
