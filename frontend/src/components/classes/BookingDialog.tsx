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
import type { GymClass } from "@/lib/api/classService";
import { format } from "date-fns";
import { Calendar, Clock, MapPin, User } from "lucide-react";

interface BookingDialogProps {
    gymClass: GymClass | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    loading?: boolean;
}

export function BookingDialog({ gymClass, open, onOpenChange, onConfirm, loading }: BookingDialogProps) {
    if (!gymClass) return null;

    const isFree = !gymClass.priceLKR || gymClass.priceLKR === 0;

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="bg-background border-border text-foreground">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl font-headline text-foreground">Confirm Booking</AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground">
                        You are about to book a spot in the following class:
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="py-4 space-y-3">
                    <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
                        <div className="space-y-1">
                            <h3 className="font-bold text-lg text-primary-800">{gymClass.name}</h3>
                            <div className="flex items-center text-sm text-muted-foreground">
                                <User className="w-4 h-4 mr-2" />
                                {gymClass.trainerName}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center justify-end text-sm text-muted-foreground mb-1">
                                <Calendar className="w-4 h-4 mr-2" />
                                {format(new Date(gymClass.startTime), "EEE, MMM d")}
                            </div>
                            <div className="flex items-center justify-end text-sm text-muted-foreground">
                                <Clock className="w-4 h-4 mr-2" />
                                {format(new Date(gymClass.startTime), "h:mm a")}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground px-1">
                        <MapPin className="w-4 h-4" />
                        {gymClass.location}
                    </div>

                    {!isFree && (
                        <div className="p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-800 dark:text-amber-300 text-sm flex items-center justify-between">
                            <span className="font-bold uppercase tracking-wider text-xs">Total Amount</span>
                            <span className="font-bold text-lg">LKR {gymClass.priceLKR}</span>
                        </div>
                    )}
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel className="bg-card border-border text-foreground hover:bg-muted hover:text-foreground">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            onConfirm();
                        }}
                        className="bg-primary-600 hover:bg-primary-700 text-white"
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : (isFree ? 'Confirm Free Booking' : `Pay LKR ${gymClass.priceLKR}`)}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
