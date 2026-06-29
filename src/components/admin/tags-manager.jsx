"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, X, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createTag, updateTag, deleteTag } from "@/app/admin/articles/actions";

export function TagsManager({ tags }) {
	const router = useRouter();
	const [creating, setCreating] = useState(false);
	const [newName, setNewName] = useState("");
	const [newColor, setNewColor] = useState("#6366f1");
	const [editingId, setEditingId] = useState(null);
	const [editName, setEditName] = useState("");
	const [editColor, setEditColor] = useState("");

	async function handleCreate(e) {
		e.preventDefault();
		setCreating(true);
		const fd = new FormData();
		fd.set("name", newName);
		fd.set("color", newColor);
		const result = await createTag(fd);
		setCreating(false);
		if (result?.error) {
			toast.error(result.error);
			return;
		}
		toast.success("Tag créé");
		setNewName("");
		router.refresh();
	}

	async function handleUpdate(tagId) {
		const fd = new FormData();
		fd.set("name", editName);
		fd.set("color", editColor || "");
		const result = await updateTag(tagId, fd);
		if (result?.error) {
			toast.error(result.error);
			return;
		}
		toast.success("Tag mis à jour");
		setEditingId(null);
		router.refresh();
	}

	async function handleDelete(tagId, tagName) {
		if (!confirm(`Supprimer le tag "${tagName}" ?`)) return;
		const result = await deleteTag(tagId);
		if (result?.error) {
			toast.error(result.error);
			return;
		}
		toast.success("Tag supprimé");
		router.refresh();
	}

	function startEdit(tag) {
		setEditingId(tag.id);
		setEditName(tag.name);
		setEditColor(tag.color || "#6366f1");
	}

	return (
		<div className="space-y-6">
			{/* Formulaire création */}
			<Card>
				<CardContent className="p-6">
					<form
						onSubmit={handleCreate}
						className="flex gap-2"
					>
						<Input
							value={newName}
							onChange={(e) => setNewName(e.target.value)}
							placeholder="Nom du tag (ex: Croisières)"
							required
						/>
						<input
							type="color"
							value={newColor}
							onChange={(e) => setNewColor(e.target.value)}
							className="h-10 w-16 rounded border cursor-pointer"
							title="Couleur du badge"
						/>
						<Button
							type="submit"
							disabled={creating}
						>
							<Plus className="mr-1 h-4 w-4" />
							Créer
						</Button>
					</form>
				</CardContent>
			</Card>

			{/* Liste des tags */}
			<Card>
				<CardContent className="p-6">
					{tags.length === 0 ? (
						<p className="text-center text-muted-foreground py-8">Aucun tag pour le moment</p>
					) : (
						<ul className="space-y-2">
							{tags.map((tag) => (
								<li
									key={tag.id}
									className="flex items-center gap-3 rounded-md border p-3"
								>
									{editingId === tag.id ? (
										<>
											<Input
												value={editName}
												onChange={(e) => setEditName(e.target.value)}
												className="flex-1"
											/>
											<input
												type="color"
												value={editColor}
												onChange={(e) => setEditColor(e.target.value)}
												className="h-9 w-12 rounded border cursor-pointer"
											/>
											<Button
												type="button"
												size="icon"
												variant="ghost"
												onClick={() => handleUpdate(tag.id)}
											>
												<Check className="h-4 w-4 text-green-600" />
											</Button>
											<Button
												type="button"
												size="icon"
												variant="ghost"
												onClick={() => setEditingId(null)}
											>
												<X className="h-4 w-4" />
											</Button>
										</>
									) : (
										<>
											<Badge
												variant="outline"
												style={
													tag.color
														? {
																backgroundColor: tag.color,
																color: "#fff",
																borderColor: tag.color,
															}
														: undefined
												}
												className="text-sm"
											>
												{tag.name}
											</Badge>
											<span className="text-xs text-muted-foreground">/{tag.slug}</span>
											<span className="ml-auto text-sm text-muted-foreground">{tag._count.articles} article(s)</span>
											<Button
												type="button"
												size="icon"
												variant="ghost"
												onClick={() => startEdit(tag)}
											>
												<Edit2 className="h-4 w-4" />
											</Button>
											<Button
												type="button"
												size="icon"
												variant="ghost"
												onClick={() => handleDelete(tag.id, tag.name)}
											>
												<Trash2 className="h-4 w-4 text-destructive" />
											</Button>
										</>
									)}
								</li>
							))}
						</ul>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
