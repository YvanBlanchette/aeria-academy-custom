import { Button } from "./button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

const ButtonTooltip = ({ onClick, disabled, className, children, variant, type = "button", size = "sm", side = "top", label, classNameLabel }) => {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					type={type}
					variant={variant}
					size={size}
					onClick={onClick}
					disabled={disabled}
					className={className}
				>
					{children}
				</Button>
			</TooltipTrigger>
			<TooltipContent side={side}>
				<p className={classNameLabel}>{label}</p>
			</TooltipContent>
		</Tooltip>
	);
};
export default ButtonTooltip;
