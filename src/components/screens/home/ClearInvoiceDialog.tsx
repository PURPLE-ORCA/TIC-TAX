import { Button, Dialog } from "heroui-native";
import { View } from "react-native";

interface ClearInvoiceDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export function ClearInvoiceDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  isLoading,
}: ClearInvoiceDialogProps) {
  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-black/60" />
        <Dialog.Content className="mx-6 rounded-2xl border border-foreground/10 bg-background p-6">
          <Dialog.Close variant="ghost" />
          <View className="mb-6 gap-1.5">
            <Dialog.Title>Mark Invoice as Paid?</Dialog.Title>
            <Dialog.Description>
              This moves the amount into real capital and applies the 1% tax.
            </Dialog.Description>
          </View>
          <View className="flex-row justify-end gap-3">
            <Button variant="tertiary" size="sm" onPress={() => onOpenChange(false)}>
              <Button.Label>Cancel</Button.Label>
            </Button>
            <Button variant="primary" size="sm" onPress={onConfirm} isDisabled={isLoading}>
              <Button.Label>{isLoading ? "Confirming..." : "Confirm"}</Button.Label>
            </Button>
          </View>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}