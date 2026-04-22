import React from "react";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitBugReport } from "@/lib/api/feedbackService";

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
        // Automatically report bug to backend
        submitBugReport(`Auto-reported crash: ${error.message}`, error).catch(err => {
            console.error("Failed to auto-report bug:", err);
        });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = "/dashboard";
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
                    <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-slate-100 animate-in fade-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-10 h-10 text-rose-500" />
                        </div>

                        <h1 className="text-2xl font-bold text-slate-900 text-center mb-2">Something went wrong</h1>
                        <p className="text-slate-500 text-center mb-8">
                            An unexpected error occurred. Don't worry, our team has been automatically notified and we're on it.
                        </p>

                        <div className="space-y-3">
                            <Button
                                onClick={() => window.location.reload()}
                                className="w-full h-12 rounded-xl font-bold gap-2"
                            >
                                <RefreshCcw className="w-4 h-4" />
                                Refresh Page
                            </Button>
                            <Button
                                variant="outline"
                                onClick={this.handleReset}
                                className="w-full h-12 rounded-xl font-bold gap-2"
                            >
                                <Home className="w-4 h-4" />
                                Back to Dashboard
                            </Button>
                        </div>

                        {(window as any).__DEV__ && (
                            <div className="mt-8 p-4 bg-slate-50 rounded-xl overflow-hidden border border-slate-100">
                                <p className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Error Detail (Dev Only)</p>
                                <p className="text-xs font-mono text-rose-600 break-all">{this.state.error?.message}</p>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
