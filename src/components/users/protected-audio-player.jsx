"use client";

import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import { Play, Pause, Volume2, VolumeX, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";

function normalizeAudioSrc(value) {
	if (typeof value !== "string") return "";
	const trimmed = value.trim();
	if (!trimmed) return "";
	if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith("/") || trimmed.startsWith("blob:") || trimmed.startsWith("data:")) {
		return trimmed;
	}
	if (trimmed.startsWith("uploads/")) {
		return `/${trimmed}`;
	}
	return trimmed;
}

export function ProtectedAudioPlayer({ src, title = "Capsule audio", prevHref = null, nextHref = null }) {
	const audioRef = useRef(null);
	const normalizedSrc = normalizeAudioSrc(src);
	const [playing, setPlaying] = useState(false);
	const [loading, setLoading] = useState(true);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [volume, setVolume] = useState(1);
	const [muted, setMuted] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;

		setPlaying(false);
		setCurrentTime(0);
		setDuration(0);
		setError(null);

		if (!normalizedSrc) {
			return;
		}

		const markReady = () => {
			setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
			setLoading(false);
		};

		const onLoadedMetadata = markReady;
		const onLoadedData = markReady;
		const onCanPlay = markReady;
		const onDurationChange = () => {
			if (Number.isFinite(audio.duration)) {
				setDuration(audio.duration);
			}
		};
		const onTimeUpdate = () => setCurrentTime(audio.currentTime);
		const onEnded = () => setPlaying(false);
		const onPlay = () => setPlaying(true);
		const onPause = () => setPlaying(false);
		const onWaiting = () => setLoading(true);
		const onError = () => {
			setError("Impossible de charger l'audio");
			setLoading(false);
		};

		audio.addEventListener("loadedmetadata", onLoadedMetadata);
		audio.addEventListener("loadeddata", onLoadedData);
		audio.addEventListener("canplay", onCanPlay);
		audio.addEventListener("durationchange", onDurationChange);
		audio.addEventListener("timeupdate", onTimeUpdate);
		audio.addEventListener("ended", onEnded);
		audio.addEventListener("play", onPlay);
		audio.addEventListener("pause", onPause);
		audio.addEventListener("waiting", onWaiting);
		audio.addEventListener("error", onError);

		if (audio.readyState >= 1) {
			markReady();
		} else {
			audio.load();
		}

		return () => {
			audio.removeEventListener("loadedmetadata", onLoadedMetadata);
			audio.removeEventListener("loadeddata", onLoadedData);
			audio.removeEventListener("canplay", onCanPlay);
			audio.removeEventListener("durationchange", onDurationChange);
			audio.removeEventListener("timeupdate", onTimeUpdate);
			audio.removeEventListener("ended", onEnded);
			audio.removeEventListener("play", onPlay);
			audio.removeEventListener("pause", onPause);
			audio.removeEventListener("waiting", onWaiting);
			audio.removeEventListener("error", onError);
		};
	}, [normalizedSrc]);

	async function togglePlay() {
		const audio = audioRef.current;
		if (!audio) return;
		if (playing) {
			audio.pause();
		} else {
			setError(null);
			if (audio.readyState === 0) {
				setLoading(true);
				audio.load();
			}

			try {
				await audio.play();
			} catch {
				setError("Lecture impossible");
				setLoading(false);
			}
		}
	}

	function handleSeek(value) {
		const audio = audioRef.current;
		if (!audio) return;
		audio.currentTime = value[0];
		setCurrentTime(value[0]);
	}

	function handleVolumeChange(value) {
		const audio = audioRef.current;
		if (!audio) return;
		const newVolume = value[0];
		audio.volume = newVolume;
		setVolume(newVolume);
		if (newVolume === 0) setMuted(true);
		else if (muted) setMuted(false);
	}

	function toggleMute() {
		const audio = audioRef.current;
		if (!audio) return;
		audio.muted = !muted;
		setMuted(!muted);
	}

	function changeSpeed(rate) {
		const audio = audioRef.current;
		if (!audio) return;
		audio.playbackRate = rate;
	}

	function formatTime(seconds) {
		if (!seconds || isNaN(seconds)) return "0:00";
		const m = Math.floor(seconds / 60);
		const s = Math.floor(seconds % 60);
		return `${m}:${s.toString().padStart(2, "0")}`;
	}

	// Désactive le menu contextuel (clic droit)
	function handleContextMenu(e) {
		e.preventDefault();
		return false;
	}

	// Désactive le drag
	function handleDragStart(e) {
		e.preventDefault();
		return false;
	}

	if (!normalizedSrc) {
		return <Card className="p-4 bg-destructive/10 text-destructive text-sm">Aucune source audio valide pour cette capsule</Card>;
	}

	if (error) {
		return <Card className="p-4 bg-destructive/10 text-destructive text-sm">{error}</Card>;
	}

	return (
		<Card
			className="bg-linear-to-br from-primary/5 to-primary/10 border-primary/20 select-none shadow-md"
			onContextMenu={handleContextMenu}
			onDragStart={handleDragStart}
		>
			{/* Élément audio caché — controlsList masque le bouton download natif si jamais on l'active */}
			<audio
				ref={audioRef}
				src={normalizedSrc}
				preload="metadata"
				controlsList="nodownload noremoteplayback"
				onContextMenu={handleContextMenu}
			/>

			{/* AUDIO HEADER */}
			<div className="p-4 flex flex-col justify-between items-center gap-3 sm:flex-row sm:items-start bg-neutral-300 h-full -translate-y-4 rounded-t-lg">
				{/* AUDIO INFO */}
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
						<Volume2 className="h-5 w-5 text-primary" />
					</div>
					<div className="flex-1 min-w-0">
						<p className="text-xs uppercase tracking-wider text-muted-foreground">Capsule audio</p>
						<p className="text-sm font-medium truncate">{title}</p>
					</div>
				</div>

				{/* VOLUME CONTROLS */}
				<div className="flex items-center gap-1 self-end sm:self-auto">
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={toggleMute}
						className="h-8 w-8"
					>
						{muted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
					</Button>
					<div className="w-24 sm:w-20">
						<Slider
							value={[muted ? 0 : volume]}
							max={1}
							step={0.05}
							onValueChange={handleVolumeChange}
						/>
					</div>
				</div>
			</div>

			<div className="px-4 pb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-2">
				{/* PLAY/PAUSE BUTTON */}
				<div className="flex justify-start items-center gap-1.5">
					<Button
						asChild
						variant="outline"
						size="icon"
						disabled={!prevHref}
						className="h-10 w-10 rounded-full"
					>
						{prevHref ? (
							<Link
								href={prevHref}
								aria-label="Leçon précédente"
							>
								<ChevronLeft className="h-4 w-4" />
							</Link>
						) : (
							<span aria-label="Leçon précédente indisponible">
								<ChevronLeft className="h-4 w-4" />
							</span>
						)}
					</Button>

					<Button
						type="button"
						size="icon"
						onClick={togglePlay}
						disabled={Boolean(error)}
						className="h-10 w-10 rounded-full"
					>
						{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
					</Button>

					<Button
						asChild
						variant="outline"
						size="icon"
						disabled={!nextHref}
						className="h-10 w-10 rounded-full"
					>
						{nextHref ? (
							<Link
								href={nextHref}
								aria-label="Leçon suivante"
							>
								<ChevronRight className="h-4 w-4" />
							</Link>
						) : (
							<span aria-label="Leçon suivante indisponible">
								<ChevronRight className="h-4 w-4" />
							</span>
						)}
					</Button>
				</div>

				{/* PROGRESS BAR */}
				<div className="flex w-full items-center gap-2 sm:gap-3">
					<span className="text-xs text-muted-foreground w-10 text-right tabular-nums">{formatTime(currentTime)}</span>
					<Slider
						value={[currentTime]}
						max={duration || 100}
						step={0.1}
						onValueChange={handleSeek}
						disabled={loading}
						className="flex-1"
					/>
					<span className="text-xs text-muted-foreground w-10 tabular-nums">{formatTime(duration)}</span>
				</div>

				{/* VITESSE DE LECTURE */}
				<div className="flex w-full items-center justify-end gap-1 md:w-auto">
					{[0.75, 1, 1.25].map((rate) => (
						<button
							key={rate}
							type="button"
							onClick={() => changeSpeed(rate)}
							className="text-xs px-2 py-1 rounded hover:bg-primary/10 text-muted-foreground hover:text-foreground transition-colors"
						>
							{rate}x
						</button>
					))}
				</div>
			</div>
		</Card>
	);
}
