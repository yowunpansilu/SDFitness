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

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="bg-dark-900 border-dark-700 text-white">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl font-headline text-white">Confirm Booking</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-400">
                        You are about to book a spot in the following class:
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="py-4 space-y-3">
                    <div className="flex items-center justify-between p-3 bg-dark-800 rounded-lg border border-dark-700">
                        <div className="space-y-1">
                            <h3 className="font-bold text-lg text-primary-400">{gymClass.name}</h3>
                            <div className="flex items-center text-sm text-gray-400">
                                <User className="w-4 h-4 mr-2" />
                                {gymClass.trainerName}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center justify-end text-sm text-gray-300 mb-1">
                                <Calendar className="w-4 h-4 mr-2" />
                                {format(new Date(gymClass.startTime), "EEE, MMM d")}
                            </div>
                            <div className="flex items-center justify-end text-sm text-gray-300">
                                <Clock className="w-4 h-4 mr-2" />
                                {format(new Date(gymClass.startTime), "h:mm a")}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-400 px-1">
                        <MapPin className="w-4 h-4" />
                        {gymClass.location}
                    </div>
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel className="bg-dark-800 border-dark-600 text-white hover:bg-dark-700 hover:text-white">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            onConfirm();
                        }}
                        className="bg-primary-600 hover:bg-primary-700 text-white"
                        disabled={loading}
                    >
                        {loading ? 'Booking...' : 'Confirm Booking'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
