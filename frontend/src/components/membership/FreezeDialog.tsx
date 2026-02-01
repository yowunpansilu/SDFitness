import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface FreezeDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (date: Date) => Promise<void>;
}

export function FreezeDialog({ isOpen, onClose, onConfirm }: FreezeDialogProps) {
    const [date, setDate] = useState<Date>();
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        if (!date) return;
        setLoading(true);
        try {
            await onConfirm(date);
            onClose();
        } finally {
            setLoading(false);
        }
    };

    // Calculate min date (tomorrow) and max date (3 months from now)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Freeze Membership</AlertDialogTitle>
                    <AlertDialogDescription>
                        Select a date to automatically resume your membership. You won't be billed while your account is frozen.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="py-4">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Pick a resume date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                fromDate={tomorrow}
                                toDate={maxDate}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onClose} disabled={loading}>Cancel</AlertDialogCancel>
                    <Button onClick={handleConfirm} disabled={!date || loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Freeze Membership
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
