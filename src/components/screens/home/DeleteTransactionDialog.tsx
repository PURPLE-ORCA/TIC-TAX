import { Button, Dialog } from "heroui-native";
import { View } from "react-native";

interface DeleteTransactionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export function DeleteTransactionDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  isLoading,
}: DeleteTransactionDialogProps) {
  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-black/60" />
        <Dialog.Content className="mx-6 rounded-2xl border border-foreground/10 bg-background p-6">
          <Dialog.Close variant="ghost" />
          <View className="mb-6 gap-1.5">
            <Dialog.Title>Delete Transaction?</Dialog.Title>
            <Dialog.Description>This action cannot be undone.</Dialog.Description>
          </View>
          <View className="flex-row justify-end gap-3">
            <Button variant="tertiary" size="sm" onPress={() => onOpenChange(false)}>
              <Button.Label>Cancel</Button.Label>
            </Button>
            <Button variant="danger" size="sm" onPress={onConfirm} isDisabled={isLoading}>
              <Button.Label>{isLoading ? "Deleting..." : "Delete"}</Button.Label>
            </Button>
          </View>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}