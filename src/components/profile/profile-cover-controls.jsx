"use client";

import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { clearProfileCoverImage, setProfileCoverImage } from "@/app/(member)/profile/actions";
import { Button } from "@/components/ui/button";

export function ProfileCoverControls({ hasCover = false }) {
	const router = useRouter();
	const formRef = useRef(null);
	const inputRef = useRef(null);
	const [isUploading, startUploading] = useTransition();
	const [isRemoving, startRemoving] = useTransition();

	function handleFileChange(event) {
		const file = event.target.files?.[0];
		if (!file || !formRef.current) return;

		const formData = new FormData(formRef.current);
		startUploading(async () => {
			const result = await setProfileCoverImage(formData);
			if (result?.error) {
				toast.error(result.error);
				return;
			}

			toast.success("Image de couverture mise à jour");
			router.refresh();
		});
	}

	function handleRemove() {
		startRemoving(async () => {
			const result = await clearProfileCoverImage();
			if (result?.error) {
				toast.error(result.error);
				return;
			}

			if (inputRef.current) {
				inputRef.current.value = "";
			}
			toast.success("Image de couverture supprimée");
			router.refresh();
		});
	}

	return (
		<div className="flex flex-wrap items-center gap-2">
			<form ref={formRef}>
				<input
					ref={inputRef}
					type="file"
					name="file"
					accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
					onChange={handleFileChange}
					className="hidden"
				/>
			</form>
			<Button
				type="button"
				variant="secondary"
				size="sm"
				onClick={() => inputRef.current?.click()}
				disabled={isUploading || isRemoving}
			>
				{isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
				{hasCover ? "Changer la couverture" : "Ajouter une couverture"}
			</Button>
			{hasCover ? (
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={handleRemove}
					disabled={isUploading || isRemoving}
				>
					{isRemoving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
					Retirer
				</Button>
			) : null}
		</div>
	);
}
