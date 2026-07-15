<script lang="ts">
	import { AdminService } from '$lib/services/index.js';
	import type { User } from '$lib/types/index.js';
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import { toast } from 'svelte-sonner';
	import { CheckCircle2, XCircle, LogIn, Trash2 } from '@lucide/svelte';
	import { authState } from '$lib/stores/auth.svelte';

	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import PageComposer from '$lib/components/layout/page-composer.svelte';
	import { Label } from '$lib/components/ui/label/index.js';

	let users = $state<User[]>([]);
	let loading = $state(true);

	let createUserOpen = $state(false);
	let isSubmitting = $state(false);
	let newUser = $state({
		email: '',
		password: '',
		is_admin: false
	});

	async function handleCreateUser(e: Event) {
		e.preventDefault();
		isSubmitting = true;
		try {
			const created = await AdminService.createUser(newUser);
			users = [created, ...users];
			toast.success('Pengguna berhasil dibuat');
			createUserOpen = false;
			newUser = { email: '', password: '', is_admin: false };
		} catch (error) {
			toast.error('Gagal membuat pengguna');
		} finally {
			isSubmitting = false;
		}
	}

	onMount(async () => {
		try {
			users = await AdminService.listUsers();
		} catch (error) {
			toast.error('Gagal memuat daftar pengguna');
		} finally {
			loading = false;
		}
	});

	async function toggleUserStatus(user: User, field: 'verified' | 'is_admin') {
		try {
			const updatedUser = { ...user, [field]: !user[field] };
			await AdminService.updateUserStatus(user.id, {
				verified: updatedUser.verified,
				is_admin: updatedUser.is_admin
			});
			user[field] = !user[field];
			toast.success('Status pengguna berhasil diperbarui');
		} catch (error) {
			toast.error('Gagal memperbarui status');
		}
	}

	let loginAsUserOpen = $state(false);
	let selectedUserToLoginAs = $state<User | null>(null);
	let isLoginAsSubmitting = $state(false);

	function promptLoginAs(user: User) {
		selectedUserToLoginAs = user;
		loginAsUserOpen = true;
	}

	async function handleLoginAs() {
		if (!selectedUserToLoginAs) return;
		isLoginAsSubmitting = true;
		try {
			const res = await AdminService.loginAs(selectedUserToLoginAs.id);
			authState.setSession(res.user, res.token, res.refresh_token);
			toast.success(`Berhasil login sebagai ${selectedUserToLoginAs.email}`);
			window.location.href = '/app';
		} catch (error) {
			toast.error('Gagal login sebagai pengguna');
			isLoginAsSubmitting = false;
			loginAsUserOpen = false;
		}
	}

	let deleteUserOpen = $state(false);
	let selectedUserToDelete = $state<User | null>(null);
	let isDeletingUser = $state(false);

	function promptDeleteUser(user: User) {
		selectedUserToDelete = user;
		deleteUserOpen = true;
	}

	async function handleDeleteUser() {
		if (!selectedUserToDelete) return;
		isDeletingUser = true;
		try {
			await AdminService.deleteUser(selectedUserToDelete.id);
			users = users.filter((u) => u.id !== selectedUserToDelete!.id);
			toast.success('Pengguna berhasil dihapus');
			deleteUserOpen = false;
		} catch (error) {
			toast.error('Gagal menghapus pengguna');
		} finally {
			isDeletingUser = false;
		}
	}
</script>

<svelte:head>
	<title>Momenu | Manajemen Pengguna</title>
</svelte:head>

