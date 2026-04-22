import { useEffect, useState } from "react";
import { useClassStore } from "@/lib/stores/classStore";
import { useAuthStore } from "@/lib/stores/authStore";
import { ClassScheduleCalendar } from "@/components/classes/ClassScheduleCalendar";
import { BookingDialog } from "@/components/classes/BookingDialog";
import { initiateClassPayment } from "@/lib/api/classService";
import { getPaymentById } from "@/lib/api/billingService";
import type { GymClass } from "@/lib/api/classService";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Filter, Search, RefreshCw } from "lucide-react";

export function ClassSchedule() {
    const { toast } = useToast();
    const { user } = useAuthStore();
    const {
        classes,
        userBookings,
        selectedDate,
        loading,
        filters,
        setSelectedDate,
        setFilters,
        fetchClasses,
        fetchUserBookings,
        joinClass
    } = useClassStore();

    const [selectedClass, setSelectedClass] = useState<GymClass | null>(null);
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Initial fetch and check for success payment
    useEffect(() => {
        fetchClasses(selectedDate, selectedDate);
        if (user?.id) fetchUserBookings(user.id);

        // Handle Stripe success redirect
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');

        if (sessionId) {
            const verifyPayment = async () => {
                try {
                    // This call triggers backend self-healing if webhook didn't process yet
                    await getPaymentById(sessionId);
                    toast({
                        title: "Payment Successful",
                        description: "Your class booking has been confirmed.",
                    });
                    // Clean up URL
                    window.history.replaceState({}, document.title, window.location.pathname);
                    // Re-fetch bookings
                    if (user?.id) await fetchUserBookings(user.id);
                } catch (err: any) {
                    console.error('Payment verification failed:', err);
                    toast({
                        title: "Payment Verification",
                        description: "Payment processed, but we are still confirming your booking. It should appear shortly.",
                        variant: "destructive"
                    });
                }
            };
            verifyPayment();
        }
    }, [selectedDate, user?.id]);

    const handleBookClick = (gymClass: GymClass) => {
        if (!user) {
            toast({ title: "Login Required", description: "Please login to book a class", variant: "destructive" });
            return;
        }
        setSelectedClass(gymClass);
        setIsBookingOpen(true);
    };

    const handleConfirmBooking = async () => {
        if (!selectedClass || !user?.id) return;

        setBookingLoading(true);
        try {
            const isFree = !selectedClass.priceLKR || selectedClass.priceLKR === 0;

            if (isFree) {
                await joinClass(selectedClass.id, user.id, selectedClass.startTime);
                toast({
                    title: "Booking Confirmed",
                    description: `You have successfully booked ${selectedClass.name}`,
                });
                setIsBookingOpen(false);
            } else {
                const response = await initiateClassPayment(selectedClass.id, selectedClass.startTime, user.id);
                if (response.checkoutUrl) {
                    window.location.href = response.checkoutUrl;
                }
            }
        } catch (error: any) {
            toast({
                title: "Booking Failed",
                description: error.response?.data?.error || error.message || "Could not book class",
                variant: "destructive"
            });
        } finally {
            setBookingLoading(false);
        }
    };

    const filteredClasses = classes.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.trainerName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filters.type === 'All' || c.type === filters.type;
        const matchesTrainer = filters.trainer === 'All' || c.trainerName === filters.trainer; // Simplified for now
        const matchesAvailability = !filters.onlyAvailable || c.bookedCount < c.capacity;

        return matchesSearch && matchesType && matchesTrainer && matchesAvailability;
    });

    return (
        <div className="space-y-6 animate-fade-in pt-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-headline font-bold text-foreground flex items-center gap-3">
                        <Calendar className="w-8 h-8 text-primary-800" />
                        Class Schedule
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Find and book your favorite fitness classes
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        fetchClasses(selectedDate, selectedDate);
                        if (user?.id) fetchUserBookings(user.id);
                    }}
                    className="border-border text-muted-foreground hover:text-foreground"
                >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Filters */}
            <div className="glass-card p-4 rounded-lg border-border flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search classes or trainers..."
                        className="pl-10 bg-card border-border text-foreground"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Select
                        value={filters.type}
                        onValueChange={(val: any) => setFilters({ type: val })}
                    >
                        <SelectTrigger className="w-full md:w-[150px] bg-card border-border text-foreground">
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                            <SelectItem value="All">All Types</SelectItem>
                            <SelectItem value="Yoga">Yoga</SelectItem>
                            <SelectItem value="HIIT">HIIT</SelectItem>
                            <SelectItem value="Spin">Spin</SelectItem>
                            <SelectItem value="Pilates">Pilates</SelectItem>
                            <SelectItem value="Strength">Strength</SelectItem>
                            <SelectItem value="Zumba">Zumba</SelectItem>
                        </SelectContent>
                    </Select>
                    {/* Add more filters as needed */}
                </div>
            </div>

            <ClassScheduleCalendar
                classes={filteredClasses}
                userBookings={userBookings}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                onBookClass={handleBookClick}
                loading={loading}
            />

            <BookingDialog
                open={isBookingOpen}
                onOpenChange={setIsBookingOpen}
                gymClass={selectedClass}
                onConfirm={handleConfirmBooking}
                loading={bookingLoading}
            />
        </div>
    );
}
