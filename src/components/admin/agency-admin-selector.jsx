"use client";

import { useState } from "react";
import { toast } from "sonner";
import { changeAgencyAdmin } from "@/app/admin/agencies/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function AgencyAdminSelector({ agencyId, currentAdminUserId, options }) {
	const [selected, setSelected] = useState(currentAdminUserId || "");
	const [loading, setLoading] = useState(false);

	async function handleApply() {
		setLoading(true);
		const result = await changeAgencyAdmin(agencyId, selected || null);
		setLoading(false);
		if (result?.error) {
			toast.error(result.error);
			return;
		}
		toast.success("Admin de l'agence mis à jour");
	}

	return (
		<div className="space-y-3">
			<Label htmlFor="agency-admin">Changer l&apos;admin</Label>
			<select
				id="agency-admin"
				className="h-9 w-full rounded-md border bg-background px-3 text-sm"
				value={selected}
				onChange={(e) => setSelected(e.target.value)}
				disabled={loading}
			>
				<option value="">Aucun admin défini</option>
				{options.map((opt) => (
					<option
						key={opt.value}
						value={opt.value}
					>
						{opt.label}
					</option>
				))}
			</select>
			<Button
				type="button"
				variant="outline"
				size="sm"
				onClick={handleApply}
				disabled={loading}
			>
				{loading ? "Application..." : "Appliquer"}
			</Button>
		</div>
	);
}