<PageComposer>
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Pengguna</h1>
			<p class="text-muted-foreground mt-2">Kelola akun pengguna dan akses admin.</p>
		</div>
		<Dialog.Root bind:open={createUserOpen}>
			<Dialog.Trigger>
				<Button>Tambah Pengguna</Button>
			</Dialog.Trigger>
			<Dialog.Content>
				<Dialog.Header>
					<Dialog.Title>Tambah Pengguna Baru</Dialog.Title>
					<Dialog.Description>Buat akun pengguna baru dengan email dan password.</Dialog.Description
					>
				</Dialog.Header>
				<form onsubmit={handleCreateUser} class="space-y-4 py-4">
					<div class="space-y-2">
						<Label for="email">Email</Label>
						<Input
							id="email"
							type="email"
							bind:value={newUser.email}
							required
							placeholder="email@contoh.com"
						/>
					</div>
					<div class="space-y-2">
						<Label for="password">Password</Label>
						<Input
							id="password"
							type="password"
							bind:value={newUser.password}
							required
							placeholder="••••••••"
						/>
					</div>
					<div class="flex items-center justify-between rounded-lg border p-3">
						<div class="space-y-0.5">
							<Label>Akses Admin</Label>
							<p class="text-muted-foreground text-sm">Berikan akses ke dashboard admin.</p>
						</div>
						<Switch bind:checked={newUser.is_admin} />
					</div>
					<Dialog.Footer class="pt-4">
						<Button type="button" variant="outline" onclick={() => (createUserOpen = false)}
							>Batal</Button
						>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? 'Menyimpan...' : 'Simpan'}
						</Button>
					</Dialog.Footer>
				</form>
			</Dialog.Content>
		</Dialog.Root>
	</div>

	<div class="rounded-md border bg-card">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Email</Table.Head>
					<Table.Head>Google SSO</Table.Head>
					<Table.Head>Terkonfirmasi</Table.Head>
					<Table.Head>Akses Admin</Table.Head>
					<Table.Head>Tanggal Daftar</Table.Head>
					<Table.Head class="text-right">Aksi</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#if loading}
					{#each Array(5) as _}
						<Table.Row>
							<Table.Cell><Skeleton class="h-4 w-40" /></Table.Cell>
							<Table.Cell><Skeleton class="h-4 w-10" /></Table.Cell>
							<Table.Cell><Skeleton class="h-6 w-10" /></Table.Cell>
							<Table.Cell><Skeleton class="h-6 w-10" /></Table.Cell>
							<Table.Cell><Skeleton class="h-4 w-24" /></Table.Cell>
							<Table.Cell><Skeleton class="h-8 w-20 float-right" /></Table.Cell>
						</Table.Row>
					{/each}
				{:else if users.length === 0}
					<Table.Row>
						<Table.Cell colspan={6} class="text-center py-6 text-muted-foreground"
							>Tidak ada pengguna ditemukan.</Table.Cell
						>
					</Table.Row>
				{:else}
					{#each users as user}
						<Table.Row>
							<Table.Cell class="font-medium">{user.email}</Table.Cell>
							<Table.Cell>
								{#if user.google_id}
									<CheckCircle2 class="h-4 w-4 text-primary" />
								{:else}
									<XCircle class="h-4 w-4 text-muted-foreground opacity-50" />
								{/if}
							</Table.Cell>
							<Table.Cell>
								<Switch
									checked={user.verified}
									onCheckedChange={() => toggleUserStatus(user, 'verified')}
								/>
							</Table.Cell>
							<Table.Cell>
								<Switch
									checked={user.is_admin}
									onCheckedChange={() => toggleUserStatus(user, 'is_admin')}
								/>
							</Table.Cell>
							<Table.Cell class="text-muted-foreground text-sm">
								{new Date(user.created_at).toLocaleDateString('id-ID')}
							</Table.Cell>
							<Table.Cell class="text-right">
								<div class="flex items-center justify-end gap-2">
									<Button
										variant="ghost"
										size="sm"
										onclick={() => promptLoginAs(user)}
										class="hover:bg-primary/10 hover:text-primary"
									>
										<LogIn class="h-4 w-4 mr-2" /> Login
									</Button>
									<Button
										variant="ghost"
										size="icon"
										onclick={() => promptDeleteUser(user)}
										class="text-destructive hover:bg-destructive/10 hover:text-destructive w-8 h-8"
									>
										<Trash2 class="h-4 w-4" />
									</Button>
								</div>
							</Table.Cell>
						</Table.Row>
					{/each}
				{/if}
			</Table.Body>
		</Table.Root>
	</div>

	<Dialog.Root bind:open={loginAsUserOpen}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Konfirmasi Login As</Dialog.Title>
				<Dialog.Description>
					Anda akan beralih sesi dan login sebagai <strong>{selectedUserToLoginAs?.email}</strong>.
					Tindakan ini akan menghentikan sesi admin Anda saat ini.
				</Dialog.Description>
			</Dialog.Header>
			<Dialog.Footer class="pt-4">
				<Button type="button" variant="outline" onclick={() => (loginAsUserOpen = false)}>
					Batal
				</Button>
				<Button
					type="button"
					variant="default"
					onclick={handleLoginAs}
					disabled={isLoginAsSubmitting}
				>
					{isLoginAsSubmitting ? 'Mengalihkan Sesi...' : 'Ya, Lanjutkan'}
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>

	<Dialog.Root bind:open={deleteUserOpen}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Hapus Pengguna</Dialog.Title>
				<Dialog.Description>
					Apakah Anda yakin ingin menghapus pengguna <strong class="text-foreground"
						>{selectedUserToDelete?.email}</strong
					>? Tindakan ini tidak dapat dibatalkan dan semua data terkait pengguna ini akan dihapus
					secara permanen.
				</Dialog.Description>
			</Dialog.Header>
			<Dialog.Footer class="pt-4">
				<Button type="button" variant="outline" onclick={() => (deleteUserOpen = false)}>
					Batal
				</Button>
				<Button
					type="button"
					variant="destructive"
					onclick={handleDeleteUser}
					disabled={isDeletingUser}
				>
					{isDeletingUser ? 'Menghapus...' : 'Ya, Hapus'}
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
</PageComposer>
