import { Button } from 'heroui-native';
import { Pressable, Text } from 'react-native';
import { tv, type VariantProps } from 'tailwind-variants';

const button = tv({
  base: "h-14 rounded-xl items-center justify-center flex-row",
  variants: {
    variant: {
      primary: "bg-primary",
      secondary: "bg-primary/15",
      transparent: "bg-transparent border border-foreground/10",
    },
  },
  defaultVariants: {
    variant: "primary",
  },
});

export type CustomButtonProps = {
  variant?: "primary" | "secondary" | "transparent";
  className?: string;
  label?: string;
  onPress?: () => void;
};

export function CustomButton({ variant = "primary", className, label, onPress }: CustomButtonProps) {
  return (
    <Button 
      className={button({ variant, className })} 
      onPress={onPress}
    >
      {label && (
        <Text className="text-primary font-bold">{label}</Text>
      )}
    </Button>
  );
}