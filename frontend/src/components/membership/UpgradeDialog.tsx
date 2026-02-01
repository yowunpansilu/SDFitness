import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UpgradeDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    planName: string;
    isUpgrade: boolean;
}

export function UpgradeDialog({ isOpen, onClose, onConfirm, planName, isUpgrade }: UpgradeDialogProps) {
    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirm {isUpgrade ? 'Upgrade' : 'Plan Change'}</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to switch to the <strong>{planName}</strong> plan?
                        {isUpgrade
                            ? " You will be charged the difference immediately."
                            : " Your new rate will apply starting next billing cycle."}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => { onConfirm(); onClose(); }}>
                        Confirm
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
