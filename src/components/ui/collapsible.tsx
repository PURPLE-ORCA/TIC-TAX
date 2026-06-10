import {
  createContext,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import {
  Pressable,
  View,
  type PressableProps,
  type ViewProps,
} from "react-native";

type CollapsibleContextValue = {
  isOpen: boolean;
  isDisabled: boolean;
  setOpen: (isOpen: boolean) => void;
};

type CollapsibleProps = PropsWithChildren<
  ViewProps & {
    defaultOpen?: boolean;
    disabled?: boolean;
    open?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
  }
>;

type CollapsibleTriggerProps = PressableProps;
type CollapsibleContentProps = ViewProps;

const CollapsibleContext = createContext<CollapsibleContextValue | null>(null);

function useCollapsible() {
  const context = useContext(CollapsibleContext);

  if (!context) {
    throw new Error(
      "Collapsible compound components must be rendered inside Collapsible.",
    );
  }

  return context;
}

function Collapsible({
  children,
  defaultOpen = false,
  disabled = false,
  open,
  onOpenChange,
  ...props
}: CollapsibleProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = open ?? uncontrolledOpen;

  const value = useMemo(
    () => ({
      isOpen,
      isDisabled: disabled,
      setOpen: (nextOpen: boolean) => {
        if (disabled) {
          return;
        }

        setUncontrolledOpen(nextOpen);
        onOpenChange?.(nextOpen);
      },
    }),
    [disabled, isOpen, onOpenChange],
  );

  return (
    <CollapsibleContext.Provider value={value}>
      <View {...props}>{children}</View>
    </CollapsibleContext.Provider>
  );
}

function CollapsibleTrigger({
  children,
  disabled,
  onPress,
  ...props
}: CollapsibleTriggerProps) {
  const { isDisabled, isOpen, setOpen } = useCollapsible();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{
        disabled: disabled || isDisabled,
        expanded: isOpen,
      }}
      disabled={disabled || isDisabled}
      onPress={(event) => {
        onPress?.(event);
        setOpen(!isOpen);
      }}
      {...props}
    >
      {children}
    </Pressable>
  );
}

function CollapsibleContent({ children, ...props }: CollapsibleContentProps) {
  const { isOpen } = useCollapsible();

  if (!isOpen) {
    return null;
  }

  return <View {...props}>{children}</View>;
}

export { Collapsible, CollapsibleContent, CollapsibleTrigger };
