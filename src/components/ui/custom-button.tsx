import { Button } from 'heroui-native';
import { Text, View } from 'react-native';
import { tv, type VariantProps } from 'tailwind-variants';

const button = tv({
  base: "h-14 rounded-xl items-center justify-center flex-row",
  variants: {
    variant: {
      primary: "bg-plum-night",
      secondary: "bg-plum-deep",
      transparent: "bg-transparent border border-foreground/10",
    },
  },
  defaultVariants: {
    variant: "primary",
  },
});

const labelText = tv({
  base: 'font-bold',
  variants: {
    variant: {
      primary: 'text-white',
      secondary: 'text-foreground',
      transparent: 'text-primary',
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
});

export type CustomButtonProps = {
  variant?: "primary" | "secondary" | "transparent";
  className?: string;
  label?: string;
  onPress?: () => void;
  isDisabled?: boolean;
};

export function CustomButton({ variant = "primary", className, label, onPress, isDisabled }: CustomButtonProps) {
  return (
    <View className="my-6">
      <Button
        className={button({ variant, className })}
        onPress={onPress}
        isDisabled={isDisabled}
      >
        {label && <Text className={labelText({ variant })}>{label}</Text>}
      </Button>
    </View>
  );
}
