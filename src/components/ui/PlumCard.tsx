import { Card } from "heroui-native";
import type { CardRootProps } from "heroui-native";
import { forwardRef } from "react";
import type { View } from "react-native";

/**
 * Card variant with deep plum (#260C35) background.
 * Use for primary data cards on dark gradient backgrounds.
 */
export const PlumCard = forwardRef<
  React.ElementRef<typeof View>,
  CardRootProps
>((props, ref) => {
  const { className, ...rest } = props;

  return (
    <Card
      ref={ref}
      className={`bg-plum-deep rounded-xl ${className ?? ""}`}
      {...rest}
    />
  );
});

PlumCard.displayName = "PlumCard";
