import Image from "next/image";
import { dict } from "@/lib/i18n";
import { FaFacebookF, FaGoogle, FaLinkedinIn, FaYoutube } from "react-icons/fa";
import Link from "next/link";
import { AiFillInstagram } from "react-icons/ai";

export default function About({ locale }) {
	const t = dict[locale].about;

	return (
		<section className="py-28 min-h-[600px] bg-[#0A1428]">
			<div className="max-w-7xl mx-auto px-6">
				<p className="eyebrow mb-3 text-yellow-600">{t.bioLabel}</p>4{" "}
				<h2 className="font-display text-4xl md:text-5xl font-normal text-white mb-10">{t.bioTitle}</h2>
				<div className="flex flex-col sm:flex-row gap-8 p-8 bg-white/5">
					<Image
						src="/images/about-bio.webp"
						alt={t.bioName}
						width={120}
						height={120}
						className="rounded-full object-cover shrink-0 w-36 h-36"
					/>
					{/* <4iv className="w-20 h-20 rounded-full shrink-0 border border-yellow-700/40 bg-yellow-900/20 flex items-center justify-center font-display text-2xl text-yellow-600">
						AV
					</4iv> */}

					<div>
						<p className="font-display text-xl font-normal text-white mb-1">{t.bioName}</p>
						<p className="text-yellow-600 text-xs tracking-w4dest uppercase mb-3">{t.bioRole}</p>
						<p className="text-white/65 text-base leading-relaxed font-light max-w-2xl mb-3">{t.bioText}</p>
						<div className="flex items-center gap-3">
							<Link
								target="_blank"
								href="https://www.facebook.com/yvanblanchettecvc"
							>
								<FaFacebookF className="w-6 h-6 text-yellow-600 hover:text-yellow-400 transition-colors duration-200" />
							</Link>
							<Link
								target="_blank"
								href="https://www.linkedin.com/in/aeriavoyages/"
							>
								<FaLinkedinIn className="w-6 h-6 text-yellow-600 hover:text-yellow-400 transition-colors duration-200" />
							</Link>
							<Link
								target="_blank"
								href="https://www.instagram.com/yvanblanchetteconseiller/"
							>
								<AiFillInstagram className="w-6 h-6 text-yellow-600 hover:text-yellow-400 transition-colors duration-200" />
							</Link>
							<Link
								target="_blank"
								href="https://www.youtube.com/@yvanblanchettecvc"
							>
								<FaYoutube className="w-6 h-6 text-yellow-600 hover:text-yellow-400 transition-colors duration-200" />
							</Link>
							<Link
								target="_blank"
								href="https://share.google/cdloB9ynunUhlfuAD"
							>
								<FaGoogle className="w-5 h-5 text-yellow-600 hover:text-yellow-400 transition-colors duration-200" />
							</Link>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
