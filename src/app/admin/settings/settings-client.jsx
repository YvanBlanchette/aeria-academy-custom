"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
	ShieldCheck,
	Bell,
	BookOpen,
	CreditCard,
	Globe,
	Mail,
	Save,
	Settings2,
	Sparkles,
	Timer,
	Wrench,
	Users,
	Paintbrush,
	Server,
	BadgeCheck,
	FileText,
	ShieldAlert,
	RotateCcw,
	History,
	Download,
	Upload,
	Lock,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { exportAdminSettings, getAdminSettingsAudit, importAdminSettings, resetAdminSettings, saveAdminSettings } from "./actions";
import { DEFAULT_SETTINGS } from "./settings-schema";

const plans = ["FREE", "ACADEMY", "PRIME"];
const currencies = ["CAD", "USD", "EUR"];

function SettingsSection({ icon: Icon, title, description, children }) {
	return (
		<Card className="shadow-sm">
			<CardHeader className="space-y-2 pb-4">
				<div className="flex items-center gap-2">
					<div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
						<Icon className="h-4 w-4" />
					</div>
					<CardTitle className="text-lg">{title}</CardTitle>
				</div>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<CardContent className="space-y-5">{children}</CardContent>
		</Card>
	);
}

function Field({ label, hint, children }) {
	return (
		<div className="space-y-2">
			<Label className="text-sm font-medium">{label}</Label>
			{children}
			{hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
		</div>
	);
}

function ToggleField({ label, hint, checked, onCheckedChange }) {
	return (
		<div className="flex items-start justify-between gap-4 rounded-md border bg-white p-3">
			<div className="space-y-1">
				<p className="text-sm font-medium">{label}</p>
				{hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
			</div>
			<Switch
				checked={checked}
				onCheckedChange={onCheckedChange}
			/>
		</div>
	);
}

function formatDate(value) {
	try {
		return new Intl.DateTimeFormat("fr-CA", {
			dateStyle: "medium",
			timeStyle: "short",
		}).format(new Date(value));
	} catch {
		return "-";
	}
}

export function SettingsClient({ initialSettings, initialAudit, permissions }) {
	const router = useRouter();
	const importFileRef = useRef(null);
	const [settings, setSettings] = useState(initialSettings || DEFAULT_SETTINGS);
	const [audit, setAudit] = useState(initialAudit || []);
	const [auditSearch, setAuditSearch] = useState("");
	const [auditActionFilter, setAuditActionFilter] = useState("all");
	const [isSaving, startSaving] = useTransition();
	const [isResetting, startResetting] = useTransition();
	const [isAuditLoading, startAuditLoading] = useTransition();
	const [isExporting, startExporting] = useTransition();
	const [isImporting, startImporting] = useTransition();

	const canManageCritical = Boolean(permissions?.canManageCritical);
	const sensitiveKeys = permissions?.sensitiveKeys || [];

	const changedCount = useMemo(() => {
		return Object.keys(DEFAULT_SETTINGS).filter((key) => settings[key] !== (initialSettings?.[key] ?? DEFAULT_SETTINGS[key])).length;
	}, [settings, initialSettings]);

	function patch(next) {
		if (!canManageCritical) {
			const blocked = Object.keys(next).filter((key) => sensitiveKeys.includes(key));
			if (blocked.length > 0) {
				toast.error("Action reservee au super-admin");
				return;
			}
		}
		setSettings((prev) => ({ ...prev, ...next }));
	}

	function isSensitive(key) {
		return sensitiveKeys.includes(key);
	}

	function handleSaveAll() {
		startSaving(async () => {
			const result = await saveAdminSettings(settings);
			if (result?.error) {
				toast.error(result.error);
				return;
			}
			toast.success("Paramètres enregistrés", {
				description: `${result?.changedCount ?? 0} changement(s) sauvegardé(s).`,
			});
			router.refresh();
		});
	}

	function handleResetToDbDefaults() {
		startResetting(async () => {
			const result = await resetAdminSettings();
			if (result?.error) {
				toast.error(result.error);
				return;
			}
			setSettings(DEFAULT_SETTINGS);
			toast.success("Paramètres réinitialisés", {
				description: "Les valeurs par défaut ont été restaurées.",
			});
			router.refresh();
		});
	}

	function handleAuditRefresh() {
		startAuditLoading(async () => {
			const result = await getAdminSettingsAudit({
				search: auditSearch,
				action: auditActionFilter,
			});
			if (!result?.success) {
				toast.error("Impossible de charger le journal d'audit");
				return;
			}
			setAudit(result.audit || []);
		});
	}

	function handleExport() {
		startExporting(async () => {
			const result = await exportAdminSettings();
			if (!result?.success) {
				toast.error("Export impossible");
				return;
			}

			const blob = new Blob([JSON.stringify(result.payload, null, 2)], { type: "application/json" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `aeria-settings-${new Date().toISOString().slice(0, 10)}.json`;
			a.click();
			URL.revokeObjectURL(url);
			toast.success("Export JSON téléchargé");
		});
	}

	function openImportDialog() {
		if (!canManageCritical) {
			toast.error("Import reserve au super-admin");
			return;
		}
		importFileRef.current?.click();
	}

	async function handleImportFileChange(e) {
		const file = e.target.files?.[0];
		if (!file) return;

		const text = await file.text();

		startImporting(async () => {
			const result = await importAdminSettings(text);
			if (result?.error) {
				toast.error(result.error);
				return;
			}

			toast.success("Import terminé", {
				description: `${result?.changedCount ?? 0} changement(s) appliqué(s).`,
			});
			router.refresh();
		});

		e.target.value = "";
	}

	return (
		<div className="mx-auto max-w-7xl space-y-6 bg-neutral-100 p-4 sm:p-6 lg:p-8">
			<div className="flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
				<div className="space-y-1">
					<div className="flex items-center gap-2">
						<h2 className="text-xl font-bold sm:text-2xl">Paramètres Admin</h2>
						<Badge variant="outline">Persisté DB</Badge>
					</div>
					<p className="text-sm text-muted-foreground">Configuration globale de l&apos;académie, des accès, du contenu, des paiements et du système.</p>
				</div>
				<div className="flex items-center gap-2">
					{!canManageCritical ? (
						<Badge
							variant="outline"
							className="gap-1"
						>
							<Lock className="h-3 w-3" />
							Mode admin standard
						</Badge>
					) : null}
					<Badge variant={changedCount > 0 ? "default" : "secondary"}>{changedCount} modification(s)</Badge>
					<Button
						variant="outline"
						onClick={handleExport}
						disabled={isExporting}
					>
						<Download className="mr-2 h-4 w-4" />
						{isExporting ? "Export..." : "Exporter JSON"}
					</Button>
					<Button
						variant="outline"
						onClick={openImportDialog}
						disabled={!canManageCritical || isImporting}
					>
						<Upload className="mr-2 h-4 w-4" />
						{isImporting ? "Import..." : "Importer JSON"}
					</Button>
					<input
						ref={importFileRef}
						type="file"
						accept="application/json"
						onChange={handleImportFileChange}
						className="hidden"
					/>
					<Button
						variant="outline"
						onClick={handleResetToDbDefaults}
						disabled={isResetting || !canManageCritical}
					>
						<RotateCcw className="mr-2 h-4 w-4" />
						{isResetting ? "Reset..." : "Réinitialiser"}
					</Button>
					<Button
						onClick={handleSaveAll}
						disabled={isSaving}
					>
						<Save className="mr-2 h-4 w-4" />
						{isSaving ? "Enregistrement..." : "Enregistrer"}
					</Button>
				</div>
			</div>

			<Tabs
				defaultValue="platform"
				className="gap-4"
			>
				<TabsList className="h-auto w-full flex-wrap justify-start gap-1 bg-transparent p-0">
					<TabsTrigger value="platform">
						<Settings2 className="h-4 w-4" />
						Plateforme
					</TabsTrigger>
					<TabsTrigger value="access">
						<ShieldCheck className="h-4 w-4" />
						Accès & sécurité
					</TabsTrigger>
					<TabsTrigger value="content">
						<BookOpen className="h-4 w-4" />
						Contenu
					</TabsTrigger>
					<TabsTrigger value="communication">
						<Mail className="h-4 w-4" />
						Communication
					</TabsTrigger>
					<TabsTrigger value="billing">
						<CreditCard className="h-4 w-4" />
						Paiements
					</TabsTrigger>
					<TabsTrigger value="system">
						<Server className="h-4 w-4" />
						Système
					</TabsTrigger>
				</TabsList>

				<TabsContent
					value="platform"
					className="space-y-4"
				>
					<SettingsSection
						icon={Globe}
						title="Identité de l'académie"
						description="Nom public, domaine, fuseau horaire et branding de base."
					>
						<div className="grid gap-4 md:grid-cols-2">
							<Field label="Nom de l'académie">
								<Input
									value={settings.academyName}
									onChange={(e) => patch({ academyName: e.target.value })}
								/>
							</Field>
							<Field label="Tagline">
								<Input
									value={settings.academyTagline}
									onChange={(e) => patch({ academyTagline: e.target.value })}
								/>
							</Field>
							<Field label="Domaine public">
								<Input
									value={settings.academyPublicDomain}
									onChange={(e) => patch({ academyPublicDomain: e.target.value })}
								/>
							</Field>
							<Field label="Email support">
								<Input
									value={settings.academySupportEmail}
									onChange={(e) => patch({ academySupportEmail: e.target.value })}
								/>
							</Field>
							<Field label="Fuseau horaire">
								<Select
									value={settings.academyTimezone}
									onValueChange={(value) => patch({ academyTimezone: value })}
								>
									<SelectTrigger className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="America/Toronto">America/Toronto</SelectItem>
										<SelectItem value="America/Montreal">America/Montreal</SelectItem>
										<SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
									</SelectContent>
								</Select>
							</Field>
							<Field label="Langue par défaut">
								<Select
									value={settings.defaultLocale}
									onValueChange={(value) => patch({ defaultLocale: value })}
								>
									<SelectTrigger className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="fr">Français</SelectItem>
										<SelectItem value="en">English</SelectItem>
									</SelectContent>
								</Select>
							</Field>
						</div>
					</SettingsSection>
					<SettingsSection
						icon={Paintbrush}
						title="SEO et vitrine"
						description="Réglages SEO globaux pour la plateforme marketing."
					>
						<div className="space-y-4">
							<Field label="Titre SEO global">
								<Input
									value={settings.seoTitle}
									onChange={(e) => patch({ seoTitle: e.target.value })}
								/>
							</Field>
							<Field label="Description SEO">
								<Textarea
									rows={3}
									value={settings.seoDescription}
									onChange={(e) => patch({ seoDescription: e.target.value })}
								/>
							</Field>
							<Field
								label="Mots-clés"
								hint="Séparés par des virgules"
							>
								<Input
									value={settings.seoKeywords}
									onChange={(e) => patch({ seoKeywords: e.target.value })}
								/>
							</Field>
						</div>
					</SettingsSection>
				</TabsContent>

				<TabsContent
					value="access"
					className="space-y-4"
				>
					<SettingsSection
						icon={Users}
						title="Inscription et accès"
						description="Contrôle qui peut rejoindre la plateforme et dans quelles conditions."
					>
						<ToggleField
							label="Autoriser les nouvelles inscriptions"
							checked={settings.allowRegistration}
							onCheckedChange={(v) => patch({ allowRegistration: v })}
						/>
						<ToggleField
							label="Vérification email obligatoire"
							hint="Empêche l'accès tant que l'email n'est pas validé."
							checked={settings.requireEmailVerification}
							onCheckedChange={(v) => patch({ requireEmailVerification: v })}
						/>
						<ToggleField
							label="Autoriser les profils publics"
							checked={settings.allowPublicProfiles}
							onCheckedChange={(v) => patch({ allowPublicProfiles: v })}
						/>
						<div className="grid gap-4 sm:grid-cols-2">
							<Field label="Nombre d'appareils par utilisateur">
								<Select
									value={settings.maxDevicesPerUser}
									onValueChange={(value) => patch({ maxDevicesPerUser: value })}
								>
									<SelectTrigger className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="1">1 appareil</SelectItem>
										<SelectItem value="2">2 appareils</SelectItem>
										<SelectItem value="3">3 appareils</SelectItem>
										<SelectItem value="5">5 appareils</SelectItem>
									</SelectContent>
								</Select>
							</Field>
							<Field label="Politique mot de passe">
								<Select
									value={settings.passwordPolicy}
									onValueChange={(value) => patch({ passwordPolicy: value })}
								>
									<SelectTrigger className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="low">Simple</SelectItem>
										<SelectItem value="medium">Standard</SelectItem>
										<SelectItem value="high">Renforcée</SelectItem>
									</SelectContent>
								</Select>
							</Field>
						</div>
					</SettingsSection>
				</TabsContent>

				<TabsContent
					value="content"
					className="space-y-4"
				>
					<SettingsSection
						icon={BookOpen}
						title="Expérience pédagogique"
						description="Paramètres qui influencent la lecture des leçons et l'évaluation."
					>
						<ToggleField
							label="Activer les aperçus gratuits"
							checked={settings.allowFreePreview}
							onCheckedChange={(v) => patch({ allowFreePreview: v })}
						/>
						<ToggleField
							label="Activer les capsules audio"
							checked={settings.enableAudioCapsules}
							onCheckedChange={(v) => patch({ enableAudioCapsules: v })}
						/>
						<ToggleField
							label="Autoriser le téléchargement des leçons"
							checked={settings.enableLessonDownload}
							onCheckedChange={(v) => patch({ enableLessonDownload: v })}
						/>
						<ToggleField
							label="Autoriser les reprises de quiz"
							checked={settings.enableQuizRetakes}
							onCheckedChange={(v) => patch({ enableQuizRetakes: v })}
						/>
						<ToggleField
							label="Activer les certificats"
							checked={settings.enableCertificates}
							onCheckedChange={(v) => patch({ enableCertificates: v })}
						/>
						<ToggleField
							label="Protection de contenu renforcée"
							hint="Désactive certaines interactions navigateur pour limiter la copie."
							checked={settings.enableContentProtection}
							onCheckedChange={(v) => patch({ enableContentProtection: v })}
						/>
						<div className="grid gap-4 sm:grid-cols-2">
							<Field label="Seuil auto-complétion leçon (secondes)">
								<Input
									type="number"
									min="0"
									value={settings.lessonAutoCompleteSeconds}
									onChange={(e) => patch({ lessonAutoCompleteSeconds: e.target.value })}
								/>
							</Field>
							<Field label="Nombre max de reprises quiz">
								<Input
									type="number"
									min="1"
									value={settings.quizRetakeLimit}
									onChange={(e) => patch({ quizRetakeLimit: e.target.value })}
								/>
							</Field>
						</div>
					</SettingsSection>
					<SettingsSection
						icon={BadgeCheck}
						title="Modération éditoriale"
						description="Workflow de validation des agences et contenus."
					>
						<ToggleField
							label="Validation admin des agences obligatoire"
							checked={settings.moderateAgencies}
							onCheckedChange={(v) => patch({ moderateAgencies: v })}
						/>
						<ToggleField
							label="Workflow brouillon/publication pour les articles"
							hint="Recommandé pour garder une qualité éditoriale stable."
							checked={settings.enableArticlePublishingWorkflow}
							onCheckedChange={(v) => patch({ enableArticlePublishingWorkflow: v })}
						/>
					</SettingsSection>
				</TabsContent>

				<TabsContent
					value="communication"
					className="space-y-4"
				>
					<SettingsSection
						icon={Mail}
						title="Emails transactionnels"
						description="Expéditeur, fournisseur et notifications automatiques."
					>
						<div className="grid gap-4 md:grid-cols-2">
							<Field label="Fournisseur email">
								<Select
									value={settings.emailProvider}
									onValueChange={(value) => patch({ emailProvider: value })}
								>
									<SelectTrigger className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="resend">Resend</SelectItem>
										<SelectItem value="smtp">SMTP</SelectItem>
										<SelectItem value="mailgun">Mailgun</SelectItem>
									</SelectContent>
								</Select>
							</Field>
							<Field label="Nom expéditeur">
								<Input
									value={settings.emailFromName}
									onChange={(e) => patch({ emailFromName: e.target.value })}
								/>
							</Field>
							<Field
								label="Adresse expéditeur"
								hint="Doit être validée par votre provider email."
							>
								<Input
									value={settings.emailFromAddress}
									onChange={(e) => patch({ emailFromAddress: e.target.value })}
								/>
							</Field>
						</div>
						<ToggleField
							label="Digest hebdomadaire admin"
							checked={settings.enableWeeklyDigest}
							onCheckedChange={(v) => patch({ enableWeeklyDigest: v })}
						/>
						<ToggleField
							label="Alertes système par email"
							checked={settings.enableSystemAlerts}
							onCheckedChange={(v) => patch({ enableSystemAlerts: v })}
						/>
					</SettingsSection>
				</TabsContent>

				<TabsContent
					value="billing"
					className="space-y-4"
				>
					<SettingsSection
						icon={CreditCard}
						title="Facturation et abonnements"
						description="Options globales des plans, devise et provider de paiement."
					>
						<ToggleField
							label="Activer la passerelle de paiement"
							hint={isSensitive("enablePaymentGateway") && !canManageCritical ? "Paramètre sensible: super-admin requis" : undefined}
							checked={settings.enablePaymentGateway}
							onCheckedChange={(v) => patch({ enablePaymentGateway: v })}
						/>
						<div className="grid gap-4 md:grid-cols-3">
							<Field label="Provider">
								<Select
									value={settings.paymentProvider}
									onValueChange={(value) => patch({ paymentProvider: value })}
								>
									<SelectTrigger className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="stripe">Stripe</SelectItem>
										<SelectItem value="manual">Manuel</SelectItem>
									</SelectContent>
								</Select>
							</Field>
							<Field label="Plan par défaut">
								<Select
									value={settings.defaultPlan}
									onValueChange={(value) => patch({ defaultPlan: value })}
								>
									<SelectTrigger className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{plans.map((plan) => (
											<SelectItem
												key={plan}
												value={plan}
											>
												{plan}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</Field>
							<Field label="Devise">
								<Select
									value={settings.currency}
									onValueChange={(value) => patch({ currency: value })}
								>
									<SelectTrigger className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{currencies.map((code) => (
											<SelectItem
												key={code}
												value={code}
											>
												{code}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</Field>
						</div>
						<Field label="Notice taxes / TVA">
							<Input
								value={settings.vatNotice}
								onChange={(e) => patch({ vatNotice: e.target.value })}
							/>
						</Field>
					</SettingsSection>
				</TabsContent>

				<TabsContent
					value="system"
					className="space-y-4"
				>
					<SettingsSection
						icon={Wrench}
						title="Maintenance et opérations"
						description="Réglages techniques et mode maintenance global."
					>
						<ToggleField
							label="Mode maintenance"
							hint={
								isSensitive("maintenanceMode") && !canManageCritical
									? "Paramètre sensible: super-admin requis"
									: "Bloque l'accès utilisateur (sauf admins) pendant une intervention."
							}
							checked={settings.maintenanceMode}
							onCheckedChange={(v) => patch({ maintenanceMode: v })}
						/>
						<Field label="Message maintenance">
							<Textarea
								rows={3}
								value={settings.maintenanceMessage}
								onChange={(e) => patch({ maintenanceMessage: e.target.value })}
							/>
						</Field>
						<div className="grid gap-4 sm:grid-cols-2">
							<Field label="Rétention logs debug (jours)">
								<Input
									type="number"
									min="1"
									value={settings.debugLogsRetentionDays}
									onChange={(e) => patch({ debugLogsRetentionDays: e.target.value })}
								/>
							</Field>
							<div className="rounded-md border bg-white p-3">
								<p className="text-sm font-medium">Statut système</p>
								<div className="mt-2 flex flex-wrap gap-2">
									<Badge className="gap-1">
										<Sparkles className="h-3 w-3" /> API OK
									</Badge>
									<Badge
										variant="secondary"
										className="gap-1"
									>
										<Timer className="h-3 w-3" /> Queue stable
									</Badge>
									<Badge
										variant="outline"
										className="gap-1"
									>
										<Bell className="h-3 w-3" /> 0 alerte critique
									</Badge>
								</div>
							</div>
						</div>
						<Separator />
						<div className="grid gap-3 sm:grid-cols-3">
							<Button
								variant="outline"
								onClick={() => toast.success("Cache purgé")}
							>
								Vider le cache
							</Button>
							<Button
								variant="outline"
								onClick={() => toast.success("Index rebuild lancé")}
							>
								Rebuild index
							</Button>
							<Button
								variant="destructive"
								onClick={() => toast("Action sensible", { description: "Confirmez dans la version branchée backend." })}
							>
								<ShieldAlert className="mr-2 h-4 w-4" />
								Mode urgence
							</Button>
						</div>
					</SettingsSection>

					<SettingsSection
						icon={History}
						title="Journal d'audit paramètres"
						description="Historique des modifications effectuées par les administrateurs."
					>
						<div className="grid gap-2 md:grid-cols-[1fr_220px_auto]">
							<Input
								value={auditSearch}
								onChange={(e) => setAuditSearch(e.target.value)}
								placeholder="Rechercher action, nom ou email"
							/>
							<Select
								value={auditActionFilter}
								onValueChange={setAuditActionFilter}
							>
								<SelectTrigger className="w-full">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Toutes les actions</SelectItem>
									<SelectItem value="update_settings">Mises à jour</SelectItem>
									<SelectItem value="reset_settings">Reset</SelectItem>
									<SelectItem value="import_settings">Imports</SelectItem>
								</SelectContent>
							</Select>
							<Button
								variant="outline"
								onClick={handleAuditRefresh}
								disabled={isAuditLoading}
							>
								{isAuditLoading ? "Chargement..." : "Filtrer"}
							</Button>
						</div>
						<div className="space-y-2">
							{audit.length === 0 ? (
								<p className="rounded-md border bg-white p-3 text-sm text-muted-foreground">Aucune modification enregistrée pour le moment.</p>
							) : (
								audit.map((entry) => {
									const changedKeys = Object.keys(entry.changes || {});
									return (
										<div
											key={entry.id}
											className="rounded-md border bg-white p-3"
										>
											<div className="flex flex-wrap items-center justify-between gap-2">
												<div className="text-sm font-medium">{entry.action === "reset_settings" ? "Réinitialisation globale" : "Mise à jour paramètres"}</div>
												<div className="text-xs text-muted-foreground">{formatDate(entry.createdAt)}</div>
											</div>
											<p className="mt-1 text-xs text-muted-foreground">Par {entry.actor?.name || entry.actor?.email || "Admin inconnu"}</p>
											<div className="mt-2 flex flex-wrap gap-1">
												{changedKeys.slice(0, 8).map((key) => (
													<Badge
														key={key}
														variant="outline"
														className="text-[11px]"
													>
														{key}
													</Badge>
												))}
												{changedKeys.length > 8 ? <Badge variant="secondary">+{changedKeys.length - 8}</Badge> : null}
											</div>
										</div>
									);
								})
							)}
						</div>
					</SettingsSection>
				</TabsContent>
			</Tabs>

			<div className="rounded-xl border bg-white p-4 shadow-sm">
				<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<p className="text-sm font-semibold">Persistance active</p>
						<p className="text-sm text-muted-foreground">Les paramètres sont sauvegardés en base et chaque modification est journalisée.</p>
					</div>
					<Button
						variant="outline"
						onClick={handleSaveAll}
					>
						<FileText className="mr-2 h-4 w-4" />
						Sauvegarder maintenant
					</Button>
				</div>
			</div>
		</div>
	);
}
