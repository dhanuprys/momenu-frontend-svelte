<script lang="ts">
	import type { FieldGroup, FieldDefinition, Project } from '$lib/types/index.js';
	import { ProjectService, UploadService } from '$lib/services/index.js';
	import { ApiError } from '$lib/utils/api-error.js';
	import { getMediaUrl } from '$lib/utils.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { toast } from 'svelte-sonner';
	import { AlertCircle, Check, LoaderCircle, Plus, Trash2, Upload } from '@lucide/svelte';

	let { project = $bindable(), schema } = $props<{ project: Project; schema: FieldGroup[] }>();

	let saving = $state(false);

	let formData = $state<Record<string, any>>({});
	let originalFormData = $state<Record<string, any>>({});
	let fieldErrors = $state<Record<string, string>>({});
	let imageUploading = $state<Record<string, boolean>>({});

	// Derived flag to check if anything actually changed
	let isDirty = $derived.by(() => {
		for (const key of Object.keys(formData)) {
			if (formData[key] !== originalFormData[key]) return true;
		}
		return false;
	});

	// Initialize form data
	$effect(() => {
		if (project && schema && Object.keys(formData).length === 0) {
			const initialData: Record<string, any> = {};
			schema.forEach((group: FieldGroup) => {
				group.fields.forEach((field: FieldDefinition) => {
					const existingVal = project?.payload?.[field.key];
					if (existingVal !== undefined && existingVal !== null) {
						initialData[field.key] = existingVal;
					} else if (field.type === 'group') {
						const emptyItem: Record<string, any> = {};
						(field.fields ?? []).forEach((sf) => {
							emptyItem[sf.key] = '';
						});
						initialData[field.key] = [emptyItem];
					} else {
						initialData[field.key] = '';
					}
				});
			});
			formData = { ...initialData };
			originalFormData = { ...initialData };
		}
	});

	// ── Client-side validation ──
	function validateField(field: FieldDefinition, value: any): string {
		if (field.type === 'group') {
			const items = value as any[] | undefined;
			if (field.required && (!items || items.length === 0)) return `${field.label} wajib diisi`;
			if (items && field.min_items && items.length < field.min_items)
				return `${field.label} minimal ${field.min_items} entri`;
			if (items && field.max_items && items.length > field.max_items)
				return `${field.label} maksimal ${field.max_items} entri`;
			return '';
		}
		if (field.type === 'image') {
			if (field.required && (!value || String(value).trim() === ''))
				return `${field.label} wajib diisi`;
			return '';
		}

		const strVal = String(value ?? '').trim();

		if (field.required && strVal === '') return `${field.label} wajib diisi`;
		if (strVal === '') return '';

		if (field.type === 'number') {
			const num = Number(strVal);
			if (isNaN(num)) return `${field.label} harus berupa angka`;
		}

		if (field.type === 'url' && strVal !== '') {
			try {
				new URL(strVal);
			} catch {
				return `${field.label} harus berupa URL yang valid`;
			}
		}

		for (const rule of field.validations ?? []) {
			const [ruleName, ruleParam] = rule.split(':');
			const paramNum = parseInt(ruleParam, 10);
			if (isNaN(paramNum)) continue;
			if (field.type === 'number') {
				const num = Number(strVal);
				if (ruleName === 'min' && num < paramNum) return `${field.label} minimal ${paramNum}`;
				if (ruleName === 'max' && num > paramNum) return `${field.label} maksimal ${paramNum}`;
			} else {
				if (ruleName === 'min' && strVal.length < paramNum)
					return `${field.label} minimal ${paramNum} karakter`;
				if (ruleName === 'max' && strVal.length > paramNum)
					return `${field.label} maksimal ${paramNum} karakter`;
			}
		}
		return '';
	}

	function validateAllFields(): boolean {
		for (const key of Object.keys(fieldErrors)) delete fieldErrors[key];
		let hasError = false;

		for (const group of schema) {
			for (const field of group.fields) {
				const err = validateField(field, formData[field.key]);
				if (err) {
					fieldErrors[field.key] = err;
					hasError = true;
				}
			}
		}

		return !hasError;
	}

	function clearFieldError(key: string) {
		if (fieldErrors[key]) {
			const next = { ...fieldErrors };
			delete next[key];
			fieldErrors = next;
		}
	}

	// ── Save ──
	async function saveDetails() {
		if (!project) return;

		if (!validateAllFields()) {
			toast.error('Harap periksa kembali isian formulir Anda');
			// Scroll to first error
			const firstErrKey = Object.keys(fieldErrors)[0];
			if (firstErrKey) {
				const el = document.getElementById(firstErrKey);
				el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
			}
			return;
		}

		saving = true;
		try {
			// Coerce number fields from string → number for JSON
			const payload: Record<string, any> = {};
			for (const group of schema) {
				for (const field of group.fields) {
					const val = formData[field.key];
					if (field.type === 'group') {
						const items = ((val as any[]) || []).map((item: Record<string, any>) => {
							const coerced: Record<string, any> = {};
							for (const sf of field.fields ?? []) {
								const sv = item[sf.key];
								if (sf.type === 'number' && sv !== '' && sv != null) coerced[sf.key] = Number(sv);
								else coerced[sf.key] = sv;
							}
							return coerced;
						});
						payload[field.key] = items;
					} else if (field.type === 'number' && val !== '' && val != null) {
						payload[field.key] = Number(val);
					} else {
						payload[field.key] = val;
					}
				}
			}

			await ProjectService.update(project.id, {
				title: project.title,
				slug: project.slug,
				sharing_thumbnail: project.sharing_thumbnail,
				music_id: project.music_id,
				payload
			});

			project.payload = payload;
			originalFormData = { ...formData };
			toast.success('Detail acara berhasil disimpan');
		} catch (e) {
			if (e instanceof ApiError && e.hasFieldErrors()) {
				for (const key of Object.keys(fieldErrors)) delete fieldErrors[key];
				for (const ve of e.validationErrors) {
					fieldErrors[ve.field] = ve.message;
				}
				toast.error('Terdapat kesalahan pada input Anda');
			} else {
				console.error(e);
				toast.error('Gagal menyimpan detail acara');
			}
		} finally {
			saving = false;
		}
	}

	// ── Group field helpers ──
	function addGroupItem(field: FieldDefinition) {
		const items = (formData[field.key] as any[]) || [];
		if (field.max_items && items.length >= field.max_items) return;
		const emptyItem: Record<string, any> = {};
		(field.fields ?? []).forEach((sf) => {
			emptyItem[sf.key] = '';
		});
		formData[field.key] = [...items, emptyItem];
	}

	function removeGroupItem(field: FieldDefinition, index: number) {
		const items = (formData[field.key] as any[]) || [];
		if (field.min_items && items.length <= field.min_items) return;
		formData[field.key] = items.filter((_, i) => i !== index);
	}

	async function handleImageUpload(
		fieldKey: string,
		groupFieldKey: string | null,
		groupIndex: number,
		event: Event
	) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file || !project) return;
		const uploadKey = groupFieldKey ? `${groupFieldKey}_${groupIndex}_${fieldKey}` : fieldKey;
		imageUploading[uploadKey] = true;
		try {
			const result = await UploadService.upload(file, 'image', project.id);
			if (groupFieldKey !== null) {
				const items = formData[groupFieldKey] as any[];
				items[groupIndex][fieldKey] = result.url;
				formData[groupFieldKey] = [...items];
			} else {
				formData[fieldKey] = result.url;
			}
			toast.success('Foto berhasil diupload');
		} catch {
			toast.error('Gagal mengupload foto');
		} finally {
			imageUploading[uploadKey] = false;
		}
	}
