import { QRCodeCanvas } from "qrcode.react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function QRCodeCard() {
    // In a real app, this would be a secure token from the backend
    const [qrValue, setQrValue] = useState("");

    const generateCode = () => {
        const mockUserId = "user_123"; // Replace with actual user ID from auth
        const timestamp = Date.now();
        const secureToken = Math.random().toString(36).substring(7);
        const code = JSON.stringify({ u: mockUserId, t: timestamp, s: secureToken });
        setQrValue(code);
    };

    useEffect(() => {
        generateCode();
        // Auto refresh every minute
        const interval = setInterval(generateCode, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Digital ID</CardTitle>
                <CardDescription>Scan this QR code at the gym entrance to check in.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center gap-6 pb-8">
                <div className="p-4 bg-white rounded-xl shadow-sm border flex items-center justify-center">
                    <QRCodeCanvas
                        size={200}
                        value={qrValue}
                        level={"H"}
                    />
                </div>

                <div className="text-center space-y-2">
                    <p className="text-xs text-muted-foreground">
                        Code refreshes automatically every minute.
                    </p>
                    <Button variant="ghost" size="sm" onClick={generateCode} className="text-xs h-8">
                        <RefreshCw className="w-3 h-3 mr-2" />
                        Refresh Code
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
