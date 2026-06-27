"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import { Card, CardHeader, CardContent } from "../ui/card";
import { createCourse, updateCourse } from "@/app/admin/courses/actions";

export function CourseForm({ course }) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [thumbnail, setThumbnail] = useState(course?.thumbnail || "");
	const isEdit = !!course;

	async function handleSubmit(e) {
		e.preventDefault();
		setLoading(true);

		const formData = new FormData(e.currentTarget);
		formData.set("thumbnail", thumbnail || "");

		const result = isEdit ? await updateCourse(course.id, formData) : await createCourse(formData);

		setLoading(false);

		if (result?.error) {
			toast.error(result.error);
			return;
		}

		if (result?.success) {
			toast.success(isEdit ? "Cours mis à jour" : "Cours créé");
			router.refresh();
		}
	}

	return (
		<Card className="w-full max-w-xl shadow-md p-5">
			<CardHeader>
				<h2 className="text-xl font-bold">{isEdit ? "Modifier le cours" : "Créer un cours"}</h2>
				<p className="text-muted-foreground tracking-wider">
					{isEdit ? "Modifie les informations du cours." : "Tu pourras ajouter les modules et leçons ensuite."}
				</p>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={handleSubmit}
					className="space-y-6 max-w-2xl"
				>
					<div className="space-y-2">
						<Label htmlFor="title">Titre du cours *</Label>
						<Input
							id="title"
							name="title"
							defaultValue={course?.title}
							placeholder="Ex: Introduction à AERIA"
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">Description *</Label>
						<Textarea
							id="description"
							name="description"
							defaultValue={course?.description}
							placeholder="Décris le contenu et les objectifs du cours..."
							rows={5}
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="price">Prix ($)</Label>
						<Input
							id="price"
							name="price"
							type="number"
							step="0.01"
							min="0"
							defaultValue={course ? (course.price / 100).toFixed(2) : "0"}
							required
						/>
						<p className="text-xs text-muted-foreground">Mettre 0 pour un cours gratuit</p>
					</div>

					<div className="space-y-2">
						<Label>Miniature du cours</Label>
						<ImageUpload
							name="thumbnail"
							value={thumbnail}
							onChange={setThumbnail}
						/>
					</div>

					<div className="flex gap-3">
						<Button
							type="submit"
							disabled={loading}
						>
							{loading ? "Enregistrement..." : isEdit ? "Mettre à jour" : "Créer le cours"}
						</Button>
						<Button
							type="button"
							variant="outline"
							onClick={() => router.push("/admin/courses")}
						>
							Annuler
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
