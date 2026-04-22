import { useEffect } from "react";
import { useClassStore } from "@/lib/stores/classStore";
import { useAuthStore } from "@/lib/stores/authStore";
import { format } from "date-fns";
import { Calendar, Clock, MapPin, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

export function MyBookings() {
    const { user } = useAuthStore();
    const { toast } = useToast();
    const { userBookings, fetchUserBookings, leaveClass, loading } = useClassStore();

    useEffect(() => {
        if (user?.id) fetchUserBookings(user.id);
    }, [user?.id]);

    const handleCancel = async (bookingId: string) => {
        try {
            await leaveClass(bookingId);
            toast({
                title: "Booking Cancelled",
                description: "Your spot has been released.",
            });
        } catch (error: any) {
            toast({
                title: "Cancellation Failed",
                description: error.message || "Could not cancel booking",
                variant: "destructive"
            });
        }
    };

    // Separate upcoming and past bookings
    const now = new Date();
    const upcomingBookings = userBookings.filter(b => b.gymClass && b.status === 'confirmed' && new Date(b.gymClass.startTime) >= now);
    const pastBookings = userBookings.filter(b => b.gymClass && new Date(b.gymClass.startTime) < now);

    return (
        <div className="space-y-8 animate-fade-in pt-6">
            <div>
                <h1 className="text-3xl font-headline font-bold text-foreground flex items-center gap-3">
                    <Calendar className="w-8 h-8 text-primary-800" />
                    My Bookings
                </h1>
                <p className="text-muted-foreground mt-1">
                    Manage your upcoming classes and view your history
                </p>
            </div>

            {/* Upcoming Bookings */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-foreground">Upcoming Classes</h2>
                {upcomingBookings.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {upcomingBookings.map((booking) => (
                            <div key={booking.id} className="glass-card p-5 rounded-lg border-border flex flex-col justify-between h-full bg-card">
                                <div>
                                    <div className="flex justify-between items-start mb-3">
                                        <Badge variant="outline" className="border-primary-600/50 text-primary-800">
                                            {booking.gymClass.type}
                                        </Badge>
                                        <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'} className="bg-green-500/20 text-green-400">
                                            {booking.status}
                                        </Badge>
                                    </div>
                                    <h3 className="font-bold text-lg text-foreground mb-2">{booking.gymClass.name}</h3>
                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        <div className="flex items-center">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            {format(new Date(booking.gymClass.startTime), "EEEE, MMM d")}
                                        </div>
                                        <div className="flex items-center">
                                            <Clock className="w-4 h-4 mr-2" />
                                            {format(new Date(booking.gymClass.startTime), "h:mm a")} ({booking.gymClass.duration} min)
                                        </div>
                                        <div className="flex items-center">
                                            <MapPin className="w-4 h-4 mr-2" />
                                            {booking.gymClass.location}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 pt-4 border-t border-border">
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" className="w-full text-red-400 hover:text-red-300 hover:bg-red-900/20">
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Cancel Booking
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="bg-background border-border text-foreground">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
                                                <AlertDialogDescription className="text-muted-foreground">
                                                    Are you sure you want to cancel your spot in {booking.gymClass.name}? This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel className="bg-card border-border text-foreground hover:bg-muted">Detailed</AlertDialogCancel>
                                                <AlertDialogAction
                                                    className="bg-red-600 hover:bg-red-700 text-foreground"
                                                    onClick={() => handleCancel(booking.id)}
                                                    disabled={loading}
                                                >
                                                    {loading ? "Cancelling..." : "Yes, Cancel"}
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 border-2 border-dashed border-border rounded-lg bg-card/50">
                        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">No upcoming bookings</h3>
                        <p className="text-muted-foreground mb-6">You haven't booked any upcoming classes yet.</p>
                        <Button asChild variant="gym">
                            <Link to="/dashboard/classes">Browse Schedule</Link>
                        </Button>
                    </div>
                )}
            </div>

            {/* Past Bookings */}
            {pastBookings.length > 0 && (
                <div className="space-y-4 pt-8 border-t border-border">
                    <h2 className="text-xl font-bold text-muted-foreground">Past Classes</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 opacity-60">
                        {pastBookings.map((booking) => (
                            <div key={booking.id} className="glass-card p-4 rounded-lg border-border bg-card">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-foreground">{booking.gymClass.name}</h3>
                                    <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">Completed</span>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {format(new Date(booking.gymClass.startTime), "MMM d, yyyy • h:mm a")}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
