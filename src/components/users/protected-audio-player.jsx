"use client";

import { useRef, useEffect, useState } from "react";
import { Play, Pause, Volume2, VolumeX, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";

export function ProtectedAudioPlayer({ src, title = "Capsule audio" }) {
	const audioRef = useRef(null);
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

		const onLoadedMetadata = () => {
			setDuration(audio.duration);
			setLoading(false);
		};
		const onTimeUpdate = () => setCurrentTime(audio.currentTime);
		const onEnded = () => setPlaying(false);
		const onError = () => {
			setError("Impossible de charger l'audio");
			setLoading(false);
		};

		audio.addEventListener("loadedmetadata", onLoadedMetadata);
		audio.addEventListener("timeupdate", onTimeUpdate);
		audio.addEventListener("ended", onEnded);
		audio.addEventListener("error", onError);

		return () => {
			audio.removeEventListener("loadedmetadata", onLoadedMetadata);
			audio.removeEventListener("timeupdate", onTimeUpdate);
			audio.removeEventListener("ended", onEnded);
			audio.removeEventListener("error", onError);
		};
	}, []);

	function togglePlay() {
		const audio = audioRef.current;
		if (!audio) return;
		if (playing) {
			audio.pause();
		} else {
			audio.play().catch(() => setError("Lecture impossible"));
		}
		setPlaying(!playing);
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

	if (error) {
		return <Card className="p-4 bg-destructive/10 text-destructive text-sm">{error}</Card>;
	}

	return (
		<Card
			className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 select-none"
			onContextMenu={handleContextMenu}
			onDragStart={handleDragStart}
		>
			{/* Élément audio caché — controlsList masque le bouton download natif si jamais on l'active */}
			<audio
				ref={audioRef}
				src={src}
				preload="metadata"
				controlsList="nodownload noremoteplayback"
				onContextMenu={handleContextMenu}
			/>

			<div className="flex items-center gap-3 mb-3">
				<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
					<Volume2 className="h-5 w-5 text-primary" />
				</div>
				<div className="flex-1 min-w-0">
					<p className="text-xs uppercase tracking-wider text-muted-foreground">Capsule audio</p>
					<p className="text-sm font-medium truncate">{title}</p>
				</div>
			</div>

			{/* Controls */}
			<div className="space-y-3">
				{/* Progress bar */}
				<div className="flex items-center gap-3">
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

				{/* Buttons row */}
				<div className="flex items-center gap-2">
					<Button
						type="button"
						size="icon"
						onClick={togglePlay}
						disabled={loading}
						className="h-10 w-10 rounded-full"
					>
						{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
					</Button>

					<div className="flex items-center gap-1">
						<Button
							type="button"
							variant="ghost"
							size="icon"
							onClick={toggleMute}
							className="h-8 w-8"
						>
							{muted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
						</Button>
						<div className="w-20">
							<Slider
								value={[muted ? 0 : volume]}
								max={1}
								step={0.05}
								onValueChange={handleVolumeChange}
							/>
						</div>
					</div>

					{/* Vitesse de lecture */}
					<div className="ml-auto flex items-center gap-1">
						{[0.75, 1, 1.25, 1.5, 2].map((rate) => (
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
			</div>
		</Card>
	);
}