</script>

<div class="space-y-6">
	{#each schema as group}
		<Card.Root class="overflow-hidden">
			<Card.Header class="bg-muted/30 border-b">
				<Card.Title>{group.group_name}</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-6 pt-6">
				{#each group.fields as field}
					{#if field.type === 'group'}
						<div class="space-y-4">
							<div class="flex items-center justify-between">
								<Label class="text-sm font-semibold">
									{field.label}
									{#if field.required}<span class="text-destructive">*</span>{/if}
									<span class="text-muted-foreground font-normal text-xs ml-1"
										>(maks. {field.max_items || '∞'})</span
									>
								</Label>
								<Button
									variant="outline"
									size="sm"
									disabled={field.max_items
										? ((formData[field.key] as any[]) || []).length >= field.max_items
										: false}
									onclick={() => addGroupItem(field)}
									class="text-xs"
								>
									<Plus class="h-3.5 w-3.5 mr-1" /> Tambah
								</Button>
							</div>
							{#each (formData[field.key] as any[]) || [] as item, idx}
								<div class="p-4 border border-border rounded-xl bg-muted/10 space-y-4">
									<div class="flex items-center justify-between">
										<span class="text-sm font-medium text-muted-foreground"
											>{field.label} #{idx + 1}</span
										>
										{#if !field.min_items || (formData[field.key] as any[]).length > field.min_items}
											<Button
												variant="ghost"
												size="icon"
												onclick={() => removeGroupItem(field, idx)}
												class="text-destructive/60 hover:text-destructive hover:bg-destructive/10 h-8 w-8 transition-colors"
											>
												<Trash2 class="h-4 w-4" />
											</Button>
										{/if}
									</div>
									{#each field.fields ?? [] as subField}
										<div class="grid gap-2">
											<Label for="{field.key}_{idx}_{subField.key}" class="text-sm">
												{subField.label}
												{#if subField.required}<span class="text-destructive">*</span>{/if}
											</Label>
											{#if subField.type === 'image'}
												{@const uploadKey = `${field.key}_${idx}_${subField.key}`}
												{#if item[subField.key]}
													<div
														class="relative group rounded-xl overflow-hidden border border-border bg-muted h-32 w-32 sm:h-40 sm:w-40 shrink-0 shadow-sm"
													>
														<img
															src={getMediaUrl(item[subField.key])}
															alt="Preview"
															class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
														/>
														<div
															class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
														>
															<Button
																variant="destructive"
																size="icon"
																onclick={() => {
																	item[subField.key] = '';
																	formData[field.key] = [...(formData[field.key] as any[])];
																}}
																class="rounded-full hover:scale-110 transition-all shadow-md"
																title="Hapus foto"
															>
																<Trash2 class="h-4 w-4" />
															</Button>
														</div>
													</div>
												{:else}
													<label
														class="flex flex-col items-center justify-center gap-3 px-6 py-8 border-2 border-dashed border-border/60 rounded-xl cursor-pointer hover:bg-primary/5 hover:border-primary/40 transition-all duration-200 bg-card group/upload relative overflow-hidden"
													>
														<div
															class="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover/upload:scale-110 transition-transform duration-300"
														>
															{#if imageUploading[uploadKey]}
																<LoaderCircle class="h-5 w-5 animate-spin" />
															{:else}
																<Upload class="h-5 w-5" />
															{/if}
														</div>
														<div class="text-center space-y-1">
															<p class="text-sm font-medium text-foreground">
																{imageUploading[uploadKey]
																	? 'Mengupload...'
																	: 'Klik untuk memilih foto'}
															</p>
															<p class="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
														</div>
														<input
															type="file"
															accept="image/*"
															class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
															onchange={(e) => handleImageUpload(subField.key, field.key, idx, e)}
															disabled={imageUploading[uploadKey]}
														/>
													</label>
												{/if}
											{:else}
												<Input
													type={subField.type === 'number'
														? 'number'
														: subField.type === 'url'
															? 'url'
															: 'text'}
													id="{field.key}_{idx}_{subField.key}"
													bind:value={item[subField.key]}
													placeholder={subField.placeholder}
													class="h-11"
												/>
											{/if}
										</div>
									{/each}
								</div>
							{/each}
							{#if fieldErrors[field.key]}
								<p class="text-sm text-destructive flex items-center gap-1.5">
									<AlertCircle class="h-3.5 w-3.5 shrink-0" />{fieldErrors[field.key]}
								</p>
							{/if}
						</div>
					{:else if field.type === 'image'}
						<div class="grid gap-2">
							<Label class="text-sm font-semibold"
								>{field.label}{#if field.required}<span class="text-destructive">*</span
									>{/if}</Label
							>
							{#if formData[field.key]}
								<div
									class="relative group rounded-xl overflow-hidden border border-border bg-muted h-32 w-32 sm:h-40 sm:w-40 shrink-0 shadow-sm"
								>
									<img
										src={getMediaUrl(formData[field.key])}
										alt="Preview"
										class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
									/>
									<div
										class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
									>
										<Button
											variant="destructive"
											size="icon"
											onclick={() => {
												formData[field.key] = '';
											}}
											class="rounded-full hover:scale-110 transition-all shadow-md"
											title="Hapus foto"
										>
											<Trash2 class="h-4 w-4" />
										</Button>
									</div>
								</div>
							{:else}
								<label
									class="flex flex-col items-center justify-center gap-3 px-6 py-8 border-2 border-dashed border-border/60 rounded-xl cursor-pointer hover:bg-primary/5 hover:border-primary/40 transition-all duration-200 bg-card group/upload relative overflow-hidden"
								>
									<div
										class="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover/upload:scale-110 transition-transform duration-300"
									>
										{#if imageUploading[field.key]}
											<LoaderCircle class="h-5 w-5 animate-spin" />
										{:else}
											<Upload class="h-5 w-5" />
										{/if}
									</div>
									<div class="text-center space-y-1">
										<p class="text-sm font-medium text-foreground">
											{imageUploading[field.key] ? 'Mengupload...' : 'Klik untuk memilih foto'}
										</p>
										<p class="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
									</div>
									<input
										type="file"
										accept="image/*"
										class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
										onchange={(e) => handleImageUpload(field.key, null, 0, e)}
										disabled={imageUploading[field.key]}
									/>
								</label>
							{/if}
						</div>
					{:else}
						<div class="grid gap-2">
							<Label for={field.key} class="text-sm font-semibold">
								{field.label}
								{#if field.required}<span class="text-destructive">*</span>{/if}
							</Label>
							{#if field.type === 'text'}
								<Textarea
									id={field.key}
									bind:value={formData[field.key]}
									placeholder={field.placeholder}
									oninput={() => clearFieldError(field.key)}
									class="min-h-[100px] bg-transparent {fieldErrors[field.key]
										? 'border-destructive focus-visible:ring-destructive'
										: 'border-input'}"
								/>
							{:else if field.type === 'number'}
								<Input
									type="number"
									id={field.key}
									bind:value={formData[field.key]}
									placeholder={field.placeholder}
									class="h-11 {fieldErrors[field.key]
										? 'border-destructive focus-visible:ring-destructive'
										: ''}"
									oninput={() => clearFieldError(field.key)}
								/>
							{:else}
								<Input
									type={field.type === 'url' ? 'url' : 'text'}
									id={field.key}
									bind:value={formData[field.key]}
									placeholder={field.placeholder}
									class="h-11 {fieldErrors[field.key]
										? 'border-destructive focus-visible:ring-destructive'
										: ''}"
									oninput={() => clearFieldError(field.key)}
								/>
							{/if}
							{#if fieldErrors[field.key]}
								<p
									class="text-sm text-destructive flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200"
								>
									<AlertCircle class="h-3.5 w-3.5 shrink-0" />{fieldErrors[field.key]}
								</p>
							{/if}
						</div>
					{/if}
				{/each}
			</Card.Content>
		</Card.Root>
	{/each}

	<div class="flex justify-end pt-4 pb-12">
		<Button
			size="lg"
			disabled={!isDirty || saving}
			onclick={saveDetails}
			class="h-12 px-8 min-w-[180px] bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md text-white font-semibold"
		>
			{#if saving}
				<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
				Menyimpan...
			{:else}
				Simpan Perubahan <Check class="ml-2 h-4 w-4" />
			{/if}
		</Button>
	</div>
</div>
