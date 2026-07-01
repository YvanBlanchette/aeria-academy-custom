"use client";

import { useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { createCommunityPost, uploadCommunityPostImage } from "@/app/(member)/community/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FaRegImage } from "react-icons/fa6";

function initialsFromName(name, email) {
	return (name || email || "U")
		.split(" ")
		.map((s) => s.charAt(0))
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

export function CommunityPostComposer({ user, placeholder, submitLabel = "Publier", cardStyle = "default" }) {
	const fileInputRef = useRef(null);
	const formRef = useRef(null);
	const [uploadingImage, setUploadingImage] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [imageUrl, setImageUrl] = useState("");
	const initials = initialsFromName(user?.name, user?.email);

	async function handleImageChange(event) {
		const file = event.target.files?.[0];
		if (!file) return;

		setUploadingImage(true);
		const formData = new FormData();
		formData.set("file", file);
		const result = await uploadCommunityPostImage(formData);
		setUploadingImage(false);

		if (result?.error) {
			toast.error(result.error);
			return;
		}

		setImageUrl(result.url || "");
		toast.success("Image ajoutée à la publication");
	}

	function clearImage() {
		setImageUrl("");
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	}

	async function handleSubmit(formData) {
		setSubmitting(true);
		formData.set("imageUrl", imageUrl);

		const result = await createCommunityPost(formData);
		setSubmitting(false);

		if (result?.error) {
			toast.error(result.error);
			return;
		}

		setImageUrl("");
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
		formRef.current?.reset();
		toast.success("Publication créée");
	}

	const shellClassName = "space-y-2";

	return (
		<form
			ref={formRef}
			action={handleSubmit}
			className={shellClassName}
		>
			<div className="flex items-start gap-2.5">
				{/* AVATAR */}
				<Avatar className="mt-0.5 h-11 w-11">
					<AvatarImage src={user?.image || ""} />
					<AvatarFallback>{initials}</AvatarFallback>
				</Avatar>

				{/* INPUT */}
				<div className="min-w-0 flex-1 rounded-3xl border bg-neutral-100 shadow-inner p-3.5">
					<Textarea
						name="content"
						rows={2}
						className="min-h-12 resize-none border-0 bg-transparent px-0 py-0 shadow-none focus-visible:ring-0"
						placeholder={placeholder}
						required
					/>

					<input
						type="hidden"
						name="imageUrl"
						value={imageUrl}
					/>

					{imageUrl ? (
						<div className="mt-3 overflow-hidden rounded-2xl border bg-background">
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src={imageUrl}
								alt="Aperçu de publication"
								className="max-h-96 w-full object-cover"
							/>
						</div>
					) : null}
				</div>
			</div>

			{/* ACTION BUTTONS */}
			<div className="flex justify-end items-center gap-2 pt-1">
				<div className="flex items-center gap-2">
					{/* IMAGE UPLOAD */}
					<button
						type="button"
						className="w-fit h-fit rounded-full border-0 p-0 cursor-pointer"
						onClick={() => fileInputRef.current?.click()}
						disabled={uploadingImage || submitting}
					>
						{uploadingImage ? (
							<Loader2 className="h-6 w-6 animate-spin" />
						) : (
							<FaRegImage className="w-6 h-6 text-neutral-400 hover:text-neutral-800 transition-all" />
						)}
					</button>
					{imageUrl ? (
						<Button
							type="button"
							variant="ghost"
							className="rounded-full"
							onClick={clearImage}
							disabled={uploadingImage || submitting}
						>
							<X className="mr-2 h-4 w-4" />
							Retirer
						</Button>
					) : null}
					<input
						ref={fileInputRef}
						type="file"
						accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
						onChange={handleImageChange}
						disabled={uploadingImage || submitting}
						className="hidden"
					/>
				</div>

				{/* SUBMIT BUTTON */}
				<Button
					type="submit"
					className="rounded-full"
					disabled={uploadingImage || submitting}
				>
					{uploadingImage || submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
					{submitLabel}
				</Button>
			</div>
		</form>
	);
}
