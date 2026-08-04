import { cn } from "@/lib/utils";

interface PasswordStrengthProps {
  password?: string;
}

export function PasswordStrength({ password = "" }: PasswordStrengthProps) {
  let score = 0;
  
  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  const strengthText = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  const strengthColor = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-blue-500",
    "bg-green-500",
  ];

  const currentScore = Math.min(Math.max(score - 1, 0), 4);
  const textScore = password.length === 0 ? "None" : strengthText[currentScore];

  return (
    <div className="w-full space-y-1.5 mt-2">
      <div className="flex justify-between items-center text-[10px]">
        <span className="text-muted-foreground">Password strength</span>
        <span
          className={cn(
            "font-medium",
            password.length === 0 ? "text-muted-foreground" : `text-${strengthColor[currentScore].split("-")[1]}-500`
          )}
        >
          {textScore}
        </span>
      </div>
      <div className="flex gap-1 h-1">
        {[0, 1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className={cn(
              "h-full flex-1 rounded-full transition-colors duration-300",
              password.length > 0 && index <= currentScore
                ? strengthColor[currentScore]
                : "bg-muted"
            )}
          />
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground mt-1">
        Requires 8+ chars, uppercase, lowercase, number, and special character.
      </p>
    </div>
  );
}
